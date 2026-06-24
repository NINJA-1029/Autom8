export interface QuestionOption {
  id: string;
  text: string;
}

export interface PracticeQuestion {
  id: string;
  moduleId: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'exam';
  type: 'mcq' | 'tf' | 'simulate' | 'trace';
  questionText: string;
  options?: QuestionOption[];
  correctAnswer: string; // ID of correct option, or exact string, or comma-separated states
  explanations: Record<string, string>; // mapping option ID (or 'correct'/'incorrect') to detailed explanation
  hints: string[];
}

export const practiceQuestions: PracticeQuestion[] = [
  {
    id: 'q-regex-1',
    moduleId: 'module-3',
    difficulty: 'easy',
    type: 'mcq',
    questionText: 'Which of the following strings is NOT accepted by the regular expression (a|b)*abb?',
    options: [
      { id: 'a', text: 'abb' },
      { id: 'b', text: 'aabb' },
      { id: 'c', text: 'ababb' },
      { id: 'd', text: 'abba' }
    ],
    correctAnswer: 'd',
    explanations: {
      'a': 'Incorrect. "abb" is accepted because the (a|b)* part can match the empty string, leaving "abb".',
      'b': 'Incorrect. "aabb" is accepted because (a|b)* matches "aa", followed by "abb".',
      'c': 'Incorrect. "ababb" is accepted because (a|b)* matches "ab", followed by "abb".',
      'd': 'Correct! "abba" ends with a, which violates the requirement that the string must end with "abb".'
    },
    hints: [
      'Observe the suffix of the regular expression: it forces the string to end with a specific sequence.',
      'Check which of the options does not end with "abb".'
    ]
  },
  {
    id: 'q-dfa-1',
    moduleId: 'module-4',
    difficulty: 'easy',
    type: 'tf',
    questionText: 'True or False: Every Deterministic Finite Automaton (DFA) is also a Non-Deterministic Finite Automaton (NFA).',
    options: [
      { id: 'true', text: 'True' },
      { id: 'false', text: 'False' }
    ],
    correctAnswer: 'true',
    explanations: {
      'true': 'Correct! A DFA is a special case of an NFA where the transition function maps to exactly one state instead of a set of states, and there are no epsilon transitions.',
      'false': 'Incorrect. Remember that NFAs generalize DFAs. Any DFA can be directly interpreted as an NFA.'
    },
    hints: [
      'Think about definition subset containment. Does the set of DFAs fit inside the set of NFAs?'
    ]
  },
  {
    id: 'q-dfa-2',
    moduleId: 'module-4',
    difficulty: 'medium',
    type: 'mcq',
    questionText: 'What is the minimum number of states in a DFA that accepts the language L = { w ∈ {0, 1}* | w contains an even number of 0s }?',
    options: [
      { id: '1', text: '1 state' },
      { id: '2', text: '2 states' },
      { id: '3', text: '3 states' },
      { id: '4', text: '4 states' }
    ],
    correctAnswer: '2',
    explanations: {
      '1': 'Incorrect. One state is not enough because we need to distinguish between having an even number of 0s and an odd number of 0s.',
      '2': 'Correct! We only need 2 states: State 0 (Even number of 0s, which is also the start/accept state) and State 1 (Odd number of 0s). 1s do not change the count of 0s.',
      '3': 'Incorrect. 3 states is redundant. We do not need to count beyond modulo 2.',
      '4': 'Incorrect. 4 states is too many.'
    },
    hints: [
      'You only need to keep track of the parity of the count of 0s.',
      'Parity has two possibilities: even or odd.'
    ]
  }
];
