# Index des Connaissances — FemtoLogger

## Patterns

| Nom | Description | Fichier |
|-----|-------------|---------|
| Transport-Based Logging | Architecture extensible multi-destinations | [pattern-transport-based-logging.md](./pattern-transport-based-logging.md) |

## Standards

| Catégorie | Nom | Fichier |
|-----------|-----|---------|
| Error Handling | Logger error handling (silent fail) | [std-error-handling-logger.md](./std-error-handling-logger.md) |
| Dependencies | Zero-dependency philosophy | [std-zero-dependency-packages.md](./std-zero-dependency-packages.md) |

## Bugs Documentés

| Date | Description | Fichier |
|------|-------------|---------|
| 2026-02-07 | Falsy trap in chatId validation | [bug-chatid-zero-validation.md](./bug-chatid-zero-validation.md) |

## Apprentissages Clés

- **Strategy Pattern** : Extensibilité via interface commune
- **Promise.allSettled** : Resilience multi-transport
- **Zero-dep** : Native APIs (fetch) vs bibliothèques externes
- **Type safety** : Union types strictes pour options
- **Silent error handling** : Logger ne crash jamais l'app

## Dernière mise à jour
2026-02-07
