# Migration Examples

## Simple JavaScript Project Example

This directory contains example projects for testing the Playwright Migration Agent.

### Input Project

Location: `./input-projects/simple-js-project/`

A minimal JavaScript project with:
- Page Object (JavaScript) - `pages/LoginPage.js`
- Test File (JavaScript) - `tests/login.spec.js`
- Package configuration - `package.json`

### Expected Output

Location: `./output-projects/simple-ts-project/`

The migrated TypeScript version with:
- Page Object (TypeScript) - `pages/LoginPage.ts`
- Test File (TypeScript) - `tests/login.spec.ts`
- Type annotations and best practices

## How to Test

```bash
# Run the migration
npm run migrate -- --source ./examples/input-projects/simple-js-project --output ./examples/test-output

# Compare output with expected
diff ./examples/test-output ./examples/output-projects/simple-ts-project
```

## Key Changes in Migration

### 1. Syntax Conversion
- `const X = require(...)` → `import X from '...'`
- `module.exports = X` → `export class X`

### 2. Type Annotations
- Function parameters get types: `(email) => (email: string)`
- Return types are added: `async login() => async login(): Promise<void>`
- Constructor parameters typed: `constructor(page: Page)`

### 3. Import Statements
- `.js` extensions converted to `.ts`
- Destructured imports properly typed
- Absolute imports resolved

### 4. Best Practices
- Private methods prefixed with `_`
- JSDoc comments added
- Async/await properly formatted
- Error handling improved

## Testing Locally

```bash
# Install dependencies
npm install

# Run unit tests
npm run test

# Run specific test
npm run test -- src/tests/agents/project-scanner-agent.test.ts

# Run with coverage
npm run test -- --coverage
```
