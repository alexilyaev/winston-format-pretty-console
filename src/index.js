'use strict';

const { inspect } = require('util');
const { EOL } = require('os');
const { format } = require('winston');
const { MESSAGE, SPLAT } = require('triple-beam');

// https://nodejs.org/api/util.html#util_util_inspect_object_options
const defaultInspectOpts = {
  depth: null,
  colors: true,
  breakLength: 80,
  maxArrayLength: 100,
  compact: true
};

function isPrimitive(val) {
  return val === null || (typeof val !== 'object' && typeof val !== 'function');
}

function formatWithInspect(val, inspectOptions = {}) {
  const prefix = isPrimitive(val) ? ' ' : EOL;
  const shouldFormat = typeof val !== 'string';
  const options = Object.assign({}, defaultInspectOpts, inspectOptions);

  const formattedVal = shouldFormat ? inspect(val, options) : val;

  return prefix + formattedVal;
}

function prettyConsoleFormat(info, { inspectOptions }) {
  let msgArg;
  const splatArgs = info[SPLAT] || [];
  const timestamp = info.timestamp ? `${info.timestamp} - ` : '';
  const level = info.level;
  const meta = info.meta ? [info.meta] : [];

  // If Error passed as `message`, e.g. `logger.info(new Error('123'))`
  if (info instanceof Error) {
    msgArg = `${EOL}${info.stack}`;
  } else {
    // If Error passed as meta, e.g. logger.info('something', new Error('123')),
    // `error.message` is concatenated with `info.message`, see:
    // https://github.com/winstonjs/winston#streams-objectmode-and-info-objects
    // We need to forcefully remove it to avoid a duplicate message
    if (splatArgs[0] instanceof Error && isPrimitive(info.message)) {
      info.message = info.message.replace(splatArgs[0].message, '');
    }

    msgArg = info.message;
  }

  const customOptions = info.prettyConsole && info.prettyConsole.inspectOptions;
  const formatOptions = customOptions || inspectOptions;

  const values = [msgArg]
    // Support extra arguments passed beyond the `message`, e.g.
    // `logger.info('123', [1, 2, 3])`
    .concat(splatArgs)
    // Support meta, e.g.
    // `logger.log({ level: 'info', message: '123', meta: [1, 2, 3] })`
    .concat(meta)
    .map((value, index, arr) => {
      let suffix = '';
      const nextVal = arr[index + 1];

      if (value instanceof Error) {
        // If next argument is primitive, separate with a newline
        if (nextVal && isPrimitive(nextVal)) {
          suffix = EOL;
        }
      }

      return formatWithInspect(value, formatOptions) + suffix;
    })
    .join('');

  return `${timestamp}${level}:${values}`;
}

module.exports = format((info, opts = {}) => {
  info[MESSAGE] = prettyConsoleFormat(info, opts);

  return info;
});
