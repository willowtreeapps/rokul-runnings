import { printer } from './types';
import * as chalk from 'chalk';

const log = console.log;

export class PrintPretty {
  private printOptions: printer;
  constructor(printOptions: printer) {
    this.printOptions = printOptions;
  }

  // Print styling for responses that return true
  trueText(text: String) {
    log(this.printOptions.trueStyle ? chalk`{${this.printOptions.trueStyle} ${text}}` : chalk.green(text));
  }

  // Print styling for responses that return false
  falseText(text: String) {
    log(this.printOptions.falseStyle ? chalk`{${this.printOptions.falseStyle} ${text}}` : chalk.red(text));
  }

  // Print styling for keys in JSON objects
  jsonKey(text: String) {
    return this.printOptions.jsonKeyStyle
      ? chalk`{${this.printOptions.jsonKeyStyle} ${text}:}`
      : chalk.green(`${text}:`);
  }

  // Print styling for values in JSON Objects, based on value type
  jsonValue(text: String | Boolean | number) {
    switch (typeof text) {
      case 'string':
        return this.printOptions.jsonValueStyle.stringStyle
          ? chalk`{${this.printOptions.jsonValueStyle.stringStyle} "${text}"}`
          : chalk.keyword('orange')(`"${text}"`);
      case 'boolean':
        return this.printOptions.jsonValueStyle.booleanStyle
          ? chalk`{${this.printOptions.jsonValueStyle.booleanStyle} ${text}}`
          : chalk.blue(`${text}`);
      case 'number':
        return this.printOptions.jsonValueStyle.numberStyle
          ? chalk`{${this.printOptions.jsonValueStyle.numberStyle} ${text}}`
          : chalk.yellow(`${text}`);
      default:
        log(typeof text);
        return chalk`{red ${text}}`;
    }
  }

  // Concatenates a key-value pair, with a specified indent
  private jsonKeyValuePair(key: String, value: String, indentString: String) {
    log(`${indentString}${this.jsonKey(key)} ${this.jsonValue(value)},`);
  }

  // Printer for JSON objects
  json(jsonObject: Object, indent?: number, nested?: boolean) {
    // Set up the indent
    let indentString = '';
    indent = indent || 0;
    for (let index = 0; index < indent; index++) {
      indentString += ' ';
    }
    // Print indent with appropriate opening bracket
    log(`${indentString}${Array.isArray(jsonObject) ? '[' : '{'}`);
    // Set up object keys and indent
    const keys = Object.keys(jsonObject);
    indent += this.printOptions.jsonIndentAmount || 4;
    for (let index = 0; index < indent; index++) {
      indentString += ' ';
    }
    // Iterate over keys
    keys.forEach(key => {
      // If the key is a JSON object
      if (typeof jsonObject[key] === 'object') {
        // Wrap Array objects in brackets -- Array "keys" are actually their indices, and having the indices wrapped makes them easy to identify
        const keyString = Array.isArray(jsonObject) ? `[${key}]` : key;
        log(indentString, this.jsonKey(keyString));
        // Repeat the printing process for the object
        this.json(jsonObject[key], indent, true);
      } else {
        // Print the key-value pair
        this.jsonKeyValuePair(key, jsonObject[key], indentString);
      }
    });
    // Reset indent
    indentString = '';
    for (let index = 0; index < indent - (this.printOptions.jsonIndentAmount || 4); index++) {
      indentString += ' ';
    }
    // Print indent with appropriate closing bracket
    log(`${indentString}${Array.isArray(jsonObject) ? ']' : '}'}${nested ? ',' : ''}`);
  }
}
