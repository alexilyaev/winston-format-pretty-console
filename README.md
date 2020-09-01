# Winston@3 pretty console format

[![Version npm](https://img.shields.io/npm/v/winston-format-pretty-console.svg?style=flat-square)](https://www.npmjs.com/package/winston-format-pretty-console)

Winston@3 pretty **console** formatter.

## Why?

- Because Winston v3 broke fundamental console features that worked fine in v2 ([details](https://github.com/winstonjs/winston/issues/1427#issuecomment-535297716))
- Because logging to the console should be delightful 🎉

## Why not [winston-console-format](https://github.com/duccio/winston-console-format)?

- Looks really nice, but has different design goals
- Requires `message` to be a `string` (as opposed to anything we want)
- Doesn't support some of features mentioned below

## Features

- Supports any number of arguments, of any type, which will be pretty printed
  to the console (`message` argument can be **anything!**)
- Supports colorized string values just fine (e.g. using `chalk`)
- Formats literal values like `number`, `null`, `undefined`, `function`, etc.
- Handles Error objects. The error be any argument
- Supports formatting configuration, per logger and even per single log

## Design Decisions

- Should work as expected, basically like `console.log`
- No fancy colors, should be clean by default
- Provides easy Copy/Paste experience of multi-line objects, etc.
