import React, { useState, useRef, useEffect } from 'react';
import { TM_TEMPLATES, buildTMFromKey, TMTemplate } from '../../engines/tmBuilderEngine';
import { simulateTM, TMHistoryStep } from '../../engines/automataSimulators';
import { GraphEditor } from '../editor/GraphEditor';
import { askAITutor, AIModelConfig } from '../../services/aiService';
import {
  Play, Pause, ChevronLeft, ChevronRight, RotateCcw,
  Cpu, Sparkles, Key, AlertCircle, CheckCircle, XCircle,
  Table, GitBranch
} from 'lucide-react';

// ─────────────────── helpers ───────────────────
function parseAITMResponse(json: string): TMTemplate | null {
  try {
    // Strip markdown fences if present
    const cleaned = json.replace(/```json|```/g, '').trim();
    const obj = JSON.parse(cleaned);
    if (!obj.tm || !obj.label) return null;
    return obj as TMTemplate;
  } catch {
    return null;
  }
}

// ─────────────────── component ───────────────────
export const TMSimulator: React.FC = () => {
  // ── AI key (read from localStorage same as AITutorView) ──
  const [apiKey]    = useState(() => localStorage.getItem('automata_ai_key') || '');
  const [provider]  = useState<'openai' | 'anthropic' | 'gemini'>(() =>
    (localStorage.getItem('automata_ai_provider') as any) || 'gemini'
  );
  const hasKey = apiKey.trim().length > 0;

  // ── mode ──
  const [mode, setMode] = useState<'preset' | 'ai'>(hasKey ? 'preset' : 'preset');

  // ── preset selection ──
  const [selectedKey, setSelectedKey] = useState<string>(TM_TEMPLATES[0].key);

  // ── AI generation ──
  const [aiQuery,   setAiQuery]   = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError,   setAiError]   = useState('');

  // ── active template ──
  const [template, setTemplate] = useState<TMTemplate>(TM_TEMPLATES[0]);

  // ── simulation ──
  const [testInput,     setTestInput]     = useState(TM_TEMPLATES[0].testCases[0]?.input ?? '0011');
  const [history,       setHistory]       = useState<TMHistoryStep[]>([]);
  const [stepIdx,       setStepIdx]       = useState(0);
  const [isPlaying,     setIsPlaying]     = useState(false);
  const [playSpeed,     setPlaySpeed]     = useState(700);
  const intervalRef = useRef<any>(null);

  // ── active view sub-tab ──
  const [viewTab, setViewTab] = useState<'diagram' | 'table'>('diagram');

  // ── load a template ──
  function loadTemplate(tmpl: TMTemplate, input?: string) {
    setTemplate(tmpl);
    const ti = input ?? tmpl.testCases[0]?.input ?? '';
    setTestInput(ti);
    runSim(tmpl, ti);
    setStepIdx(0);
    setIsPlaying(false);
  }

  function runSim(tmpl: TMTemplate, input: string) {
    const trace = simulateTM(tmpl.tm, input, 500);
    setHistory(trace);
    setStepIdx(0);
    setIsPlaying(false);
  }

  // preset change
  useEffect(() => {
    const tmpl = buildTMFromKey(selectedKey);
    if (tmpl) loadTemplate(tmpl);
  }, [selectedKey]);

  // playback
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setStepIdx(prev => {
          if (prev < history.length - 1) return prev + 1;
          setIsPlaying(false);
          return prev;
        });
      }, playSpeed);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, history, playSpeed]);

  // ── AI generation ──
  async function handleAIGenerate() {
    if (!aiQuery.trim() || !hasKey) return;
    setAiLoading(true);
    setAiError('');
    const systemPrompt = `You are an expert in Theory of Computation. 
The user will describe a formal language. You must output a VALID JSON object representing a Turing Machine for that language.
The JSON must follow this TypeScript shape exactly:
{
  "key": string,
  "label": string,
  "languageDescription": string,
  "formalDefinition": string,
  "testCases": [{ "input": string, "expected": "accept" | "reject" }],
  "tm": {
    "alphabet": string[],
    "tapeAlphabet": string[],
    "blankSymbol": "_",
    "states": [{ "id": string, "name": string, "isStart": boolean, "isAccept": boolean, "x": number, "y": number }],
    "transitions": [{ "from": string, "to": string, "readSymbol": string, "writeSymbol": string, "direction": "L" | "R" | "N" }]
  }
}
Layout states in a horizontal chain: x = 80 + idx*180, y = 200.
Output ONLY the JSON, no markdown fences, no explanation.`;

    const config: AIModelConfig = { apiKey, provider, explanationMode: 'detailed' };
    const raw = await askAITutor(config, systemPrompt, `Language to model: ${aiQuery}`);
    const parsed = parseAITMResponse(raw);
    if (parsed) {
      loadTemplate(parsed);
      setAiError('');
    } else {
      setAiError('AI returned an invalid structure. Try rephrasing your language description.');
    }
    setAiLoading(false);
  }

  // ── derived simulation state ──
  const currentStep = history[stepIdx];
  const tape        = currentStep?.tape ?? (testInput ? testInput.split('') : ['_']);
  const headPos     = currentStep?.headPosition ?? 0;
  const stateName   = currentStep?.state ?? '';
  const isLastStep  = stepIdx === history.length - 1 && history.length > 0;
  const isAccepted  = isLastStep && (() => {
    const s = template.tm.states.find(st => st.id === currentStep?.state);
    return !!(s?.isAccept);
  })();
  const isRejected  = isLastStep && !isAccepted && history.length > 1;

  // All unique tape alphabet symbols for table header
  const tapeSymbols = template.tm.tapeAlphabet;
  const tmStates    = template.tm.states;

  // ── styles ──
  const panelStyle: React.CSSProperties = {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '20px'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── Header / Mode Selector ── */}
      <div style={{ ...panelStyle }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Cpu size={20} style={{ color: 'var(--accent-color)' }} />
          <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Turing Machine Builder</h3>
        </div>

        {/* Mode tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
          <button
            onClick={() => setMode('preset')}
            className="btn-secondary"
            style={{
              backgroundColor: mode === 'preset' ? 'var(--accent-color)' : 'var(--bg-tertiary)',
              color: mode === 'preset' ? '#fff' : 'var(--text-primary)',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <GitBranch size={14} /> Built-in Languages
          </button>

          {hasKey ? (
            <button
              onClick={() => setMode('ai')}
              className="btn-secondary"
              style={{
                backgroundColor: mode === 'ai' ? 'var(--accent-color)' : 'var(--bg-tertiary)',
                color: mode === 'ai' ? '#fff' : 'var(--text-primary)',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <Sparkles size={14} /> AI Generate
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', backgroundColor: 'rgba(255,170,0,0.08)', border: '1px solid rgba(255,170,0,0.2)', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <Key size={13} /> Add API key in AI Tutor to unlock AI generation
            </div>
          )}
        </div>

        {/* ── Preset mode ── */}
        {mode === 'preset' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>LANGUAGE</label>
              <select
                value={selectedKey}
                onChange={e => setSelectedKey(e.target.value)}
                style={{ padding: '9px 14px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '14px', minWidth: '260px' }}
              >
                {TM_TEMPLATES.map(t => (
                  <option key={t.key} value={t.key}>{t.label}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>TEST STRING</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={testInput}
                  onChange={e => setTestInput(e.target.value)}
                  style={{ padding: '9px 14px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '14px', width: '160px', fontFamily: 'monospace' }}
                  placeholder="e.g. 0011"
                />
                <button className="btn-primary" onClick={() => runSim(template, testInput)}>
                  <Play size={14} style={{ display: 'inline', marginRight: '6px' }} />Run
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── AI mode ── */}
        {mode === 'ai' && hasKey && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>DESCRIBE YOUR LANGUAGE</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={aiQuery}
                  onChange={e => setAiQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAIGenerate()}
                  placeholder="e.g. strings with equal number of a's and b's"
                  style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '14px' }}
                />
                <button
                  className="btn-primary"
                  onClick={handleAIGenerate}
                  disabled={aiLoading}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '120px', justifyContent: 'center' }}
                >
                  {aiLoading
                    ? <><span style={{ width: '14px', height: '14px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Generating</>
                    : <><Sparkles size={14} /> Generate TM</>}
                </button>
              </div>
            </div>

            {aiError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: 'var(--error-color)', fontSize: '13px' }}>
                <AlertCircle size={15} /> {aiError}
              </div>
            )}

            {/* Test string for AI mode */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>TEST STRING</label>
              <input
                type="text"
                value={testInput}
                onChange={e => setTestInput(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '14px', width: '140px', fontFamily: 'monospace' }}
              />
              <button className="btn-secondary" onClick={() => runSim(template, testInput)}>Run</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Language info banner ── */}
      <div style={{ ...panelStyle, padding: '14px 20px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '11px', color: 'var(--accent-color)', fontWeight: 700, letterSpacing: '0.5px' }}>LANGUAGE</span>
          <div style={{ fontSize: '16px', fontWeight: 600, marginTop: '2px' }}>{template.label}</div>
        </div>
        <div style={{ height: '36px', width: '1px', backgroundColor: 'var(--border-color)' }} />
        <div>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700 }}>FORMAL DEFINITION</span>
          <div style={{ fontSize: '13px', fontFamily: 'monospace', marginTop: '2px', color: 'var(--text-secondary)' }}>{template.formalDefinition}</div>
        </div>
        <div style={{ height: '36px', width: '1px', backgroundColor: 'var(--border-color)' }} />
        <div>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700 }}>STATES</span>
          <div style={{ fontSize: '13px', marginTop: '2px', fontWeight: 600 }}>{template.tm.states.length}</div>
        </div>
        <div>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700 }}>TRANSITIONS</span>
          <div style={{ fontSize: '13px', marginTop: '2px', fontWeight: 600 }}>{template.tm.transitions.length}</div>
        </div>
      </div>

      {/* ── Diagram + Table ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }}>

        {/* Left: diagram / table toggle */}
        <div style={{ ...panelStyle, padding: '0', overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
            {(['diagram', 'table'] as const).map(t => (
              <button
                key={t}
                onClick={() => setViewTab(t)}
                style={{
                  flex: 1, padding: '12px', fontSize: '13px', fontWeight: 600,
                  backgroundColor: viewTab === t ? 'var(--accent-color)' : 'transparent',
                  color: viewTab === t ? 'white' : 'var(--text-secondary)',
                  border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}
              >
                {t === 'diagram' ? <><GitBranch size={13} /> State Diagram</> : <><Table size={13} /> Transition Table</>}
              </button>
            ))}
          </div>

          {viewTab === 'diagram' && (
            <GraphEditor
              states={template.tm.states.map(s => ({
                ...s,
                // Highlight current state
                name: s.name
              }))}
              transitions={template.tm.transitions.map(t => ({
                from: t.from,
                to:   t.to,
                symbols: [`${t.readSymbol}→${t.writeSymbol},${t.direction}`]
              }))}
              onChange={() => {}}
              alphabet={template.tm.alphabet}
            />
          )}

          {viewTab === 'table' && (
            <div style={{ padding: '20px', overflowX: 'auto' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                δ(state, read) = (write, direction, next state)
              </p>
              <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '13px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '10px 14px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', textAlign: 'left', fontWeight: 700, color: 'var(--text-secondary)' }}>State</th>
                    {tapeSymbols.map(sym => (
                      <th key={sym} style={{ padding: '10px 14px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', textAlign: 'center', fontWeight: 700, color: 'var(--accent-color)', fontFamily: 'monospace' }}>{sym}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tmStates.map(s => (
                    <tr
                      key={s.id}
                      style={{ backgroundColor: s.id === stateName ? 'rgba(99,102,241,0.12)' : 'transparent' }}
                    >
                      <td style={{ padding: '10px 14px', border: '1px solid var(--border-color)', fontWeight: 600, fontFamily: 'monospace', color: s.isAccept ? 'var(--success-color)' : s.isStart ? 'var(--accent-color)' : 'var(--text-primary)' }}>
                        {s.isStart ? '→ ' : ''}{s.isAccept ? '★ ' : ''}{s.name}
                      </td>
                      {tapeSymbols.map(sym => {
                        const tr = template.tm.transitions.find(t => t.from === s.id && t.readSymbol === sym);
                        const isCurrent = s.id === stateName && sym === (tape[headPos] ?? '_');
                        return (
                          <td
                            key={sym}
                            style={{
                              padding: '10px 14px',
                              border: '1px solid var(--border-color)',
                              textAlign: 'center',
                              fontFamily: 'monospace',
                              fontSize: '12px',
                              backgroundColor: isCurrent ? 'rgba(99,102,241,0.2)' : 'transparent',
                              color: tr ? 'var(--text-primary)' : 'var(--text-secondary)'
                            }}
                          >
                            {tr
                              ? <span title={`Write ${tr.writeSymbol}, move ${tr.direction}, go to ${tr.to}`}>
                                  ({tr.to}, {tr.writeSymbol}, {tr.direction})
                                </span>
                              : '—'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '12px' }}>→ = start state &nbsp;&nbsp; ★ = accept state &nbsp;&nbsp; Highlighted row/cell = current step</p>
            </div>
          )}
        </div>

        {/* Right: test cases */}
        <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>Sample Test Cases</h4>
          {template.testCases.map((tc, i) => (
            <button
              key={i}
              onClick={() => { setTestInput(tc.input); runSim(template, tc.input); }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderRadius: '8px', cursor: 'pointer',
                backgroundColor: testInput === tc.input ? 'rgba(99,102,241,0.12)' : 'var(--bg-primary)',
                border: `1px solid ${testInput === tc.input ? 'var(--accent-color)' : 'var(--border-color)'}`,
                color: 'var(--text-primary)', transition: 'all 0.18s'
              }}
            >
              <span style={{ fontFamily: 'monospace', fontSize: '14px' }}>{tc.input === '' ? 'ε (empty)' : tc.input}</span>
              <span style={{
                fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px',
                backgroundColor: tc.expected === 'accept' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                color: tc.expected === 'accept' ? 'var(--success-color)' : 'var(--error-color)'
              }}>
                {tc.expected.toUpperCase()}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Tape Visualizer + Controls ── */}
      <div style={{ ...panelStyle }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>State:</span>
            <span style={{
              padding: '4px 12px', borderRadius: '99px', fontFamily: 'monospace', fontSize: '14px', fontWeight: 700,
              backgroundColor: tmStates.find(s => s.id === stateName)?.isAccept
                ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.12)',
              color: tmStates.find(s => s.id === stateName)?.isAccept ? 'var(--success-color)' : 'var(--accent-color)'
            }}>
              {stateName || '—'}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Step {stepIdx} / {history.length - 1}
            </span>
          </div>

          {/* Playback */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="btn-secondary" style={{ padding: '8px' }} onClick={() => setStepIdx(Math.max(0, stepIdx - 1))} disabled={stepIdx === 0}>
              <ChevronLeft size={16} />
            </button>
            <button className="btn-primary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button className="btn-secondary" style={{ padding: '8px' }} onClick={() => setStepIdx(Math.min(history.length - 1, stepIdx + 1))} disabled={stepIdx === history.length - 1}>
              <ChevronRight size={16} />
            </button>
            <button className="btn-secondary" style={{ padding: '8px' }} onClick={() => { setStepIdx(0); setIsPlaying(false); }}>
              <RotateCcw size={16} />
            </button>
            <select
              value={playSpeed}
              onChange={e => setPlaySpeed(Number(e.target.value))}
              style={{ padding: '6px 10px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '12px' }}
            >
              <option value={1400}>Slow</option>
              <option value={700}>Normal</option>
              <option value={300}>Fast</option>
            </select>
          </div>
        </div>

        {/* Tape cells */}
        <div style={{ overflowX: 'auto', paddingBottom: '8px' }}>
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-start', minWidth: 'max-content', padding: '8px 4px' }}>
            {/* Show some blank context to the left */}
            {[...Array(2)].map((_, i) => (
              <div key={`pre-${i}`} style={cellStyle(false, false)}>_</div>
            ))}
            {tape.map((cell, idx) => (
              <div key={idx} style={cellStyle(idx === headPos, false)}>
                {cell}
                {idx === headPos && (
                  <div style={{
                    position: 'absolute', bottom: '-22px', left: '50%', transform: 'translateX(-50%)',
                    fontSize: '10px', color: 'var(--accent-color)', fontWeight: 700, whiteSpace: 'nowrap'
                  }}>▲ head</div>
                )}
              </div>
            ))}
            {[...Array(2)].map((_, i) => (
              <div key={`post-${i}`} style={cellStyle(false, false)}>_</div>
            ))}
          </div>
        </div>

        {/* Step description */}
        {currentStep?.transitionTaken && (
          <div style={{ marginTop: '28px', padding: '12px 16px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', fontFamily: 'monospace', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>δ(</span>
            <span style={{ color: 'var(--accent-color)', fontWeight: 700 }}>{currentStep.transitionTaken.from}</span>
            <span style={{ color: 'var(--text-secondary)' }}>, </span>
            <span style={{ color: '#f59e0b', fontWeight: 700 }}>{currentStep.transitionTaken.read}</span>
            <span style={{ color: 'var(--text-secondary)' }}>) = (</span>
            <span style={{ color: '#10b981', fontWeight: 700 }}>{currentStep.transitionTaken.to}</span>
            <span style={{ color: 'var(--text-secondary)' }}>, </span>
            <span style={{ color: '#f59e0b' }}>{currentStep.transitionTaken.write}</span>
            <span style={{ color: 'var(--text-secondary)' }}>, </span>
            <span style={{ color: '#a78bfa' }}>{currentStep.transitionTaken.dir}</span>
            <span style={{ color: 'var(--text-secondary)' }}>)</span>
          </div>
        )}

        {/* Accept / Reject banner */}
        {isLastStep && history.length > 1 && (
          <div style={{
            marginTop: '16px', padding: '14px 18px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px',
            backgroundColor: isAccepted ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${isAccepted ? 'var(--success-color)' : 'var(--error-color)'}`,
            color: isAccepted ? 'var(--success-color)' : 'var(--error-color)',
            fontWeight: 700, fontSize: '15px'
          }}>
            {isAccepted
              ? <><CheckCircle size={20} /> String Accepted — Halted in accept state <strong>{stateName}</strong></>
              : <><XCircle    size={20} /> String Rejected — No transition from state <strong>{stateName}</strong></>}
          </div>
        )}
      </div>

      {/* ── CSS keyframe for spinner ── */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ─────────────────── helper: tape cell style ───────────────────
function cellStyle(isHead: boolean, _isDim: boolean): React.CSSProperties {
  return {
    position: 'relative',
    width: '48px', height: '48px', minWidth: '48px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: `2px solid ${isHead ? 'var(--accent-color)' : 'var(--border-color)'}`,
    borderRadius: '6px',
    backgroundColor: isHead ? 'rgba(99,102,241,0.18)' : 'var(--bg-primary)',
    fontFamily: 'monospace', fontSize: '20px', fontWeight: 700,
    color: isHead ? 'var(--accent-color)' : 'var(--text-primary)',
    boxShadow: isHead ? '0 0 0 3px rgba(99,102,241,0.25)' : 'none',
    transition: 'all 0.2s ease',
    marginBottom: '24px'
  };
}
