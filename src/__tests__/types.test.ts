import { describe, it, expectTypeOf } from 'vitest';
import type {
  LogLevel,
  LogEntry,
  Transport,
  LoggerOptions,
  TelegramTransportOptions,
} from '../types';

describe('Type definitions', () => {
  describe('LogLevel', () => {
    it('should accept valid log levels', () => {
      const info: LogLevel = 'info';
      const warn: LogLevel = 'warn';
      const error: LogLevel = 'error';

      expectTypeOf(info).toEqualTypeOf<LogLevel>();
      expectTypeOf(warn).toEqualTypeOf<LogLevel>();
      expectTypeOf(error).toEqualTypeOf<LogLevel>();
    });
  });

  describe('LogEntry', () => {
    it('should have correct structure', () => {
      const entry: LogEntry = {
        level: 'info',
        message: 'test',
        timestamp: new Date(),
      };

      expectTypeOf(entry).toMatchTypeOf<LogEntry>();
      expectTypeOf(entry.level).toEqualTypeOf<LogLevel>();
      expectTypeOf(entry.message).toBeString();
      expectTypeOf(entry.timestamp).toEqualTypeOf<Date>();
    });

    it('should allow optional metadata', () => {
      const entryWithMeta: LogEntry = {
        level: 'info',
        message: 'test',
        metadata: { key: 'value' },
        timestamp: new Date(),
      };

      const entryWithoutMeta: LogEntry = {
        level: 'info',
        message: 'test',
        timestamp: new Date(),
      };

      expectTypeOf(entryWithMeta).toMatchTypeOf<LogEntry>();
      expectTypeOf(entryWithoutMeta).toMatchTypeOf<LogEntry>();
    });

    it('should allow any metadata structure', () => {
      const entry: LogEntry = {
        level: 'info',
        message: 'test',
        metadata: {
          string: 'value',
          number: 123,
          boolean: true,
          nested: { deep: { value: 'test' } },
          array: [1, 2, 3],
        },
        timestamp: new Date(),
      };

      expectTypeOf(entry).toMatchTypeOf<LogEntry>();
    });
  });

  describe('Transport', () => {
    it('should require send method', () => {
      expectTypeOf<Transport>().toHaveProperty('send');
      expectTypeOf<Transport['send']>().toBeFunction();
    });

    it('should accept LogEntry and return Promise<void>', () => {
      expectTypeOf<Transport['send']>().parameter(0).toMatchTypeOf<LogEntry>();
      expectTypeOf<Transport['send']>().returns.toEqualTypeOf<Promise<void>>();
    });
  });

  describe('LoggerOptions', () => {
    it('should require transports array', () => {
      const options: LoggerOptions = {
        transports: [],
      };

      expectTypeOf(options.transports).toEqualTypeOf<Transport[]>();
    });

    it('should allow optional level', () => {
      const withLevel: LoggerOptions = {
        transports: [],
        level: 'warn',
      };

      const withoutLevel: LoggerOptions = {
        transports: [],
      };

      expectTypeOf(withLevel).toMatchTypeOf<LoggerOptions>();
      expectTypeOf(withoutLevel).toMatchTypeOf<LoggerOptions>();
    });
  });

  describe('TelegramTransportOptions', () => {
    it('should require token and chatId', () => {
      const options: TelegramTransportOptions = {
        token: 'test-token',
        chatId: '123',
      };

      expectTypeOf(options.token).toBeString();
      expectTypeOf(options.chatId).toEqualTypeOf<string | number>();
    });

    it('should allow string or number chatId', () => {
      const stringChatId: TelegramTransportOptions = {
        token: 'token',
        chatId: '123',
      };

      const numberChatId: TelegramTransportOptions = {
        token: 'token',
        chatId: 123,
      };

      expectTypeOf(stringChatId).toMatchTypeOf<TelegramTransportOptions>();
      expectTypeOf(numberChatId).toMatchTypeOf<TelegramTransportOptions>();
    });

    it('should allow optional parseMode', () => {
      const withParseMode: TelegramTransportOptions = {
        token: 'token',
        chatId: '123',
        parseMode: 'HTML',
      };

      const withoutParseMode: TelegramTransportOptions = {
        token: 'token',
        chatId: '123',
      };

      expectTypeOf(withParseMode).toMatchTypeOf<TelegramTransportOptions>();
      expectTypeOf(withoutParseMode).toMatchTypeOf<TelegramTransportOptions>();
    });

    it('should restrict parseMode to valid values', () => {
      const html: TelegramTransportOptions['parseMode'] = 'HTML';
      const markdown: TelegramTransportOptions['parseMode'] = 'Markdown';
      const markdownV2: TelegramTransportOptions['parseMode'] = 'MarkdownV2';

      expectTypeOf(html).toEqualTypeOf<'HTML' | 'Markdown' | 'MarkdownV2' | undefined>();
      expectTypeOf(markdown).toEqualTypeOf<'HTML' | 'Markdown' | 'MarkdownV2' | undefined>();
      expectTypeOf(markdownV2).toEqualTypeOf<'HTML' | 'Markdown' | 'MarkdownV2' | undefined>();
    });

    it('should allow optional disableWebPagePreview', () => {
      const withPreview: TelegramTransportOptions = {
        token: 'token',
        chatId: '123',
        disableWebPagePreview: false,
      };

      const withoutPreview: TelegramTransportOptions = {
        token: 'token',
        chatId: '123',
      };

      expectTypeOf(withPreview).toMatchTypeOf<TelegramTransportOptions>();
      expectTypeOf(withoutPreview).toMatchTypeOf<TelegramTransportOptions>();
    });
  });
});
