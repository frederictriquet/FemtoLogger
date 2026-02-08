import type { LogEntry, LogLevel, Transport, TelegramTransportOptions } from '../types';

/**
 * Transport pour envoyer des logs vers Telegram via Bot API.
 *
 * Utilise l'API native de Telegram (pas de dépendance externe).
 *
 * @example
 * ```typescript
 * const transport = new TelegramTransport({
 *   token: process.env.TELEGRAM_BOT_TOKEN!,
 *   chatId: process.env.TELEGRAM_CHAT_ID!,
 *   parseMode: 'HTML',
 * });
 * ```
 */
export class TelegramTransport implements Transport {
  private readonly apiUrl: string;
  private readonly chatId: string | number;
  private readonly parseMode: 'HTML' | 'Markdown' | 'MarkdownV2';
  private readonly disableWebPagePreview: boolean;

  constructor(options: TelegramTransportOptions) {
    // Validation des paramètres obligatoires
    if (!options.token) {
      throw new Error('TelegramTransport: token is required');
    }
    if (options.chatId === undefined || options.chatId === '') {
      throw new Error('TelegramTransport: chatId is required');
    }

    this.apiUrl = `https://api.telegram.org/bot${options.token}/sendMessage`;
    this.chatId = options.chatId;
    this.parseMode = options.parseMode ?? 'HTML';
    this.disableWebPagePreview = options.disableWebPagePreview ?? true;
  }

  /**
   * Envoie un log entry vers Telegram.
   *
   * Les erreurs sont gérées silencieusement pour ne pas faire crasher l'application.
   *
   * @param entry - L'entrée de log à envoyer
   */
  async send(entry: LogEntry): Promise<void> {
    try {
      const text = this.formatMessage(entry);

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.chatId,
          text,
          parse_mode: this.parseMode,
          disable_web_page_preview: this.disableWebPagePreview,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(
          `[FemtoLogger/Telegram] Erreur API (${response.status}): ${errorBody}`,
        );
      }
    } catch (error) {
      // Erreur réseau ou autre : log silencieux sans throw
      console.error(
        '[FemtoLogger/Telegram] Échec d\'envoi:',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  /**
   * Formate un LogEntry en message texte lisible pour Telegram.
   *
   * Format:
   * [EMOJI] LEVEL | Message
   * {metadata en JSON si présente}
   * Timestamp
   *
   * @param entry - L'entrée de log à formater
   * @returns Message formaté prêt à être envoyé
   */
  private formatMessage(entry: LogEntry): string {
    // Emoji par niveau
    const emoji = this.getLevelEmoji(entry.level);

    // Ligne principale : [EMOJI] LEVEL | Message
    let text = `${emoji} ${entry.level.toUpperCase()} | ${entry.message}`;

    // Ajouter metadata si présente
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      const metadataJson = JSON.stringify(entry.metadata, null, 2);
      text += `\n\n<pre>${this.escapeHtml(metadataJson)}</pre>`;
    }

    // Ajouter timestamp
    const timestamp = entry.timestamp.toISOString();
    text += `\n\n<i>${timestamp}</i>`;

    return text;
  }

  /**
   * Retourne l'emoji correspondant au niveau de log.
   *
   * @param level - Niveau du log
   * @returns Emoji représentant le niveau
   */
  private getLevelEmoji(level: LogLevel): string {
    switch (level) {
      case 'info':
        return '🔵';
      case 'warn':
        return '🟡';
      case 'error':
        return '🔴';
      default:
        return '⚪';
    }
  }

  /**
   * Échappe les caractères HTML pour éviter les problèmes de parsing Telegram.
   *
   * @param text - Texte à échapper
   * @returns Texte avec caractères HTML échappés
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
