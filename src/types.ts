/**
 * Niveaux de log supportés.
 */
export type LogLevel = 'info' | 'warn' | 'error';

/**
 * Entrée de log structurée, passée à chaque Transport.
 */
export interface LogEntry {
  /** Niveau de sévérité du log */
  level: LogLevel;
  /** Message principal du log */
  message: string;
  /** Métadonnées optionnelles associées au log */
  metadata?: Record<string, unknown>;
  /** Horodatage de création du log */
  timestamp: Date;
}

/**
 * Contrat que chaque destination de log doit implémenter.
 *
 * Les implémentations DOIVENT gérer leurs propres erreurs de manière silencieuse
 * pour ne jamais faire crasher l'application utilisateur.
 */
export interface Transport {
  /**
   * Envoie un log entry vers la destination.
   *
   * @param entry - L'entrée de log à envoyer
   * @returns Promise qui se résout quand l'envoi est terminé (succès ou échec géré)
   */
  send(entry: LogEntry): Promise<void>;
}

/**
 * Options de configuration du logger.
 */
export interface LoggerOptions {
  /** Liste des transports actifs vers lesquels dispatcher les logs */
  transports: Transport[];
  /**
   * Niveau minimum de log à traiter (optionnel, défaut: 'info').
   * Les logs en dessous de ce niveau sont ignorés.
   */
  level?: LogLevel;
}

/**
 * Configuration spécifique au transport Telegram.
 */
export interface TelegramTransportOptions {
  /** Token du bot Telegram (obtenu via @BotFather) */
  token: string;
  /**
   * Chat ID de destination (peut être un user ID, group ID, ou channel ID).
   * Pour obtenir votre chat ID, envoyez un message à @userinfobot sur Telegram.
   */
  chatId: string | number;
  /**
   * Mode de parsing des messages (défaut: 'HTML').
   * Voir https://core.telegram.org/bots/api#formatting-options
   */
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  /** Désactiver les previews de liens dans les messages (défaut: true) */
  disableWebPagePreview?: boolean;
}
