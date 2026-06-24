import React, { useState } from 'react';
import { Automaton } from '../../types/automata';
import { simulateFA } from '../../engines/automataSimulators';
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw, Volume2 } from 'lucide-react';

interface SimulatorControlsProps {
  automaton: Automaton;
  onNarrationRequest?: (stepExplanation: string) => void;
}

export const SimulatorControls: React.FC<SimulatorControlsProps> = ({
  automaton,
  onNarrationRequest
}) => {
  const [inputString, setInputString] = useState<string>('010101');
  const [history, setHistory] = useState<any[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1000); // ms per step
  const intervalRef = React.useRef<any>(null);

  const startSimulation = () => {
    const trace = simulateFA(automaton, inputString);
    setHistory(trace);
    setCurrentStepIdx(0);
    setIsPlaying(false);
  };

  React.useEffect(() => {
    startSimulation();
  }, [automaton, inputString]);

  // Handle Playback Interval
  React.useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentStepIdx(prev => {
          if (prev < history.length - 1) {
            return prev + 1;
          }
          setIsPlaying(false);
          return prev;
        });
      }, playbackSpeed);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, history, playbackSpeed]);

  const stepForward = () => {
    if (currentStepIdx < history.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
    }
  };

  const stepBackward = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
    }
  };

  const resetSim = () => {
    setCurrentStepIdx(0);
    setIsPlaying(false);
  };

  const currentStep = history[currentStepIdx];
  const isAccepted = currentStep 
    ? currentStep.remainingInput.length === 0 && currentStep.activeStates.some((id: string) => {
        const s = automaton.states.find(st => st.id === id);
        return s ? s.isAccept : false;
      })
    : false;

  // Socratic Narration Helper
  const triggerNarration = () => {
    if (!currentStep || !onNarrationRequest) return;
    const activeNames = currentStep.activeStates.map((id: string) => automaton.states.find(s => s.id === id)?.name).join(', ');
    let text = `In step ${currentStep.stepIndex}, the active states are {${activeNames}}. `;
    if (currentStep.currentSymbol) {
      text += `We just read the symbol '${currentStep.currentSymbol}', transition taken: ${currentStep.transitionsTaken.map((t: any) => `${t.from} to ${t.to}`).join(', ')}. `;
    } else {
      text += `This is the starting state configuration. `;
    }
    text += `Remaining input suffix to process is: "${currentStep.remainingInput}".`;
    onNarrationRequest(text);
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', marginTop: '20px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Input Text Box */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ fontSize: '13px', fontWeight: 600 }}>Input String:</label>
          <input
            type="text"
            value={inputString}
            onChange={(e) => setInputString(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
          />
          <button className="btn-primary" onClick={startSimulation} style={{ padding: '8px 14px' }}>Load</button>
        </div>

        {/* Playback Actions */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={stepBackward} disabled={currentStepIdx === 0} className="btn-secondary" style={{ padding: '8px' }}>
            <ChevronLeft size={16} />
          </button>
          
          <button onClick={() => setIsPlaying(!isPlaying)} className="btn-primary" style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>

          <button onClick={stepForward} disabled={currentStepIdx === history.length - 1} className="btn-secondary" style={{ padding: '8px' }}>
            <ChevronRight size={16} />
          </button>

          <button onClick={resetSim} className="btn-secondary" style={{ padding: '8px' }}>
            <RotateCcw size={16} />
          </button>
        </div>

        {/* Speed Controls */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Speed:</span>
          <select 
            value={playbackSpeed} 
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            style={{ padding: '6px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
          >
            <option value={1500}>Slow (1.5s)</option>
            <option value={1000}>Normal (1s)</option>
            <option value={500}>Fast (0.5s)</option>
          </select>
        </div>

        {/* Narration Assist Button */}
        {onNarrationRequest && (
          <button 
            onClick={triggerNarration} 
            className="btn-secondary" 
            style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px', borderColor: 'var(--accent-color)', color: 'var(--accent-color)' }}
          >
            <Volume2 size={15} /> Explain Step
          </button>
        )}
      </div>

      {/* Progress Status Bar */}
      <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
          <span>Step: <strong>{currentStepIdx} / {history.length - 1}</strong></span>
          <span>Remaining Input: <span style={{ fontFamily: 'monospace', color: 'var(--accent-color)' }}>{currentStep?.remainingInput || 'None'}</span></span>
        </div>

        {/* Highlighted Input String */}
        <div style={{ display: 'flex', gap: '2px', fontFamily: 'monospace', fontSize: '20px', backgroundColor: 'var(--bg-primary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', justifyContent: 'center' }}>
          {inputString.split('').map((char, index) => {
            const isProcessed = index < currentStepIdx;
            const isCurrent = index === currentStepIdx - 1;
            return (
              <span 
                key={index} 
                style={{
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: isCurrent ? 'var(--accent-color)' : 'transparent',
                  color: isCurrent ? 'white' : isProcessed ? 'var(--text-secondary)' : 'var(--text-primary)',
                  fontWeight: isCurrent ? 'bold' : 'normal'
                }}
              >
                {char}
              </span>
            );
          })}
        </div>

        {/* Status Acceptance */}
        {currentStep && currentStep.remainingInput.length === 0 && (
          <div style={{
            marginTop: '12px',
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: isAccepted ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${isAccepted ? 'var(--success-color)' : 'var(--error-color)'}`,
            textAlign: 'center',
            color: isAccepted ? 'var(--success-color)' : 'var(--error-color)',
            fontWeight: 'bold'
          }}>
            {isAccepted ? 'String Accepted! (Halted in Accept State)' : 'String Rejected! (No accepting state matched)'}
          </div>
        )}
      </div>
    </div>
  );
};
