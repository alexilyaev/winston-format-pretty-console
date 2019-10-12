'use strict';

const { inspect } = require('util');
const { EOL } = require('os');
const { format } = require('winston');
const { MESSAGE, SPLAT } = require('triple-beam');

const defaultInspectOpts = {
  depth: null,
  colors: true
};

function isPrimitive(val) {
  return val === null || (typeof val !== 'object' && typeof val !== 'function');
}

function formatWithInspect(val, { inspectOpts = {} } = {}) {
  const prefix = isPrimitive(val) ? ' ' : EOL;
  const shouldFormat = typeof val !== 'string';
  const formattedVal = shouldFormat
    ? inspect(val, { ...defaultInspectOpts, ...inspectOpts })
    : val;

  return prefix + formattedVal;
}

function prettyConsoleFormat(info, { inspectOpts }) {
  let msgArg;
  const splatArgs = info[SPLAT] || [];
  const timestamp = info.timestamp ? `${info.timestamp} - ` : '';

  // If Error passed as 1st argument
  if (info instanceof Error) {
    msgArg = `${EOL}${info.stack}`;
  } else {
    // If Error is 2nd argument, `info.message` will be concatenated with
    // the error `message` (don't know why that happens).
    // We need to forcefully remove it to avoid a duplicate message
    if (splatArgs[0] instanceof Error && isPrimitive(info.message)) {
      info.message = info.message.replace(splatArgs[0].message, '');
    }

    msgArg = info.message;
  }

  const values = [msgArg]
    .concat(splatArgs)
    .map((value, index, arr) => {
      let suffix = '';
      const nextVal = arr[index + 1];

      if (value instanceof Error) {
        // If next argument is primitive, separate with a newline
        if (nextVal && isPrimitive(nextVal)) {
          suffix = EOL;
        }
      }

      return formatWithInspect(value, { inspectOpts }) + suffix;
    })
    .join('');

  return `${timestamp}${info.level}:${values}`;
}

module.exports = format((info, opts = {}) => {
  info[MESSAGE] = prettyConsoleFormat(info, opts);

  return info;
});
