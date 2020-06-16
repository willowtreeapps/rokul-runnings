import { opts as Opts } from './types';
import { PrintPretty } from './printPretty';

// Base function for arguments that pass in parameters
export async function baseFunction({
  valuesToParse,
  parseElementDataObject = false,
  defaultOpt,
  okOpts,
  sequence,
  screenshot = false,
  rrFunc,
  print,
  pp,
  stringInsteadOfObject = false,
}: {
  valuesToParse: string;
  parseElementDataObject?: boolean;
  defaultOpt?: string;
  okOpts?: string[];
  sequence?: 'sequence' | 'customSequence';
  screenshot?: boolean;
  rrFunc: Function;
  print?: { type?: 'trueFalse' | 'json' | 'status'; text?: string; false?: string };
  pp?: PrintPretty;
  stringInsteadOfObject?: boolean;
}) {
  // Pass in parameter value from command line
  let opts =
    valuesToParse !== '' // as long as there are values to parse
      ? parseElementDataObject // if there are ElementDataObjects to parse
        ? parseElementDataObjectFunc(parseValues({ opts: valuesToParse, defaultOpt }))
        : parseValues({ opts: valuesToParse, defaultOpt })
      : {};
  if (opts && okOpts) {
    // only validate the opts if there are opts and a definite list of valid opts
    validateOpts(opts, okOpts);
  }
  if (sequence) {
    // if a sequence is passed in, there is special parsing to be done
    opts[sequence] = parseButtonSequence(opts[sequence]);
  }
  if (screenshot) {
    // Setting the print flag to true so that the filepath of the screenshot is printed
    opts = { ...opts, print: true };
    // if directoryPath is not set to PWD, then the directory used will be the node modules directory where Rokul Runnings is installed
    // eslint-disable-next-line dot-notation
    opts['directoryPath'] = opts['directoryPath'] || './';
  }
  // if Rokul Runnings function needs a string parameter instead of an object
  // Currently only used for --install and --replace
  const keys = Object.keys(opts);
  if (stringInsteadOfObject && keys.length === 1) {
    opts = opts[keys[0]];
  }

  const response = await rrFunc(opts);
  // Use the print parameter to determine how the response is printed
  if (!print) {
    console.log(response);
  } else if (print.type === 'trueFalse') {
    response ? pp.trueText(print.text) : pp.falseText(print.false);
  } else if (print.type === 'json') {
    pp.json(response);
  } else if (print.type === 'status') {
    // prints out the trueText if the response a 200 of any type
    response < 300 ? pp.trueText(`Status is ${response}`) : pp.falseText(`${response}`);
  }

  return response;
}

// Re-usable function for the basic get functions, all of which have their `action` as `'storeTrue'`
export async function storeTrue(func: Function, pp: PrintPretty) {
  return func()
    .then(response => {
      pp.json(response);
      return response;
    })
    .catch(err => {
      console.error('ERROR = ', err);
    });
}

// Validates that the keyType passed in is correct
export function validateKeyType(keyType: string) {
  if (keyType !== 'up' && keyType !== 'down' && keyType !== 'press') {
    throw new Error(`Incorrect keyType. Valid keyTypes are up, down, and press. Found: ${keyType}`);
  }
}

// Validates that only the valid opts are present
export function validateOpts(opts: {}, okOpts: string[]) {
  const optsKeys = Object.keys(opts);
  optsKeys.forEach(key => {
    if (!okOpts.includes(key)) {
      throw Error(`Invalid Parameter! Acceptable parameters are ${okOpts}\nPlease use command "rr --help" for help.`);
    }
  });
}

/**
 * Parses the button sequences for either sendSequence or sendCustomSequence
 * Sequences are expected to be sent in this format:
 * sequence=home^select^right^down
 * sequence=down.home^press.select^up.right^press.down
 * The first sequence is a traditional sequence, where all presses are the same type
 * The second sequence is a custom sequence, where each press has a separate type
 * */
export function parseButtonSequence(sequence: string) {
  const sequenceArray = sequence.split('^');
  const returnSequence = [];
  sequenceArray.forEach(key => {
    // If a custom sequence is passed in, this will be true
    if (key.split('.').length === 2) {
      const keySplit = key.split('.');
      validateKeyType(keySplit[0]);
      // custom sequences are expect to be formatted as `{ keyType: keyToPress }`
      returnSequence.push({ [keySplit[0]]: keySplit[1] });
    } else {
      returnSequence.push(key);
    }
  });
  return returnSequence;
}

// Parses a string value and returns an ElementDataObject for querying app-ui
export function parseElementDataObjectFunc(opts: Opts) {
  if (!opts.value || !opts.using || (opts.using === 'attr' && !opts.attribute)) {
    throw new Error(
      'Data is formatted incorrectly or missing.\nIt should be formatted as "using=text|tag,value=valueValue" or\n"using=attr,attribute=attributeValue,value=valueValue"',
    );
  } else {
    if (opts.using === 'attr') {
      opts.data = {
        using: opts.using,
        value: opts.value,
        attribute: opts.attribute,
      };
      delete opts.attribute;
    } else {
      opts.data = {
        using: opts.using,
        value: opts.value,
      };
    }
    delete opts.using;
    delete opts.value;
  }
  return opts;
}

// Parses the string values and returns a JSON object
// Values are expected to be sent as one of the following:
// `value` (in which case the value is assumed to be matched to the defaultOpt key)
// `key=value`
// `key1=value1,key2=value2`
export function parseValues({ opts, defaultOpt }: { opts?: string; defaultOpt?: string }) {
  const splitValues = opts.split(',');
  const returnOpts = {};
  if (splitValues.length > 1 || splitValues[0].includes('=')) {
    // If the string contains a key-value pair as key=value
    splitValues.forEach(opt => {
      const key = opt.split('=')[0];
      const value = opt.split('=', 2)[1];
      returnOpts[key] = value;
    });
  } else if (defaultOpt) {
    // If there is no key provided, then the value is assumed to be the default value
    returnOpts[defaultOpt] = opts;
  }
  return returnOpts;
}
