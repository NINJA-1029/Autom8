import { CFG, Production } from '../types/automata';

export interface GrammarDerivationStep {
  stepIndex: number;
  sententialForm: string[];
  productionUsed: Production | null;
  targetNonTerminalIndex: number;
}

// Leftmost derivation generation
export function generateLeftmostDerivation(cfg: CFG, targetWord: string, maxDepth = 20): GrammarDerivationStep[] | null {
  const steps: GrammarDerivationStep[] = [];
  
  // Backtracking-based search to find a leftmost derivation for testing
  const search = (sentential: string[], depth: number): boolean => {
    if (depth > maxDepth) return false;

    // Check if terminals match
    const terminalsOnly = sentential.filter(s => cfg.terminals.includes(s) || s === 'ε');
    const wordSoFar = terminalsOnly.filter(s => s !== 'ε').join('');
    if (wordSoFar.length > targetWord.length) return false;
    
    const isAllTerminals = sentential.every(s => cfg.terminals.includes(s) || s === 'ε');
    if (isAllTerminals) {
      return wordSoFar === targetWord;
    }

    // Find leftmost non-terminal
    const ntIdx = sentential.findIndex(s => cfg.nonTerminals.includes(s));
    if (ntIdx === -1) return false;

    const nt = sentential[ntIdx];
    const rules = cfg.productions.filter(p => p.lhs === nt);

    for (const rule of rules) {
      const nextSentential = [
        ...sentential.slice(0, ntIdx),
        ...rule.rhs,
        ...sentential.slice(ntIdx + 1)
      ].filter(s => s !== 'ε' || rule.rhs.length === 1); // keep ε only if empty rule

      steps.push({
        stepIndex: steps.length + 1,
        sententialForm: nextSentential,
        productionUsed: rule,
        targetNonTerminalIndex: ntIdx
      });

      if (search(nextSentential, depth + 1)) {
        return true;
      }
      steps.pop();
    }
    return false;
  };

  const initial = [cfg.startSymbol];
  steps.push({
    stepIndex: 0,
    sententialForm: initial,
    productionUsed: null,
    targetNonTerminalIndex: -1
  });

  if (search(initial, 0)) {
    return steps;
  }
  return null;
}

// Convert CFG to Chomsky Normal Form (CNF)
// Returns grammar state at each simplification step
export interface CNFConversionHistory {
  step: 'start' | 'epsilon' | 'unit' | 'useless' | 'binarize';
  description: string;
  grammar: CFG;
}

