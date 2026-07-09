import os
import sqlite3
from typing import Annotated, TypedDict, List, Optional
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from langchain_core.tools import tool
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, START, END

# --- 1. SQL DATABASE INITIALIZATION ---
def init_db():
    """Creates a local SQLite database file to permanently store completed interaction rows."""
    conn = sqlite3.connect("crm_database.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS hcp_interactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            hcp_name TEXT,
            interaction_type TEXT,
            date TEXT,
            time TEXT,
            attendees TEXT,
            topics_discussed TEXT,
            sentiment TEXT,
            materials_shared TEXT,
            samples_distributed TEXT,
            outcomes TEXT
        )
    """)
    conn.commit()
    conn.close()

# Run the database setup immediately on launch
init_db()


# --- 2. DEFINE STRUCTURED ARGUMENT SCHEMAS FOR TOOLS ---
class LogData(BaseModel):
    hcp_name: Optional[str] = Field(None, description="Name of the healthcare professional, e.g., Dr. Smith")
    interaction_type: Optional[str] = Field(None, description="Type of interaction, e.g., Meeting or Call")
    date: Optional[str] = Field(None, description="Date of the interaction")
    time: Optional[str] = Field(None, description="Time of the interaction")
    attendees: Optional[str] = Field(None, description="Names of other attendees present")
    topics_discussed: Optional[str] = Field(None, description="Core summary of clinical topics discussed")
    sentiment: Optional[str] = Field(None, description="HCP Sentiment value: Positive, Neutral, or Negative")


# --- 3. IMPLEMENT THE 5 REQUIRED LANGGRAPH TOOLS ---

@tool("log_interaction", args_schema=LogData)
def log_interaction(**kwargs) -> dict:
    """Use this tool to extract details from a prompt to auto-populate empty form fields."""
    return {k: v for k, v in kwargs.items() if v is not None}


@tool("edit_interaction", args_schema=LogData)
def edit_interaction(**kwargs) -> dict:
    """Use this tool when the user requests manual corrections or changes to already filled form fields."""
    return {k: v for k, v in kwargs.items() if v is not None}


@tool("suggest_follow_ups")
def suggest_follow_ups(topics_discussed: str) -> dict:
    """Use this tool to automatically generate actionable recommendations for the AI Suggested Follow-ups section."""
    return {
        "ai_suggested_follow_ups": f"• Schedule technical follow-up regarding: {topics_discussed}\n• Email relevant safety and efficiency PDF brochures."
    }


@tool("add_materials")
def add_materials(material_name: str) -> dict:
    """Use this tool when the user mentions product brochures, clinical study folders, or sample drug packs given to the doctor."""
    return {
        "materials_shared": f"Brochure: {material_name}",
        "samples_distributed": "Sample Pack distributed"
    }


@tool("submit_final_log", args_schema=LogData)
def submit_final_log(**kwargs) -> dict:
    """Saves the completely filled out form data permanently to the SQL database when the user confirms it's correct."""
    conn = sqlite3.connect("crm_database.db")
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO hcp_interactions (hcp_name, interaction_type, date, time, attendees, topics_discussed, sentiment, materials_shared, samples_distributed, outcomes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        kwargs.get("hcp_name", "Unknown HCP"),
        kwargs.get("interaction_type", "Meeting"),
        kwargs.get("date", "19-04-2025"),
        kwargs.get("time", "19:36"),
        kwargs.get("attendees", ""),
        kwargs.get("topics_discussed", ""),
        kwargs.get("sentiment", "Neutral"),
        kwargs.get("materials_shared", "Shared via Agent"),
        kwargs.get("samples_distributed", "Distributed via Agent"),
        "Interaction saved and verified successfully!"
    ))
    
    conn.commit()
    conn.close()
    return {"outcomes": "Data safely saved and locked inside the permanent SQL database store!"}


tools_list = [log_interaction, edit_interaction, suggest_follow_ups, add_materials, submit_final_log]


# --- 4. LANGGRAPH STATE & WORKFLOW ORCHESTRATION ---
class FormStructure(TypedDict):
    hcp_name: str
    interaction_type: str
    date: str
    time: str
    attendees: str
    topics_discussed: str
    materials_shared: str
    samples_distributed: str
    sentiment: str
    outcomes: str
    follow_up_actions: str
    ai_suggested_follow_ups: str

class AgentState(TypedDict):
    messages: List
    form_data: FormStructure

# Initialize Groq LLM client using the active Llama-3.3 model engine
GROQ_KEY = os.environ.get("GROQ_API_KEY", "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")
llm = ChatGroq(model="llama-3.3-70b-versatile", groq_api_key=GROQ_KEY).bind_tools(tools_list)

def agent_node(state: AgentState):
    sys_prompt = (
        "You are an AI assistant managing a read-only medical CRM form layout. "
        "You MUST execute tools to auto-fill or modify fields on the left based on conversational text on the right. "
        "Acknowledge your tool call with a brief confirmation sentence back to the user."
    )
    response = llm.invoke([{"role": "system", "content": sys_prompt}] + state["messages"])
    return {"messages": [response]}

def tool_node(state: AgentState):
    last_msg = state["messages"][-1]
    current_form = dict(state["form_data"])
    if hasattr(last_msg, "tool_calls") and last_msg.tool_calls:
        for call in last_msg.tool_calls:
            active_tool = next((t for t in tools_list if t.name == call["name"]), None)
            if active_tool:
                result = active_tool.invoke(call["args"])
                if isinstance(result, dict):
                    current_form.update(result)
    return {"form_data": current_form}

# Compile Workflow StateGraph
workflow = StateGraph(AgentState)
workflow.add_node("agent", agent_node)
workflow.add_node("tools", tool_node)

workflow.add_edge(START, "agent")
workflow.add_conditional_edges("agent", lambda state: "tools" if state["messages"][-1].tool_calls else END)
workflow.add_edge("tools", END)

graph = workflow.compile()


# --- 5. FASTAPI ROUTING ENTRY LAYER ---
app = FastAPI()

# Allow cross-origin communication with your Vite React server layout
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatPayload(BaseModel):
    message: str
    current_form: dict

@app.post("/api/chat")
async def chat(payload: ChatPayload):
    inputs = {
        "messages": [{"role": "user", "content": payload.message}],
        "form_data": payload.current_form
    }
    output = graph.invoke(inputs)
    reply = output["messages"][-1].content or "Form parameters parsed successfully by LangGraph tools."
    return {
        "reply": reply,
        "updated_form": output["form_data"]
    }