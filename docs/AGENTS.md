# Agent Specifications

## Overview

The migration system consists of 12 specialized agents, each responsible for a specific aspect of the conversion process.

## Agent 1: Project Scanner Agent

### Purpose
Recursively scan a JavaScript Playwright project and build a complete structural model.

### Input
```typescript
{
  projectPath: string;
  includeNodeModules?: boolean;
  maxDepth?: number;
}
```

### Output
```typescript
ProjectStructure {
  rootPath: string;
  files: FileInfo[];
  folders: FolderInfo[];
  packageJson: PackageJsonInfo;
  playwrightConfig: PlaywrightConfigInfo;
}
```

### Process
1. Walk directory tree
2. Categorize files (fixture, page-object, test, utility, config)
3. Extract file metadata (size, content, type)
4. Parse package.json
5. Parse playwright config
6. Build dependency graph

### Error Handling
- Skip inaccessible directories
- Handle large files gracefully
- Report file access errors
- Validate file encoding

### Example Output
```json
{
  "rootPath": "/path/to/project",
  "files": [
    {
      "path": "pages/BasePage.js",
      "name": "BasePage.js",
      "extension": ".js",
      "type": "page-object",
      "size": 5234
    }
  ],
  "folders": [
    {
      "path": "pages",
      "name": "pages",
      "childCount": 5,
      "fileCount": 5
    }
  ]
}
```

---

## Agent 2: Framework Analysis Agent

### Purpose
Analyze the scanned project structure to understand its architecture and patterns.

### Input
```typescript
ProjectStructure
```

### Output
```typescript
FrameworkAnalysis {
  projectType: string;
  patterns: DetectedPattern[];
  architecture: ArchitecturePattern;
  customizations: CustomPattern[];
  confidence: number;
}
```

### Process
1. Analyze folder organization
2. Examine file naming patterns
3. Inspect import styles
4. Detect async patterns
5. Classify test organization
6. Identify custom utilities
7. Calculate confidence scores

### Detection Rules
- **Fixture-based**: Detects `test.extend()` or custom fixtures
- **Class-based**: Detects `class` declarations with methods
- **POM-based**: Detects inheritance from base page object
- **Mixed**: Combination of multiple patterns

### Example Output
```json
{
  "projectType": "pom-based",
  "patterns": [
    {
      "name": "PageObjectModel",
      "type": "page-object",
      "confidence": 0.95
    }
  ],
  "architecture": {
    "fixtureStyle": "custom",
    "pomStyle": "inheritance",
    "importStyle": "es6",
    "asyncStyle": "async-await",
    "testOrganization": "describe"
  }
}
```

---

## Agent 3: Pattern Recognition Engine

### Purpose
Identify specific patterns in code using AST analysis.

### Input
```typescript
{
  files: FileInfo[];
  patterns?: string[];
}
```

### Output
```typescript
DetectedPattern[] {
  name: string;
  type: string;
  location: string;
  description: string;
  confidence: number;
}
```

### Patterns Detected
1. **Fixture Patterns**
   - `test.extend()`
   - Custom fixture functions
   - Setup/teardown hooks

2. **Page Object Patterns**
   - Class inheritance
   - Method organization
   - Locator definitions

3. **Test Patterns**
   - Test blocks
   - Assertion patterns
   - Test organization

4. **Utility Patterns**
   - Helper functions
   - Config loaders
   - Data generators

5. **Hook Patterns**
   - Before/after hooks
   - Setup functions
   - Teardown functions

### Example
```typescript
const patterns = [
  {
    name: "BasePage Inheritance",
    type: "page-object",
    location: "pages/LoginPage.js",
    description: "Class extends BasePage with 15 methods",
    confidence: 0.98
  }
];
```

---

## Agent 4: Reference Learner

### Purpose
Analyze the reference TypeScript framework and extract conventions to apply to output.

### Input
```typescript
{
  referenceProjectPath: string;
}
```

### Output
```typescript
ReferenceFrameworkAnalysis {
  name: string;
  version: string;
  structure: ReferenceStructure;
  conventions: NamingConventions;
  codeStyle: CodeStyleGuide;
  abstractionPatterns: AbstractionPattern[];
}
```

### Analysis Process
1. Scan reference structure
2. Extract folder organization
3. Analyze naming conventions
4. Extract code style
5. Learn abstraction patterns
6. Document best practices

### Example Output
```json
{
  "name": "MAS FLORAFIRE",
  "structure": {
    "folders": {
      "fixtures": "Custom Playwright fixtures & shared sessionData",
      "manager": "Central manager for all page objects",
      "pages": "Page object classes",
      "resource": "Test data for different environments",
      "tests": "Test files organized by feature",
      "utils": "Utility functions and helpers"
    }
  },
  "conventions": {
    "files": {
      "fixtures": "fixtures.ts",
      "manager": "POManager.ts",
      "basePage": "BasePage.ts"
    }
  }
}
```

---

## Agent 5-12: Detailed Specifications

### Agent 5: JS-to-TS Conversion Agent
Converts JavaScript syntax to TypeScript, adds basic types.

### Agent 6: AST Transformation Agent
Applies advanced AST-based transformations using ts-morph.

### Agent 7: Type Inference Agent
Infers complex types, creates interfaces, handles generics.

### Agent 8: Import Resolution Agent
Resolves import paths, updates file extensions, fixes circular dependencies.

### Agent 9: Playwright Optimization Agent
Applies Playwright best practices, adds error handling.

### Agent 10: POM Refactor Agent
Refactors page objects to match reference style and structure.

### Agent 11: Validation Agent
Runs TypeScript compiler, ESLint, and Playwright tests.

### Agent 12: Self-Healing Agent
Analyzes errors and applies fixes automatically.

## Agent Communication

Agents communicate through:

1. **Shared Context**
   - `AgentContext` object updated by each agent
   - Immutable updates ensure consistency
   - Versioned snapshots for rollback

2. **Event System**
   - Agents emit events on state changes
   - Listeners can react to events
   - Enables debugging and monitoring

3. **Error Channels**
   - Errors propagate through context
   - Each agent handles its errors
   - Fatal errors stop pipeline

## Retry Strategy

Each agent implements:

```typescript
const retry = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(2000 * Math.pow(1.5, i));
    }
  }
};
```

## Performance Targets

- Small projects (< 50 files): < 30 seconds
- Medium projects (50-200 files): < 2 minutes
- Large projects (200+ files): < 5 minutes

## Monitoring & Observability

Each agent tracks:
- Execution time
- Input/output sizes
- Error rates
- Retry counts
- Resource usage

Data exported to:
- Migration report
- Performance metrics
- Error analytics
