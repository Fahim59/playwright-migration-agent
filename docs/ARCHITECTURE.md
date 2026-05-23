# System Architecture

## Overview

The Playwright Migration Agent is built on a **multi-agent orchestration system** using LangGraph. It converts any Playwright JavaScript project to TypeScript while aligning with a reference TypeScript framework.

## Core Components

### 1. **Orchestrator (LangGraph)**

```typescript
Orchestrator
  ├── Agent Pool
  ├── State Management
  ├── Workflow Execution
  ├── Error Handling
  └── Callback System
```

**Responsibilities:**
- Coordinate all 12 agents
- Manage agent communication
- Track conversion state
- Handle retries and recovery
- Generate reports

### 2. **Agent System**

Each agent has:
- **Input**: Context + configuration
- **Process**: Execute specific task
- **Output**: Structured result
- **Error Handling**: Graceful degradation
- **State Updates**: Shared context modification

#### Agent Lifecycle

```
Agent Creation
    ↓
Initialization
    ↓
Validate Input
    ↓
Execute Process
    ↓
Generate Output
    ↓
Update Context
    ↓
Cleanup
```

### 3. **Agent Specifications**

#### Agent 1: Project Scanner Agent

```typescript
Input:  sourceProjectPath: string
Output: ProjectStructure
Process:
  - Recursively scan directories
  - Identify file types
  - Extract metadata
  - Build file tree
  - Analyze dependencies
```

#### Agent 2: Framework Analysis Agent

```typescript
Input:  ProjectStructure
Output: FrameworkAnalysis
Process:
  - Detect architecture patterns
  - Classify project type
  - Identify custom patterns
  - Calculate confidence scores
```

#### Agent 3: Pattern Recognition Engine

```typescript
Input:  ProjectStructure, FileInfo[]
Output: DetectedPattern[]
Process:
  - AST-based pattern matching
  - Fixture detection
  - Page object identification
  - Test hook detection
  - Utility classification
```

#### Agent 4: Reference Learner

```typescript
Input:  referenceProjectPath: string
Output: ReferenceFrameworkAnalysis
Process:
  - Analyze reference structure
  - Extract conventions
  - Learn code style
  - Map abstraction patterns
```

#### Agent 5: JS-to-TS Conversion Agent

```typescript
Input:  FileInfo, FrameworkAnalysis
Output: ConversionResult
Process:
  - Parse JavaScript AST
  - Extract structure
  - Generate TypeScript
  - Type annotations
  - Import conversion
```

#### Agent 6: AST Transformation Agent

```typescript
Input:  SourceCode: string, AST: SourceFile
Output: TransformedCode: string
Process:
  - Apply transformations via ts-morph
  - Add type annotations
  - Refactor patterns
  - Optimize imports
  - Format code
```

#### Agent 7: Type Inference Agent

```typescript
Input:  SourceCode: string
Output: TypeMapping[]
Process:
  - Infer variable types
  - Infer function signatures
  - Infer return types
  - Create interface definitions
  - Handle complex types
```

#### Agent 8: Import Resolution Agent

```typescript
Input:  ImportStatements, ProjectStructure
Output: ResolvedImports
Process:
  - Resolve relative paths
  - Update module paths
  - Fix file extensions
  - Add type imports
  - Verify existence
```

#### Agent 9: Playwright Optimization Agent

```typescript
Input:  ConvertedCode, FrameworkAnalysis
Output: OptimizedCode
Process:
  - Apply best practices
  - Add type safety
  - Optimize selectors
  - Add error handling
  - Improve performance
```

#### Agent 10: POM Refactor Agent

```typescript
Input:  PageObjects: FileInfo[]
Output: RefactoredPageObjects
Process:
  - Standardize structure
  - Apply reference style
  - Add type annotations
  - Organize methods
  - Add documentation
```

#### Agent 11: Validation Agent

