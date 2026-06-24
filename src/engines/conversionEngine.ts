import { Automaton } from '../types/automata';
import { epsilonClosure } from './automataSimulators';

export interface ConversionStep {
  stepIndex: number;
  description: string;
  sourceFocusStateIds?: string[];
  targetAutomatonStateId?: string;
  automatonState: Automaton;
}

export function convertNFAtoDFA(nfa: Automaton): ConversionStep[] {
  const steps: ConversionStep[] = [];
  const alphabet = nfa.alphabet;

  // Initialize target DFA states and transitions
  const dfaStates: { id: string; name: string; isStart: boolean; isAccept: boolean; x: number; y: number; nfaSubstates: string[] }[] = [];
  const dfaTransitions: { from: string; to: string; symbols: string[] }[] = [];

  // Compute start state closure
  const startState = nfa.states.find(s => s.isStart);
  if (!startState) return [];

  const startClosure = epsilonClosure(nfa, [startState.id]).sort();
  const getDFAStateName = (substates: string[]) => {
    if (substates.length === 0) return 'trap';
    return '{' + substates.map(id => {
      const st = nfa.states.find(s => s.id === id);
      return st ? st.name : id;
    }).join(',') + '}';
  };

  const getOrCreateDFAState = (substates: string[]) => {
    const key = substates.join(',');
    let existing = dfaStates.find(s => s.nfaSubstates.join(',') === key);
    if (!existing) {
      const name = getDFAStateName(substates);
      const isStart = dfaStates.length === 0;
      const isAccept = substates.some(id => {
        const sObj = nfa.states.find(s => s.id === id);
        return sObj ? sObj.isAccept : false;
      });
      // simple coordinate circle layout
      const angle = (dfaStates.length * 45 * Math.PI) / 180;
      const x = 200 + 150 * Math.cos(angle);
      const y = 200 + 150 * Math.sin(angle);
      
      const newDFAState = {
        id: `dfa_${dfaStates.length}`,
        name,
        isStart,
        isAccept,
        x,
        y,
        nfaSubstates: [...substates]
      };
      dfaStates.push(newDFAState);
      existing = newDFAState;
    }
    return existing;
  };

  const startDFAState = getOrCreateDFAState(startClosure);

  const getDFAObj = (): Automaton => ({
    type: 'DFA',
    alphabet: [...alphabet],
    states: dfaStates.map(({ id, name, isStart, isAccept, x, y }) => ({ id, name, isStart, isAccept, x, y })),
    transitions: [...dfaTransitions]
  });

  steps.push({
    stepIndex: 0,
    description: `Compute the epsilon-closure of the NFA start state: ${startClosure.join(', ')}. This forms the initial DFA state: ${startDFAState.name}.`,
    sourceFocusStateIds: startClosure,
    targetAutomatonStateId: startDFAState.id,
    automatonState: getDFAObj()
  });

  const queue: typeof dfaStates[0][] = [startDFAState];
  const processedKeys = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentKey = current.nfaSubstates.join(',');
    if (processedKeys.has(currentKey)) continue;
    processedKeys.add(currentKey);

    for (const sym of alphabet) {
      // Find where current sub-states transition on symbol sym
      const reachSet = new Set<string>();
      for (const subId of current.nfaSubstates) {
        const matchingTrans = nfa.transitions.filter(t => t.from === subId && t.symbols.includes(sym));
        for (const t of matchingTrans) {
          reachSet.add(t.to);
        }
      }

      // Compute epsilon closure of reached states
      const closure = epsilonClosure(nfa, Array.from(reachSet)).sort();
      const targetState = getOrCreateDFAState(closure);

      // Add transition if not already added
      if (!dfaTransitions.some(t => t.from === current.id && t.to === targetState.id && t.symbols.includes(sym))) {
        dfaTransitions.push({
          from: current.id,
          to: targetState.id,
          symbols: [sym]
        });
      }

      steps.push({
        stepIndex: steps.length,
        description: `From DFA state ${current.name} (substates: ${current.nfaSubstates.join(', ')}), reading '${sym}' reaches states ${Array.from(reachSet).join(', ')}. Epsilon closure is ${closure.join(', ')}, mapping to DFA state ${targetState.name}.`,
        sourceFocusStateIds: current.nfaSubstates,
        targetAutomatonStateId: targetState.id,
        automatonState: getDFAObj()
      });

      // queue target state if it hasn't been processed
      const targetKey = targetState.nfaSubstates.join(',');
      if (!processedKeys.has(targetKey) && !queue.some(q => q.nfaSubstates.join(',') === targetKey)) {
        queue.push(targetState);
      }
    }
  }

  return steps;
}
