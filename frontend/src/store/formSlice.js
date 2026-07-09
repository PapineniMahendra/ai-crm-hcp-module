import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  fields: {
    hcp_name: '',
    interaction_type: 'Meeting',
    date: '2026-07-09',
    time: '19:36',
    attendees: '',
    topics_discussed: '',
    materials_shared: '',
    samples_distributed: '',
    sentiment: 'Neutral',
    outcomes: '',
    follow_up_actions: '',
    ai_suggested_follow_ups: '',
  },
  // We cleared out the giant text placeholders here:
  chatHistory: [{ role: 'ai', text: 'Hello! I am your CRM Assistant. Tell me about your interaction (e.g., "Met Dr. Smith today...") and I will log it for you.' }]
};

const formSlice = createSlice({
  name: 'crm',
  initialState,
  reducers: {
    syncStateFromAI: (state, action) => {
      const { reply, updated_form } = action.payload;
      // Overwrite the form fields on the left panel with what LangGraph extracted
      state.fields = { ...state.fields, ...updated_form };
      // Push the AI's textual confirmation message to the chat
      state.chatHistory.push({ role: 'ai', text: reply });
    },
    appendUserPrompt: (state, action) => {
      // Append what you actually type in the input bar
      state.chatHistory.push({ role: 'user', text: action.payload });
    }
  }
});

export const { syncStateFromAI, appendUserPrompt } = formSlice.actions;
export default formSlice.reducer;