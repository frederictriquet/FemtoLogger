# Standard : Zero-Dependency Philosophy

## Catégorie
Architecture | Dependencies

## Règle
Pour les packages libraries publics : **privilégier zéro dépendance runtime** quand faisable.

## Justification
- Réduit surface d'attaque (supply chain)
- Minimise taille du bundle
- Simplifie maintenance
- Évite conflits de versions

## Application

### Préférer native APIs
```typescript
// ✅ Utiliser fetch natif (Node 18+)
await fetch(url, options);

// ❌ Ajouter axios/node-fetch
import axios from 'axios';
```

### Préférer stdlib
```typescript
// ✅ Utiliser JSON natif
JSON.stringify(data);

// ❌ Ajouter fast-json-stringify (sauf perf critique)
```

## Exceptions
- DevDependencies : acceptables (build tools, tests)
- Peer dependencies : OK si justifié
- Performance critique : profiler avant d'ajouter

## Trade-offs Acceptés
- Code légèrement plus verbeux
- Gestion manuelle de certains cas (retry, rate-limit)
- Maintenance de fonctionnalités basiques

## Validation
```json
// package.json
{
  "dependencies": {}, // Vide ✅
  "devDependencies": { ... }
}
```

## Date d'adoption
2026-02-07

## Références
- FemtoLogger : 0 runtime deps, 2.1KB bundle
- API directe Telegram au lieu de grammY (200KB+)
