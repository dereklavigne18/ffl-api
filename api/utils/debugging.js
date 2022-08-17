// Native
const fs = require('fs');
const path = require('path');
const util = require('util');

// Packages
const { v4 } = require('uuid');
const uuidv4 = v4; // Immediately re-assign to a better name

// App Modules
const { logger } = require('./logger');


function hookDebugging() {
  // Dirs relative to this file to hook the debugging logs onto
  const dirs = [`${__dirname}/../services`];

  dirs.forEach(hookDebuggingOnDir);
}

function hookDebuggingOnDir(dirPath) {
  const resources = fs.readdirSync(dirPath, { withFileTypes: true });
  const fileNames = resources.filter(item => !item.isDirectory()).map(item => item.name);
  const dirNames = resources.filter(item => item.isDirectory()).map(item => item.name);

  // Iterate over all files and add the debugging logs, then recursively go over sub-directories
  fileNames.forEach(fileName => hookDebuggingOnModule(`${dirPath}/${fileName}`));
  dirNames.forEach(dirName => hookDebuggingOnDir(`${dirPath}/${dirName}`));
}

function hookDebuggingOnModule(modulePath) {
  const m = require(modulePath);

  // Go through all function exports and all the debugging logs
  for (const [propName, propVal] of Object.entries(m)) {
    if (typeof propVal === 'function') {
      m[propName] = hookDebuggingOnFunction(propVal);
    }
  }
}

function hookDebuggingOnFunction(fn) {
  return function () {
    const callId = uuidv4();

    // Log the call
    const argString = [...arguments].map(a => (typeof a === 'object') ? JSON.stringify(a) : a).join(', ');
    logger.debug(`${fn.name} CALL ${callId} ARGS ${argString}`);

    // Log the result
    const ret = fn.apply(this, arguments);

    // Should consider altering this to support Promises, they show as an empty object, maybe we could intercept the
    // resolution and log it
    const retString = (typeof ret === 'object') ? `${ret.constructor.name} ${JSON.stringify(ret)}` : ret;
    logger.debug(`${fn.name} CALL ${callId} RETURN ${retString}`);

    return ret;
  }
}

module.exports = {
  hookDebugging
}