export function convertToCNF(cfg: CFG): CNFConversionHistory[] {
  const history: CNFConversionHistory[] = [];
  let currentGrammar = JSON.parse(JSON.stringify(cfg)) as CFG;

  history.push({
    step: 'start',
    description: 'Original Context-Free Grammar',
    grammar: JSON.parse(JSON.stringify(currentGrammar))
  });

  // 1. Eliminate Epsilon-Productions (A -> ε)
  const nullableNonTerminals = new Set<string>();
  let added = true;
  while (added) {
    added = false;
    for (const prod of currentGrammar.productions) {
      if (prod.rhs.length === 1 && prod.rhs[0] === 'ε') {
        if (!nullableNonTerminals.has(prod.lhs)) {
          nullableNonTerminals.add(prod.lhs);
          added = true;
        }
      }
      // Or if all RHS symbols are nullable
      const allNullable = prod.rhs.length > 0 && prod.rhs.every(sym => nullableNonTerminals.has(sym));
      if (allNullable && !nullableNonTerminals.has(prod.lhs)) {
        nullableNonTerminals.add(prod.lhs);
        added = true;
      }
    }
  }

  // Generate new productions without ε
  const newProductions1: Production[] = [];
  const addCombinations = (lhs: string, rhs: string[], index: number, current: string[]) => {
    if (index === rhs.length) {
      if (current.length > 0) {
        // avoid duplicate productions
        if (!newProductions1.some(p => p.lhs === lhs && p.rhs.join('') === current.join(''))) {
          newProductions1.push({ lhs, rhs: [...current] });
        }
      }
      return;
    }
    const sym = rhs[index];
    if (nullableNonTerminals.has(sym)) {
      // Option 1: exclude sym
      addCombinations(lhs, rhs, index + 1, current);
      // Option 2: include sym
      addCombinations(lhs, rhs, index + 1, [...current, sym]);
    } else {
      addCombinations(lhs, rhs, index + 1, [...current, sym]);
    }
  };

  for (const prod of currentGrammar.productions) {
    if (prod.rhs.length === 1 && prod.rhs[0] === 'ε') continue;
    addCombinations(prod.lhs, prod.rhs, 0, []);
  }

  // If start symbol S is nullable, we add S0 -> S | ε
  if (nullableNonTerminals.has(currentGrammar.startSymbol)) {
    const originalStart = currentGrammar.startSymbol;
    currentGrammar.startSymbol = 'S0';
    currentGrammar.nonTerminals.unshift('S0');
    newProductions1.push({ lhs: 'S0', rhs: [originalStart] });
    newProductions1.push({ lhs: 'S0', rhs: ['ε'] });
  }

  currentGrammar.productions = newProductions1;
  history.push({
    step: 'epsilon',
    description: 'Eliminate ε-productions',
    grammar: JSON.parse(JSON.stringify(currentGrammar))
  });

  // 2. Eliminate Unit Productions (A -> B)
  const unitPairs = new Set<string>(); // "A->B"
  currentGrammar.nonTerminals.forEach(nt => unitPairs.add(`${nt}->${nt}`));

  let unitAdded = true;
  while (unitAdded) {
    unitAdded = false;
    for (const prod of currentGrammar.productions) {
      if (prod.rhs.length === 1 && currentGrammar.nonTerminals.includes(prod.rhs[0])) {
        const A = prod.lhs;
        const B = prod.rhs[0];
        // find all pairs (C -> A)
        for (const C of currentGrammar.nonTerminals) {
          if (unitPairs.has(`${C}->${A}`) && !unitPairs.has(`${C}->${B}`)) {
            unitPairs.add(`${C}->${B}`);
            unitAdded = true;
          }
        }
      }
    }
  }

  const newProductions2: Production[] = [];
  for (const pair of unitPairs) {
    const [A, B] = pair.split('->');
    // find all non-unit productions B -> alpha
    const nonUnits = currentGrammar.productions.filter(
      p => p.lhs === B && !(p.rhs.length === 1 && currentGrammar.nonTerminals.includes(p.rhs[0]))
    );
    for (const prod of nonUnits) {
      if (!newProductions2.some(p => p.lhs === A && p.rhs.join('') === prod.rhs.join(''))) {
        newProductions2.push({ lhs: A, rhs: [...prod.rhs] });
      }
    }
  }

  currentGrammar.productions = newProductions2;
  history.push({
    step: 'unit',
    description: 'Eliminate Unit productions',
    grammar: JSON.parse(JSON.stringify(currentGrammar))
  });

  // 3. Eliminate Useless Symbols (Generating and Reachable)
  // Step 3a: Generating symbols
  const generating = new Set<string>(currentGrammar.terminals);
  let genAdded = true;
  while (genAdded) {
    genAdded = false;
    for (const prod of currentGrammar.productions) {
      if (prod.rhs.every(sym => generating.has(sym))) {
        if (!generating.has(prod.lhs)) {
          generating.add(prod.lhs);
          genAdded = true;
        }
      }
    }
  }

  currentGrammar.nonTerminals = currentGrammar.nonTerminals.filter(nt => generating.has(nt));
  currentGrammar.productions = currentGrammar.productions.filter(
    p => generating.has(p.lhs) && p.rhs.every(sym => generating.has(sym))
  );

  // Step 3b: Reachable symbols
  const reachable = new Set<string>([currentGrammar.startSymbol]);
  let reachAdded = true;
  while (reachAdded) {
    reachAdded = false;
    for (const prod of currentGrammar.productions) {
      if (reachable.has(prod.lhs)) {
        for (const sym of prod.rhs) {
          if (!reachable.has(sym)) {
            reachable.add(sym);
            reachAdded = true;
          }
        }
      }
    }
  }

  currentGrammar.nonTerminals = currentGrammar.nonTerminals.filter(nt => reachable.has(nt));
  currentGrammar.terminals = currentGrammar.terminals.filter(t => reachable.has(t));
  currentGrammar.productions = currentGrammar.productions.filter(
    p => reachable.has(p.lhs) && p.rhs.every(sym => reachable.has(sym))
  );

  history.push({
    step: 'useless',
    description: 'Eliminate Useless (non-generating/unreachable) symbols',
    grammar: JSON.parse(JSON.stringify(currentGrammar))
  });

  // 4. Binarize & Terminal Substitution to CNF rules (A -> BC or A -> a)
  const newProductions4: Production[] = [];
  const termMapping: Record<string, string> = {}; // 'a' -> 'T_a'
  let helperCounter = 0;
  
  const getTerminalHelper = (term: string) => {
    if (termMapping[term]) return termMapping[term];
    const name = `T_${term.toUpperCase()}`;
    termMapping[term] = name;
    currentGrammar.nonTerminals.push(name);
    newProductions4.push({ lhs: name, rhs: [term] });
    return name;
  };

  const getVariablesForRHS = (rhs: string[]): string[] => {
    return rhs.map(sym => {
      if (currentGrammar.terminals.includes(sym)) {
        return getTerminalHelper(sym);
      }
      return sym;
    });
  };

  for (const prod of currentGrammar.productions) {
    if (prod.rhs.length === 1 && currentGrammar.terminals.includes(prod.rhs[0])) {
      // Already of the form A -> a
      newProductions4.push(prod);
    } else if (prod.rhs.length === 2 && prod.rhs.every(sym => currentGrammar.nonTerminals.includes(sym))) {
      // Already of the form A -> BC
      newProductions4.push(prod);
    } else {
      // Needs conversion
      const vars = getVariablesForRHS(prod.rhs);
      if (vars.length === 2) {
        newProductions4.push({ lhs: prod.lhs, rhs: vars });
      } else {
        // split S -> X1 X2 X3 into S -> X1 C1, C1 -> X2 X3 etc.
        let currentLHS = prod.lhs;
        for (let i = 0; i < vars.length - 2; i++) {
          const helperVar = `C_${helperCounter++}`;
          currentGrammar.nonTerminals.push(helperVar);
          newProductions4.push({ lhs: currentLHS, rhs: [vars[i], helperVar] });
          currentLHS = helperVar;
        }
        newProductions4.push({ lhs: currentLHS, rhs: [vars[vars.length - 2], vars[vars.length - 1]] });
      }
    }
  }

  currentGrammar.productions = newProductions4;
  history.push({
    step: 'binarize',
    description: 'Substitute terminals and binarize long productions',
    grammar: JSON.parse(JSON.stringify(currentGrammar))
  });

  return history;
}
