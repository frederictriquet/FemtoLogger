import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TelegramTransport } from '../telegram';
import type { LogEntry } from '../../types';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

describe('TelegramTransport', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create transport with required options', () => {
      const transport = new TelegramTransport({
        token: 'test-token',
        chatId: '123456',
      });

      expect(transport).toBeDefined();
    });

    it('should throw error when token is missing', () => {
      expect(() => {
        new TelegramTransport({
          token: '',
          chatId: '123',
        });
      }).toThrow('token is required');
    });

    it('should throw error when chatId is missing', () => {
      expect(() => {
        new TelegramTransport({
          token: 'test-token',
          chatId: '',
        });
      }).toThrow('chatId is required');
    });

    it('should accept numeric chatId', () => {
      const transport = new TelegramTransport({
        token: 'test-token',
        chatId: 123456,
      });

      expect(transport).toBeDefined();
    });

    it('should use default parseMode "HTML" when not specified', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => '{}',
      });

      const transport = new TelegramTransport({
        token: 'test-token',
        chatId: '123',
      });

      const logEntry: LogEntry = {
        level: 'info',
        message: 'test',
        timestamp: new Date(),
      };

      await transport.send(logEntry);

      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);

      expect(body.parse_mode).toBe('HTML');
    });

    it('should use custom parseMode when specified', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => '{}',
      });

      const transport = new TelegramTransport({
        token: 'test-token',
        chatId: '123',
        parseMode: 'Markdown',
      });

      const logEntry: LogEntry = {
        level: 'info',
        message: 'test',
        timestamp: new Date(),
      };

      await transport.send(logEntry);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.parse_mode).toBe('Markdown');
    });

    it('should disable web page preview by default', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => '{}',
      });

      const transport = new TelegramTransport({
        token: 'test-token',
        chatId: '123',
      });

      const logEntry: LogEntry = {
        level: 'info',
        message: 'test',
        timestamp: new Date(),
      };

      await transport.send(logEntry);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.disable_web_page_preview).toBe(true);
    });
  });

  describe('send()', () => {
    const createLogEntry = (
      level: 'info' | 'warn' | 'error',
      message: string,
      metadata?: Record<string, unknown>,
    ): LogEntry => ({
      level,
      message,
      metadata,
      timestamp: new Date('2024-01-15T10:30:00Z'),
    });

    it('should send info log to Telegram API', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => '{"ok":true}',
      });

      const transport = new TelegramTransport({
        token: 'test-token',
        chatId: '123456',
      });

      const logEntry = createLogEntry('info', 'Test message');
      await transport.send(logEntry);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.telegram.org/bottest-token/sendMessage',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    it('should format message with level emoji', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => '{}',
      });

      const transport = new TelegramTransport({
        token: 'test-token',
        chatId: '123',
      });

      const infoEntry = createLogEntry('info', 'Info message');
      await transport.send(infoEntry);
      let body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.text).toContain('🔵');
      expect(body.text).toContain('INFO');

      const warnEntry = createLogEntry('warn', 'Warn message');
      await transport.send(warnEntry);
      body = JSON.parse(mockFetch.mock.calls[1][1].body);
      expect(body.text).toContain('🟡');
      expect(body.text).toContain('WARN');

      const errorEntry = createLogEntry('error', 'Error message');
      await transport.send(errorEntry);
      body = JSON.parse(mockFetch.mock.calls[2][1].body);
      expect(body.text).toContain('🔴');
      expect(body.text).toContain('ERROR');
    });

    it('should include metadata in formatted message', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => '{}',
      });

      const transport = new TelegramTransport({
        token: 'test-token',
        chatId: '123',
      });

      const logEntry = createLogEntry('info', 'User action', {
        userId: 123,
        action: 'login',
      });

      await transport.send(logEntry);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.text).toContain('userId');
      expect(body.text).toContain('123');
      expect(body.text).toContain('action');
      expect(body.text).toContain('login');
    });

    it('should include timestamp in ISO format', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => '{}',
      });

      const transport = new TelegramTransport({
        token: 'test-token',
        chatId: '123',
      });

      const logEntry = createLogEntry('info', 'Test');
      await transport.send(logEntry);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.text).toContain('2024-01-15T10:30:00.000Z');
    });

    it('should escape HTML characters in metadata', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => '{}',
      });

      const transport = new TelegramTransport({
        token: 'test-token',
        chatId: '123',
      });

      const logEntry = createLogEntry('info', 'Test', {
        html: '<script>alert("xss")</script>',
        amp: 'foo & bar',
      });

      await transport.send(logEntry);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.text).toContain('&lt;script&gt;');
      expect(body.text).toContain('&amp;');
      expect(body.text).not.toContain('<script>');
    });

    it('should preserve HTML in message for formatting', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => '{}',
      });

      const transport = new TelegramTransport({
        token: 'test-token',
        chatId: '123',
      });

      const logEntry = createLogEntry('info', '<b>ETL Done</b>: import-actors');
      await transport.send(logEntry);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.text).toContain('<b>ETL Done</b>');
    });

    it('should send to correct chat_id', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => '{}',
      });

      const transport = new TelegramTransport({
        token: 'test-token',
        chatId: '987654321',
      });

      const logEntry = createLogEntry('info', 'Test');
      await transport.send(logEntry);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.chat_id).toBe('987654321');
    });

    it('should handle numeric chatId', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => '{}',
      });

      const transport = new TelegramTransport({
        token: 'test-token',
        chatId: 987654321,
      });

      const logEntry = createLogEntry('info', 'Test');
      await transport.send(logEntry);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.chat_id).toBe(987654321);
    });
  });

  describe('error handling', () => {
    it('should not throw when API returns error status', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => 'Bad Request',
      });

      const transport = new TelegramTransport({
        token: 'test-token',
        chatId: '123',
      });

      const logEntry: LogEntry = {
        level: 'info',
        message: 'test',
        timestamp: new Date(),
      };

      // Ne doit pas throw
      await expect(transport.send(logEntry)).resolves.not.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Erreur API (400)'),
      );

      consoleErrorSpy.mockRestore();
    });

    it('should not throw when network error occurs', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      mockFetch.mockRejectedValue(new Error('Network error'));

      const transport = new TelegramTransport({
        token: 'test-token',
        chatId: '123',
      });

      const logEntry: LogEntry = {
        level: 'info',
        message: 'test',
        timestamp: new Date(),
      };

      // Ne doit pas throw
      await expect(transport.send(logEntry)).resolves.not.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Échec d'envoi"),
        'Network error',
      );

      consoleErrorSpy.mockRestore();
    });

    it('should log errors to console.error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      mockFetch.mockRejectedValue(new Error('Fetch failed'));

      const transport = new TelegramTransport({
        token: 'test-token',
        chatId: '123',
      });

      const logEntry: LogEntry = {
        level: 'error',
        message: 'test error',
        timestamp: new Date(),
      };

      await transport.send(logEntry);

      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('edge cases', () => {
    it('should handle empty message', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => '{}',
      });

      const transport = new TelegramTransport({
        token: 'test-token',
        chatId: '123',
      });

      const logEntry: LogEntry = {
        level: 'info',
        message: '',
        timestamp: new Date(),
      };

      await transport.send(logEntry);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.text).toBeDefined();
    });

    it('should handle very long messages', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => '{}',
      });

      const transport = new TelegramTransport({
        token: 'test-token',
        chatId: '123',
      });

      const longMessage = 'a'.repeat(5000);
      const logEntry: LogEntry = {
        level: 'info',
        message: longMessage,
        timestamp: new Date(),
      };

      await transport.send(logEntry);

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should handle metadata with special characters', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => '{}',
      });

      const transport = new TelegramTransport({
        token: 'test-token',
        chatId: '123',
      });

      const logEntry: LogEntry = {
        level: 'info',
        message: 'test',
        metadata: {
          special: '"quotes" & <tags> \\ backslash',
        },
        timestamp: new Date(),
      };

      await transport.send(logEntry);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.text).toBeDefined();
    });

    it('should handle undefined metadata', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => '{}',
      });

      const transport = new TelegramTransport({
        token: 'test-token',
        chatId: '123',
      });

      const logEntry: LogEntry = {
        level: 'info',
        message: 'test',
        metadata: undefined,
        timestamp: new Date(),
      };

      await transport.send(logEntry);

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should handle empty metadata object', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => '{}',
      });

      const transport = new TelegramTransport({
        token: 'test-token',
        chatId: '123',
      });

      const logEntry: LogEntry = {
        level: 'info',
        message: 'test',
        metadata: {},
        timestamp: new Date(),
      };

      await transport.send(logEntry);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      // Ne doit pas inclure de section metadata si vide
      expect(body.text).not.toContain('<pre>');
    });
  });
});
