import React, { useState, useRef, useEffect } from 'react';
import { State, Transition } from '../../types/automata';
import { Plus, Trash2, ShieldAlert, ArrowRight, Play, RefreshCw } from 'lucide-react';

interface GraphEditorProps {
  states: State[];
  transitions: Transition[];
  onChange: (states: State[], transitions: Transition[]) => void;
  alphabet: string[];
}

export const GraphEditor: React.FC<GraphEditorProps> = ({
  states,
  transitions,
  onChange,
  alphabet
}) => {
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [selectedTransitionIdx, setSelectedTransitionIdx] = useState<number | null>(null);
  const [draggedStateId, setDraggedStateId] = useState<string | null>(null);
  const [linkingStateId, setLinkingStateId] = useState<string | null>(null);
  const [transitionInput, setTransitionInput] = useState<string>('a');
  
  const canvasRef = useRef<SVGSVGElement | null>(null);

  // Handle Drag Node
  const handlePointerDownState = (e: React.PointerEvent, stateId: string) => {
    e.stopPropagation();
    if (e.shiftKey) {
      // Start linking
      setLinkingStateId(stateId);
    } else {
      setDraggedStateId(stateId);
      setSelectedStateId(stateId);
      setSelectedTransitionIdx(null);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (draggedStateId) {
      const updated = states.map(s => {
        if (s.id === draggedStateId) {
          return { ...s, x, y };
        }
        return s;
      });
      onChange(updated, transitions);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setDraggedStateId(null);
  };

  // Add new state on double click canvas
  const handleDoubleClickCanvas = (e: React.MouseEvent) => {
    if (e.target !== canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const id = `q_${Date.now()}`;
    const name = `q${states.length}`;
    const newState: State = {
      id,
      name,
      isStart: states.length === 0, // first is start
      isAccept: false,
      x,
      y
    };

    onChange([...states, newState], transitions);
  };

  // Link edge creation
  const handleMouseUpState = (targetId: string) => {
    if (linkingStateId && linkingStateId !== targetId) {
      // Create or update transition
      const existingIdx = transitions.findIndex(
        t => t.from === linkingStateId && t.to === targetId
      );

      if (existingIdx !== -1) {
        // Toggle/Add new symbol
        const symbols = transitions[existingIdx].symbols;
        if (!symbols.includes(transitionInput)) {
          const updatedTrans = [...transitions];
          updatedTrans[existingIdx] = {
            ...transitions[existingIdx],
            symbols: [...symbols, transitionInput]
          };
          onChange(states, updatedTrans);
        }
      } else {
        const newTrans: Transition = {
          from: linkingStateId,
          to: targetId,
          symbols: [transitionInput]
        };
        onChange(states, [...transitions, newTrans]);
      }
    }
    setLinkingStateId(null);
  };

  const toggleAccept = (stateId: string) => {
    const updated = states.map(s => {
      if (s.id === stateId) {
        return { ...s, isAccept: !s.isAccept };
      }
      return s;
    });
    onChange(updated, transitions);
  };

  const makeStart = (stateId: string) => {
    const updated = states.map(s => ({
      ...s,
      isStart: s.id === stateId
    }));
    onChange(updated, transitions);
  };

  const deleteState = (stateId: string) => {
    const updatedStates = states.filter(s => s.id !== stateId);
    const updatedTrans = transitions.filter(t => t.from !== stateId && t.to !== stateId);
    setSelectedStateId(null);
    onChange(updatedStates, updatedTrans);
  };

  const deleteTransition = (idx: number) => {
    const updated = transitions.filter((_, i) => i !== idx);
    setSelectedTransitionIdx(null);
    onChange(states, updated);
  };

  return (
    <div style={{ display: 'flex', gap: '20px', height: '500px', margin: '20px 0' }}>
      {/* Visual Canvas Area */}
      <div style={{ flex: 1, position: 'relative', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'var(--bg-secondary)' }}>
        <div style={{ position: 'absolute', top: '12px', left: '12px', pointerEvents: 'none', zIndex: 10 }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            • Double Click to add state<br />
            • Shift + Drag from one state to another to create/add transition edge<br />
            • Drag state to reposition
          </div>
        </div>

        <svg
          ref={canvasRef}
          width="100%"
          height="100%"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onDoubleClick={handleDoubleClickCanvas}
          style={{ cursor: draggedStateId ? 'grabbing' : 'crosshair' }}
        >
          {/* Defs for arrow heads */}
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent-color)" />
            </marker>
          </defs>

          {/* Render Transitions (Edges) */}
          {transitions.map((t, idx) => {
            const fromState = states.find(s => s.id === t.from);
            const toState = states.find(s => s.id === t.to);
            if (!fromState || !toState) return null;

            const isSelected = selectedTransitionIdx === idx;

            if (t.from === t.to) {
              // Self loop path
              const x = fromState.x;
              const y = fromState.y;
              return (
                <g key={`self-${idx}`} onClick={(e) => { e.stopPropagation(); setSelectedTransitionIdx(idx); setSelectedStateId(null); }}>
                  <path
                    d={`M ${x - 15} ${y - 25} C ${x - 30} ${y - 70}, ${x + 30} ${y - 70}, ${x + 15} ${y - 25}`}
                    fill="none"
                    stroke={isSelected ? 'var(--error-color)' : 'var(--accent-color)'}
                    strokeWidth="2.5"
                    markerEnd="url(#arrow)"
                    style={{ cursor: 'pointer' }}
                  />
                  <text x={x} y={y - 55} fill="var(--text-primary)" fontSize="13" textAnchor="middle" fontWeight="bold">
                    {t.symbols.join(', ')}
                  </text>
                </g>
              );
            }

            // Normal transition edge
            const dx = toState.x - fromState.x;
            const dy = toState.y - fromState.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            
            // Offset coordinates slightly to draw curve if there's a reciprocal transition
            const hasReciprocal = transitions.some(tr => tr.from === t.to && tr.to === t.from);
            const controlOffset = hasReciprocal ? 30 : 0;

            const mx = (fromState.x + toState.x) / 2;
            const my = (fromState.y + toState.y) / 2;
            
            // Orthogonal vector for curve control point
            const px = -dy / len;
            const py = dx / len;
            const cx = mx + px * controlOffset;
            const cy = my + py * controlOffset;

            const pathD = hasReciprocal
              ? `M ${fromState.x} ${fromState.y} Q ${cx} ${cy} ${toState.x} ${toState.y}`
              : `M ${fromState.x} ${fromState.y} L ${toState.x} ${toState.y}`;

            return (
              <g key={`edge-${idx}`} onClick={(e) => { e.stopPropagation(); setSelectedTransitionIdx(idx); setSelectedStateId(null); }}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={isSelected ? 'var(--error-color)' : 'var(--accent-color)'}
                  strokeWidth="2.5"
                  markerEnd="url(#arrow)"
                  style={{ cursor: 'pointer' }}
                />
                <text x={cx} y={cy - 8} fill="var(--text-primary)" fontSize="13" textAnchor="middle" fontWeight="bold">
                  {t.symbols.join(', ')}
                </text>
              </g>
            );
          })}

          {/* Render States (Nodes) */}
          {states.map(s => {
            const isSelected = selectedStateId === s.id;
            return (
              <g
                key={s.id}
                onPointerDown={(e) => handlePointerDownState(e, s.id)}
                onMouseUp={() => handleMouseUpState(s.id)}
                style={{ cursor: 'grab' }}
              >
                {/* Accept outer circle */}
                {s.isAccept && (
                  <circle
                    cx={s.x}
                    cy={s.y}
                    r="26"
                    fill="none"
                    stroke={isSelected ? 'var(--accent-color)' : 'var(--text-secondary)'}
                    strokeWidth="2"
                  />
                )}

                {/* Primary Circle */}
                <circle
                  cx={s.x}
                  cy={s.y}
                  r="22"
                  fill="var(--bg-tertiary)"
                  stroke={isSelected ? 'var(--accent-color)' : 'var(--border-color)'}
                  strokeWidth={s.isStart ? '3' : '2'}
                />

                {/* State Label Text */}
                <text
                  x={s.x}
                  y={s.y + 5}
                  textAnchor="middle"
                  fill="var(--text-primary)"
                  fontSize="14"
                  fontWeight="bold"
                  pointerEvents="none"
                >
                  {s.name}
                </text>

                {/* Start State Indicator Arrow */}
                {s.isStart && (
                  <path
                    d={`M ${s.x - 45} ${s.y} L ${s.x - 26} ${s.y}`}
                    stroke="var(--success-color)"
                    strokeWidth="3"
                    markerEnd="url(#arrow)"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Property Details Side Panel */}
      <div style={{ width: '250px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Properties Panel</h3>

        {selectedStateId && (() => {
          const s = states.find(st => st.id === selectedStateId);
          if (!s) return null;
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>State Name</label>
                <input
                  type="text"
                  value={s.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    onChange(states.map(item => item.id === s.id ? { ...item, name: val } : item), transitions);
                  }}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', marginTop: '4px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={s.isAccept}
                  onChange={() => toggleAccept(s.id)}
                  id="chk-accept"
                />
                <label htmlFor="chk-accept" style={{ fontSize: '13px' }}>Accepting State</label>
              </div>

              <button
                onClick={() => makeStart(s.id)}
                className="btn-secondary"
                style={{ width: '100%', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <ArrowRight size={14} /> Make Start State
              </button>

              <button
                onClick={() => deleteState(s.id)}
                className="btn-secondary"
                style={{ width: '100%', color: 'var(--error-color)', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Trash2 size={14} /> Delete State
              </button>
            </div>
          );
        })()}

        {selectedTransitionIdx !== null && (() => {
          const t = transitions[selectedTransitionIdx];
          if (!t) return null;
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Transition: <strong>{states.find(s => s.id === t.from)?.name}</strong> → <strong>{states.find(s => s.id === t.to)?.name}</strong>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Label Symbols (Comma-separated)</label>
                <input
                  type="text"
                  value={t.symbols.join(', ')}
                  onChange={(e) => {
                    const symbols = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    const updated = [...transitions];
                    updated[selectedTransitionIdx] = { ...t, symbols };
                    onChange(states, updated);
                  }}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', marginTop: '4px' }}
                />
              </div>

              <button
                onClick={() => deleteTransition(selectedTransitionIdx)}
                className="btn-secondary"
                style={{ width: '100%', color: 'var(--error-color)', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Trash2 size={14} /> Delete Edge
              </button>
            </div>
          );
        })()}

        {!selectedStateId && selectedTransitionIdx === null && (
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '40px' }}>
            Select a state or transition edge to modify properties.
          </div>
        )}

        <div style={{ marginTop: 'auto' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Symbol for new transitions</label>
          <input
            type="text"
            value={transitionInput}
            onChange={(e) => setTransitionInput(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', marginTop: '4px' }}
          />
        </div>
      </div>
    </div>
  );
};