```typescript
Input:  ConvertedProject
Output: ValidationResult
Process:
  - Run TypeScript compiler
  - Run ESLint
  - Run Playwright tests
  - Collect errors
  - Generate report
```

#### Agent 12: Self-Healing Agent

```typescript
Input:  ValidationResult, Errors
Output: HealingResult
Process:
  - Analyze error patterns
  - Generate fixes
  - Apply transformations
  - Retry validation
  - Report success/failure
```

## Workflow

### Migration Flow

```
┌─────────────────────────────────────┐
│ Input: JS Project Path              │
└────────────┬────────────────────────┘
             │
             ▼
    ┌────────────────────┐
    │ Scanner Agent      │ → ProjectStructure
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────┐
    │ Framework Analysis │ → FrameworkAnalysis
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────┐
    │ Pattern Detection  │ → DetectedPatterns
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────┐
    │ Reference Learning │ → ReferenceAnalysis
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────┐
    │ JS→TS Conversion   │ → ConvertedFiles
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────┐
    │ AST Transform      │ → TransformedCode
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────┐
    │ Type Inference     │ → TypedCode
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────┐
    │ Import Resolution  │ → ResolvedImports
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────┐
    │ Optimization       │ → OptimizedCode
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────┐
    │ POM Refactor       │ → StructuredPOM
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────┐
    │ Validation         │ → ValidationResult
    └────────┬───────────┘
             │
             ├─→ ✓ Success → Report & Output
             │
             └─→ ✗ Errors → Self-Healing Agent
                    ↓
                  Analyze & Fix
                    ↓
                  Retry Validation
                    ↓
                  ✓ Success → Report & Output
```

## State Management

### AgentContext

```typescript
interface AgentContext {
  projectPath: string;
  referencePath?: string;
  outputPath: string;
  analysis: ProjectStructure;
  frameworkAnalysis?: FrameworkAnalysis;
  referenceAnalysis?: ReferenceFrameworkAnalysis;
  conversions: Map<string, ConversionResult>;
  errors: MigrationError[];
  metadata: Record<string, unknown>;
}
```

Updated sequentially by agents:
1. Scanner updates: `analysis`
2. Framework analyzer updates: `frameworkAnalysis`
3. Reference learner updates: `referenceAnalysis`
4. Converters update: `conversions`
5. Validators update: `errors`

## Error Handling Strategy

### Error Hierarchy

```
MigrationError
  ├── ScanError
  ├── AnalysisError
  ├── ConversionError
  │   ├── TypeInferenceError
  │   ├── ImportResolutionError
  │   └── TransformationError
  ├── ValidationError
  └── HealingError
```

### Recovery Strategy

1. **Retry with Backoff**
   - Initial delay: 2 seconds
   - Multiplier: 1.5x
   - Max retries: 3

2. **Graceful Degradation**
   - Continue on non-critical errors
   - Skip problematic files
   - Log warnings

3. **Self-Healing**
   - Analyze error patterns
   - Apply targeted fixes
   - Retry validation
   - Report if unrecoverable

## Performance Considerations

### Parallel Processing

- Scan agents can process files in parallel
- Type inference can work on independent files
- Validation runs in parallel when possible

### Caching

- Cache AST analysis results
- Cache reference framework analysis
- Cache type mappings
- Cache import resolutions

### Optimization

- Lazy load large files
- Stream processing for large projects
- Incremental conversion
- Batch validation

## Extension Points

### Custom Agents

Extend the agent system:

```typescript
class CustomAgent extends BaseAgent {
  async execute(context: AgentContext): Promise<AgentResult> {
    // Custom implementation
  }
}
```

### Custom Transformations

Add custom AST transformations:

```typescript
const transformer = new AstTransformer();
transformer.registerTransform(pattern, transformation);
```

### Custom Validators

Add project-specific validation:

```typescript
const validator = new ValidationAgent();
validator.registerCustomCheck(checkFunction);
```
