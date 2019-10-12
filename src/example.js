'use strict';

const { createLogger, format, transports } = require('winston');
const chalk = require('chalk');

const prettyConsoleFormat = require('./index');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.colorize(),
    prettyConsoleFormat()
  ),
  transports: [new transports.Console()]
});

logger.info('The quick brown fox jumps over the lazy dog');
logger.info(chalk.dim('The quick brown fox jumps over the lazy dog'));
logger.info('The quick brown fox', chalk.dim('jumps over'), 'the lazy dog');
logger.info({ one: 1, two: 2, three: 3 });
logger.info(chalk.blue('[TEST]:'), { one: 1, two: 2 }, [3, 4, 5]);
logger.info(chalk.blue('[TEST]:'), null, undefined, 'one', 2, { 3: 3, 4: '4' });
logger.info(chalk.blue('[TEST]:'), chalk.yellow('Bombastic'), () => {}, /foo/);
logger.error(new Error('Why u broke, ha?'));
logger.error(new Error('Why u broke, ha?'), { one: 1, two: 2 }, [3, 4, 5]);
logger.error(new Error('Why u broke, ha?'), 123, '456');
logger.error(chalk.blue('[ERR]:'), new Error('Why u broke, ha?'));
logger.error({ one: 1, two: 2 }, new Error('Why u broke, ha?'));
logger.error(chalk.blue('[ERR]:'), 123, new Error('Why u broke, ha?'));
