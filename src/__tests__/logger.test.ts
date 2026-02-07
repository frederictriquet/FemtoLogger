import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FemtoLogger } from '../logger';
import type { Transport, LogEntry } from '../types';

describe('FemtoLogger', () => {
  describe('constructor', () => {
    it('should create logger with single transport', () => {
      const mockTransport: Transport = { send: vi.fn() };
      const logger = new FemtoLogger({ transports: [mockTransport] });

      expect(logger).toBeDefined();
    });

    it('should create logger with multiple transports', () => {
      const transport1: Transport = { send: vi.fn() };
      const transport2: Transport = { send: vi.fn() };
      const logger = new FemtoLogger({ transports: [transport1, transport2] });

      expect(logger).toBeDefined();
    });

    it('should throw error when no transports provided', () => {
      expect(() => {
        new FemtoLogger({ transports: [] });
      }).toThrow('Au moins un transport doit être fourni');
    });

    it('should use default level "info" when not specified', async () => {
      const mockTransport: Transport = { send: vi.fn() };
      const logger = new FemtoLogger({ transports: [mockTransport] });

      await logger.info('test');

      expect(mockTransport.send).toHaveBeenCalledTimes(1);
    });

    it('should respect custom minimum level', async () => {
      const mockTransport: Transport = { send: vi.fn() };
      const logger = new FemtoLogger({
        transports: [mockTransport],
        level: 'error',
      });

      await logger.info('should not be sent');
      await logger.warn('should not be sent');
      await logger.error('should be sent');

      expect(mockTransport.send).toHaveBeenCalledTimes(1);
    });
  });

  describe('log methods', () => {
    let mockTransport: Transport;
    let logger: FemtoLogger;

    beforeEach(() => {
      mockTransport = { send: vi.fn() };
      logger = new FemtoLogger({ transports: [mockTransport] });
    });

    describe('info()', () => {
      it('should send info log with message only', async () => {
        await logger.info('Test info message');

        expect(mockTransport.send).toHaveBeenCalledWith(
          expect.objectContaining({
            level: 'info',
            message: 'Test info message',
            metadata: undefined,
            timestamp: expect.any(Date),
          }),
        );
      });

      it('should send info log with message and metadata', async () => {
        const metadata = { userId: 123, action: 'login' };

        await logger.info('User logged in', metadata);

        expect(mockTransport.send).toHaveBeenCalledWith(
          expect.objectContaining({
            level: 'info',
            message: 'User logged in',
            metadata,
            timestamp: expect.any(Date),
          }),
        );
      });
    });

    describe('warn()', () => {
      it('should send warn log with message only', async () => {
        await logger.warn('Test warning');

        expect(mockTransport.send).toHaveBeenCalledWith(
          expect.objectContaining({
            level: 'warn',
            message: 'Test warning',
            metadata: undefined,
          }),
        );
      });

      it('should send warn log with metadata', async () => {
        const metadata = { memory: '85%', cpu: '60%' };

        await logger.warn('High resource usage', metadata);

        expect(mockTransport.send).toHaveBeenCalledWith(
          expect.objectContaining({
            level: 'warn',
            message: 'High resource usage',
            metadata,
          }),
        );
      });
    });

    describe('error()', () => {
      it('should send error log with message only', async () => {
        await logger.error('Test error');

        expect(mockTransport.send).toHaveBeenCalledWith(
          expect.objectContaining({
            level: 'error',
            message: 'Test error',
            metadata: undefined,
          }),
        );
      });

      it('should send error log with metadata', async () => {
        const metadata = { code: 'ERR_TIMEOUT', duration: 5000 };

        await logger.error('Request timeout', metadata);

        expect(mockTransport.send).toHaveBeenCalledWith(
          expect.objectContaining({
            level: 'error',
            message: 'Request timeout',
            metadata,
          }),
        );
      });
    });
  });

  describe('level filtering', () => {
    it('should filter logs below minimum level', async () => {
      const mockTransport: Transport = { send: vi.fn() };
      const logger = new FemtoLogger({
        transports: [mockTransport],
        level: 'warn',
      });

      await logger.info('filtered');
      await logger.warn('sent');
      await logger.error('sent');

      expect(mockTransport.send).toHaveBeenCalledTimes(2);
    });

    it('should send all logs when level is "info"', async () => {
      const mockTransport: Transport = { send: vi.fn() };
      const logger = new FemtoLogger({
        transports: [mockTransport],
        level: 'info',
      });

      await logger.info('sent');
      await logger.warn('sent');
      await logger.error('sent');

      expect(mockTransport.send).toHaveBeenCalledTimes(3);
    });

    it('should only send errors when level is "error"', async () => {
      const mockTransport: Transport = { send: vi.fn() };
      const logger = new FemtoLogger({
        transports: [mockTransport],
        level: 'error',
      });

      await logger.info('filtered');
      await logger.warn('filtered');
      await logger.error('sent');

      expect(mockTransport.send).toHaveBeenCalledTimes(1);
    });
  });

  describe('multi-transport dispatch', () => {
    it('should dispatch to all transports', async () => {
      const transport1: Transport = { send: vi.fn() };
      const transport2: Transport = { send: vi.fn() };
      const transport3: Transport = { send: vi.fn() };

      const logger = new FemtoLogger({
        transports: [transport1, transport2, transport3],
      });

      await logger.info('broadcast message');

      expect(transport1.send).toHaveBeenCalledTimes(1);
      expect(transport2.send).toHaveBeenCalledTimes(1);
      expect(transport3.send).toHaveBeenCalledTimes(1);
    });

    it('should continue dispatching even if one transport fails', async () => {
      const successTransport: Transport = { send: vi.fn() };
      const failingTransport: Transport = {
        send: vi.fn().mockRejectedValue(new Error('Transport failed')),
      };
      const anotherSuccessTransport: Transport = { send: vi.fn() };

      const logger = new FemtoLogger({
        transports: [successTransport, failingTransport, anotherSuccessTransport],
      });

      await logger.info('test message');

      // Tous les transports doivent être appelés malgré l'échec du second
      expect(successTransport.send).toHaveBeenCalledTimes(1);
      expect(failingTransport.send).toHaveBeenCalledTimes(1);
      expect(anotherSuccessTransport.send).toHaveBeenCalledTimes(1);
    });

    it('should not throw error when transport fails', async () => {
      const failingTransport: Transport = {
        send: vi.fn().mockRejectedValue(new Error('Transport error')),
      };

      const logger = new FemtoLogger({
        transports: [failingTransport],
      });

      // Ne doit pas throw
      await expect(logger.error('test')).resolves.not.toThrow();
    });
  });

  describe('timestamp', () => {
    it('should add current timestamp to log entries', async () => {
      const mockTransport: Transport = { send: vi.fn() };
      const logger = new FemtoLogger({ transports: [mockTransport] });

      const beforeLog = new Date();
      await logger.info('test');
      const afterLog = new Date();

      const logEntry = (mockTransport.send as any).mock.calls[0][0] as LogEntry;

      expect(logEntry.timestamp).toBeInstanceOf(Date);
      expect(logEntry.timestamp.getTime()).toBeGreaterThanOrEqual(beforeLog.getTime());
      expect(logEntry.timestamp.getTime()).toBeLessThanOrEqual(afterLog.getTime());
    });
  });

  describe('edge cases', () => {
    it('should handle empty string message', async () => {
      const mockTransport: Transport = { send: vi.fn() };
      const logger = new FemtoLogger({ transports: [mockTransport] });

      await logger.info('');

      expect(mockTransport.send).toHaveBeenCalledWith(
        expect.objectContaining({ message: '' }),
      );
    });

    it('should handle very long messages', async () => {
      const mockTransport: Transport = { send: vi.fn() };
      const logger = new FemtoLogger({ transports: [mockTransport] });

      const longMessage = 'a'.repeat(10000);
      await logger.info(longMessage);

      expect(mockTransport.send).toHaveBeenCalledWith(
        expect.objectContaining({ message: longMessage }),
      );
    });

    it('should handle empty metadata object', async () => {
      const mockTransport: Transport = { send: vi.fn() };
      const logger = new FemtoLogger({ transports: [mockTransport] });

      await logger.info('test', {});

      expect(mockTransport.send).toHaveBeenCalledWith(
        expect.objectContaining({ metadata: {} }),
      );
    });

    it('should handle complex nested metadata', async () => {
      const mockTransport: Transport = { send: vi.fn() };
      const logger = new FemtoLogger({ transports: [mockTransport] });

      const complexMeta = {
        user: { id: 123, profile: { name: 'Test', roles: ['admin', 'user'] } },
        request: { method: 'POST', headers: { 'content-type': 'application/json' } },
      };

      await logger.info('test', complexMeta);

      expect(mockTransport.send).toHaveBeenCalledWith(
        expect.objectContaining({ metadata: complexMeta }),
      );
    });
  });
});
