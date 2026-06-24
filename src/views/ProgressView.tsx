import React, { useEffect, useState } from 'react';
import { Award, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';

export const ProgressView: React.FC = () => {
  const [weakTopics, setWeakTopics] = useState<string[]>([]);
  const [completedCount, setCompletedCount] = useState<number>(0);

  useEffect(() => {
    // Load local storage states
    const topics = localStorage.getItem('automata_weak_topics');
    if (topics) {
      setWeakTopics(JSON.parse(topics));
    }
  }, []);

  const handleReset = () => {
    localStorage.removeItem('automata_weak_topics');
    setWeakTopics([]);
    alert('Progress analytics reset successfully.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700 }}>My Progress Dashboard</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Real-time analytics computed directly from your interactive simulator runs and quiz scores.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
          <BookOpen size={32} style={{ color: 'var(--accent-color)', margin: '0 auto 8px' }} />
          <h4 style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Completed Lessons</h4>
          <p style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px' }}>{completedCount} / 9</p>
        </div>

        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
          <Award size={32} style={{ color: 'var(--success-color)', margin: '0 auto 8px' }} />
          <h4 style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Exam Readiness</h4>
          <p style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px', color: 'var(--success-color)' }}>
            {weakTopics.length > 2 ? '50%' : weakTopics.length > 0 ? '80%' : '100%'}
          </p>
        </div>
      </div>

      {/* Weak Topics Section */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <AlertCircle size={18} style={{ color: 'var(--warning-color)' }} />
          Weak Topics Inspector
        </h3>

        {weakTopics.length === 0 ? (
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            No weak topics detected. Complete quizzes in the Practice tabs to collect analytics.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              We detected errors in the following modules. Consider reviewing their lessons or simulating extra strings:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {weakTopics.map((topic, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '13px',
                    backgroundColor: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid var(--warning-color)',
                    color: 'var(--warning-color)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontWeight: 500
                  }}
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleReset}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--error-color)', borderColor: 'var(--error-color)' }}
        >
          <RefreshCw size={14} /> Reset Analytics Data
        </button>
      </div>
    </div>
  );
};
