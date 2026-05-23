# 🎭 Playwright Migration Agent

**Production-grade AI migration system for converting any Playwright JavaScript framework to TypeScript with reference architecture alignment.**

## 🎯 Overview

This system provides an intelligent, autonomous migration engine that:

- 🔍 **Analyzes** any Playwright JavaScript project
- 🧠 **Detects** patterns (fixtures, page objects, utilities, test architecture)
- 🔄 **Converts** JavaScript to strictly-typed TypeScript
- 📐 **Aligns** output with your reference TypeScript framework (MAS FLORAFIRE)
- ✅ **Validates** through compilation, linting, and testing
- 🛠️ **Self-heals** common migration and type errors
- 📊 **Reports** comprehensive migration metrics

## 🏗️ Architecture

### Multi-Agent System (LangGraph)

The migration engine uses 12 specialized AI agents:

```
┌─────────────────────────────────────────┐
│  1. Project Scanner Agent               │ → Analyze JS project structure
├─────────────────────────────────────────┤
│  2. Framework Analysis Agent            │ → Detect architecture patterns
├─────────────────────────────────────────┤
│  3. Pattern Recognition Engine          │ → Identify reusable patterns
├─────────────────────────────────────────┤
│  4. Reference Learner                   │ → Learn from reference TS framework
├─────────────────────────────────────────┤
│  5. JS-to-TS Conversion Agent           │ → Convert code to TypeScript
├─────────────────────────────────────────┤
│  6. AST Transformation Agent            │ → Apply AST-based transforms
├─────────────────────────────────────────┤
│  7. Type Inference Agent                │ → Infer strict TypeScript types
├─────────────────────────────────────────┤
│  8. Import Resolution Agent             │ → Resolve and rewrite imports
├─────────────────────────────────────────┤
│  9. Playwright Optimization Agent       │ → Apply best practices
├─────────────────────────────────────────┤
│ 10. POM Refactor Agent                  │ → Structure page objects
├─────────────────────────────────────────┤
│ 11. Validation Agent                    │ → Run tsc, eslint, tests
├─────────────────────────────────────────┤
│ 12. Self-Healing Agent                  │ → Fix errors automatically
└─────────────────────────────────────────┘
         ↓
    ORCHESTRATOR (LangGraph)
         ↓
  OUTPUT: TypeScript Project ✨
```

## 📋 Project Structure

```
playwright-migration-agent/
├── docs/                           # Documentation
│   ├── ARCHITECTURE.md            # System design & components
│   ├── AGENTS.md                  # Agent specifications
│   ├── WORKFLOW.md                # Migration workflow
│   └── IMPLEMENTATION.md           # Implementation guide
│
├── src/
│   ├── core/
│   │   ├── orchestrator.ts        # LangGraph orchestration
│   │   ├── types.ts               # Core TypeScript interfaces
│   │   ├── constants.ts           # System constants
│   │   └── logger.ts              # Logging utilities
│   │
│   ├── agents/
│   │   ├── project-scanner-agent.ts
│   │   ├── framework-analysis-agent.ts
│   │   ├── pattern-recognition-engine.ts
│   │   ├── reference-learner-agent.ts
│   │   ├── js-to-ts-conversion-agent.ts
│   │   ├── ast-transformation-agent.ts
│   │   ├── type-inference-agent.ts
│   │   ├── import-resolution-agent.ts
│   │   ├── playwright-optimization-agent.ts
│   │   ├── pom-refactor-agent.ts
│   │   ├── validation-agent.ts
│   │   └── self-healing-agent.ts
│   │
│   ├── utils/
│   │   ├── ast-analyzer.ts        # AST parsing & analysis
│   │   ├── pattern-detector.ts    # Pattern detection engine
│   │   ├── reference-learner.ts   # Reference framework analyzer
│   │   ├── type-mapper.ts         # JS type → TS type mapping
│   │   ├── file-system.ts         # File I/O utilities
│   │   ├── error-parser.ts        # Error message parsing
│   │   └── validators.ts          # Validation utilities
│   │
│   ├── templates/
│   │   ├── tsconfig.template.ts
│   │   ├── playwright.template.ts
│   │   ├── package.template.ts
│   │   ├── basepage.template.ts
│   │   ├── fixtures.template.ts
│   │   └── pom-manager.template.ts
│   │
│   ├── cli/
│   │   ├── migrate.ts             # CLI entry point
│   │   └── commands.ts            # CLI commands
│   │
│   └── index.ts                   # Main entry point
│
├── examples/
│   ├── input-projects/            # Example JS projects
│   │   └── sample-js-framework/
│   └── output-projects/           # Generated TS projects
│       └── sample-ts-framework/
│
├── reference-framework/           # MAS FLORAFIRE reference
│   └── (reference TS structure)
│
├── tests/
│   ├── agents/
│   ├── utils/
│   └── integration/
│
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── .prettierrc.json
├── .gitignore
├── .env.example
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- TypeScript knowledge

### Installation

```bash
# Clone repository
git clone https://github.com/Fahim59/playwright-migration-agent.git
cd playwright-migration-agent

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Add your CLAUDE_API_KEY if using Claude AI features

