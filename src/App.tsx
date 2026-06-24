import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './views/DashboardView';
import { ModuleTemplate } from './components/modules/ModuleTemplate';
import { SimulatorsView } from './views/SimulatorsView';
import { AITutorView } from './views/AITutorView';
import { ProgressView } from './views/ProgressView';
import { modulesData } from './data/modules';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Interactive connection state for Socratic AI tutor
  const [pendingNarrationText, setPendingNarrationText] = useState<string | undefined>(undefined);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (next === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  };

  const activeModule = modulesData.find(m => m.id === selectedModuleId);

  return (
    <div className={`app-container ${theme === 'light' ? 'light-theme' : ''}`}>
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        selectedModuleId={selectedModuleId}
        onSelectModule={setSelectedModuleId}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <main className="main-content">
        {selectedModuleId && activeModule ? (
          <ModuleTemplate
            module={activeModule}
            onNarrationRequest={(text) => {
              setPendingNarrationText(text);
              setCurrentView('ai-tutor');
            }}
          />
        ) : (
          <>
            {currentView === 'dashboard' && (
              <DashboardView
                modules={modulesData}
                onSelectModule={(id) => {
                  setSelectedModuleId(id);
                  setCurrentView('learn');
                }}
                onNavigateView={setCurrentView}
              />
            )}

            {currentView === 'learn' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Choose a Study Module</h2>
                <div className="dashboard-grid">
                  {modulesData.map(m => (
                    <div
                      key={m.id}
                      className="glass-panel"
                      onClick={() => setSelectedModuleId(m.id)}
                      style={{ padding: '20px', cursor: 'pointer', transition: 'var(--transition-smooth)' }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-color)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                    >
                      <span style={{ fontSize: '11px', color: 'var(--accent-color)', fontWeight: 'bold' }}>MODULE {m.number}</span>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, marginTop: '4px' }}>{m.title}</h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>{m.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentView === 'simulators' && <SimulatorsView />}

            {currentView === 'ai-tutor' && (
              <AITutorView
                systemNarrationText={pendingNarrationText}
                onClearNarration={() => setPendingNarrationText(undefined)}
              />
            )}

            {currentView === 'progress' && <ProgressView />}

            {currentView === 'practice' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Interactive Module Quizzes</h2>
                <div className="dashboard-grid">
                  {modulesData.map(m => (
                    <div
                      key={m.id}
                      className="glass-panel"
                      onClick={() => setSelectedModuleId(m.id)}
                      style={{ padding: '20px', cursor: 'pointer', transition: 'var(--transition-smooth)' }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-color)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                    >
                      <span style={{ fontSize: '11px', color: 'var(--accent-color)', fontWeight: 'bold' }}>PRACTICE EXAM</span>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, marginTop: '4px' }}>{m.title}</h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>Test your knowledge with progressive hints & solutions.</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
