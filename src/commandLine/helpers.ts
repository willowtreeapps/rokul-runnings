import { opts as Opts } from './types';

export function validateKeyType(keyType: string) {
  if (keyType !== 'up' && keyType !== 'down' && keyType !== 'press') {
    throw new Error(`Incorrect keyType. Valid keyTypes are up, down, and press. Found: ${keyType}`);
  }
}

export function validateOpts(opts: {}, okOpts: string[]) {
  const optsKeys = Object.keys(opts);
  optsKeys.forEach(key => {
    if (!okOpts.includes(key)) {
      throw Error(`Invalid Parameter! Acceptable parameters are ${okOpts}\nPlease use command "rr --help" for help.`);
    }
  });
}

export function parseButtonSequence(sequence: string) {
  const sequenceArray = sequence.split('^');
  const returnSequence = [];
  sequenceArray.forEach(key => {
    if (key.split('.').length === 2) {
      const keySplit = key.split('.');
      validateKeyType(keySplit[0]);
      returnSequence.push({ [keySplit[0]]: keySplit[1] });
    } else {
      returnSequence.push(key);
    }
  });
  return returnSequence;
}

export function parseElement(opts: Opts) {
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

export function parseOpts({ opts, defaultOpt }: { opts?: string; defaultOpt?: string }) {
  const splitOpts = opts.split(',');
  const returnOpts = {};
  if (splitOpts.length > 1 || splitOpts[0].includes('=')) {
    splitOpts.forEach(opt => {
      const key = opt.split('=')[0];
      const value = opt.split('=', 2)[1];
      returnOpts[key] = value;
    });
  } else if (defaultOpt) {
    returnOpts[defaultOpt] = opts;
  }
  return returnOpts;
}
