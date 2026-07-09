import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { appendUserPrompt, syncStateFromAI } from './store/formSlice';

function App() {
  const dispatch = useDispatch();
  const fields = useSelector((state) => state.crm.fields);
  const chatHistory = useSelector((state) => state.crm.chatHistory);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const currentPrompt = userInput;
    setUserInput('');
    setLoading(true);

    dispatch(appendUserPrompt(currentPrompt));

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/chat', {
        message: currentPrompt,
        current_form: fields,
      });
      dispatch(syncStateFromAI(response.data));
    } catch (err) {
      console.error("Communication error with AI backend agent:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6', color: '#334155', padding: '12px gap: 16px' }}>
      
      {/* ================= LEFT SIDE: LOG HCP INTERACTION FORM ================= */}
      <div style={{ width: '63%', backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflowY: 'auto', maxHeight: '95vh', marginLeft: '16px', marginTop: '12px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', marginBottom: '24px' }}>Log HCP Interaction</h1>
        
        {/* Interaction Details Block */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', marginBottom: '20px', position: 'relative' }}>
          <span style={{ position: 'absolute', top: '-10px', left: '16px', backgroundColor: '#ffffff', padding: '0 8px', fontSize: '13px', fontWeight: '600', color: '#1e3a8a' }}>Interaction Details</span>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '8px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>HCP Name</label>
              <input type="text" value={fields.hcp_name} placeholder="Search or select HCP..." readOnly style={{ width: '93%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#f9fafb', fontSize: '14px', outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>Interaction Type</label>
              <div style={{ position: 'relative' }}>
                <select value={fields.interaction_type} disabled style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#f9fafb', fontSize: '14px', appearance: 'none', WebkitAppearance: 'none' }}>
                  <option>Meeting</option>
                  <option>Call</option>
                </select>
                <span style={{ position: 'absolute', right: '14px', top: '40%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '12px', color: '#6b7280' }}>▼</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>Date</label>
              <input type="text" value={fields.date || "19-04-2025"} readOnly style={{ width: '93%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#f9fafb', fontSize: '14px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>Time</label>
              <input type="text" value={fields.time || "19:36"} readOnly style={{ width: '93%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#f9fafb', fontSize: '14px' }} />
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>Attendees</label>
            <input type="text" value={fields.attendees} placeholder="Enter names or search..." readOnly style={{ width: '96.5%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#f9fafb', fontSize: '14px' }} />
          </div>

          <div style={{ marginTop: '16px', position: 'relative' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>Topics Discussed</label>
            <textarea value={fields.topics_discussed} placeholder="Enter key discussion points..." readOnly style={{ width: '96.5%', height: '80px', padding: '10px 14px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#f9fafb', fontSize: '14px', resize: 'none' }} />
            <span style={{ position: 'absolute', right: '25px', bottom: '12px', fontSize: '16px', color: '#9ca3af', cursor: 'not-allowed' }}>🎙️</span>
          </div>

          <button type="button" style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: '20px', backgroundColor: '#f3f4f6', fontSize: '13px', fontWeight: '500', color: '#374151', cursor: 'not-allowed' }}>
            ✨ Summarize from Voice Note (Requires Consent)
          </button>
        </div>

        {/* Materials / Samples Box */}
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Materials Shared / Samples Distributed</div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', width: '100%' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: '600' }}>Materials Shared</div>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{fields.materials_shared || "No materials added."}</div>
            </div>
            <button type="button" style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>🔍 Search/Add</button>
          </div>
          <div style={{ height: '1px', backgroundColor: '#f3f4f6' }}></div>
          <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', width: '100%' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: '600' }}>Samples Distributed</div>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{fields.samples_distributed || "No samples added."}</div>
            </div>
            <button type="button" style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>📦 Add Sample</button>
          </div>
        </div>

        {/* Sentiment Row Matching Original Screenshot Radio layout */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px' }}>Observed/Inferred HCP Sentiment</label>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'not-allowed' }}>
              <input type="radio" checked={fields.sentiment === 'Positive'} readOnly /> 😃 Positive
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'not-allowed' }}>
              <input type="radio" checked={fields.sentiment === 'Neutral' || !fields.sentiment} readOnly /> 😐 Neutral
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'not-allowed' }}>
              <input type="radio" checked={fields.sentiment === 'Negative'} readOnly /> 🙁 Negative
            </label>
          </div>
        </div>

        {/* Outcomes & Follow-up Actions */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Outcomes</label>
          <textarea value={fields.outcomes} placeholder="Key outcomes or agreements..." readOnly style={{ width: '97.5%', height: '60px', padding: '10px 14px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#f9fafb', fontSize: '14px', resize: 'none' }} />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Follow-up Actions</label>
          <textarea value={fields.follow_up_actions} placeholder="Enter next steps or tasks..." readOnly style={{ width: '97.5%', height: '60px', padding: '10px 14px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#f9fafb', fontSize: '14px', resize: 'none' }} />
        </div>

        {/* AI Suggested Follow-ups Block */}
        <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#2563eb', letterSpacing: '0.05em', marginBottom: '8px' }}>AI SUGGESTED FOLLOW-UPS:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {fields.ai_suggested_follow_ups ? (
              <pre style={{ margin: 0, fontFamily: 'inherit', fontSize: '13px', color: '#2563eb', whiteSpace: 'pre-line', lineHeight: '1.5' }}>{fields.ai_suggested_follow_ups}</pre>
            ) : (
              <>
                <div style={{ color: '#2563eb', fontSize: '13px' }}>+ Schedule follow-up meeting in 2 weeks</div>
                <div style={{ color: '#2563eb', fontSize: '13px' }}>+ Send OncoBoost Phase III PDF</div>
                <div style={{ color: '#2563eb', fontSize: '13px' }}>+ Add Dr. Sharma to advisory board invite list</div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ================= RIGHT SIDE: AI ASSISTANT PANEL ================= */}
      <div style={{ width: '33%', backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', maxHeight: '95vh', marginRight: '16px', marginTop: '12px' }}>
        <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>🤖</span>
            <span style={{ fontWeight: '700', fontSize: '15px', color: '#1e293b' }}>AI Assistant</span>
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px', marginLeft: '24px' }}>Log interaction via chat</div>
        </div>

        {/* Chat Stream History */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px', marginBottom: '16px' }}>
          {chatHistory.map((msg, idx) => (
            <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', backgroundColor: msg.role === 'user' ? '#2563eb' : '#f1f5f9', color: msg.role === 'user' ? '#ffffff' : '#1e293b', padding: '10px 14px', borderRadius: '12px', borderBottomRightRadius: msg.role === 'user' ? '2px' : '12px', borderBottomLeftRadius: msg.role === 'ai' ? '2px' : '12px', fontSize: '13px', maxWidth: '85%', lineHeight: '1.4' }}>
              {msg.text}
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf: 'flex-start', backgroundColor: '#f1f5f9', color: '#6b7280', padding: '10px 14px', borderRadius: '12px', fontSize: '13px', fontStyle: 'italic' }}>
              Invoking LangGraph agents...
            </div>
          )}
        </div>

        {/* Interactive Prompt Sender Form */}
        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '6px 8px', alignItems: 'center' }}>
          <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Describe interaction..." style={{ flex: 1, border: 'none', outline: 'none', fontSize: '13px', color: '#334155', padding: '6px' }} />
          <button type="submit" disabled={loading} style={{ backgroundColor: '#475569', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>▲</span> Log
          </button>
        </form>
      </div>

    </div>
  );
}

export default App;