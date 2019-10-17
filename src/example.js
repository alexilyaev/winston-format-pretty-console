'use strict';

const { createLogger, format, transports } = require('winston');
const chalk = require('chalk');

const prettyConsoleFormat = require('./index');

const logger = createLogger({
  level: 'silly',
  format: format.combine(
    format.timestamp(),
    format.colorize(),
    prettyConsoleFormat()
  ),
  transports: [new transports.Console()]
});

// Basic
logger.info('The quick brown fox jumps over the lazy dog');
logger.info(chalk.dim('The quick brown fox jumps over the lazy dog'));
logger.info('The quick brown fox', chalk.dim('jumps over'), 'the lazy dog');
// Objects and other types
logger.info({ one: 1, two: 2, three: 3 });
logger.info(chalk.blue('[TEST]:'), { one: 1, two: 2 }, [3, 4, 5]);
logger.info(chalk.blue('[TEST]:'), null, undefined, 'one', 2, { 3: 3, 4: '4' });
logger.info(chalk.blue('[TEST]:'), chalk.yellow('Bombastic'), () => {}, /foo/);
// Errors
logger.error(new Error('Why u broke, ha?'));
logger.error(new Error('Why u broke, ha?'), { one: 1, two: 2 }, [3, 4, 5]);
logger.error(new Error('Why u broke, ha?'), 123, '456');
logger.error(chalk.red('[ERR]:'), new Error('Why u broke, ha?'));
logger.error({ one: 1, two: 2 }, new Error('Why u broke, ha?'));
logger.error(chalk.red('[ERR]:'), 123, new Error('Why u broke, ha?'));

logger.log({
  level: 'info',
  message: 'Meta data',
  // Override format options for this specific log
  prettyConsole: {
    inspectOptions: {
      depth: 2,
      colors: false,
      compact: false
    }
  },
  meta: {
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
  }
});
