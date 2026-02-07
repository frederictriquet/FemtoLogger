# FemtoLogger 🪶

[![CI/CD](https://github.com/frederictriquet/FemtoLogger/actions/workflows/ci.yml/badge.svg)](https://github.com/frederictriquet/FemtoLogger/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-green.svg)](https://nodejs.org/)
[![Coverage](https://img.shields.io/badge/Coverage-97.67%25-brightgreen.svg)](./TEST_COVERAGE.md)

> Lightweight, extensible event logger for TypeScript server apps

FemtoLogger est un logger minimaliste conçu pour envoyer des événements applicatifs vers des services de messagerie (Telegram, Slack, Discord, etc.) avec une architecture modulaire et extensible.

## Caractéristiques ✨

- **Léger** : Zéro dépendance runtime, ~10KB minifié
- **Extensible** : Architecture transport-based, facile d'ajouter de nouvelles destinations
- **Type-safe** : 100% TypeScript avec types complets exportés
- **Multi-destinations** : Support natif de plusieurs transports simultanés
- **Robuste** : Gestion d'erreurs silencieuse — un logger ne fait jamais crasher votre app
- **Node 18+** : Utilise `fetch` natif (pas de polyfill)

## Installation 📦

```bash
npm install femtologger
```

## Utilisation rapide 🚀

### Configuration basique avec Telegram

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

// Utilisation
await logger.info('Server started', { port: 3000 });
await logger.warn('High memory usage', { usage: '85%' });
await logger.error('Database connection failed', { error: err.message });
```

### Configuration multi-destinations

```typescript
import { FemtoLogger, TelegramTransport } from 'femtologger';

const logger = new FemtoLogger({
  transports: [
    new TelegramTransport({
      token: process.env.TELEGRAM_BOT_TOKEN!,
      chatId: process.env.TELEGRAM_CHAT_ID!,
    }),
    // Futures destinations (Slack, Discord, etc.)
  ],
  level: 'warn', // Log seulement warn et error
});
```

## Obtenir vos credentials Telegram 🤖

1. **Créer un bot** :
   - Envoyez `/newbot` à [@BotFather](https://t.me/BotFather) sur Telegram
   - Suivez les instructions
   - Récupérez votre `token` (ex: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)

2. **Obtenir votre Chat ID** :
   - Envoyez un message à [@userinfobot](https://t.me/userinfobot)
   - Il vous répondra avec votre `chatId` (ex: `123456789`)

3. **Variables d'environnement** :
   ```bash
   # .env
   TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
   TELEGRAM_CHAT_ID=123456789
   ```

## API 📚

### `FemtoLogger`

#### Constructor

```typescript
new FemtoLogger(options: LoggerOptions)
```

| Option | Type | Défaut | Description |
|--------|------|--------|-------------|
| `transports` | `Transport[]` | **required** | Liste des destinations de logs |
| `level` | `'info' \| 'warn' \| 'error'` | `'info'` | Niveau minimum de log |

#### Méthodes

```typescript
logger.info(message: string, metadata?: Record<string, unknown>): Promise<void>
logger.warn(message: string, metadata?: Record<string, unknown>): Promise<void>
logger.error(message: string, metadata?: Record<string, unknown>): Promise<void>
```

### `TelegramTransport`

#### Constructor

```typescript
new TelegramTransport(options: TelegramTransportOptions)
```

| Option | Type | Défaut | Description |
|--------|------|--------|-------------|
| `token` | `string` | **required** | Token du bot Telegram |
| `chatId` | `string \| number` | **required** | ID du chat de destination |
| `parseMode` | `'HTML' \| 'Markdown' \| 'MarkdownV2'` | `'HTML'` | Mode de parsing des messages |
| `disableWebPagePreview` | `boolean` | `true` | Désactiver les previews de liens |

## Étendre avec de nouveaux transports 🔌

Créer un nouveau transport est trivial — une seule interface à implémenter :

```typescript
import type { Transport, LogEntry } from 'femtologger';

export class SlackTransport implements Transport {
  constructor(private webhookUrl: string) {}

  async send(entry: LogEntry): Promise<void> {
    try {
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `${entry.level.toUpperCase()}: ${entry.message}`,
          // ... autres champs Slack
        }),
      });
    } catch (error) {
      console.error('[SlackTransport] Error:', error);
    }
  }
}
```

## Architecture 🏗️

```
FemtoLogger (core)
├── Transport (interface)
│   ├── TelegramTransport
│   ├── [Future] SlackTransport
│   └── [Future] DiscordTransport
└── LogEntry (type)
```

**Pattern** : Strategy Pattern — chaque destination implémente l'interface `Transport`.

## Roadmap 🗺️

- [x] ~~Tests unitaires~~ — 64 tests, 97.67% couverture
- [ ] Transport Slack
- [ ] Transport Discord
- [ ] Option de batching (regrouper plusieurs logs)
- [ ] Rate limiting intégré

## Contribution 🤝

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## License 📄

MIT © Fred

---

**Philosophy "Femto"** : Rester léger, simple, et efficace. Pas de features inutiles, juste ce qu'il faut pour bien faire le job.
