/**
 * tmBuilderEngine.ts
 * Built-in Turing Machine definitions for common formal languages.
 * Each entry includes the full TM structure + metadata + example test cases.
 */
import { TuringMachine } from '../types/automata';

export interface TMTemplate {
  key: string;
  label: string;
  languageDescription: string;   // e.g. "{ 0ⁿ1ⁿ | n ≥ 0 }"
  formalDefinition: string;
  testCases: { input: string; expected: 'accept' | 'reject' }[];
  tm: TuringMachine;
}

// ─────────────────────────────────────────────────────────────
// 1. { 0ⁿ1ⁿ | n ≥ 0 }
// Strategy: mark each leftmost 0 as X, scan right to find matching 1 → mark as Y, repeat.
// ─────────────────────────────────────────────────────────────
const tm_equal01: TuringMachine = {
  alphabet: ['0', '1'],
  tapeAlphabet: ['0', '1', 'X', 'Y', '_'],
  blankSymbol: '_',
  states: [
    { id: 'q0', name: 'q0', isStart: true,  isAccept: false, x: 80,  y: 180 },
    { id: 'q1', name: 'q1', isStart: false, isAccept: false, x: 220, y: 100 },
    { id: 'q2', name: 'q2', isStart: false, isAccept: false, x: 360, y: 180 },
    { id: 'q3', name: 'q3', isStart: false, isAccept: false, x: 220, y: 260 },
    { id: 'qa', name: 'qa', isStart: false, isAccept: true,  x: 500, y: 180 },
  ],
  transitions: [
    // q0: scan for 0
    { from: 'q0', to: 'q1', readSymbol: '0', writeSymbol: 'X', direction: 'R' },
    { from: 'q0', to: 'qa', readSymbol: 'Y', writeSymbol: 'Y', direction: 'R' },
    { from: 'q0', to: 'qa', readSymbol: '_', writeSymbol: '_', direction: 'R' },
    // q1: skip 0s and Ys, looking for 1
    { from: 'q1', to: 'q1', readSymbol: '0', writeSymbol: '0', direction: 'R' },
    { from: 'q1', to: 'q1', readSymbol: 'Y', writeSymbol: 'Y', direction: 'R' },
    { from: 'q1', to: 'q2', readSymbol: '1', writeSymbol: 'Y', direction: 'L' },
    // q2: scan back left to X
    { from: 'q2', to: 'q2', readSymbol: '0', writeSymbol: '0', direction: 'L' },
    { from: 'q2', to: 'q2', readSymbol: 'Y', writeSymbol: 'Y', direction: 'L' },
    { from: 'q2', to: 'q3', readSymbol: 'X', writeSymbol: 'X', direction: 'R' },
    // q3: move to q0 after finding X
    { from: 'q3', to: 'q0', readSymbol: 'Y', writeSymbol: 'Y', direction: 'R' },
    { from: 'q3', to: 'q0', readSymbol: '0', writeSymbol: '0', direction: 'R' },
    // qa: verify all 1s are consumed
    { from: 'qa', to: 'qa', readSymbol: 'Y', writeSymbol: 'Y', direction: 'R' },
  ]
};

