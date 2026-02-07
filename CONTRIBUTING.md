# Contributing to FemtoLogger

## Development Setup

```bash
git clone https://github.com/frederictriquet/FemtoLogger.git
cd FemtoLogger
npm install
```

## Commands

```bash
npm run build       # Build ESM/CJS
npm run dev         # Watch mode
npm test            # Run tests
npm run test:watch  # Test watch mode
npm run test:coverage # Coverage report
npm run typecheck   # Type checking
```

## Creating a New Transport

1. Create `src/transports/your-service.ts`:

```typescript
import type { LogEntry, Transport } from '../types';

export interface YourServiceTransportOptions {
  webhookUrl: string;
}

export class YourServiceTransport implements Transport {
  constructor(private options: YourServiceTransportOptions) {
    if (!options.webhookUrl) {
      throw new Error('YourServiceTransport: webhookUrl is required');
    }
  }

  async send(entry: LogEntry): Promise<void> {
    try {
      await fetch(this.options.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: entry.level,
          message: entry.message,
          metadata: entry.metadata,
        }),
      });
    } catch (error) {
      console.error('[YourServiceTransport] Error:', error);
    }
  }
}
```

2. Export in `src/transports/index.ts`:

```typescript
export { YourServiceTransport } from './your-service';
```

3. Add tests in `src/transports/__tests__/your-service.test.ts`

4. Export types in `src/index.ts`

## Pull Requests

- Create a feature branch: `git checkout -b feature/my-transport`
- Write tests (maintain 95%+ coverage)
- Update README with usage example
- Run `npm test` and `npm run typecheck`
- Create PR against `master`

## Code Style

- TypeScript strict mode
- JSDoc for public APIs
- Error messages in English
- Follow existing patterns

## Testing

- Unit tests for all public APIs
- Mock external services (fetch)
- Test error handling
- Validate input edge cases

## License

By contributing, you agree that your contributions will be licensed under MIT.
