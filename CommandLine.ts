#!/usr/bin/env node
const RR = require('./src/modules/RokulRunnings').RokulRunnings;
const ArgumentParser = require('argparse').ArgumentParser;
// const Configstore = require('configstore');

// const rrConfig = '';

const parser = new ArgumentParser({
  version: '0.0.1',
  addHelp: true,
  description: 'CLI for Rokul Runnings',
});

parser.addArgument(['-si', '--setIP'], { help: 'set the IP Address for the Roku' });
parser.addArgument(['-su', '--setUsername'], { help: 'set the username for the Roku' });
parser.addArgument(['-sp', '--setPassword'], { help: 'set the password for the Roku' });
parser.addArgument(['--setPressDelay'], { help: 'set the press delay' });
parser.addArgument(['--setRetryDelay'], { help: 'set the retry delay' });
parser.addArgument(['--setRetries'], { help: 'set the retries' });
parser.addArgument(['-lc', '--launchChannel'], { help: 'launch the specified channel' });
parser.addArgument(['-dl', '--deepLink'], { help: 'deep link into the specified channel' });

parser.addArgument(['-ga', '--getApps'], {
  action: 'storeTrue',
  help: 'returns currently installed channels; does not accept parameters',
});

parser.addArgument(['-pb', '--pressBtn'], { help: 'sends a button press to the Roku' });
parser.addArgument(['--pressBtnDown'], { help: 'sends a button down press to the Roku' });
parser.addArgument(['--pressBtnUp'], { help: 'sends a button up press to the Roku' });
parser.addArgument(['--sendWord'], { help: 'sends a word to the Roku' });

parser.addArgument(['--print'], { action: 'storeTrue', help: 'print for debugging, does not require value' });

const args = parser.parseArgs();

const rokuIP = args.setIP ? args.setIP : '';
const username = args.setUsername ? args.setUsername : '';
const password = args.setPassword ? args.setPassword : '';
const options = {
  pressDelayInMillis: args.setPressDelay ? args.setPressDelay : 1000,
  retryDelayInMillis: args.setRetryDelay ? args.setRetryDelay : 1000,
  retries: args.setRetries ? args.setRetries : 1,
};

console.log(rokuIP, username, password, options);

const runner = new RR(rokuIP, username, password, { ...options });

function parseOpts({ opts, defaultOpt }: { opts?: string; defaultOpt?: string }) {
  const splitOpts = opts.split(',');
  const returnOpts = {};
  if (splitOpts.length > 1 || splitOpts[0].includes('=')) {
    splitOpts.forEach(opt => {
      const key = opt.split('=')[0];
      const value = opt.split('=')[1];
      returnOpts[key] = value;
    });
  } else {
    returnOpts[defaultOpt] = opts;
  }
  return returnOpts;
}

function validateOpts(opts: {}, okOpts: string[]) {
  const optsKeys = Object.keys(opts);
  optsKeys.forEach(key => {
    if (!okOpts.includes(key)) {
      throw Error(`Invalid Parameter! Acceptable parameters are ${okOpts}`);
    }
  });
}

if (args.launchChannel) {
  const opts = parseOpts({ opts: args.launchChannel, defaultOpt: 'channelCode' });
  const okOpts = ['channelCode', 'contentId', 'mediaType', 'params'];
  validateOpts(opts, okOpts);
  Promise.resolve(console.log(runner.launchTheChannel(opts))).then(response => {
    console.log(response);
  });
}

if (args.deepLink) {
  const opts = parseOpts({ opts: args.deepLink, defaultOpt: 'channelCode' });
  const okOpts = ['channelCode', 'contentId', 'mediaType', 'params'];
  validateOpts(opts, okOpts);
  Promise.resolve(runner.deepLinkIntoChannel(opts)).then(response => {
    console.log(response);
  });
}

if (args.getApps) {
  Promise.resolve(runner.getApps()).then(response => {
    console.log(response);
  });
}

const okOptsBtnPress = ['keyPress', 'params'];

if (args.pressBtn) {
  const opts = parseOpts({ opts: args.pressBtn, defaultOpt: 'keyPress' });
  validateOpts(opts, okOptsBtnPress);
  Promise.resolve(runner.pressBtn(opts)).then(response => {
    console.log(response);
  });
}

if (args.pressBtnDown) {
  const opts = parseOpts({ opts: args.pressBtnDown, defaultOpt: 'keyDown' });
  validateOpts(opts, okOptsBtnPress);
  Promise.resolve(runner.pressBtnDown(opts)).then(response => {
    console.log(response);
  });
}

if (args.pressBtnUp) {
  const opts = parseOpts({ opts: args.pressBtnUp, defaultOpt: 'keyUp' });
  validateOpts(opts, okOptsBtnPress);
  Promise.resolve(runner.pressBtnUp(opts)).then(response => {
    console.log(response);
  });
}

if (args.sendWord) {
  const opts = parseOpts({ opts: args.sendWord, defaultOpt: 'word' });
  validateOpts(opts, okOptsBtnPress);
  Promise.resolve(runner.sendWord(opts)).then(response => {
    console.log(response);
  });
}

function parseSequence(sequence: string) {
  // Probably need a new parser for sequences
}

if (args.sendButtonSequence) {
  // Need to figure this out
}

if (args.print) {
  console.log(runner);
}
