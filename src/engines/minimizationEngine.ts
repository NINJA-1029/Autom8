import { Automaton } from '../types/automata';

// Table Filling Algorithm for DFA Minimization
export interface TableMinimizationStep {
  matrix: Record<string, Record<string, boolean>>; // stateId1 -> stateId2 -> isDistinguishable
  description: string;
  markedCount: number;
}

export function minimizeDFATableFilling(dfa: Automaton): { steps: TableMinimizationStep[], minimized: Automaton } {
  const steps: TableMinimizationStep[] = [];
  const states = dfa.states;
  const alphabet = dfa.alphabet;

  // Initialize matrix
  const matrix: Record<string, Record<string, boolean>> = {};
  for (let i = 0; i < states.length; i++) {
    matrix[states[i].id] = {};
    for (let j = 0; j < states.length; j++) {
      matrix[states[i].id][states[j].id] = false;
    }
  }

  // Helper to copy matrix state
  const cloneMatrix = () => {
    const copy: Record<string, Record<string, boolean>> = {};
    for (const id1 in matrix) {
      copy[id1] = { ...matrix[id1] };
    }
    return copy;
  };

  // Step 1: Mark pairs where one is accepting and one is not
  let initMarked = 0;
  for (let i = 0; i < states.length; i++) {
    for (let j = i + 1; j < states.length; j++) {
      const s1 = states[i];
      const s2 = states[j];
      if (s1.isAccept !== s2.isAccept) {
        matrix[s1.id][s2.id] = true;
        matrix[s2.id][s1.id] = true;
        initMarked++;
      }
    }
  }

  steps.push({
    matrix: cloneMatrix(),
    description: `Base case: Mark all pairs where one state is accepting and the other is non-accepting (${initMarked} pairs marked).`,
    markedCount: initMarked
  });

  // Step 2: Iterate and propagate
  let changed = true;
  let iterations = 1;
  while (changed) {
    changed = false;
    let iterationMarked = 0;

    for (let i = 0; i < states.length; i++) {
      for (let j = i + 1; j < states.length; j++) {
        const s1 = states[i];
        const s2 = states[j];

        if (matrix[s1.id][s2.id]) continue; // already marked

        // Check transitions for each symbol
        for (const sym of alphabet) {
          const t1 = dfa.transitions.find(t => t.from === s1.id && t.symbols.includes(sym));
          const t2 = dfa.transitions.find(t => t.from === s2.id && t.symbols.includes(sym));

          if (t1 && t2) {
            if (matrix[t1.to][t2.to]) {
              matrix[s1.id][s2.id] = true;
              matrix[s2.id][s1.id] = true;
              changed = true;
              iterationMarked++;
              break; // finished for this pair
            }
          }
        }
      }
    }

    if (changed) {
      steps.push({
        matrix: cloneMatrix(),
        description: `Iteration ${iterations}: Mark pairs (A, B) where reading some alphabet symbol transitions to an already distinguishable pair. Found ${iterationMarked} new distinguishable pairs.`,
        markedCount: steps[steps.length - 1].markedCount + iterationMarked
      });
      iterations++;
    }
  }

  // Step 3: Construct minimized DFA by combining equivalent states
  const parent: Record<string, string> = {};
  states.forEach(s => {
    parent[s.id] = s.id;
  });

  const find = (id: string): string => {
    if (parent[id] === id) return id;
    return find(parent[id]);
  };

  const union = (id1: string, id2: string) => {
    const root1 = find(id1);
    const root2 = find(id2);
    if (root1 !== root2) {
      parent[root1] = root2;
    }
  };

  // Union unmarked pairs
  for (let i = 0; i < states.length; i++) {
    for (let j = i + 1; j < states.length; j++) {
      const s1 = states[i];
      const s2 = states[j];
      if (!matrix[s1.id][s2.id]) {
        union(s1.id, s2.id);
      }
    }
  }

  // Create minimized states
  const groups: Record<string, string[]> = {};
  states.forEach(s => {
    const root = find(s.id);
    if (!groups[root]) groups[root] = [];
    groups[root].push(s.id);
  });

  const minStates: typeof dfa.states = [];
  const minTransitions: typeof dfa.transitions = [];

  const getMinStateId = (originalId: string) => {
    const root = find(originalId);
    return `min_${root}`;
  };

  for (const root in groups) {
    const originalIds = groups[root];
    const originalStates = originalIds.map(id => states.find(s => s.id === id)!);
    
    const name = '{' + originalStates.map(s => s.name).join(',') + '}';
    const isStart = originalStates.some(s => s.isStart);
    const isAccept = originalStates.some(s => s.isAccept);

    const firstState = originalStates[0];

    minStates.push({
      id: `min_${root}`,
      name,
      isStart,
      isAccept,
      x: firstState.x,
      y: firstState.y
    });
  }

  // Rebuild transitions
  minStates.forEach(minS => {
    const origId = minS.id.replace('min_', '');
    const members = groups[origId];
    // Find representative transitions
    for (const sym of alphabet) {
      // Find where member states go
      const member = members[0];
      const trans = dfa.transitions.find(t => t.from === member && t.symbols.includes(sym));
      if (trans) {
        const destMinId = getMinStateId(trans.to);
        if (!minTransitions.some(t => t.from === minS.id && t.to === destMinId && t.symbols.includes(sym))) {
          minTransitions.push({
            from: minS.id,
            to: destMinId,
            symbols: [sym]
          });
        }
      }
    }
  });

  const minimized: Automaton = {
    type: 'DFA',
    alphabet: [...alphabet],
    states: minStates,
    transitions: minTransitions
  };

  return { steps, minimized };
}
