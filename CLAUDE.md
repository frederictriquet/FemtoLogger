# FemtoLogger — Quick Integration Guide

## Install

```bash
npm install femtologger
```

## Required env vars

```
TELEGRAM_BOT_TOKEN=<bot token from @BotFather>
TELEGRAM_CHAT_ID=<chat id from @userinfobot>
```

Make sure these are loaded (via dotenv, framework config, or process env).

## Usage

```typescript
import { FemtoLogger, TelegramTransport } from 'femtologger';

const logger = new FemtoLogger({
  transports: [
    new TelegramTransport({
      token: process.env.TELEGRAM_BOT_TOKEN!,
      chatId: process.env.TELEGRAM_CHAT_ID!,
    }),
  ],
});

await logger.info('User signed up', { userId: 42 });
await logger.warn('Rate limit approaching', { current: 95, max: 100 });
await logger.error('Payment failed', { orderId: 'abc', reason: err.message });
```

## API

### FemtoLogger(options)

| Option | Type | Default | Description |
|---|---|---|---|
| `transports` | `Transport[]` | required | Array of transport instances |
| `level` | `'info' \| 'warn' \| 'error'` | `'info'` | Minimum log level |

Methods: `logger.info(message, metadata?)`, `logger.warn(message, metadata?)`, `logger.error(message, metadata?)`. All return `Promise<void>`. The `metadata` parameter is `Record<string, unknown>`.

### TelegramTransport(options)

| Option | Type | Default |
|---|---|---|
| `token` | `string` | required |
| `chatId` | `string \| number` | required |
| `parseMode` | `'HTML' \| 'Markdown' \| 'MarkdownV2'` | `'HTML'` |
| `disableWebPagePreview` | `boolean` | `true` |

## Custom transport

Implement the `Transport` interface:

```typescript
import type { Transport, LogEntry } from 'femtologger';

class MyTransport implements Transport {
  async send(entry: LogEntry): Promise<void> {
    // entry.level: 'info' | 'warn' | 'error'
    // entry.message: string
    // entry.metadata?: Record<string, unknown>
    // entry.timestamp: Date
    // IMPORTANT: catch errors internally, never throw
  }
}
```

## Key behaviors

- Logger never throws at runtime — transport errors are caught and logged to console.error
- Multiple transports are dispatched in parallel via Promise.allSettled (one failure doesn't block others)
- Zero runtime dependencies, requires Node >= 18 (uses native fetch)
