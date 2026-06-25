# 🤖 Automata Teacher

An interactive, browser-based learning platform for **Theory of Computation** — built with React, TypeScript, and Vite. Study finite automata, formal grammars, and Turing machines through structured lessons, live simulators, a practice exam system, and a Socratic AI tutor.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📚 **Structured Modules** | 7 progressive modules covering Regular Languages → Turing Machines |
| 🔬 **Live Simulators** | Step-through DFA, NFA, PDA, and TM simulation with visual tape/stack feedback |
| 🔄 **Conversion Engines** | Regex → NFA, NFA → DFA (Subset Construction), DFA → Regex, DFA Minimization |
| 🧪 **Practice Exams** | Per-module quizzes with progressive hints and worked solutions |
| 🤖 **AI Tutor** | Socratic-style AI tutor that narrates topic explanations from any lesson |
| 📊 **Progress Tracking** | Visual progress dashboard across all modules and topics |
| 🌗 **Dark / Light Theme** | Fully-themed glassmorphism UI with toggle |

---

## 📖 Course Modules

| # | Module | Topics |
|---|---|---|
| 3 | **Regular Languages & Regular Expressions** | RE Syntax, Identities, Pumping Lemma |
| 4 | **Finite Automata (DFA, NFA & ε-NFA)** | DFA Definition, NFA & ε-transitions |
| 5 | **Automata Conversions** | Thompson's Construction, Subset Construction, State Elimination |
| 6 | **DFA Minimization** | Table-Filling Algorithm, Moore's Partition Refinement |
| 7 | **Context-Free Grammars (CFG)** | Derivations, Ambiguity, Chomsky Normal Form |
| 8 | **Pushdown Automata (PDA)** | Stack Mechanics, Acceptance Modes |
| 9 | **Turing Machines (TM)** | Tape Operations, Decidability, Recognizability |

Each topic includes:
- Learning objectives
- Intuitive explanation
- Formal mathematical definition
- Common mistakes & exam tips

---

## 🛠️ Tech Stack

- **Framework:** [React 19](https://react.dev/) + [TypeScript 6](https://www.typescriptlang.org/)
- **Build Tool:** [Vite 8](https://vite.dev/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Linter:** [Oxlint](https://oxc.rs/docs/guide/usage/linter)
- **Styling:** Vanilla CSS with CSS custom properties (glassmorphism design system)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (bundled with Node)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/NINJA-1029/Autom8.git
cd Autom8

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

The app will be available at **`http://localhost:5173`**.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server with HMR |
| `npm run build` | Type-check and build for production (`dist/`) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run Oxlint static analysis |

---

## 🗂️ Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI primitives
│   ├── editor/          # Automata/grammar editor components
│   ├── layout/          # Sidebar and app shell
│   ├── modules/         # Module template, learn tab, practice tab
│   └── simulators/      # Simulator controls and visualizers
├── data/
│   ├── modules.ts            # All module/topic content definitions
│   └── practiceQuestions.ts  # Practice exam question bank
├── engines/
│   ├── automataSimulators.ts  # DFA/NFA/PDA/TM step simulators
│   ├── conversionEngine.ts    # Regex ↔ NFA ↔ DFA conversions
│   ├── grammarEngine.ts       # CFG derivation & CNF engine
│   ├── minimizationEngine.ts  # Table-filling DFA minimizer
│   ├── regexEngine.ts         # Regular expression parser/evaluator
│   └── validationEngine.ts    # Input and automata validation
├── services/
│   └── aiService.ts           # AI provider abstraction (Gemini / OpenAI / Anthropic)
├── types/               # Shared TypeScript type definitions
├── views/
│   ├── AITutorView.tsx      # Socratic AI tutor interface
│   ├── DashboardView.tsx    # Home/progress overview
│   ├── ProgressView.tsx     # Detailed progress tracker
│   └── SimulatorsView.tsx   # Live automata simulator hub
├── App.tsx              # Root component & client-side routing
└── main.tsx             # Entry point
```

---

## 🧠 Engine Overview

### `conversionEngine.ts`
Implements formal automata conversions:
- **Thompson's Construction** — Regex → ε-NFA
- **Subset Construction** — NFA/ε-NFA → DFA (with ε-closure computation)
- **State Elimination** — DFA → Regular Expression

### `minimizationEngine.ts`
Implements the **Table-Filling (Myhill-Nerode)** algorithm to produce the unique canonical minimum-state DFA by iteratively marking distinguishable state pairs.

### `automataSimulators.ts`
Provides step-by-step runtime simulation for DFA, NFA, PDA, and Turing Machines, returning per-step state snapshots for visual playback.

### `grammarEngine.ts`
Handles CFG parsing, leftmost/rightmost derivation generation, ambiguity detection, and conversion to **Chomsky Normal Form (CNF)**.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push and open a Pull Request

Please run `npm run lint` before submitting.

---

## 📄 License

This project is for educational purposes. All rights reserved © 2025 NINJA-1029.
