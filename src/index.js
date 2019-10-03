'use strict';

const { inspect } = require('util');
const { EOL } = require('os');
const { format } = require('winston');
const { MESSAGE, SPLAT } = require('triple-beam');

function isPrimitive(val) {
  return val === null || (typeof val !== 'object' && typeof val !== 'function');
}

function formatWithInspect(val) {
  if (val instanceof Error) {
    return '';
  }

  const prefix = isPrimitive(val) ? '' : EOL;
  const shouldFormat = typeof val !== 'string';

  return (
    prefix + (shouldFormat ? inspect(val, { depth: null, colors: true }) : val)
  );
}

function prettyConsoleFormat(info) {
  const msg = formatWithInspect(info.message);
  const splatArgs = info[SPLAT] || [];
  const rest = splatArgs.map(data => formatWithInspect(data)).join(' ');
  const stackTrace = info.stack ? `${EOL}${info.stack}` : '';

  return `${info.timestamp} - ${info.level}: ${msg} ${rest}${stackTrace}`;
}

module.exports = format(info => {
  info[MESSAGE] = prettyConsoleFormat(info);

  return info;
});