# Build
npm run build
```

### Usage

#### Migrate a Project

```bash
# CLI command
npm run migrate -- --source ./path/to/js-project --reference ./reference-framework --output ./output

# Or programmatically
ts-node src/cli/migrate.ts --source ./my-js-project
```

#### Options

```
--source, -s        Path to JavaScript Playwright project (required)
--reference, -r     Path to reference TypeScript framework (optional)
--output, -o        Output directory (default: ./migration-output)
--validate          Run validation after migration (default: true)
--fix               Enable auto-fix for errors (default: true)
--verbose, -v       Verbose logging (default: false)
--dry-run           Show what would be migrated without making changes
```

## 📊 Phase Progress

### Phase 1: Foundation Setup ✅
- [x] Architecture design
- [x] Core types and interfaces
- [x] Project Scanner Agent specification
- [x] Framework Analysis Agent specification
- [x] Pattern Recognition Engine design
- [x] Reference Learner design
- [x] Configuration setup
- [x] Documentation

### Phase 2: Core Implementation 🔄
- [ ] AST Transformation Engine
- [ ] Type Inference System
- [ ] Import Resolution
- [ ] Orchestrator implementation

### Phase 3: Validation & Self-Healing 📋
- [ ] Validation engine
- [ ] Error parser
- [ ] Self-healing agent
- [ ] Retry logic

### Phase 4: Production Hardening 🚀
- [ ] CLI implementation
- [ ] Azure pipeline setup
- [ ] Docker configuration
- [ ] Comprehensive testing

## 🔧 Core Concepts

### Pattern Detection

The system automatically detects:
- **Fixture patterns** (custom Playwright fixtures)
- **Page object patterns** (POM, inheritance)
- **Utility patterns** (helpers, generators, config)
- **Test patterns** (structure, hooks, assertions)
- **Import patterns** (module dependencies)

### Reference Alignment

Output is aligned with your reference framework:
- Folder structure matches exactly
- Naming conventions applied
- Code style replicated
- Abstraction patterns preserved

### Validation Loop

```
Conversion → TypeScript Check → ESLint → Playwright Test
     ↑                                          ↓
     └──────── Self-Heal if Failed ───────────┘
```

## 📖 Documentation

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System design details
- **[AGENTS.md](docs/AGENTS.md)** - Agent specifications & workflows
- **[WORKFLOW.md](docs/WORKFLOW.md)** - Migration process flow
- **[IMPLEMENTATION.md](docs/IMPLEMENTATION.md)** - Phase-by-phase guide

## 🔌 API

### Orchestrator

```typescript
import { Orchestrator } from '@core/orchestrator';

const orchestrator = new Orchestrator({
  sourceProjectPath: './my-js-project',
  referenceProjectPath: './reference-framework',
  outputPath: './output',
});

const result = await orchestrator.migrate();
```

### Individual Agents

```typescript
import { ProjectScannerAgent } from '@agents/project-scanner-agent';

const scanner = new ProjectScannerAgent(sourceProjectPath);
const analysis = await scanner.analyze();
```

## 🛠️ Development

```bash
# Build
npm run build

# Type check
npm run type-check

# Lint
npm run lint
npm run lint:fix

# Format
npm run format

# Test
npm run test

# Clean
npm run clean
```

## 📝 Examples

See `examples/` directory for:
- Sample JavaScript Playwright projects
- Expected TypeScript outputs
- Migration reports

## 🤝 Contributing

Contributions welcome! Please follow:
- TypeScript strict mode
- ESLint rules
- Prettier formatting
- Test coverage for new features

## 📄 License

MIT License - See LICENSE file

## 🔗 Links

- [Playwright Docs](https://playwright.dev)
- [LangGraph Docs](https://js.langchain.com/docs/langgraph)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [ts-morph Documentation](https://ts-morph.com)

## 💬 Support

For issues, questions, or suggestions:
- Open a GitHub issue
- Check existing documentation
- Review example migrations

---

**Built with ❤️ for enterprise test automation**
