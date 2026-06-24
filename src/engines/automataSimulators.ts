import { Automaton, PDA, TuringMachine } from '../types/automata';

// Compute ε-closure of a set of states
export function epsilonClosure(automaton: Automaton, stateIds: string[]): string[] {
  const closure = new Set<string>(stateIds);
  const queue = [...stateIds];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const epsTrans = automaton.transitions.filter(
      t => t.from === current && t.symbols.includes('ε')
    );
    for (const t of epsTrans) {
      if (!closure.has(t.to)) {
        closure.add(t.to);
        queue.push(t.to);
      }
    }
  }

  return Array.from(closure).sort();
}

// Trace simulation steps for DFA/NFA/ENFA
export interface FAHistoryStep {
  stepIndex: number;
  remainingInput: string;
  currentSymbol: string | null;
  activeStates: string[]; // State IDs
  transitionsTaken: { from: string; to: string; symbol: string }[];
  epsilonTransitionsTaken?: { from: string; to: string }[];
}

export function simulateFA(automaton: Automaton, input: string): FAHistoryStep[] {
  const trace: FAHistoryStep[] = [];
  const startState = automaton.states.find(s => s.isStart);
  if (!startState) return [];

  let currentStates = automaton.type === 'ENFA' 
    ? epsilonClosure(automaton, [startState.id]) 
    : [startState.id];

  // Record initial step
  trace.push({
    stepIndex: 0,
    remainingInput: input,
    currentSymbol: null,
    activeStates: [...currentStates],
    transitionsTaken: []
  });

  for (let i = 0; i < input.length; i++) {
    const symbol = input[i];
    const nextStatesSet = new Set<string>();
    const transitionsTaken: { from: string; to: string; symbol: string }[] = [];

    // NFA / DFA state transition logic
    for (const stateId of currentStates) {
      const matchTrans = automaton.transitions.filter(
        t => t.from === stateId && t.symbols.includes(symbol)
      );
      for (const t of matchTrans) {
        nextStatesSet.add(t.to);
        transitionsTaken.push({ from: stateId, to: t.to, symbol });
      }
    }

    let nextStates = Array.from(nextStatesSet);
    
    // For ENFA, compute epsilon closure of target states
    if (automaton.type === 'ENFA') {
      nextStates = epsilonClosure(automaton, nextStates);
    }

    currentStates = nextStates;
    trace.push({
      stepIndex: i + 1,
      remainingInput: input.slice(i + 1),
      currentSymbol: symbol,
      activeStates: [...currentStates],
      transitionsTaken
    });
  }

  return trace;
}

// PDA Simulator Step Trace
export interface PDAHistoryStep {
  stepIndex: number;
  state: string;
  remainingInput: string;
  currentSymbol: string | null;
  stack: string[];
  transitionTaken: { from: string; to: string; input: string; pop: string; push: string[] } | null;
}

