import { printer } from './types';

const log = console.log;
const chalk = require('chalk');
const Configstore = require('configstore');

const rrConfig = new Configstore('Rokul Runnings', {
  ip: '',
  username: '',
  password: '',
  options: { pressDelay: 1000, retryDelay: 1000, retries: 1 },
});

const printOptions: printer = rrConfig.get('printOptions') || {};

export function trueText(text: String) {
  log(printOptions.true ? chalk`{${printOptions.true} ${text}}` : chalk.green(text));
}

export function falseText(text: String) {
  log(printOptions.false ? chalk`{${printOptions.false} ${text}}` : chalk.red(text));
}

export function jsonKey(text: String) {
  return printOptions.jsonKey ? chalk`{${printOptions.jsonKey} ${text}:}` : chalk.green(`${text}:`);
}

export function jsonValue(text: String | Boolean | number) {
  switch (typeof text) {
    case 'string':
      return printOptions.jsonValue.string
        ? chalk`{${printOptions.jsonValue.string} "${text}"}`
        : chalk.keyword('orange')(`"${text}"`);
    case 'boolean':
      return printOptions.jsonValue.boolean
        ? chalk`{${printOptions.jsonValue.boolean} ${text}}`
        : chalk.blue(`${text}`);
    case 'number':
      return printOptions.jsonValue.number
        ? chalk`{${printOptions.jsonValue.number} ${text}}`
        : chalk.yellow(`${text}`);
    default:
      log(typeof text);
      return chalk`{red ${text}}`;
  }
}

function jsonKeyValuePair(key: String, value: String, indentString: String) {
  log(`${indentString}${jsonKey(key)} ${jsonValue(value)},`);
}

export function json(jsonObject: Object, indent?: number, nested?: boolean) {
  let indentString = '';
  indent = indent || 0;
  for (let index = 0; index < indent; index++) {
    indentString += ' ';
  }
  log(`${indentString}${Array.isArray(jsonObject) ? '[' : '{'}`);
  const keys = Object.keys(jsonObject);
  indent += printOptions.jsonIndent || 4;
  for (let index = 0; index < indent; index++) {
    indentString += ' ';
  }
  keys.forEach(key => {
    if (typeof jsonObject[key] === 'object') {
      const keyString = Array.isArray(jsonObject) ? `[${key}]` : key;
      log(indentString, jsonKey(keyString));
      json(jsonObject[key], indent, true);
    } else {
      jsonKeyValuePair(key, jsonObject[key], indentString);
    }
  });
  indentString = '';
  for (let index = 0; index < indent - (printOptions.jsonIndent || 4); index++) {
    indentString += ' ';
  }
  log(`${indentString}${Array.isArray(jsonObject) ? ']' : '}'}${nested ? ',' : ''}`);
}
