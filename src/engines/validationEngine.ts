import { Automaton } from '../types/automata';

export interface ValidationIssue {
  severity: 'warning' | 'error';
  message: string;
  fixSuggestion: string;
}

export function validateAutomaton(automaton: Automaton): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const startStates = automaton.states.filter(s => s.isStart);

  // Start state validations
  if (startStates.length === 0) {
    issues.push({
      severity: 'error',
      message: 'No start state defined.',
      fixSuggestion: 'Select a state and click "Mark Start State" or double-click to configure.'
    });
  } else if (startStates.length > 1) {
    issues.push({
      severity: 'error',
      message: `Multiple start states defined (${startStates.map(s => s.name).join(', ')}).`,
      fixSuggestion: 'Ensure only one state is marked as the starting state.'
    });
  }

  // Acceptance check
  const acceptStates = automaton.states.filter(s => s.isAccept);
  if (acceptStates.length === 0) {
    issues.push({
      severity: 'warning',
      message: 'No accepting states defined. This automaton will reject all input strings.',
      fixSuggestion: 'Mark at least one state as accepting.'
    });
  }

  // Reachable check (BFS from start state)
  const reachable = new Set<string>();
  if (startStates.length > 0) {
    const queue = [startStates[0].id];
    reachable.add(startStates[0].id);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const outgoing = automaton.transitions.filter(t => t.from === current);
      for (const t of outgoing) {
        if (!reachable.has(t.to)) {
          reachable.add(t.to);
          queue.push(t.to);
        }
      }
    }
  }

  automaton.states.forEach(s => {
    if (!reachable.has(s.id)) {
      issues.push({
        severity: 'warning',
        message: `State "${s.name}" is unreachable from the start state.`,
        fixSuggestion: `Add transitions leading to "${s.name}" or delete this state.`
      });
    }
  });

  // DFA specific checks
  if (automaton.type === 'DFA') {
    // 1. Completeness: Every state must have exactly one transition for each alphabet symbol
    automaton.states.forEach(s => {
      automaton.alphabet.forEach(sym => {
        const trans = automaton.transitions.filter(
          t => t.from === s.id && t.symbols.includes(sym)
        );
        if (trans.length === 0) {
          issues.push({
            severity: 'warning',
            message: `State "${s.name}" is missing a transition for symbol '${sym}'.`,
            fixSuggestion: `Create a transition from "${s.name}" on symbol '${sym}' (e.g., to a dead/trap state).`
          });
        } else if (trans.length > 1) {
          issues.push({
            severity: 'error',
            message: `State "${s.name}" has multiple transitions for symbol '${sym}' (${trans.length} found).`,
            fixSuggestion: 'Remove duplicate transitions to ensure determinism.'
          });
        }
      });

      // No epsilon transitions in DFA
      const epsTrans = automaton.transitions.filter(
        t => t.from === s.id && t.symbols.includes('ε')
      );
      if (epsTrans.length > 0) {
        issues.push({
          severity: 'error',
          message: `State "${s.name}" has an ε-transition, which is invalid in a DFA.`,
          fixSuggestion: 'Remove ε-transitions or change the automaton type to ε-NFA.'
        });
      }
    });
  }

  // Dead ends / Trap state checks (states with no path to accept state)
  const canReachAccept = new Set<string>();
  const acceptIds = automaton.states.filter(s => s.isAccept).map(s => s.id);
  
  // Backward BFS from accept states
  const queue = [...acceptIds];
  acceptIds.forEach(id => canReachAccept.add(id));

  while (queue.length > 0) {
    const current = queue.shift()!;
    // find transitions *to* current
    const incoming = automaton.transitions.filter(t => t.to === current);
    for (const t of incoming) {
      if (!canReachAccept.has(t.from)) {
        canReachAccept.add(t.from);
        queue.push(t.from);
      }
    }
  }

  automaton.states.forEach(s => {
    if (!canReachAccept.has(s.id) && reachable.has(s.id)) {
      issues.push({
        severity: 'warning',
        message: `State "${s.name}" is a trap/dead-end state (cannot reach any accepting state).`,
        fixSuggestion: `Add transitions leading from "${s.name}" to an accepting state or keep it as a deliberate trap state.`
      });
    }
  });

  return issues;
}
