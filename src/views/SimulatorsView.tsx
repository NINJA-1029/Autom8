import React, { useState } from 'react';
import { parseRegex, buildThompsonNFA } from '../engines/regexEngine';
import { GraphEditor } from '../components/editor/GraphEditor';
import { convertNFAtoDFA } from '../engines/conversionEngine';
import { minimizeDFATableFilling } from '../engines/minimizationEngine';
import { convertToCNF } from '../engines/grammarEngine';
import { TMSimulator } from '../components/simulators/TMSimulator';
import { CFG, Automaton } from '../types/automata';
import { Layers, ChevronLeft, ChevronRight, Play, RotateCcw, Cpu } from 'lucide-react';

export const SimulatorsView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'regex' | 'conversions' | 'minimization' | 'cnf' | 'turing'>('regex');

  // Regex state
  const [regexInput, setRegexInput] = useState<string>('(a|b)*abb');
  const [thompsonNFA, setThompsonNFA] = useState<Automaton | null>(null);

  // Conversion / Minimization source DFA state
  const [minDFAStates, setMinDFAStates] = useState<any[]>([
    { id: 'A', name: 'A', isStart: true, isAccept: false, x: 100, y: 150 },
    { id: 'B', name: 'B', isStart: false, isAccept: false, x: 250, y: 100 },
    { id: 'C', name: 'C', isStart: false, isAccept: true, x: 250, y: 200 },
    { id: 'D', name: 'D', isStart: false, isAccept: false, x: 400, y: 150 }
  ]);
  const [minDFATransitions, setMinDFATransitions] = useState<any[]>([
    { from: 'A', to: 'B', symbols: ['0'] },
    { from: 'A', to: 'C', symbols: ['1'] },
    { from: 'B', to: 'D', symbols: ['0'] },
    { from: 'B', to: 'C', symbols: ['1'] },
    { from: 'C', to: 'B', symbols: ['0'] },
    { from: 'C', to: 'D', symbols: ['1'] },
    { from: 'D', to: 'D', symbols: ['0', '1'] }
  ]);

  const sourceMinDFA: Automaton = {
    type: 'DFA',
    alphabet: ['0', '1'],
    states: minDFAStates,
    transitions: minDFATransitions
  };

  // Minimization result states
  const [minimizationSteps, setMinimizationSteps] = useState<any[]>([]);
  const [minimizedDFA, setMinimizedDFA] = useState<Automaton | null>(null);
  const [currentMinStepIdx, setCurrentMinStepIdx] = useState<number>(0);

  // CFG input for CNF Converter
  const [cfgInput, setCfgInput] = useState<string>(
    `S -> A B | a\nA -> a A | ε\nB -> b B | b`
  );
  const [cnfHistory, setCnfHistory] = useState<any[]>([]);
  const [currentCNFStepIdx, setCurrentCNFStepIdx] = useState<number>(0);

  const handleRunRegex = () => {
    try {
      const ast = parseRegex(regexInput);
      const nfa = buildThompsonNFA(ast);
      setThompsonNFA(nfa);
    } catch (err) {
      alert('Regex parse error: check matching brackets.');
    }
  };

  const handleRunMinimization = () => {
    const res = minimizeDFATableFilling(sourceMinDFA);
    setMinimizationSteps(res.steps);
    setMinimizedDFA(res.minimized);
    setCurrentMinStepIdx(0);
  };

  const handleRunCNF = () => {
    // Parse user freeform CFG input
    const nonTerminals = new Set<string>();
    const terminals = new Set<string>();
    const productions: any[] = [];

    const lines = cfgInput.split('\n').map(l => l.trim()).filter(Boolean);
    lines.forEach(line => {
      const parts = line.split('->').map(p => p.trim());
      if (parts.length < 2) return;
      const lhs = parts[0];
      nonTerminals.add(lhs);
      const alternatives = parts[1].split('|').map(a => a.trim());
      alternatives.forEach(alt => {
        const rhsSymbols = alt.split(' ').map(s => s.trim()).filter(Boolean);
        productions.push({ lhs, rhs: rhsSymbols });
        // catalog terms/non-terms
        rhsSymbols.forEach(sym => {
          if (sym === 'ε') return;
          if (sym === sym.toLowerCase()) terminals.add(sym);
          else nonTerminals.add(sym);
        });
      });
    });

    const parsedCFG: CFG = {
      nonTerminals: Array.from(nonTerminals),
      terminals: Array.from(terminals),
      productions,
      startSymbol: lines[0]?.split('->')[0]?.trim() || 'S'
    };

    const history = convertToCNF(parsedCFG);
    setCnfHistory(history);
    setCurrentCNFStepIdx(0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Interactive Simulators Hub</h2>
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
          {(['regex', 'conversions', 'minimization', 'cnf'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className="btn-secondary"
              style={{
                backgroundColor: activeSubTab === tab ? 'var(--accent-color)' : 'var(--bg-tertiary)',
                color: activeSubTab === tab ? 'white' : 'var(--text-primary)'
              }}
            >
              {tab.toUpperCase()}
            </button>
          ))}
          {/* Turing Machine tab */}
          <button
            onClick={() => setActiveSubTab('turing')}
            className="btn-secondary"
            style={{
              backgroundColor: activeSubTab === 'turing' ? 'var(--accent-color)' : 'var(--bg-tertiary)',
              color: activeSubTab === 'turing' ? 'white' : 'var(--text-primary)',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Cpu size={14} /> TURING
          </button>
        </div>
      </div>

      {/* 1. REGEX SIMULATOR */}
      {activeSubTab === 'regex' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Thompson NFA Construction</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input
                type="text"
                value={regexInput}
                onChange={(e) => setRegexInput(e.target.value)}
                style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
              />
              <button className="btn-primary" onClick={handleRunRegex}>Parse & Build</button>
            </div>

            {thompsonNFA && (
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
                <GraphEditor
                  states={thompsonNFA.states}
                  transitions={thompsonNFA.transitions}
                  onChange={() => {}}
                  alphabet={thompsonNFA.alphabet}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. DFA MINIMIZATION SIMULATOR */}
      {activeSubTab === 'minimization' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>DFA Minimization (Table-Filling Visualizer)</h3>
            <GraphEditor
              states={minDFAStates}
              transitions={minDFATransitions}
              onChange={(s, t) => { setMinDFAStates(s); setMinDFATransitions(t); }}
              alphabet={['0', '1']}
            />
            <button className="btn-primary" onClick={handleRunMinimization} style={{ marginTop: '16px' }}>Run Minimization</button>
          </div>

          {minimizationSteps.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
              <div className="glass-panel" style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Equivalence Matrix Grid</h4>
                {/* Triangular Table Fill Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${minDFAStates.length + 1}, 50px)`, gap: '4px', overflowX: 'auto', padding: '10px' }}>
                  <div />
                  {minDFAStates.map(s => <div key={s.id} style={{ fontWeight: 'bold', textAlign: 'center' }}>{s.name}</div>)}
                  {minDFAStates.map((s1, rIdx) => (
                    <React.Fragment key={s1.id}>
                      <div style={{ fontWeight: 'bold', alignSelf: 'center' }}>{s1.name}</div>
                      {minDFAStates.map((s2, cIdx) => {
                        const isMarked = minimizationSteps[currentMinStepIdx]?.matrix[s1.id]?.[s2.id];
                        const isDiagonalOrLower = rIdx <= cIdx;
                        return (
                          <div
                            key={s2.id}
                            style={{
                              height: '40px',
                              border: '1px solid var(--border-color)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: isDiagonalOrLower 
                                ? 'rgba(255, 255, 255, 0.02)' 
                                : isMarked 
                                  ? 'rgba(239, 68, 68, 0.15)' 
                                  : 'transparent',
                              color: isMarked ? 'var(--error-color)' : 'var(--text-secondary)'
                            }}
                          >
                            {isDiagonalOrLower ? '-' : isMarked ? 'X' : ''}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Min Panel Description */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="glass-panel" style={{ padding: '20px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Timeline</h4>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button className="btn-secondary" onClick={() => setCurrentMinStepIdx(Math.max(0, currentMinStepIdx - 1))}>
                      <ChevronLeft size={16} />
                    </button>
                    <span style={{ fontSize: '13px' }}>Step {currentMinStepIdx + 1} of {minimizationSteps.length}</span>
                    <button className="btn-secondary" onClick={() => setCurrentMinStepIdx(Math.min(minimizationSteps.length - 1, currentMinStepIdx + 1))}>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '12px' }}>
                    {minimizationSteps[currentMinStepIdx]?.description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. CNF CONVERTER */}
      {activeSubTab === 'cnf' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>CFG to Chomsky Normal Form (CNF)</h3>
            <textarea
              value={cfgInput}
              onChange={(e) => setCfgInput(e.target.value)}
              rows={4}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontFamily: 'monospace', outline: 'none' }}
            />
            <button className="btn-primary" onClick={handleRunCNF} style={{ marginTop: '16px' }}>Convert Grammar</button>
          </div>

          {cnfHistory.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
              <div className="glass-panel" style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Step Grammar Output</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {cnfHistory[currentCNFStepIdx]?.grammar.productions.map((p: any, idx: number) => (
                    <div key={idx} style={{ fontFamily: 'monospace', fontSize: '14px' }}>
                      <strong>{p.lhs}</strong> → {p.rhs.join(' ')}
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Algorithm Stage</h4>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button className="btn-secondary" onClick={() => setCurrentCNFStepIdx(Math.max(0, currentCNFStepIdx - 1))}>
                    <ChevronLeft size={16} />
                  </button>
                  <span style={{ fontSize: '13px' }}>Stage {currentCNFStepIdx + 1} of {cnfHistory.length}</span>
                  <button className="btn-secondary" onClick={() => setCurrentCNFStepIdx(Math.min(cnfHistory.length - 1, currentCNFStepIdx + 1))}>
                    <ChevronRight size={16} />
                  </button>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                  <strong>{cnfHistory[currentCNFStepIdx]?.step.toUpperCase()}:</strong> {cnfHistory[currentCNFStepIdx]?.description}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. TURING MACHINE BUILDER */}
      {activeSubTab === 'turing' && <TMSimulator />}
    </div>
  );
};
