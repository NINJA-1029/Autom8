import React, { useState } from 'react';
import { askAITutor, AIModelConfig } from '../services/aiService';
import { Send, Sparkles, MessageSquare, ShieldAlert, Key } from 'lucide-react';

interface AITutorViewProps {
  systemNarrationText?: string;
  onClearNarration?: () => void;
}

export const AITutorView: React.FC<AITutorViewProps> = ({
  systemNarrationText,
  onClearNarration
}) => {
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('automata_ai_key') || '');
  const [provider, setProvider] = useState<'openai' | 'anthropic' | 'gemini'>('gemini');
  const [explanationMode, setExplanationMode] = useState<'concise' | 'standard' | 'detailed'>('standard');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [inputVal, setInputVal] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Sync incoming simulation narrations directly
  React.useEffect(() => {
    if (systemNarrationText) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: `📡 **Simulator Narration**\n\n${systemNarrationText}` }
      ]);
      if (onClearNarration) onClearNarration();
    }
  }, [systemNarrationText]);

  const saveConfig = () => {
    localStorage.setItem('automata_ai_key', apiKey);
    localStorage.setItem('automata_ai_provider', provider);
    alert('API Key Configuration Saved Client-Side!');
  };

  const handleSend = async () => {
    if (!inputVal.trim() || !apiKey) return;
    const userMsg = inputVal;
    setInputVal('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    const config: AIModelConfig = { apiKey, provider, explanationMode };
    const response = await askAITutor(
      config,
      'You are a Socratic Theory of Computation professor at a top university. Guide the student using hints, asking guiding questions, and never giving away full proofs or solutions immediately unless they explicitly request it. Keep formatting clean.',
      userMsg
    );

    setMessages(prev => [...prev, { role: 'assistant', text: response }]);
    setLoading(false);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', height: 'calc(100vh - 120px)' }}>
      
      {/* Settings Side Panel */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Key size={18} /> API Config
        </h3>

        <div>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Provider</label>
          <select 
            value={provider} 
            onChange={(e) => setProvider(e.target.value as any)}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', marginTop: '4px' }}
          >
            <option value="gemini">Google Gemini</option>
            <option value="openai">OpenAI GPT</option>
            <option value="anthropic">Anthropic Claude</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            style={{ width: '100%', padding: '8px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', marginTop: '4px' }}
          />
        </div>

        <button className="btn-primary" onClick={saveConfig} style={{ width: '100%' }}>
          Save Configuration
        </button>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Explanation Detail Mode</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
            {(['concise', 'standard', 'detailed'] as const).map(mode => (
              <label key={mode} style={{ fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="radio"
                  name="detail-mode"
                  checked={explanationMode === mode}
                  onChange={() => setExplanationMode(mode)}
                />
                <span style={{ textTransform: 'capitalize' }}>{mode}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Main Socratic Chat Area */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Chat History */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', textAlign: 'center', gap: '10px' }}>
              <MessageSquare size={36} />
              <p style={{ fontSize: '14px' }}>Ask questions about state transitions, Pumping Lemma proofs, or input symbols. The Socratic Tutor will guide your reasoning.</p>
            </div>
          )}

          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: m.role === 'user' ? 'var(--accent-color)' : 'var(--bg-tertiary)',
                color: m.role === 'user' ? 'white' : 'var(--text-primary)',
                padding: '12px 16px',
                borderRadius: m.role === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                maxWidth: '80%',
                fontSize: '14px',
                whiteSpace: 'pre-wrap'
              }}
            >
              {m.text}
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf: 'flex-start', backgroundColor: 'var(--bg-tertiary)', padding: '12px 16px', borderRadius: '12px 12px 12px 0', fontSize: '13px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
              Tutor is thinking...
            </div>
          )}
        </div>

        {/* Input Text Box */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '12px', backgroundColor: 'var(--bg-secondary)' }}>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={apiKey ? "Ask a question..." : "Please configure and save your API Key first"}
            disabled={!apiKey || loading}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            style={{ flex: 1, padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
          />
          <button
            onClick={handleSend}
            disabled={!apiKey || loading}
            className="btn-primary"
            style={{ padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