// ─────────────────────────────────────────────────────────────
// 2. Palindromes over {a, b}  → w = wᴿ
// Strategy: mark first char, scan to end, verify last matches, shrink.
// (Simplified 2-symbol version using markers)
// ─────────────────────────────────────────────────────────────
const tm_palindrome: TuringMachine = {
  alphabet: ['a', 'b'],
  tapeAlphabet: ['a', 'b', 'X', 'Y', '_'],
  blankSymbol: '_',
  states: [
    { id: 'q0',  name: 'q0',  isStart: true,  isAccept: false, x: 80,  y: 200 },
    { id: 'qa1', name: 'qa1', isStart: false, isAccept: false, x: 240, y: 100 },
    { id: 'qb1', name: 'qb1', isStart: false, isAccept: false, x: 240, y: 300 },
    { id: 'qa2', name: 'qa2', isStart: false, isAccept: false, x: 420, y: 100 },
    { id: 'qb2', name: 'qb2', isStart: false, isAccept: false, x: 420, y: 300 },
    { id: 'q3',  name: 'q3',  isStart: false, isAccept: false, x: 580, y: 200 },
    { id: 'acc', name: 'acc', isStart: false, isAccept: true,  x: 720, y: 200 },
  ],
  transitions: [
    // Read first symbol
    { from: 'q0', to: 'qa1', readSymbol: 'a', writeSymbol: 'X', direction: 'R' },
    { from: 'q0', to: 'qb1', readSymbol: 'b', writeSymbol: 'Y', direction: 'R' },
    { from: 'q0', to: 'acc', readSymbol: '_', writeSymbol: '_', direction: 'R' }, // empty → accept
    { from: 'q0', to: 'acc', readSymbol: 'X', writeSymbol: 'X', direction: 'R' }, // single symbol
    // Seeking right end (started with 'a')
    { from: 'qa1', to: 'qa1', readSymbol: 'a', writeSymbol: 'a', direction: 'R' },
    { from: 'qa1', to: 'qa1', readSymbol: 'b', writeSymbol: 'b', direction: 'R' },
    { from: 'qa1', to: 'qa2', readSymbol: '_', writeSymbol: '_', direction: 'L' },
    { from: 'qa1', to: 'qa2', readSymbol: 'X', writeSymbol: 'X', direction: 'L' },
    { from: 'qa1', to: 'qa2', readSymbol: 'Y', writeSymbol: 'Y', direction: 'L' },
    // Match last 'a'
    { from: 'qa2', to: 'q3', readSymbol: 'a', writeSymbol: 'X', direction: 'L' },
    // Seeking right end (started with 'b')
    { from: 'qb1', to: 'qb1', readSymbol: 'a', writeSymbol: 'a', direction: 'R' },
    { from: 'qb1', to: 'qb1', readSymbol: 'b', writeSymbol: 'b', direction: 'R' },
    { from: 'qb1', to: 'qb2', readSymbol: '_', writeSymbol: '_', direction: 'L' },
    { from: 'qb1', to: 'qb2', readSymbol: 'X', writeSymbol: 'X', direction: 'L' },
    { from: 'qb1', to: 'qb2', readSymbol: 'Y', writeSymbol: 'Y', direction: 'L' },
    // Match last 'b'
    { from: 'qb2', to: 'q3', readSymbol: 'b', writeSymbol: 'Y', direction: 'L' },
    // Scan back left to first X/Y
    { from: 'q3', to: 'q3',  readSymbol: 'a', writeSymbol: 'a', direction: 'L' },
    { from: 'q3', to: 'q3',  readSymbol: 'b', writeSymbol: 'b', direction: 'L' },
    { from: 'q3', to: 'q0',  readSymbol: 'X', writeSymbol: 'X', direction: 'R' },
    { from: 'q3', to: 'q0',  readSymbol: 'Y', writeSymbol: 'Y', direction: 'R' },
    { from: 'q3', to: 'q0',  readSymbol: '_', writeSymbol: '_', direction: 'R' },
    // Accept when only X/Y left
    { from: 'q0', to: 'acc', readSymbol: 'Y', writeSymbol: 'Y', direction: 'R' },
  ]
};

// ─────────────────────────────────────────────────────────────
// 3. Binary Increment — adds 1 to a binary number
// Strategy: scan to right end, carry propagate left.
// ─────────────────────────────────────────────────────────────
const tm_binaryIncrement: TuringMachine = {
  alphabet: ['0', '1'],
  tapeAlphabet: ['0', '1', '_'],
  blankSymbol: '_',
  states: [
    { id: 'q0', name: 'q0', isStart: true,  isAccept: false, x: 80,  y: 180 },
    { id: 'q1', name: 'q1', isStart: false, isAccept: false, x: 260, y: 180 },
    { id: 'qa', name: 'qa', isStart: false, isAccept: true,  x: 440, y: 180 },
  ],
  transitions: [
    // q0: scan right to find end
    { from: 'q0', to: 'q0', readSymbol: '0', writeSymbol: '0', direction: 'R' },
    { from: 'q0', to: 'q0', readSymbol: '1', writeSymbol: '1', direction: 'R' },
    { from: 'q0', to: 'q1', readSymbol: '_', writeSymbol: '_', direction: 'L' },
    // q1: carry propagation
    { from: 'q1', to: 'qa', readSymbol: '0', writeSymbol: '1', direction: 'R' }, // 0+1=1, done
    { from: 'q1', to: 'q1', readSymbol: '1', writeSymbol: '0', direction: 'L' }, // 1+1=0 carry
    { from: 'q1', to: 'qa', readSymbol: '_', writeSymbol: '1', direction: 'R' }, // overflow: write 1
  ]
};

