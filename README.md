# AI-First CRM HCP Module - Log Interaction Screen

A full-stack, split-screen CRM application for life-science field representatives. This system allows users to log and manage interactions with Healthcare Professionals (HCPs) strictly through an AI-powered conversational interface, ensuring zero manual typing within the form.

## 🚀 Tech Stack
- **Frontend:** React, Redux Toolkit, Axios
- **Backend:** Python, FastAPI, Uvicorn
- **AI Orchestration:** LangGraph (StateGraph framework)
- **LLM Engine:** Groq API (`llama-3.3-70b-versatile`)

---

## 🛠️ Implemented LangGraph Tools
The system dynamically triggers 5 specific backend tools based on user conversational intent:
1. `log_interaction` (Mandatory): Extracts entities (HCP Name, sentiment, topics) from natural language and maps them to the form fields.
2. `edit_interaction` (Mandatory): Modifies specific targeted fields when corrections are conversationalized, keeping the rest of the form state intact.
3. `suggest_follow_ups`: Generates intelligent next steps or medical actions based on the discussion topics.
4. `add_materials`: Tracks product catalogs, clinical brochures, or drug sample distribution flags.
5. `submit_final_log`: Locks the current Redux application state structure and commits the workflow session.

---

## 🏃‍♂️ How to Run the Project

### 1. Backend Setup
Navigate to the backend directory, install packages, and boot the server:
```bash
cd backend
pip install fastapi uvicorn langchain-groq langgraph pydantic
python -m uvicorn main:app --reload


2. Frontend Setup
Open a separate terminal window, navigate to the frontend directory, install dependencies, and run the interface:

cd frontend
npm install
npm run dev                               Open your browser and navigate to http://localhost:5173.


---

### 🏁 Final Steps to Finish Your Submission:

1. **Push to GitHub:** Upload your code directory (`backend`, `frontend`, and the `README.md`) to a new public repository on your GitHub account. Copy that link.
2. **Record Your Video:** Open a recording app like Loom. Run through the live conversational examples (typing prompts to fill the form and modify it) while explaining that the system uses **Redux** for data flow and **LangGraph conditional edges** to trigger backend tools dynamically. Keep it around 10 minutes.
3. **Submit the Form:** Head over to their Google Form (`https://forms.gle/XdvLNBJkbdVDGADM8`), paste your GitHub repository link and your recorded video link, and submit it. 

You have managed to build a highly complex AI-agent architecture from scratch under a tight dea
