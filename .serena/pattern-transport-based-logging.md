# Pattern : Transport-Based Logging

## Problème
Besoin d'un logger extensible supportant plusieurs destinations (Telegram, Slack, Discord, etc.) sans dépendances externes.

## Contexte
- Logger côté serveur TypeScript/Node.js
- Multi-destinations requises
- Zéro dépendance souhaitée
- Extensibilité critique

## Solution
Architecture basée sur le **Strategy Pattern** avec interface `Transport` commune.

## Code

```typescript
// Interface commune
interface Transport {
  send(entry: LogEntry): Promise<void>;
}

// Logger core
class FemtoLogger {
  constructor(private transports: Transport[]) {}

  async log(entry: LogEntry) {
    // Promise.allSettled = resilience
    await Promise.allSettled(
      this.transports.map(t => t.send(entry))
    );
  }
}

// Implémentation spécifique
class TelegramTransport implements Transport {
  async send(entry: LogEntry) {
    await fetch(telegramApiUrl, { ... });
  }
}
```

## Avantages
- ✅ Ajout de transport = 1 classe (~50 lignes)
- ✅ Multi-destinations sans effort
- ✅ Isolation : un transport fail ne bloque pas les autres
- ✅ Testabilité : mock des transports trivial

## Inconvénients
- ⚠️ Légère verbosité vs approche minimaliste pure

## Exemples d'utilisation
- `src/logger.ts:92` - Dispatch avec `Promise.allSettled`
- `src/transports/telegram.ts:17` - Implémentation Telegram

## Voir aussi
- Strategy Pattern (GoF)
- Winston/Pino architecture similaire
