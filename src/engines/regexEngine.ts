import { Automaton } from '../types/automata';

// Types for parsing and construction
export interface RegexNode {
  type: 'char' | 'union' | 'concat' | 'star' | 'epsilon' | 'empty';
  char?: string;
  left?: RegexNode;
  right?: RegexNode;
}

// Thompson's NFA state mapping
interface ThompsonState {
  id: string;
  isAccept: boolean;
  transitions: { symbol: string; to: string }[];
}

export function parseRegex(pattern: string): RegexNode {
  // Simple shunting-yard regex parser supporting a|b, ab, a*
  // Pre-process: insert explicit concatenation symbols (we'll use '.')
  let formatted = '';
  for (let i = 0; i < pattern.length; i++) {
    const c1 = pattern[i];
    formatted += c1;
    if (i + 1 < pattern.length) {
      const c2 = pattern[i + 1];
      if (
        (c1 !== '(' && c1 !== '|' && c1 !== '.') &&
        (c2 !== ')' && c2 !== '|' && c2 !== '*' && c2 !== '.')
      ) {
        formatted += '.';
      }
    }
  }

  // Operator precedence: * (highest), . (concat), | (union)
  const precedence: Record<string, number> = { '*': 3, '.': 2, '|': 1 };
  const operators: string[] = [];
  const output: RegexNode[] = [];

  const createNode = (op: string) => {
    if (op === '*') {
      const operand = output.pop();
      if (!operand) return;
      output.push({ type: 'star', left: operand });
    } else if (op === '.') {
      const right = output.pop();
      const left = output.pop();
      if (!left || !right) return;
      output.push({ type: 'concat', left, right });
    } else if (op === '|') {
      const right = output.pop();
      const left = output.pop();
      if (!left || !right) return;
      output.push({ type: 'union', left, right });
    }
  };

  for (let i = 0; i < formatted.length; i++) {
    const char = formatted[i];
    if (char === '(') {
      operators.push(char);
    } else if (char === ')') {
      while (operators.length && operators[operators.length - 1] !== '(') {
        createNode(operators.pop()!);
      }
      operators.pop(); // Pop '('
    } else if (char === '*' || char === '.' || char === '|') {
      while (
        operators.length &&
        operators[operators.length - 1] !== '(' &&
        precedence[operators[operators.length - 1]] >= precedence[char]
      ) {
        createNode(operators.pop()!);
      }
      operators.push(char);
    } else {
      // Literal character or epsilon (use 'e' or 'ε')
      if (char === 'ε' || char === 'e') {
        output.push({ type: 'epsilon' });
      } else {
        output.push({ type: 'char', char });
      }
    }
  }

  while (operators.length) {
    createNode(operators.pop()!);
  }

  return output[0] || { type: 'empty' };
}

export function buildThompsonNFA(node: RegexNode): Automaton {
  let stateCounter = 0;
  const nextStateId = () => `q${stateCounter++}`;

  interface Fragment {
    start: string;
    accept: string;
    states: { id: string; name: string; isStart: boolean; isAccept: boolean; x: number; y: number }[];
    transitions: { from: string; to: string; symbols: string[] }[];
  }

  const recurse = (n: RegexNode): Fragment => {
    if (n.type === 'epsilon' || n.type === 'empty') {
      const s = nextStateId();
      const a = nextStateId();
      return {
        start: s,
        accept: a,
        states: [
          { id: s, name: s, isStart: false, isAccept: false, x: 100, y: 100 },
          { id: a, name: a, isStart: false, isAccept: false, x: 200, y: 100 }
        ],
        transitions: [{ from: s, to: a, symbols: ['ε'] }]
      };
    }

    if (n.type === 'char') {
      const s = nextStateId();
      const a = nextStateId();
      return {
        start: s,
        accept: a,
        states: [
          { id: s, name: s, isStart: false, isAccept: false, x: 100, y: 100 },
          { id: a, name: a, isStart: false, isAccept: false, x: 200, y: 100 }
        ],
        transitions: [{ from: s, to: a, symbols: [n.char!] }]
      };
    }

    if (n.type === 'star') {
      const child = recurse(n.left!);
      const s = nextStateId();
      const a = nextStateId();

      // Position children
      child.states.forEach(st => {
        st.x += 100;
      });

      return {
        start: s,
        accept: a,
        states: [
          { id: s, name: s, isStart: false, isAccept: false, x: 50, y: 100 },
          ...child.states,
          { id: a, name: a, isStart: false, isAccept: false, x: child.states[child.states.length - 1].x + 100, y: 100 }
        ],
        transitions: [
          { from: s, to: child.start, symbols: ['ε'] },
          { from: s, to: a, symbols: ['ε'] },
          { from: child.accept, to: child.start, symbols: ['ε'] },
          { from: child.accept, to: a, symbols: ['ε'] },
          ...child.transitions
        ]
      };
    }

    if (n.type === 'concat') {
      const left = recurse(n.left!);
      const right = recurse(n.right!);

      // Shift right fragment visually
      const leftMaxX = Math.max(...left.states.map(s => s.x));
      right.states.forEach(st => {
        st.x += leftMaxX;
      });

      // Merge left.accept and right.start transitions/states by simply mapping transitions
      // To keep it simple, we connect them with an ε-transition
      return {
        start: left.start,
        accept: right.accept,
        states: [...left.states, ...right.states],
        transitions: [
          ...left.transitions,
          { from: left.accept, to: right.start, symbols: ['ε'] },
          ...right.transitions
        ]
      };
    }

    if (n.type === 'union') {
      const top = recurse(n.left!);
      const bot = recurse(n.right!);
      const s = nextStateId();
      const a = nextStateId();

      top.states.forEach(st => { st.x += 100; st.y -= 80; });
      bot.states.forEach(st => { st.x += 100; st.y += 80; });

      const maxX = Math.max(...top.states.map(st => st.x), ...bot.states.map(st => st.x));

      return {
        start: s,
        accept: a,
        states: [
          { id: s, name: s, isStart: false, isAccept: false, x: 50, y: 100 },
          ...top.states,
          ...bot.states,
          { id: a, name: a, isStart: false, isAccept: false, x: maxX + 100, y: 100 }
        ],
        transitions: [
          { from: s, to: top.start, symbols: ['ε'] },
          { from: s, to: bot.start, symbols: ['ε'] },
          { from: top.accept, to: a, symbols: ['ε'] },
          { from: bot.accept, to: a, symbols: ['ε'] },
          ...top.transitions,
          ...bot.transitions
        ]
      };
    }

    return { start: '', accept: '', states: [], transitions: [] };
  };

  const frag = recurse(node);
  if (!frag.states.length) {
    return { type: 'ENFA', alphabet: [], states: [], transitions: [] };
  }

  // Set start and accept flags
  frag.states.forEach(s => {
    if (s.id === frag.start) s.isStart = true;
    if (s.id === frag.accept) s.isAccept = true;
  });

  // Infer alphabet
  const alphabetSet = new Set<string>();
  frag.transitions.forEach(t => {
    t.symbols.forEach(sym => {
      if (sym !== 'ε') alphabetSet.add(sym);
    });
  });

  return {
    type: 'ENFA',
    alphabet: Array.from(alphabetSet),
    states: frag.states,
    transitions: frag.transitions
  };
}
