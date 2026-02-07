# Standard : Error Handling in Loggers

## Catégorie
Architecture | Error Handling

## Règle
**Un logger ne doit JAMAIS faire crasher l'application.**

Toutes les erreurs de transport doivent être capturées et gérées silencieusement.

## Justification
Le rôle d'un logger est d'observer, pas d'impacter. Une erreur de logging (réseau, API down) ne doit jamais compromettre la logique métier.

## Exemples

### ✅ Correct
```typescript
async send(entry: LogEntry): Promise<void> {
  try {
    await fetch(url, options);
  } catch (error) {
    // Log silencieux, pas de throw
    console.error('[Transport] Failed:', error);
  }
}
```

### ❌ Incorrect
```typescript
async send(entry: LogEntry): Promise<void> {
  await fetch(url, options); // Throw non capturé
}
```

## Dispatch Multi-Transport

### ✅ Correct — Promise.allSettled
```typescript
await Promise.allSettled(
  transports.map(t => t.send(entry))
);
```

### ❌ Incorrect — Promise.all
```typescript
// Un transport fail = tous failent
await Promise.all(
  transports.map(t => t.send(entry))
);
```

## Exceptions
Validation au constructeur : throw acceptable pour éviter usage incorrect.

## Vérification
- Tests : vérifier qu'un transport en erreur n'empêche pas les autres
- Review : chercher `throw` non capturé dans transport

## Date d'adoption
2026-02-07

## Références
- FemtoLogger implementation (commit bede3f8)
