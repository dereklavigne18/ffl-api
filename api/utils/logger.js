/* eslint-disable no-console */

const chalk = require('chalk');
const ip = require('ip');

const divider = chalk.gray('\n-----------------------------------');
const LogLevel = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
}

/**
 * Logger middleware
 */
const logger = {
  logLevel: LogLevel.INFO,

  setLogLevel: logLevel => {
    this.logLevel = logLevel;
  },

  // Called whenever there's an error on the server we want to print
  debug: msg => {
    if (this.logLevel === LogLevel.DEBUG) {
      console.debug(chalk.green(msg));
    }
  },
  info: msg => {
    if (this.logLevel <= LogLevel.INFO) {
      console.info(chalk.blue(msg));
    }
  },
  warn: msg => {
    if (this.logLevel <= LogLevel.WARN) {
      console.log(chalk.yellow(msg));
    }
  },
  error: msg => {
    // Just always log errors
    console.error(chalk.red(msg));
  },
};

module.exports = {
  logger,
  LogLevel
};
