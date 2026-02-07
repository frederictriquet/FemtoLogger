# Bug : Falsy Trap in chatId Validation

## Date
2026-02-07

## Symptômes
`chatId: 0` rejeté comme invalide alors que techniquement acceptable en TypeScript.

## Cause Racine
Validation avec `!options.chatId` considère `0` comme falsy.

```typescript
if (!options.chatId) {  // 0 est falsy !
  throw new Error('chatId is required');
}
```

## Chemin de Diagnostic
1. Code review identifie pattern `!value`
2. Test mental : `!0 === true` → validation fail
3. Bien que `0` ne soit pas un chat ID Telegram valide, c'est un piège classique

## Solution

### ❌ Avant
```typescript
if (!options.chatId) {
  throw new Error('chatId is required');
}
```

### ✅ Après
```typescript
if (options.chatId === undefined || options.chatId === '') {
  throw new Error('chatId is required');
}
```

## Prévention
- Valider explicitement contre `undefined` ou `''`
- Ne pas utiliser `!value` pour valider numeric IDs
- Linter rule : warn sur `!numericVar`

## Tags
- type: validation
- severity: minor (edge case)
- module: telegram-transport

## Généralisation
S'applique à tout ID numeric potentiellement 0 (array index, port 0, etc.)
