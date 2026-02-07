import type { LogEntry, LogLevel, LoggerOptions, Transport } from './types';

/**
 * Logger principal qui dispatche les logs vers plusieurs transports.
 *
 * @example
 * ```typescript
 * const logger = new FemtoLogger({
 *   transports: [new TelegramTransport({ token: '...', chatId: '...' })],
 *   level: 'info',
 * });
 *
 * await logger.info('User logged in', { userId: 123 });
 * await logger.error('Payment failed', { orderId: 456 });
 * ```
 */
export class FemtoLogger {
  private readonly transports: Transport[];
  private readonly minLevel: LogLevel;
  private readonly levelPriority: Record<LogLevel, number> = {
    info: 0,
    warn: 1,
    error: 2,
  };

  constructor(options: LoggerOptions) {
    if (!options.transports || options.transports.length === 0) {
      throw new Error('FemtoLogger: Au moins un transport doit être fourni');
    }

    this.transports = options.transports;
    this.minLevel = options.level ?? 'info';
  }

  /**
   * Log un message de niveau info.
   *
   * @param message - Message à logger
   * @param metadata - Métadonnées optionnelles
   */
  async info(message: string, metadata?: Record<string, unknown>): Promise<void> {
    await this.log('info', message, metadata);
  }

  /**
   * Log un message de niveau warn.
   *
   * @param message - Message à logger
   * @param metadata - Métadonnées optionnelles
   */
  async warn(message: string, metadata?: Record<string, unknown>): Promise<void> {
    await this.log('warn', message, metadata);
  }

  /**
   * Log un message de niveau error.
   *
   * @param message - Message à logger
   * @param metadata - Métadonnées optionnelles
   */
  async error(message: string, metadata?: Record<string, unknown>): Promise<void> {
    await this.log('error', message, metadata);
  }

  /**
   * Méthode privée pour dispatcher un log vers tous les transports.
   *
   * @param level - Niveau du log
   * @param message - Message à logger
   * @param metadata - Métadonnées optionnelles
   */
  private async log(
    level: LogLevel,
    message: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    // Vérifier si le niveau est suffisant
    if (!this.shouldLog(level)) {
      return;
    }

    // Construire l'entrée de log
    const entry: LogEntry = {
      level,
      message,
      metadata,
      timestamp: new Date(),
    };

    // Dispatcher vers tous les transports avec Promise.allSettled
    // pour qu'un transport en erreur ne bloque pas les autres
    await Promise.allSettled(
      this.transports.map((transport) => transport.send(entry)),
    );
  }

  /**
   * Vérifie si un log doit être traité en fonction du niveau minimum configuré.
   *
   * @param level - Niveau du log à vérifier
   * @returns true si le log doit être traité
   */
  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.minLevel];
  }
}
