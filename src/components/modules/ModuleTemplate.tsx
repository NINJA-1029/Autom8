import React, { useState } from 'react';
import { ModuleData } from '../../data/modules';
import { GraphEditor } from '../editor/GraphEditor';
import { SimulatorControls } from '../simulators/SimulatorControls';
import { PracticeTab } from './PracticeTab';
import { validateAutomaton } from '../../engines/validationEngine';
import { Automaton } from '../../types/automata';
import { AlertCircle, HelpCircle, BookOpen, Layers, Cpu, HelpCircle as HelpIcon, ShieldAlert } from 'lucide-react';

interface ModuleTemplateProps {
  module: ModuleData;
  onNarrationRequest?: (stepExplanation: string) => void;
}

export const ModuleTemplate: React.FC<ModuleTemplateProps> = ({
  module,
  onNarrationRequest
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'learn' | 'examples' | 'simulator' | 'practice'>('overview');
  
  // Track visual active topic inside Learn Tab
  const [activeTopicIdx, setActiveTopicIdx] = useState<number>(0);

  // Automata Editor State (loaded with pre-configured DFA for the module)
  const [states, setStates] = useState<any[]>([
    { id: 'q0', name: 'q0', isStart: true, isAccept: false, x: 150, y: 200 },
    { id: 'q1', name: 'q1', isStart: false, isAccept: true, x: 350, y: 200 }
  ]);
  const [transitions, setTransitions] = useState<any[]>([
    { from: 'q0', to: 'q1', symbols: ['0'] },
    { from: 'q1', to: 'q0', symbols: ['1'] }
  ]);

  const currentAutomaton: Automaton = {
    type: module.id === 'module-3' ? 'ENFA' : 'DFA',
    alphabet: ['0', '1'],
    states,
    transitions
  };

  // Run live validation engine
  const validationIssues = validateAutomaton(currentAutomaton);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Layers },
    { id: 'learn', label: 'Learn', icon: BookOpen },
    { id: 'examples', label: 'Examples', icon: HelpCircle },
    { id: 'simulator', label: 'Simulator', icon: Cpu },
    { id: 'practice', label: 'Practice', icon: HelpIcon }
  ] as const;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Module Title Banner */}
      <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '-20px', top: '-20px', fontSize: '120px', fontWeight: 'bold', color: 'rgba(99, 102, 241, 0.03)', pointerEvents: 'none', userSelect: 'none' }}>
          M{module.number}
        </div>
        <span style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--accent-color)', letterSpacing: '1px' }}>
          Module {module.number}
        </span>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px', color: 'var(--text-primary)' }}>
          {module.title}
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '14px', maxWidth: '700px' }}>
          {module.summary}
        </p>
      </div>

      {/* Tabs Menu Navigation */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '2px' }}>
        {tabs.map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                borderBottom: isActive ? '3px solid var(--accent-color)' : '3px solid transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 400,
                background: 'transparent',
                fontSize: '14px',
                transition: 'var(--transition-smooth)'
              }}
            >
              <Icon size={16} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div style={{ minHeight: '400px', marginTop: '10px' }}>
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="glass-panel" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Learning Objectives</h3>
                <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {module.objectives.map((obj, i) => <li key={i}>{obj}</li>)}
                </ul>
              </div>

              <div className="glass-panel" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Topics covered in this module:</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {module.topics.map((t, idx) => (
                    <div 
                      key={t.id} 
                      onClick={() => { setActiveTab('learn'); setActiveTopicIdx(idx); }}
                      style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'var(--transition-smooth)' }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-color)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                    >
                      <span style={{ fontSize: '14px', fontWeight: 500 }}>{t.title}</span>
                      <span style={{ fontSize: '12px', color: 'var(--accent-color)', fontWeight: 600 }}>Study Topic →</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="glass-panel" style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Estimated Time</h4>
                <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-color)', marginTop: '4px' }}>{module.estimatedTime}</p>
              </div>

              <div className="glass-panel" style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Prerequisites</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {module.prerequisites.map((p, i) => (
                    <span key={i} style={{ fontSize: '12px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', padding: '4px 8px', borderRadius: '6px', color: 'var(--text-secondary)' }}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LEARN TAB */}
        {activeTab === 'learn' && (
          <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '24px' }}>
            {/* Sidebar list of topics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {module.topics.map((t, idx) => {
                const isActive = activeTopicIdx === idx;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTopicIdx(idx)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: isActive ? 'var(--accent-color)' : 'var(--bg-secondary)',
                      color: isActive ? 'white' : 'var(--text-secondary)',
                      border: '1px solid var(--border-color)',
                      textAlign: 'left',
                      fontWeight: isActive ? 600 : 400,
                      fontSize: '13px'
                    }}
                  >
                    {t.title}
                  </button>
                );
              })}
            </div>

            {/* Core learning content reader */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 600 }}>{module.topics[activeTopicIdx].title}</h2>
              </div>

              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-color)' }}>1. Learning Objectives</h4>
                <ul style={{ paddingLeft: '20px', marginTop: '6px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {module.topics[activeTopicIdx].learnContent.objectives.map((obj, i) => <li key={i}>{obj}</li>)}
                </ul>
              </div>

              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-color)' }}>2. Intuition</h4>
                <p style={{ marginTop: '6px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {module.topics[activeTopicIdx].learnContent.intuition}
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-color)' }}>3. Formal Definition</h4>
                <pre style={{ marginTop: '6px', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '13px', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                  {module.topics[activeTopicIdx].learnContent.formalDefinition}
                </pre>
              </div>

              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-color)' }}>4. Mathematical Notation</h4>
                <pre style={{ marginTop: '6px', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '13px', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                  {module.topics[activeTopicIdx].learnContent.mathNotation}
                </pre>
              </div>

              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-color)' }}>5. Common Mistakes</h4>
                <ul style={{ paddingLeft: '20px', marginTop: '6px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {module.topics[activeTopicIdx].learnContent.commonMistakes.map((m, i) => <li key={i} style={{ color: 'var(--error-color)' }}>{m}</li>)}
                </ul>
              </div>

              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-color)' }}>6. Exam Tips</h4>
                <ul style={{ paddingLeft: '20px', marginTop: '6px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {module.topics[activeTopicIdx].learnContent.examTips.map((t, i) => <li key={i} style={{ color: 'var(--success-color)' }}>{t}</li>)}
                </ul>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Summary</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>
                  {module.topics[activeTopicIdx].learnContent.summary}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* EXAMPLES TAB */}
        {activeTab === 'examples' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Interactive Simulation Example</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Interact with the visual controls below to trace execution. This is a working simulation rather than static pictures.
              </p>
              <GraphEditor
                states={states}
                transitions={transitions}
                onChange={(s, t) => { setStates(s); setTransitions(t); }}
                alphabet={['0', '1']}
              />
              <SimulatorControls
                automaton={currentAutomaton}
                onNarrationRequest={onNarrationRequest}
              />
            </div>
          </div>
        )}

        {/* SIMULATOR TAB */}
        {activeTab === 'simulator' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Display validation warnings live */}
            {validationIssues.length > 0 && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid var(--error-color)', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--error-color)', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                  <ShieldAlert size={16} /> Live Validation Inspector ({validationIssues.length} issues)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {validationIssues.map((issue, idx) => (
                    <div key={idx} style={{ fontSize: '13px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                      <span style={{ fontWeight: 600, color: issue.severity === 'error' ? 'var(--error-color)' : 'var(--warning-color)', textTransform: 'uppercase', marginRight: '6px' }}>
                        [{issue.severity}]
                      </span>
                      <span style={{ color: 'var(--text-primary)' }}>{issue.message}</span>
                      <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '12px', marginTop: '2px' }}>
                        Suggestion: {issue.fixSuggestion}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Automata Builder & Simulator</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                Edit the states, toggle acceptance, click/drag transition arrows, and load custom string to verify machine logic.
              </p>
              
              <GraphEditor
                states={states}
                transitions={transitions}
                onChange={(s, t) => { setStates(s); setTransitions(t); }}
                alphabet={['0', '1']}
              />
              <SimulatorControls
                automaton={currentAutomaton}
                onNarrationRequest={onNarrationRequest}
              />
            </div>
          </div>
        )}

        {/* PRACTICE TAB */}
        {activeTab === 'practice' && (
          <PracticeTab module={module} />
        )}

      </div>
    </div>
  );
};
