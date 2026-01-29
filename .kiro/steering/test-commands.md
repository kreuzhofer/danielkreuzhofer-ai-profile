# Test Commands

**IMPORTANT**: Tests run in the dev workspace, NOT inside Docker containers.

## Frontend Tests

Run from workspace root:
```bash
npm test --prefix frontend
```

Or from frontend directory:
```bash
cd frontend && npm test
```

**Specific test file:**
```bash
npm test --prefix frontend -- path/to/test.ts
```

**Pattern matching:**
```bash
npm test --prefix frontend -- --testPathPattern="Navigation"
```

## Backend Tests

Run from workspace root:
```bash
npm test --prefix backend
```

Or from backend directory:
```bash
cd backend && npm test
```

**Specific test file:**
```bash
npm test --prefix backend -- path/to/test.ts
```

**Pattern matching:**
```bash
npm test --prefix backend -- --testPathPattern="tool-executor"
```

## Property Tests

Use `{ numRuns: 3 }` by default per workspace guidelines.
