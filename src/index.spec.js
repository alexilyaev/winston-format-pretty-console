'use strict';

const { format } = require('winston');
const { LEVEL, MESSAGE, SPLAT } = require('triple-beam');
const chalk = require('chalk');

const prettyConsoleFormat = require('./index');

function cleanupErrorStack(str) {
  return (
    str
      // Remove `:line:column` from this filename in the error stack
      .replace(new RegExp(`(${__filename}):\\d+:\\d+`), '$1')
      // Remove `internal/process/next_tick.js`, not always there
      .replace(/\n.*internal\/process\/next_tick\.js:\d+:\d+\)/, '')
  );
}

describe('prettyConsoleFormat', () => {
  describe('basic', () => {
    it('should support simple string message', () => {
      const info = {
        level: 'info',
        message: 'The quick brown fox jumps over the lazy dog'
      };
      const opts = {};
      const output = prettyConsoleFormat().transform({ ...info }, opts);

      expect(output).toMatchObject(info);
      expect(output[MESSAGE]).toMatchSnapshot();
    });

    it('should support colored string message', () => {
      const info = {
        level: 'info',
        message: chalk.dim('The quick brown fox jumps over the lazy dog')
      };
      const opts = {};
      const output = prettyConsoleFormat().transform({ ...info }, opts);

      expect(output).toMatchObject(info);
      expect(output[MESSAGE]).toMatchSnapshot();
    });

    it('should support Object message', () => {
      const info = {
        level: 'info',
        message: { one: 1, two: 2, three: 3 }
      };
      const opts = {};
      // @ts-ignore
      // TypeScript expects `message` to be `string`, should really be `any`
      const output = prettyConsoleFormat().transform({ ...info }, opts);

      expect(output).toMatchObject(info);
      expect(output[MESSAGE]).toMatchSnapshot();
    });

    it('should support multiple string values', () => {
      const info = {
        level: 'info',
        message: 'The quick brown fox',
        [SPLAT]: [chalk.dim('jumps over'), 'the lazy dog']
      };
      const opts = {};
      const output = prettyConsoleFormat().transform({ ...info }, opts);

      expect(output).toMatchObject(info);
      expect(output[MESSAGE]).toMatchSnapshot();
    });

    it('should support multiple mixed Object values', () => {
      const info = {
        level: 'info',
        message: chalk.blue('[TEST]:'),
        [SPLAT]: [{ one: 1, two: 2 }, [3, 4, 5]]
      };
      const opts = {};
      const output = prettyConsoleFormat().transform({ ...info }, opts);

      expect(output).toMatchObject(info);
      expect(output[MESSAGE]).toMatchSnapshot();
    });

    it('should support multiple mixed values extra', () => {
      const info = {
        level: 'info',
        message: chalk.blue('[TEST]:'),
        [SPLAT]: [null, undefined, 'one', 2, { 3: 3, 4: '4' }]
      };
      const opts = {};
      const output = prettyConsoleFormat().transform({ ...info }, opts);

      expect(output).toMatchObject(info);
      expect(output[MESSAGE]).toMatchSnapshot();
    });

    it('should support multiple mixed values extra more', () => {
      const info = {
        level: 'info',
        message: chalk.blue('[TEST]:'),
        [SPLAT]: [chalk.yellow('Bombastic'), () => {}, /foo/]
      };
      const opts = {};
      const output = prettyConsoleFormat().transform({ ...info }, opts);

      expect(output).toMatchObject(info);
      expect(output[MESSAGE]).toMatchSnapshot();
    });
  });

  describe('errors', () => {
    it('should support error value', () => {
      const err = new Error('Why u broke, ha?');
      const info = err;

      // @ts-ignore
      info.level = 'error';
      info[LEVEL] = 'error';

      const opts = {};
      // @ts-ignore
      // Must pass the Error reference to preserve `instanceof`
      const output = prettyConsoleFormat().transform(info, opts);

      expect(output).toMatchObject({
        // @ts-ignore
        [LEVEL]: info.level
      });
      expect(cleanupErrorStack(output[MESSAGE])).toMatchSnapshot();
    });

    it('should support error value with extra Object values', () => {
      const err = new Error('Why u broke, ha?');
      const info = err;

      // @ts-ignore
      info.level = 'error';
      info[SPLAT] = [{ one: 1, two: 2 }, [3, 4, 5]];

      const opts = {};
      // @ts-ignore
      // Must pass the Error reference to preserve `instanceof`
      const output = prettyConsoleFormat().transform(info, opts);

      expect(output).toMatchObject({
        // @ts-ignore
        [LEVEL]: info.level
      });
      expect(cleanupErrorStack(output[MESSAGE])).toMatchSnapshot();
    });

    it('should support error value with extra primitive values', () => {
      const err = new Error('Why u broke, ha?');
      const info = {
        level: 'error',
        message: err,
        [SPLAT]: [123, '456']
      };

      const opts = {};
      // @ts-ignore
      // Must pass the Error reference to preserve `instanceof`
      const output = prettyConsoleFormat().transform(info, opts);

      expect(output).toMatchObject({
        // @ts-ignore
        [LEVEL]: info.level
      });
      expect(cleanupErrorStack(output[MESSAGE])).toMatchSnapshot();
    });

    it('should support message and error value', () => {
      const err = new Error('Why u broke, ha?');
      const info = {
        level: 'error',
        // Winston concatenates `err.message` to `info.message` for some reason
        // Only if the Error is the 2nd argument (1st in SPLAT)
        message: `${chalk.blue('[ERR]:')}${err.message}`,
        // I'm not sure where does that come from
        stack: err.stack,
        [SPLAT]: [err]
      };

      const opts = {};
      const output = prettyConsoleFormat().transform({ ...info }, opts);

      expect(output).toMatchObject({
        [LEVEL]: info.level,
        stack: err.stack,
        message: `${chalk.blue('[ERR]:')}`
      });
      expect(cleanupErrorStack(output[MESSAGE])).toMatchSnapshot();
    });

    // Bug in Winston, Error `message` is concatenated to `info.message`,
    // which converts the Object to string. Should not happen at all
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('should support Object message and error value', () => {
      const err = new Error('Why u broke, ha?');
      const info = {
        level: 'error',
        // This is what it should be!
        // message: { one: 1, two: 2 },
        message: `[object Object]${err.message}`,
        stack: err.stack,
        [SPLAT]: [err]
      };

      const opts = {};
      // @ts-ignore
      // TypeScript expects `message` to be `string`, should really be `any`
      const output = prettyConsoleFormat().transform({ ...info }, opts);

      expect(output).toMatchObject({
        [LEVEL]: info.level,
        stack: err.stack
      });
      expect(cleanupErrorStack(output[MESSAGE])).toMatchSnapshot();
    });

    it('should support message with extra value and then error value', () => {
      const err = new Error('Why u broke, ha?');
      const info = {
        level: 'error',
        message: `${chalk.blue('[ERR]:')}`,
        // I'm not sure where does that come from
        stack: err.stack,
        [SPLAT]: [123, err]
      };

      const opts = {};
      const output = prettyConsoleFormat().transform({ ...info }, opts);

      expect(output).toMatchObject({
        [LEVEL]: info.level,
        stack: err.stack
      });
      expect(cleanupErrorStack(output[MESSAGE])).toMatchSnapshot();
    });
  });

  describe('options', () => {
    it('should apply custom inspectOptions if passed', () => {
      const nestedData = {
        one: 1,
        two: 2,
        three: {
          subThree: 3,
          four: 4,
          subFour: {
            five: 5,
            subFive: {
              six: 6,
              subSix: {
                seven: 7,
                subSeven: {
                  eight: 8
                }
              }
            }
          }
        }
      };

      const info = {
        level: 'info',
        message: 'Deep nested data: expanded, no colors, max depth 2',
        [SPLAT]: [nestedData]
      };
      const opts = {
        inspectOptions: {
          depth: 2,
          colors: false,
          compact: false
        }
      };
      const output = prettyConsoleFormat().transform({ ...info }, opts);

      expect(output).toMatchObject(info);
      expect(output[MESSAGE]).toMatchSnapshot();
    });
  });

  describe('with other formatters', () => {
    it('should support format.timestamp()', () => {
      const info = {
        level: 'info',
        message: 'The quick brown fox jumps over the lazy dog'
      };
      const opts = {};
      const output = format
        .combine(format.timestamp(), prettyConsoleFormat())
        .transform({ ...info }, opts);

      expect(output).toMatchObject(info);
      expect(output).toHaveProperty('timestamp');
      expect(output[MESSAGE]).toMatch(output['timestamp']);
      // Timestamp is dynamic, removing it before matching
      expect(
        output[MESSAGE].replace(output['timestamp'], '')
      ).toMatchSnapshot();
    });

    it('should support format.colorize()', () => {
      const info = {
        // Needed for `format.colorize()`
        [LEVEL]: 'info',
        level: 'info',
        message: 'The quick brown fox jumps over the lazy dog'
      };
      const opts = {};
      const output = format
        .combine(format.colorize(), prettyConsoleFormat())
        .transform({ ...info }, opts);

      expect(output).toMatchObject({
        [LEVEL]: info.level,
        message: info.message
      });
      expect(output[MESSAGE]).toMatchSnapshot();
    });
  });
});
