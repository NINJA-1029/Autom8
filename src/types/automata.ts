export interface State {
  id: string;
  name: string;
  isStart: boolean;
  isAccept: boolean;
  x: number;
  y: number;
}

export interface Transition {
  from: string;
  to: string;
  symbols: string[]; // e.g. ['a'], ['ε']
}

export interface Automaton {
  type: 'DFA' | 'NFA' | 'ENFA';
  alphabet: string[];
  states: State[];
  transitions: Transition[];
}

export interface PDATransition {
  from: string;
  to: string;
  inputSymbol: string;   // 'a', 'b', 'ε'
  popSymbol: string;     // 'Z0', 'X', 'ε'
  pushSymbols: string[]; // ['X', 'Z0'] or []
}

export interface PDA {
  alphabet: string[];
  stackAlphabet: string[];
  states: State[];
  transitions: PDATransition[];
  startStackSymbol: string;
}

export interface TMTransition {
  from: string;
  to: string;
  readSymbol: string;  // '0', '1', '_'
  writeSymbol: string; // '0', '1', '_'
  direction: 'L' | 'R' | 'N';
}

export interface TuringMachine {
  alphabet: string[];
  tapeAlphabet: string[];
  states: State[];
  transitions: TMTransition[];
  blankSymbol: string;
}

export interface Production {
  lhs: string; // 'S'
  rhs: string[]; // e.g. ['a', 'S', 'b'] or ['ε']
}

export interface CFG {
  nonTerminals: string[];
  terminals: string[];
  productions: Production[];
  startSymbol: string;
}