export function simulatePDA(pda: PDA, input: string, maxSteps = 1000): PDAHistoryStep[] {
  const trace: PDAHistoryStep[] = [];
  const startState = pda.states.find(s => s.isStart);
  if (!startState) return [];

  // PDA state
  let currentState = startState.id;
  let stack = [pda.startStackSymbol];
  let remainingInput = input;
  let stepIndex = 0;

  trace.push({
    stepIndex,
    state: currentState,
    remainingInput,
    currentSymbol: null,
    stack: [...stack],
    transitionTaken: null
  });

  while (stepIndex < maxSteps) {
    const nextSymbol = remainingInput.length > 0 ? remainingInput[0] : 'ε';
    const topStack = stack.length > 0 ? stack[stack.length - 1] : 'ε';

    // Find applicable transitions: match (inputSymbol, popSymbol)
    // Priority: try matching exact symbol first, fallback to ε input transition.
    let transition = pda.transitions.find(
      t => t.from === currentState && t.inputSymbol === nextSymbol && t.popSymbol === topStack
    );

    // Try stack-epsilon match or input-epsilon match
    if (!transition) {
      transition = pda.transitions.find(
        t => t.from === currentState && t.inputSymbol === nextSymbol && t.popSymbol === 'ε'
      );
    }
    if (!transition && nextSymbol !== 'ε') {
      // Try input ε
      transition = pda.transitions.find(
        t => t.from === currentState && t.inputSymbol === 'ε' && t.popSymbol === topStack
      );
    }
    if (!transition && nextSymbol !== 'ε') {
      // Try double ε
      transition = pda.transitions.find(
        t => t.from === currentState && t.inputSymbol === 'ε' && t.popSymbol === 'ε'
      );
    }

    if (!transition) {
      break; // No path forward: halt/reject
    }

    // Apply transition
    currentState = transition.to;
    
    // Pop symbol
    if (transition.popSymbol !== 'ε') {
      stack.pop();
    }
    // Push symbols (pushed in reverse order so first symbol is on top)
    for (let k = transition.pushSymbols.length - 1; k >= 0; k--) {
      const sym = transition.pushSymbols[k];
      if (sym !== 'ε') {
        stack.push(sym);
      }
    }

    // Consume input symbol if transition consumed it
    let consumedSymbol: string | null = null;
    if (transition.inputSymbol !== 'ε' && remainingInput.length > 0) {
      consumedSymbol = remainingInput[0];
      remainingInput = remainingInput.slice(1);
    }

    stepIndex++;
    trace.push({
      stepIndex,
      state: currentState,
      remainingInput,
      currentSymbol: consumedSymbol,
      stack: [...stack],
      transitionTaken: {
        from: transition.from,
        to: transition.to,
        input: transition.inputSymbol,
        pop: transition.popSymbol,
        push: transition.pushSymbols
      }
    });

    // If string is fully consumed and stack is empty, or we reach an accepting state, we can halt
    const currStateObj = pda.states.find(s => s.id === currentState);
    if (remainingInput.length === 0 && (stack.length === 0 || (currStateObj && currStateObj.isAccept))) {
      break; // Success halt
    }
  }

  return trace;
}

// Turing Machine Simulator Step Trace
export interface TMHistoryStep {
  stepIndex: number;
  state: string;
  tape: string[];
  headPosition: number;
  transitionTaken: { from: string; to: string; read: string; write: string; dir: string } | null;
}

export function simulateTM(tm: TuringMachine, input: string, maxSteps = 1000): TMHistoryStep[] {
  const trace: TMHistoryStep[] = [];
  const startState = tm.states.find(s => s.isStart);
  if (!startState) return [];

  let currentState = startState.id;
  let tape = input.length > 0 ? input.split('') : [tm.blankSymbol];
  let headPosition = 0;
  let stepIndex = 0;

  trace.push({
    stepIndex,
    state: currentState,
    tape: [...tape],
    headPosition,
    transitionTaken: null
  });

  while (stepIndex < maxSteps) {
    // Read symbol
    if (headPosition < 0) {
      tape.unshift(tm.blankSymbol);
      headPosition = 0;
    }
    if (headPosition >= tape.length) {
      tape.push(tm.blankSymbol);
    }
    const readSym = tape[headPosition];

    const transition = tm.transitions.find(
      t => t.from === currentState && t.readSymbol === readSym
    );

    if (!transition) {
      break; // Halt/Reject
    }

    // Apply transition
    currentState = transition.to;
    tape[headPosition] = transition.writeSymbol;

    if (transition.direction === 'L') {
      headPosition--;
    } else if (transition.direction === 'R') {
      headPosition++;
    }

    stepIndex++;
    trace.push({
      stepIndex,
      state: currentState,
      tape: [...tape],
      headPosition,
      transitionTaken: {
        from: transition.from,
        to: transition.to,
        read: transition.readSymbol,
        write: transition.writeSymbol,
        dir: transition.direction
      }
    });

    const currStateObj = tm.states.find(s => s.id === currentState);
    if (currStateObj && currStateObj.isAccept) {
      break; // Accept Halt
    }
  }

  return trace;
}
