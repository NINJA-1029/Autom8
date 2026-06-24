import React, { useState } from 'react';
import { ModuleData } from '../../data/modules';
import { practiceQuestions } from '../../data/practiceQuestions';
import { CheckCircle2, AlertCircle, ChevronRight, HelpCircle } from 'lucide-react';

interface PracticeTabProps {
  module: ModuleData;
}

export const PracticeTab: React.FC<PracticeTabProps> = ({ module }) => {
  const questions = practiceQuestions.filter(q => q.moduleId === module.id);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [hintTier, setHintTier] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [answersCount, setAnswersCount] = useState<number>(0);

  if (questions.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        No practice questions loaded for this module yet.
      </div>
    );
  }

  const q = questions[currentIdx];

  const handleSubmit = () => {
    if (!selectedOptionId) return;
    setIsSubmitted(true);
    setAnswersCount(prev => prev + 1);
    if (selectedOptionId === q.correctAnswer) {
      setScore(prev => prev + 1);
    }

    // Save weak topics metadata to LocalStorage if answered incorrectly
    if (selectedOptionId !== q.correctAnswer) {
      const stored = localStorage.getItem('automata_weak_topics') || '[]';
      const parsed = JSON.parse(stored);
      if (!parsed.includes(module.title)) {
        parsed.push(module.title);
        localStorage.setItem('automata_weak_topics', JSON.stringify(parsed));
      }
    }
  };

  const handleNext = () => {
    setSelectedOptionId(null);
    setIsSubmitted(false);
    setHintTier(0);
    setCurrentIdx((currentIdx + 1) % questions.length);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Quiz Tracker Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Question <strong>{currentIdx + 1}</strong> of <strong>{questions.length}</strong>
        </span>
        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Current Score: <strong>{score} / {answersCount}</strong>
        </span>
      </div>

      {/* Question panel */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <span style={{
          textTransform: 'uppercase',
          fontSize: '11px',
          letterSpacing: '1px',
          fontWeight: 'bold',
          color: 'var(--accent-color)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          padding: '4px 8px',
          borderRadius: '4px'
        }}>
          {q.difficulty} • {q.type}
        </span>

        <h2 style={{ fontSize: '18px', fontWeight: 600, marginTop: '16px', marginBottom: '24px' }}>
          {q.questionText}
        </h2>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {q.options?.map(opt => {
            const isSelected = selectedOptionId === opt.id;
            const isCorrect = opt.id === q.correctAnswer;
            
            let borderColor = 'var(--border-color)';
            let bgColor = 'var(--bg-secondary)';

            if (isSelected) {
              borderColor = 'var(--accent-color)';
              bgColor = 'rgba(99, 102, 241, 0.05)';
            }

            if (isSubmitted) {
              if (isCorrect) {
                borderColor = 'var(--success-color)';
                bgColor = 'rgba(16, 185, 129, 0.05)';
              } else if (isSelected) {
                borderColor = 'var(--error-color)';
                bgColor = 'rgba(239, 68, 68, 0.05)';
              }
            }

            return (
              <button
                key={opt.id}
                onClick={() => !isSubmitted && setSelectedOptionId(opt.id)}
                disabled={isSubmitted}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '16px',
                  borderRadius: '10px',
                  border: `2px solid ${borderColor}`,
                  backgroundColor: bgColor,
                  color: 'var(--text-primary)',
                  textAlign: 'left',
                  fontSize: '14px',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: `2px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  backgroundColor: isSelected ? 'var(--accent-color)' : 'transparent',
                  color: isSelected ? 'white' : 'var(--text-secondary)'
                }}>
                  {opt.id.toUpperCase()}
                </div>
                <span>{opt.text}</span>
              </button>
            );
          })}
        </div>

        {/* Action controls */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
          {q.hints.length > hintTier && !isSubmitted && (
            <button
              onClick={() => setHintTier(prev => prev + 1)}
              className="btn-secondary"
              style={{ fontSize: '13px' }}
            >
              Get Hint (Tier {hintTier + 1})
            </button>
          )}

          {!isSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={!selectedOptionId}
              className="btn-primary"
              style={{ opacity: selectedOptionId ? 1 : 0.6 }}
            >
              Submit Answer
            </button>
          ) : (
            <button onClick={handleNext} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              Next Question <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Hints panel */}
      {hintTier > 0 && (
        <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.05)', border: '1px solid var(--warning-color)', borderRadius: '12px', padding: '16px' }}>
          <h4 style={{ color: 'var(--warning-color)', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <HelpCircle size={16} /> Hint (Tier {hintTier}):
          </h4>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {q.hints[hintTier - 1]}
          </p>
        </div>
      )}

      {/* Reasoned Feedback Panels */}
      {isSubmitted && (
        <div className="glass-panel" style={{ padding: '20px', borderLeft: `4px solid ${selectedOptionId === q.correctAnswer ? 'var(--success-color)' : 'var(--error-color)'}` }}>
          <h3 style={{
            fontSize: '15px',
            fontWeight: 600,
            color: selectedOptionId === q.correctAnswer ? 'var(--success-color)' : 'var(--error-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px'
          }}>
            {selectedOptionId === q.correctAnswer ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {selectedOptionId === q.correctAnswer ? 'Correct Explanation' : 'Incorrect Explanation'}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            {Object.entries(q.explanations).map(([optId, expl]) => (
              <div key={optId} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <strong>Option {optId.toUpperCase()}:</strong> {expl}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
