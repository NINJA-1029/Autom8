import React from 'react';
import { ModuleData } from '../data/modules';
import { BookOpen, Cpu, Sparkles, HelpCircle } from 'lucide-react';

interface DashboardViewProps {
  modules: ModuleData[];
  onSelectModule: (moduleId: string) => void;
  onNavigateView: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  modules,
  onSelectModule,
  onNavigateView
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Hero Welcome Banner */}
      <div className="glass-panel" style={{
        padding: '32px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(129, 140, 248, 0.05) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>
          Welcome to Automata Academy
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '15px', maxWidth: '600px' }}>
          Interactive, step-by-step simulations and formal computational models. Design automata, run derivations, and prepare for your theory exams.
        </p>
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button onClick={() => onNavigateView('learn')} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={16} /> Browse Modules
          </button>
          <button onClick={() => onNavigateView('simulators')} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={16} /> Open Simulators
          </button>
        </div>
      </div>

      {/* Modules Progress Grid */}
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Curriculum Roadmap</h2>
        <div className="dashboard-grid">
          {modules.map(m => (
            <div
              key={m.id}
              className="glass-panel"
              onClick={() => onSelectModule(m.id)}
              style={{
                padding: '20px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                transition: 'var(--transition-smooth)',
                position: 'relative'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-color)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--accent-color)', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  Module {m.number}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {m.estimatedTime}
                </span>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{m.title}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', flex: 1 }}>{m.summary}</p>
              
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', fontSize: '12px', color: 'var(--accent-color)', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Start Learning</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Access Utility Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center', cursor: 'pointer' }} onClick={() => onNavigateView('ai-tutor')}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-color)', flexShrink: 0 }}>
            <Sparkles size={24} style={{ margin: 'auto' }} />
          </div>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 600 }}>AI Tutor Assistance</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Configure API Key & practice Socratic lessons</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center', cursor: 'pointer' }} onClick={() => onNavigateView('practice')}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success-color)', flexShrink: 0 }}>
            <HelpCircle size={24} style={{ margin: 'auto' }} />
          </div>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 600 }}>Interactive Quizzes</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Practice with multi-tier progressive hints</p>
          </div>
        </div>
      </div>

    </div>
  );
};