// ─────────────────────────────────────────────────────────────
// 4. Unary copy:  aⁿ  →  aⁿ # aⁿ
// ─────────────────────────────────────────────────────────────
const tm_unaryCopy: TuringMachine = {
  alphabet: ['a'],
  tapeAlphabet: ['a', 'X', '#', '_'],
  blankSymbol: '_',
  states: [
    { id: 'q0', name: 'q0', isStart: true,  isAccept: false, x: 80,  y: 180 },
    { id: 'q1', name: 'q1', isStart: false, isAccept: false, x: 220, y: 100 },
    { id: 'q2', name: 'q2', isStart: false, isAccept: false, x: 380, y: 100 },
    { id: 'q3', name: 'q3', isStart: false, isAccept: false, x: 380, y: 260 },
    { id: 'q4', name: 'q4', isStart: false, isAccept: false, x: 220, y: 260 },
    { id: 'qa', name: 'qa', isStart: false, isAccept: true,  x: 540, y: 180 },
  ],
  transitions: [
    // Mark one 'a' as X
    { from: 'q0', to: 'q1', readSymbol: 'a', writeSymbol: 'X', direction: 'R' },
    { from: 'q0', to: 'qa', readSymbol: '#', writeSymbol: '#', direction: 'R' }, // done
    { from: 'q0', to: 'qa', readSymbol: '_', writeSymbol: '_', direction: 'R' }, // empty done
    // Scan right past a and #, find rightmost blank
    { from: 'q1', to: 'q1', readSymbol: 'a', writeSymbol: 'a', direction: 'R' },
    { from: 'q1', to: 'q1', readSymbol: '#', writeSymbol: '#', direction: 'R' },
    { from: 'q1', to: 'q2', readSymbol: '_', writeSymbol: 'a', direction: 'L' }, // write copy
    // Scan back left to #
    { from: 'q2', to: 'q2', readSymbol: 'a', writeSymbol: 'a', direction: 'L' },
    { from: 'q2', to: 'q3', readSymbol: '#', writeSymbol: '#', direction: 'L' },
    // Scan back left to X
    { from: 'q3', to: 'q3', readSymbol: 'a', writeSymbol: 'a', direction: 'L' },
    { from: 'q3', to: 'q4', readSymbol: 'X', writeSymbol: 'X', direction: 'R' },
    // Move right and write # if needed
    { from: 'q4', to: 'q0', readSymbol: 'a', writeSymbol: 'a', direction: 'R' },
    { from: 'q4', to: 'q0', readSymbol: '#', writeSymbol: '#', direction: 'R' },
    { from: 'q4', to: 'q0', readSymbol: 'X', writeSymbol: '#', direction: 'R' }, // put separator
  ]
};

// ─────────────────────────────────────────────────────────────
// 5. Even-length strings over {a, b}
// Strategy: mark alternating pairs from both ends.
// ─────────────────────────────────────────────────────────────
const tm_evenLength: TuringMachine = {
  alphabet: ['a', 'b'],
  tapeAlphabet: ['a', 'b', 'X', '_'],
  blankSymbol: '_',
  states: [
    { id: 'q0', name: 'q0', isStart: true,  isAccept: false, x: 80,  y: 180 },
    { id: 'q1', name: 'q1', isStart: false, isAccept: false, x: 260, y: 180 },
    { id: 'q2', name: 'q2', isStart: false, isAccept: false, x: 430, y: 180 },
    { id: 'qa', name: 'qa', isStart: false, isAccept: true,  x: 600, y: 180 },
  ],
  transitions: [
    // Mark first symbol
    { from: 'q0', to: 'q1', readSymbol: 'a', writeSymbol: 'X', direction: 'R' },
    { from: 'q0', to: 'q1', readSymbol: 'b', writeSymbol: 'X', direction: 'R' },
    { from: 'q0', to: 'qa', readSymbol: '_', writeSymbol: '_', direction: 'R' }, // empty → even (accept)
    { from: 'q0', to: 'qa', readSymbol: 'X', writeSymbol: 'X', direction: 'R' }, // all X → accept
    // Skip non-X symbols
    { from: 'q1', to: 'q1', readSymbol: 'a', writeSymbol: 'a', direction: 'R' },
    { from: 'q1', to: 'q1', readSymbol: 'b', writeSymbol: 'b', direction: 'R' },
    // Mark second symbol
    { from: 'q1', to: 'q2', readSymbol: 'a', writeSymbol: 'X', direction: 'L' },
    { from: 'q1', to: 'q2', readSymbol: 'b', writeSymbol: 'X', direction: 'L' },
    // Scan back to first X
    { from: 'q2', to: 'q2', readSymbol: 'a', writeSymbol: 'a', direction: 'L' },
    { from: 'q2', to: 'q2', readSymbol: 'b', writeSymbol: 'b', direction: 'L' },
    { from: 'q2', to: 'q0', readSymbol: 'X', writeSymbol: 'X', direction: 'R' },
    { from: 'q2', to: 'q0', readSymbol: '_', writeSymbol: '_', direction: 'R' },
  ]
};

