import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FemtoLogger } from '../logger';
import { TelegramTransport } from '../transports/telegram';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

describe('FemtoLogger + TelegramTransport Integration', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => '{"ok":true}',
    });
  });

  it('should send logs through TelegramTransport', async () => {
    const logger = new FemtoLogger({
      transports: [
        new TelegramTransport({
          token: 'integration-test-token',
          chatId: '123456',
        }),
      ],
    });

    await logger.info('Integration test message', { test: true });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.telegram.org/botintegration-test-token/sendMessage',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.text).toContain('Integration test message');
    expect(body.text).toContain('test');
    expect(body.chat_id).toBe('123456');
  });

  it('should work with multiple Telegram transports', async () => {
    const logger = new FemtoLogger({
      transports: [
        new TelegramTransport({
          token: 'token1',
          chatId: 'chat1',
        }),
        new TelegramTransport({
          token: 'token2',
          chatId: 'chat2',
        }),
      ],
    });

    await logger.warn('Multi-transport message');

    expect(mockFetch).toHaveBeenCalledTimes(2);

    const firstCall = JSON.parse(mockFetch.mock.calls[0][1].body);
    const secondCall = JSON.parse(mockFetch.mock.calls[1][1].body);

    expect(firstCall.chat_id).toBe('chat1');
    expect(secondCall.chat_id).toBe('chat2');
  });

  it('should respect log level filtering with real transport', async () => {
    const logger = new FemtoLogger({
      transports: [
        new TelegramTransport({
          token: 'test-token',
          chatId: '123',
        }),
      ],
      level: 'error',
    });

    await logger.info('Should be filtered');
    await logger.warn('Should be filtered');
    await logger.error('Should be sent');

    expect(mockFetch).toHaveBeenCalledTimes(1);

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.text).toContain('Should be sent');
  });

  it('should continue logging if one transport fails', async () => {
    // Premier transport échoue
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    // Deuxième transport réussit
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => '{}',
    });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const logger = new FemtoLogger({
      transports: [
        new TelegramTransport({ token: 'token1', chatId: 'chat1' }),
        new TelegramTransport({ token: 'token2', chatId: 'chat2' }),
      ],
    });

    await logger.error('Test message');

    // Les deux transports doivent être appelés
    expect(mockFetch).toHaveBeenCalledTimes(2);
    // Une erreur doit être loggée
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('should format complete log entry correctly end-to-end', async () => {
    const logger = new FemtoLogger({
      transports: [
        new TelegramTransport({
          token: 'test-token',
          chatId: '999',
          parseMode: 'HTML',
        }),
      ],
    });

    await logger.error('Payment processing failed', {
      orderId: 'ORD-12345',
      amount: 99.99,
      currency: 'EUR',
      error: 'Insufficient funds',
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);

    // Vérifier la structure complète du message
    expect(body.text).toContain('🔴'); // Emoji error
    expect(body.text).toContain('ERROR'); // Level
    expect(body.text).toContain('Payment processing failed'); // Message
    expect(body.text).toContain('orderId'); // Metadata keys
    expect(body.text).toContain('ORD-12345');
    expect(body.text).toContain('99.99');
    expect(body.text).toMatch(/\d{4}-\d{2}-\d{2}T/); // ISO timestamp

    expect(body.chat_id).toBe('999');
    expect(body.parse_mode).toBe('HTML');
  });

  it('should handle rapid sequential logs', async () => {
    const logger = new FemtoLogger({
      transports: [
        new TelegramTransport({
          token: 'test-token',
          chatId: '123',
        }),
      ],
    });

    // Envoyer 5 logs rapidement
    await Promise.all([
      logger.info('Log 1'),
      logger.info('Log 2'),
      logger.warn('Log 3'),
      logger.error('Log 4'),
      logger.info('Log 5'),
    ]);

    expect(mockFetch).toHaveBeenCalledTimes(5);
  });

  it('should work with different parseMode options', async () => {
    const markdownLogger = new FemtoLogger({
      transports: [
        new TelegramTransport({
          token: 'test-token',
          chatId: '123',
          parseMode: 'Markdown',
        }),
      ],
    });

    await markdownLogger.info('Markdown test');

    const markdownBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(markdownBody.parse_mode).toBe('Markdown');

    const htmlLogger = new FemtoLogger({
      transports: [
        new TelegramTransport({
          token: 'test-token',
          chatId: '456',
          parseMode: 'HTML',
        }),
      ],
    });

    await htmlLogger.info('HTML test');

    const htmlBody = JSON.parse(mockFetch.mock.calls[1][1].body);
    expect(htmlBody.parse_mode).toBe('HTML');
  });
});
