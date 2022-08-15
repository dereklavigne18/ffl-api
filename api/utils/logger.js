/* eslint-disable no-console */

// Packages
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
      const dt = new Date().toISOString();
      console.debug(chalk.green(`${dt} DEBUG ${msg}`));
    }
  },
  info: msg => {
    if (this.logLevel <= LogLevel.INFO) {
      const dt = new Date().toISOString();
      console.info(chalk.blue(`${dt} INFO ${msg}`));
    }
  },
  warn: msg => {
    if (this.logLevel <= LogLevel.WARN) {
      const dt = new Date().toISOString();
      console.log(chalk.yellow(`${dt} WARN ${msg}`));
    }
  },
  error: msg => {
    // Just always log errors
    const dt = new Date().toISOString();
    console.error(chalk.red(`${dt} ERROR ${msg}`));
  },
};

module.exports = {
  logger,
  LogLevel
};
