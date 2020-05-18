#!/usr/bin/env node

const RR = require('./src/modules/RokulRunnings').RokulRunnings;
const ArgumentParser = require('argparse').ArgumentParser;
const Configstore = require('configstore');

const rrConfig = new Configstore('Rokul Runnings', {
  ip: '',
  username: '',
  password: '',
  options: { pressDelay: 1000, retryDelay: 1000, retries: 1 },
});

const parser = new ArgumentParser({
  version: '0.0.1',
  addHelp: true,
  description: 'CLI for Rokul Runnings',
});

parser.addArgument(['-ip', '--ip'], { help: 'set the IP Address for the Roku' });
parser.addArgument(['-u', '--username'], { help: 'set the username for the Roku' });
parser.addArgument(['-p', '--password'], { help: 'set the password for the Roku' });
parser.addArgument(['--pressDelay'], { help: 'set the press delay' });
parser.addArgument(['--retryDelay'], { help: 'set the retry delay' });
parser.addArgument(['--retries'], { help: 'set the retries' });
parser.addArgument(['-lc', '--launchChannel'], { help: 'launch the specified channel' });
parser.addArgument(['-dl', '--deepLink'], { help: 'deep link into the specified channel' });

parser.addArgument(['-ga', '--getApps'], {
  action: 'storeTrue',
  help: 'returns currently installed channels; does not accept parameters',
});
parser.addArgument(['-gp', '--getPlayerInfo'], { action: 'storeTrue', help: 'get the player information' });
parser.addArgument(['-gf', '--getFocusedElement'], { action: 'storeTrue', help: 'get focused element' });
parser.addArgument(['--getScreenSource'], { action: 'storeTrue', help: 'get current screen source' });
parser.addArgument(['-gc', '--getCurrentChannelInfo'], {
  action: 'storeTrue',
  help: 'get current channel information',
});
parser.addArgument(['-gd', '--getDeviceInfo'], { action: 'storeTrue', help: 'get device information' });

parser.addArgument(['-gs', '--getScreenshot'], { help: 'gets a screenshot' });

parser.addArgument(['-btn', '--pressBtn'], { help: 'sends a button press to the Roku' });
parser.addArgument(['--pressBtnDown'], { help: 'sends a button down press to the Roku' });
parser.addArgument(['--pressBtnUp'], { help: 'sends a button up press to the Roku' });
parser.addArgument(['-w', '--sendWord'], { help: 'sends a word to the Roku' });

parser.addArgument(['--print'], { action: 'storeTrue', help: 'print for debugging, does not require value' });

const args = parser.parseArgs();
if (args.ip) {
  rrConfig.set('ip', args.ip);
}
if (args.username) {
  rrConfig.set('username', args.username);
}
if (args.password) {
  rrConfig.set('password', args.password);
}
if (args.pressDelay || args.retryDelay || args.retries) {
  const rrConfigOptions = rrConfig.get('options');
  const customOptions = {
    pressDelay: args.pressDelay ? args.pressDelay : rrConfigOptions.pressDelay,
    retryDelay: args.retryDelay ? args.retryDelay : rrConfigOptions.retryDelay,
    retries: args.retries ? args.retries : rrConfigOptions.retries,
  };
  rrConfig.set('options', customOptions);
}

const ip = rrConfig.get('ip');
const username = rrConfig.get('username');
const password = rrConfig.get('password');
const options = rrConfig.get('options');

let runner;
if (!(ip && username && password)) {
  throw Error('IP, Username, or Password is missing. Please set before executing commands.');
} else {
  runner = new RR(ip, username, password, { ...options });
}

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
      throw Error(`Invalid Parameter! Acceptable parameters are ${okOpts}\nPlease use command "rr --help" for help.`);
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

function getFunction(func) {
  Promise.resolve(
    func.then(response => {
      console.log(response);
    }),
  );
}

if (args.getApps) {
  getFunction(runner.getApps());
}

if (args.getFocusedElement) {
  getFunction(runner.getFocusedElement());
}

if (args.getScreenSource) {
  getFunction(runner.getScreenSource());
}

if (args.getCurrentChannelInfo) {
  getFunction(runner.getCurrentChannelInfo());
}

if (args.getDeviceInfo) {
  getFunction(runner.getDeviceInfo());
}

if (args.getPlayerInfo) {
  getFunction(runner.getPlayerInfo());
}

// Figure out why this don't work
if (args.getScreenshot) {
  const opts = parseOpts({ opts: args.getScreenshot, defaultOpt: 'directoryPath' });
  const okOpts = ['directoryPath', 'fileName', 'fileType'];
  validateOpts(opts, okOpts);
  const fullOpts = { ...opts, print: true };
  Promise.resolve(runner.getScreenshot(fullOpts)).then(response => {
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
  console.log('Hey');
}
