'use strict';

const { createLogger, format, transports } = require('winston');
const chalk = require('chalk');

const prettyConsoleFormat = require('./index');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.colorize(),
    prettyConsoleFormat()
  ),
  transports: [new transports.Console()]
});

logger.info({ one: 1, two: 2, three: 3 });
logger.info(chalk.blue('[TEST]:'), { one: 1, two: 2, three: 3 }, [4, 5, 6]);
logger.info(chalk.blue('[TEST]:'), null, undefined, 'one', 2, { 3: 3, 4: '4' });
logger.info(chalk.blue('[TEST]:'), chalk.yellow('Bombastic'), () => {}, /foo/);
logger.error(chalk.blue('[ERR]:'), new Error('Error number 1'));
logger.error(new Error('Error number 2'));
