export interface ModuleTopic {
  id: string;
  title: string;
  isCompleted: boolean;
  learnContent: {
    objectives: string[];
    intuition: string;
    formalDefinition: string;
    mathNotation: string;
    commonMistakes: string[];
    examTips: string[];
    summary: string;
  };
}

export interface ModuleData {
  id: string;
  number: number;
  title: string;
  summary: string;
  objectives: string[];
  prerequisites: string[];
  estimatedTime: string;
  topics: ModuleTopic[];
}

export const modulesData: ModuleData[] = [
  {
    id: 'module-3',
    number: 3,
    title: 'Regular Languages & Regular Expressions',
    summary: 'Master the foundations of regular languages, regex syntax, Arden\'s theorem, and state-elimination methods.',
    objectives: [
      'Understand the definition and closure properties of regular languages.',
      'Construct regular expressions for complex string-matching patterns.',
      'Convert NFAs/DFAs back into regular expressions using state elimination.',
      'Formally prove non-regularity using the Pumping Lemma.'
    ],
    prerequisites: ['Basic Set Theory', 'Alphabets and Strings'],
    estimatedTime: '2.5 Hours',
    topics: [
      {
        id: 'regex-syntax',
        title: 'Regular Expression Syntax & Identities',
        isCompleted: false,
        learnContent: {
          objectives: ['Define regular expression syntax', 'Learn identities of regex operations'],
          intuition: 'Regular expressions are like search patterns for text. Using operations like Union (or), Concatenation (next), and Kleene Star (zero or more repetitions), we can represent infinite sets of valid strings compactly.',
          formalDefinition: 'A Regular Expression (RE) over alphabet Σ is defined recursively: base cases (empty set ∅, empty string ε, and any symbol a ∈ Σ) and recursive operators (Union (R + S), Concatenation (RS), and Kleene Star (R*)).',
          mathNotation: 'L(∅) = ∅, L(ε) = {ε}, L(a) = {a}\nL(R + S) = L(R) ∪ L(S)\nL(R S) = L(R) L(S)\nL(R*) = ∪_{i≥0} L(R)^i',
          commonMistakes: [
            'Confusing (a+b)* with a*+b*. The former matches any binary string, whereas the latter only matches strings consisting purely of a\'s or purely of b\'s.',
            'Assuming R+ is the same as R*. R+ requires at least one repetition, whereas R* allows zero.'
          ],
          examTips: [
            'Always test the empty string ε against your regex to verify if it is correctly accepted or rejected.'
          ],
          summary: 'Regular expressions define regular languages recursively using primitive symbols and operators.'
        }
      },
      {
        id: 'pumping-lemma',
        title: 'The Pumping Lemma for Regular Languages',
        isCompleted: false,
        learnContent: {
          objectives: ['Understand the formulation of the Pumping Lemma', 'Apply the lemma to prove non-regularity'],
          intuition: 'If a language is regular, it can be recognized by a DFA with a finite number of states, say p. If a string is longer than p, it must visit at least one state twice, forming a loop. We can "pump" (repeat) this loop as many times as we want, and the resulting string must still be in the language. If we find a string that breaks this rule, the language is not regular.',
          formalDefinition: 'Let L be a regular language. Then there exists a pumping length p such that any string w ∈ L with |w| ≥ p can be split into three parts, w = xyz, satisfying:\n1. y ≠ ε (i.e., |y| > 0)\n2. |xy| ≤ p\n3. For all i ≥ 0, x(y^i)z ∈ L.',
          mathNotation: '∀ L ∈ Reg, ∃ p ≥ 1 s.t. ∀ w ∈ L (|w| ≥ p ⇒ ∃ x,y,z s.t. w=xyz ∧ |y|>0 ∧ |xy|≤p ∧ ∀ i≥0, x y^i z ∈ L)',
          commonMistakes: [
            'Choosing a specific value for the pumping length p instead of treating it as an arbitrary constant.',
            'Decomposing the string xyz into specific substrings manually. The proof must work for *all* valid decompositions satisfying |xy|≤p and |y|>0.'
          ],
          examTips: [
            'Always choose the string w in terms of the variable p. For example, for L = {0^n 1^n}, choose w = 0^p 1^p.',
            'Show that pumping down (i = 0) is a quick way to cause contradictions in length-dependent languages.'
          ],
          summary: 'The Pumping Lemma is a necessary condition for regularity, used exclusively to prove a language is *not* regular.'
        }
      }
    ]
  },
  {
    id: 'module-4',
    number: 4,
    title: 'Finite Automata (DFA, NFA & ε-NFA)',
    summary: 'Master the visual and mathematical formulation of deterministic, non-deterministic, and epsilon transition systems.',
    objectives: [
      'Define Deterministic and Non-Deterministic Finite Automata.',
      'Build transition tables and transition graphs.',
      'Understand parallel active state simulation in NFAs.',
      'Explain structural non-determinism and the role of ε-transitions.'
    ],
    prerequisites: ['Regular Expression Syntax'],
    estimatedTime: '3.0 Hours',
    topics: [
      {
        id: 'dfa-definition',
        title: 'Deterministic Finite Automata (DFA)',
        isCompleted: false,
        learnContent: {
          objectives: ['Define a DFA mathematically', 'Trace input symbols through a DFA transition function'],
          intuition: 'A DFA is a simple computer with a finite set of states (memory) and a strict set of rules. For every input symbol, the machine moves from its current state to exactly one target state. If it ends up in an accepting state after reading the whole string, the string is accepted.',
          formalDefinition: 'A DFA is a 5-tuple M = (Q, Σ, δ, q0, F) where:\n- Q is a finite set of states\n- Σ is a finite alphabet\n- δ: Q × Σ → Q is the transition function\n- q0 ∈ Q is the start state\n- F ⊆ Q is the set of accept states',
          mathNotation: 'δ(q, a) = p  (where q, p ∈ Q, a ∈ Σ)',
          commonMistakes: [
            'Leaving a state without transitions for all alphabet symbols. In a formal DFA, the transition function must be total.',
            'Drawing multiple transitions for the same symbol from a single state.'
          ],
          examTips: [
            'Ensure your DFA has a "trap state" to handle invalid inputs cleanly if the problem requires a fully formal definition.'
          ],
          summary: 'A DFA uses deterministic transitions to decide if a string belongs to a language.'
        }
      },
      {
        id: 'nfa-definition',
        title: 'Non-Deterministic Finite Automata (NFA & ε-NFA)',
        isCompleted: false,
        learnContent: {
          objectives: ['Distinguish NFAs from DFAs', 'Understand the mechanics of epsilon transitions'],
          intuition: 'An NFA can make multiple transitions or even no transitions on a symbol. Think of it as exploring multiple possibilities in parallel. If *any* branch of exploration ends in an accepting state, the string is accepted. Epsilon transitions allow state changes without reading any input.',
          formalDefinition: 'An NFA is a 5-tuple M = (Q, Σ, δ, q0, F) where the transition function maps to sets of states:\nδ: Q × Σ → P(Q) (Power set of Q).\nFor ε-NFA, the domain is Q × (Σ ∪ {ε}).',
          mathNotation: 'δ(q, a) = {q1, q2, ...}  (where q1, q2 ∈ Q)',
          commonMistakes: [
            'Forgetting to compute the epsilon closure at the beginning of an input string in ε-NFAs.',
            'Assuming NFA is computationally more powerful than DFA. Both recognize the exact same class of languages (Regular Languages).'
          ],
          examTips: [
            'In exams, when asked to simulate an NFA, write down the set of active states after reading each symbol.'
          ],
          summary: 'NFAs simplify machine design by allowing branching paths and spontaneous ε-transitions.'
        }
      }
    ]
  },
  {
    id: 'module-5',
    number: 5,
    title: 'Automata Conversions',
    summary: 'Master systematic conversions: Regex to NFA, NFA to DFA, and DFA to Regex.',
    objectives: [
      'Apply Thompson\'s construction recursively.',
      'Perform subset construction with epsilon closures.',
      'Convert DFAs to regular expressions using state elimination.'
    ],
    prerequisites: ['Finite Automata Definition'],
    estimatedTime: '2.5 Hours',
    topics: [
      {
        id: 'subset-construction',
        title: 'NFA to DFA Conversion (Subset Construction)',
        isCompleted: false,
        learnContent: {
          objectives: ['Convert an NFA into an equivalent DFA', 'Work with subset state grouping'],
          intuition: 'Since a DFA can only be in one state at a time, we represent each state of the DFA as a *set* of states that the NFA could simultaneously occupy. This is called Subset Construction.',
          formalDefinition: 'Given NFA N = (Q_N, Σ, δ_N, q_N0, F_N), the equivalent DFA D = (Q_D, Σ, δ_D, q_D0, F_D) has Q_D = P(Q_N). For any subset S ⊆ Q_N, δ_D(S, a) = ∪_{s ∈ S} ε-closure(δ_N(s, a)).',
          mathNotation: 'q_D0 = ε-closure({q_N0})\nF_D = {S ⊆ Q_N | S ∩ F_N ≠ ∅}',
          commonMistakes: [
            'Missed computing epsilon closure for reached states.',
            'Omitting the empty set state (trap state) if there are no transitions out of a state on a symbol.'
          ],
          examTips: [
            'Construct a tabular view of transitions first before drawing the final DFA.'
          ],
          summary: 'Subset construction creates DFA states that correspond to subsets of active NFA states.'
        }
      }
    ]
  },
  {
    id: 'module-6',
    number: 6,
    title: 'DFA Minimization',
    summary: 'Remove redundant states and compute the unique canonical minimum state DFA.',
    objectives: [
      'Understand distinguishable vs indistinguishable states.',
      'Apply the Table-Filling algorithm.',
      'Use Partition Refinement (Moore\'s algorithm).'
    ],
    prerequisites: ['Finite Automata Definition'],
    estimatedTime: '2.0 Hours',
    topics: [
      {
        id: 'table-filling',
        title: 'Table-Filling Algorithm',
        isCompleted: false,
        learnContent: {
          objectives: ['Mark equivalent states iteratively', 'Produce a minimized DFA structure'],
          intuition: 'DFA minimization identifies states that behave identically for all possible future inputs. We build a grid comparing all state pairs. By marking distinguishable pairs (such as accept vs non-accept), we eventually find pairs that can never be distinguished. These can be merged into a single state.',
          formalDefinition: 'Two states p and q are distinguishable if there exists a string w ∈ Σ* such that δ*(p, w) ∈ F and δ*(q, w) ∉ F. If no such w exists, p and q are equivalent.',
          mathNotation: 'p ≁ q ⇔ ∃ w ∈ Σ* s.t. (δ*(p, w) ∈ F ⊕ δ*(q, w) ∈ F)',
          commonMistakes: [
            'Merging states before verifying that they go to the same equivalence classes on *every* alphabet symbol.'
          ],
          examTips: [
            'In exams, the table-filling matrix is triangular. Don\'t waste time filling out both halves.'
          ],
          summary: 'The Table-Filling algorithm iteratively discovers distinguishable states to merge the remainder.'
        }
      }
    ]
  },
  {
    id: 'module-7',
    number: 7,
    title: 'Context-Free Grammars (CFG)',
    summary: 'Explore non-regular syntax, production rules, derivations, and Chomsky Normal Form.',
    objectives: [
      'Define CFGs formally.',
      'Generate leftmost and rightmost derivations.',
      'Recognize and resolve grammar ambiguity.',
      'Convert CFGs to Chomsky Normal Form.'
    ],
    prerequisites: ['Regular Expression Syntax'],
    estimatedTime: '3.0 Hours',
    topics: [
      {
        id: 'cfg-derivations',
        title: 'Grammar Derivations & Ambiguity',
        isCompleted: false,
        learnContent: {
          objectives: ['Create leftmost and rightmost derivations', 'Recognize ambiguity visually'],
          intuition: 'Context-Free Grammars use rewrite rules to generate strings. Starting with a start variable S, we replace variables with strings of variables and terminals until only terminals remain. If a string can be generated with two different parse trees, the grammar is ambiguous.',
          formalDefinition: 'A CFG is a 4-tuple G = (V, Σ, R, S) where:\n- V is a finite set of variables (non-terminals)\n- Σ is a finite set of terminals\n- R: V → (V ∪ Σ)* is a finite set of production rules\n- S ∈ V is the start variable',
          mathNotation: 'α A β ⇒ α γ β  (where A → γ is a production in R)',
          commonMistakes: [
            'Blending leftmost and rightmost steps in a single derivation. Choose one direction and stick to it.'
          ],
          examTips: [
            'To prove ambiguity, find *one* string that has two distinct parse trees.'
          ],
          summary: 'CFGs generate context-free languages via substitution rules, visualized as parse trees.'
        }
      }
    ]
  },
  {
    id: 'module-8',
    number: 8,
    title: 'Pushdown Automata (PDA)',
    summary: 'Add memory to finite automata using a Last-In-First-Out stack.',
    objectives: [
      'Define PDAs and stack transitions.',
      'Trace stack manipulation step-by-step.',
      'Distinguish acceptance by final state vs empty stack.'
    ],
    prerequisites: ['Context-Free Grammars'],
    estimatedTime: '2.5 Hours',
    topics: [
      {
        id: 'pda-mechanics',
        title: 'PDA Stack Mechanics & Transitions',
        isCompleted: false,
        learnContent: {
          objectives: ['Define stack operations', 'Design state transitions with stack push/pop actions'],
          intuition: 'An NFA alone cannot count matching braces because it has finite memory. A PDA adds an infinite stack. When we read a symbol, we can inspect (and pop) the top of the stack, and push new symbols. This lets us match elements at arbitrary depths.',
          formalDefinition: 'A PDA is a 7-tuple M = (Q, Σ, Γ, δ, q0, Z0, F) where Γ is the stack alphabet, Z0 is the initial stack symbol, and the transition function is:\nδ: Q × (Σ ∪ {ε}) × (Γ ∪ {ε}) → P(Q × Γ*)',
          mathNotation: 'δ(q, a, X) = {(p, α)}  (moves to state p, pops X, and pushes string α)',
          commonMistakes: [
            'Forgetting that stack operations are LIFO (Last-In-First-Out). E.g. pushing a, then b puts b on top.',
            'Assuming PDA can match patterns of the form a^n b^n c^n. (It can only match two-count elements, not three).'
          ],
          examTips: [
            'Always declare your initial stack symbol (e.g. Z0) and ensure you handle empty stack transitions safely.'
          ],
          summary: 'PDAs extend finite state machines with an infinite stack, enabling context-free language recognition.'
        }
      }
    ]
  },
  {
    id: 'module-9',
    number: 9,
    title: 'Turing Machines (TM)',
    summary: 'Explore the mathematical model of universal computation.',
    objectives: [
      'Understand Turing Machine tape and head operations.',
      'Build transition tables for arithmetic and language acceptance.',
      'Recognize halting, decider, and Turing-recognizable behaviors.'
    ],
    prerequisites: ['Pushdown Automata'],
    estimatedTime: '3.0 Hours',
    topics: [
      {
        id: 'tm-mechanics',
        title: 'Turing Machine Tape & Transitions',
        isCompleted: false,
        learnContent: {
          objectives: ['Formulate tape transitions', 'Design simple Turing Machines'],
          intuition: 'A Turing Machine is a finite state controller attached to an infinite tape. The tape head can read a cell, overwrite its content, and move left or right. This simple mechanism is powerful enough to simulate any computer algorithm.',
          formalDefinition: 'A Turing Machine is a 7-tuple M = (Q, Σ, Γ, δ, q0, q_accept, q_reject) where the transition function is:\nδ: Q × Γ → Q × Γ × {L, R}',
          mathNotation: 'δ(q, a) = (p, b, D)  (reads a, writes b, goes to p, moves head direction D)',
          commonMistakes: [
            'Forgetting to specify the direction (L/R) for every transition.',
            'Assuming the head can move past the left edge of the tape (which is usually blocked or wraps depending on definition).'
          ],
          examTips: [
            'Draw visual tape snapshots to verify your head positions during state changes.'
          ],
          summary: 'Turing Machines use an infinite readable/writable tape to model general-purpose computers.'
        }
      }
    ]
  }
];
