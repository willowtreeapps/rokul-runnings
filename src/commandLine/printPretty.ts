import { printer } from './types';

const log = console.log;
const chalk = require('chalk');

export class PrintPretty {
  private printOptions: printer;
  constructor(printOptions: printer) {
    this.printOptions = printOptions;
  }

  trueText(text: String) {
    log(this.printOptions.true ? chalk`{${this.printOptions.true} ${text}}` : chalk.green(text));
  }

  falseText(text: String) {
    log(this.printOptions.false ? chalk`{${this.printOptions.false} ${text}}` : chalk.red(text));
  }

  jsonKey(text: String) {
    return this.printOptions.jsonKey ? chalk`{${this.printOptions.jsonKey} ${text}:}` : chalk.green(`${text}:`);
  }

  jsonValue(text: String | Boolean | number) {
    switch (typeof text) {
      case 'string':
        return this.printOptions.jsonValue.string
          ? chalk`{${this.printOptions.jsonValue.string} "${text}"}`
          : chalk.keyword('orange')(`"${text}"`);
      case 'boolean':
        return this.printOptions.jsonValue.boolean
          ? chalk`{${this.printOptions.jsonValue.boolean} ${text}}`
          : chalk.blue(`${text}`);
      case 'number':
        return this.printOptions.jsonValue.number
          ? chalk`{${this.printOptions.jsonValue.number} ${text}}`
          : chalk.yellow(`${text}`);
      default:
        log(typeof text);
        return chalk`{red ${text}}`;
    }
  }

  private jsonKeyValuePair(key: String, value: String, indentString: String) {
    log(`${indentString}${this.jsonKey(key)} ${this.jsonValue(value)},`);
  }

  json(jsonObject: Object, indent?: number, nested?: boolean) {
    let indentString = '';
    indent = indent || 0;
    for (let index = 0; index < indent; index++) {
      indentString += ' ';
    }
    log(`${indentString}${Array.isArray(jsonObject) ? '[' : '{'}`);
    const keys = Object.keys(jsonObject);
    indent += this.printOptions.jsonIndent || 4;
    for (let index = 0; index < indent; index++) {
      indentString += ' ';
    }
    keys.forEach(key => {
      if (typeof jsonObject[key] === 'object') {
        const keyString = Array.isArray(jsonObject) ? `[${key}]` : key;
        log(indentString, this.jsonKey(keyString));
        this.json(jsonObject[key], indent, true);
      } else {
        this.jsonKeyValuePair(key, jsonObject[key], indentString);
      }
    });
    indentString = '';
    for (let index = 0; index < indent - (this.printOptions.jsonIndent || 4); index++) {
      indentString += ' ';
    }
    log(`${indentString}${Array.isArray(jsonObject) ? ']' : '}'}${nested ? ',' : ''}`);
  }
}