// ─────────────────────────────────────────────────────────────
// Template catalog
// ─────────────────────────────────────────────────────────────
export const TM_TEMPLATES: TMTemplate[] = [
  {
    key: 'equal_01',
    label: '{ 0ⁿ1ⁿ | n ≥ 0 }',
    languageDescription: 'Strings with equal numbers of 0s followed by 1s.',
    formalDefinition: 'L = { 0ⁿ1ⁿ | n ≥ 0 }',
    testCases: [
      { input: '',       expected: 'accept' },
      { input: '01',     expected: 'accept' },
      { input: '0011',   expected: 'accept' },
      { input: '000111', expected: 'accept' },
      { input: '001',    expected: 'reject' },
      { input: '0110',   expected: 'reject' },
    ],
    tm: tm_equal01,
  },
  {
    key: 'palindrome',
    label: 'Palindromes over {a, b}',
    languageDescription: 'Strings that read the same forwards and backwards over alphabet {a, b}.',
    formalDefinition: 'L = { w ∈ {a,b}* | w = wᴿ }',
    testCases: [
      { input: 'a',    expected: 'accept' },
      { input: 'aba',  expected: 'accept' },
      { input: 'abba', expected: 'accept' },
      { input: 'ab',   expected: 'reject' },
      { input: 'aab',  expected: 'reject' },
    ],
    tm: tm_palindrome,
  },
  {
    key: 'binary_increment',
    label: 'Binary Increment (+1)',
    languageDescription: 'Adds 1 to a binary number on the tape. Carry propagates left.',
    formalDefinition: 'Transducer: tape contains binary n → outputs n+1',
    testCases: [
      { input: '0',   expected: 'accept' },
      { input: '1',   expected: 'accept' },
      { input: '101', expected: 'accept' },
      { input: '111', expected: 'accept' },
    ],
    tm: tm_binaryIncrement,
  },
  {
    key: 'unary_copy',
    label: 'Unary Copy (aⁿ → aⁿ#aⁿ)',
    languageDescription: 'Copies a unary string: aⁿ becomes aⁿ#aⁿ on the tape.',
    formalDefinition: 'Transducer: tape = aⁿ → aⁿ#aⁿ',
    testCases: [
      { input: 'a',   expected: 'accept' },
      { input: 'aa',  expected: 'accept' },
      { input: 'aaa', expected: 'accept' },
    ],
    tm: tm_unaryCopy,
  },
  {
    key: 'even_length',
    label: 'Even-length strings over {a, b}',
    languageDescription: 'All strings of even length over alphabet {a, b}.',
    formalDefinition: 'L = { w ∈ {a,b}* | |w| mod 2 = 0 }',
    testCases: [
      { input: '',    expected: 'accept' },
      { input: 'ab',  expected: 'accept' },
      { input: 'aabb', expected: 'accept' },
      { input: 'a',   expected: 'reject' },
      { input: 'abc', expected: 'reject' },
    ],
    tm: tm_evenLength,
  },
];

export function buildTMFromKey(key: string): TMTemplate | undefined {
  return TM_TEMPLATES.find(t => t.key === key);
}
