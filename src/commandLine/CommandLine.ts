#!/usr/bin/env node
/* eslint-disable dot-notation */

import { PrintPretty } from './printPretty';
import * as help from './helpers';
import { getArgs } from './args';
import { RokulRunnings as RR } from '../modules/RokulRunnings';
import * as fs from 'fs';
import * as path from 'path';
import { printer } from './types';
const Configstore = require('configstore');
const log = console.log;

const configDefaults = {
  ip: '',
  username: 'rokudev',
  password: 'password',
  options: { pressDelay: 1000, retryDelay: 1000, retries: 1 },
  printOptions: {
    true: '',
    false: '',
    jsonKey: '',
    jsonValue: {
      string: '',
      boolean: '',
      number: '',
    },
  },
};

const configPath = path.resolve(process.env.PWD, 'rrconfig.json');
let configPathObj = {};
// get configs
if (fs.existsSync(configPath)) {
  configPathObj = { configPath };
}
const rrConfig = new Configstore('rrconfig', configDefaults, configPathObj);

// get args
const args = getArgs();

// set the parameters for starting the runner from the args passed in
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
  const rokuOptions = {
    pressDelay: args.pressDelay ? args.pressDelay : rrConfigOptions.pressDelay,
    retryDelay: args.retryDelay ? args.retryDelay : rrConfigOptions.retryDelay,
    retries: args.retries ? args.rrretries : rrConfigOptions.retries,
  };
  rrConfig.set('options', rokuOptions);
}
if (args.printOptions) {
  const printConfig = args.printOptions.split(',');
  const printConfigObj = { true: '', false: '', jsonKey: '', jsonValue: {} };
  printConfig.forEach(option => {
    const options = option.split('=');
    if (options[0].includes('jsonValue')) {
      options[0] = options[0].replace('jsonValue', '');
      printConfigObj['jsonValue'][options[0]] = options[1];
    } else {
      printConfigObj[options[0]] = options[1];
    }
  });
  rrConfig.set('printOptions', printConfigObj);
}

// get parameters for starting the runner
const ip = rrConfig.get('ip');
const username = rrConfig.get('username');
const password = rrConfig.get('password');
const options = rrConfig.get('options');
const printOptions: printer = rrConfig.get('printOptions');

let runner;
if (!(ip && username && password) && !args.print) {
  throw Error('IP, Username, or Password is missing. Please set before executing commands.');
} else {
  runner = new RR(ip, username, password, { ...options });
}

const pp = new PrintPretty(printOptions);

function argsFunction({
  optsToParse,
  parseElement = false,
  defaultOpt,
  okOpts,
  sequence,
  screenshot = false,
  rrFunc,
  print,
  stringInsteadOfObject = false,
}: {
  optsToParse: string;
  parseElement?: boolean;
  defaultOpt?: string;
  okOpts?: string[];
  sequence?: 'sequence' | 'customSequence';
  screenshot?: boolean;
  rrFunc: Function;
  print?: { type?: 'trueFalse' | 'json' | 'status'; text?: string; false?: string };
  stringInsteadOfObject?: boolean;
}) {
  let opts =
    optsToParse !== ''
      ? parseElement
        ? help.parseElement(help.parseOpts({ opts: optsToParse, defaultOpt }))
        : help.parseOpts({ opts: optsToParse, defaultOpt })
      : {};
  if (opts && okOpts) {
    help.validateOpts(opts, okOpts);
  }
  if (sequence) {
    opts[sequence] = help.parseButtonSequence(opts[sequence]);
  }
  if (screenshot) {
    // Setting the print flag to true so that the filepath of the screenshot is printed
    opts = { ...opts, print: true };
    // if directoryPath is not set to PWD, then the directory used will be the node modules directory where Rokul Runnings is installed
    opts['directoryPath'] = opts['directoryPath'] || './';
  }
  // if Rokul Runnings function needs a string parameter instead of an object
  // Currently only used for --install and --replace
  const keys = Object.keys(opts);
  if (stringInsteadOfObject && keys.length === 1) {
    opts = opts[keys[0]];
  }

  Promise.resolve(rrFunc(opts)).then(response => {
    if (!print) {
      log(response);
    } else if (print.type === 'trueFalse') {
      response ? pp.trueText(print.text) : pp.falseText(print.false);
    } else if (print.type === 'json') {
      pp.json(response);
    } else if (print.type === 'status') {
      // prints out the trueText if the response a 200 of any type
      response < 300 ? pp.trueText(`Status is ${response}`) : pp.falseText(`${response}`);
    }
  });
}

/** The only time that !args.launchChannel === true is when no value is specified
  `rr --launchChannel`
  Otherwise, every value, with the except of defaultValue, is the value specified.
  If `defaultValue` is received, this is set only when the argument is not passed in but set by argparse's defaultValue option
*/
if (args.launchChannel !== 'defaultValue' || !args.launchChannel) {
  const launchTheChannel = params => {
    return runner.launchTheChannel(params);
  };
  argsFunction({
    optsToParse: args.launchChannel || 'dev',
    defaultOpt: 'channelCode',
    okOpts: ['channelCode', 'contentId', 'mediaType', 'params'],
    rrFunc: launchTheChannel,
    print: { type: 'status' },
  });
}

if (args.deepLink) {
  const deepLinkIntoChannel = params => {
    return runner.deepLinkIntoChannel(params);
  };
  argsFunction({
    optsToParse: args.deepLink,
    defaultOpt: 'channelCode',
    okOpts: ['channelCode', 'contentId', 'mediaType', 'params'],
    rrFunc: deepLinkIntoChannel,
    print: { type: 'status' },
  });
}

if (args.sendInstallChannel) {
  const sendInstallChannel = params => {
    return runner.sendInstallChannel(params);
  };
  argsFunction({
    optsToParse: args.sendInstallChannel,
    defaultOpt: 'channelCode',
    okOpts: ['channelCode', 'params'],
    rrFunc: sendInstallChannel,
    print: { type: 'status' },
  });
}

// Re-usable function for the basic get functions
function simple(func) {
  Promise.resolve(
    func.then(response => {
      pp.json(response);
    }),
  );
}

if (args.getApps) {
  simple(runner.getApps());
}

if (args.getFocusedElement) {
  simple(runner.getFocusedElement());
}

if (args.getScreenSource) {
  simple(runner.getScreenSource());
}

if (args.getCurrentChannelInfo) {
  simple(runner.getCurrentChannelInfo());
}

if (args.getDeviceInfo) {
  simple(runner.getDeviceInfo());
}

if (args.getPlayerInfo) {
  simple(runner.getPlayerInfo());
}

// This won't work if the folder where the screenshot should be saved doesn't exist
if (args.getScreenshot !== 'defaultValue' || !args.getScreenshot) {
  const getScreenshot = params => {
    return runner.getScreenshot(params);
  };
  argsFunction({
    optsToParse: args.getScreenshot || './',
    defaultOpt: 'directoryPath',
    okOpts: ['directoryPath', 'fileName', 'fileType'],
    screenshot: true,
    rrFunc: getScreenshot,
  });
}

const screenLoadedOkOpts = ['data', 'maxAttempts'];

if (args.verifyScreenLoaded) {
  const verifyIsScreenLoaded = params => {
    return runner.verifyIsScreenLoaded(params);
  };
  argsFunction({
    optsToParse: args.verifyScreenLoaded,
    parseElement: true,
    okOpts: screenLoadedOkOpts,
    rrFunc: verifyIsScreenLoaded,
    print: { type: 'trueFalse', text: `Screen has been loaded.`, false: 'Screen has not been loaded.' },
  });
}

if (args.verifyElementOnScreen) {
  const verifyIsElementOnScreen = params => {
    return runner.verifyIsElementOnScreen(params);
  };
  argsFunction({
    optsToParse: args.verifyElementOnScreen,
    parseElement: true,
    okOpts: screenLoadedOkOpts,
    rrFunc: verifyIsElementOnScreen,
    print: { type: 'trueFalse', text: 'Element is on the screen', false: 'Element is not on the screen"' },
  });
}

/** The only time that !args.verifyChannelExist === true is when no value is specified
  `rr --verifyChannelExist`
  Otherwise, every value, with the except of defaultValue, is the value specified.
  If `defaultValue` is received, this is set only when the argument is not passed in but set by argparse's defaultValue option
*/
if (args.verifyChannelExist !== 'defaultValue' || !args.verifyChannelExist) {
  const verifyIsChannelExist = params => {
    return runner.verifyIsChannelExist(params);
  };
  argsFunction({
    optsToParse: args.verifyChannelExist || 'dev',
    defaultOpt: 'id',
    okOpts: ['id'],
    rrFunc: verifyIsChannelExist,
    print: { type: 'trueFalse', text: 'Channel exists.', false: 'Channel does not exist.' },
  });
}

if (args.verifyFocusedElementIsOfCertainTag) {
  const verifyFocusedElementIsOfCertainTag = params => {
    return runner.verifyFocusedElementIsOfCertainTag(params);
  };
  argsFunction({
    optsToParse: args.verifyFocusedElementIsOfCertainTag,
    defaultOpt: 'tag',
    okOpts: ['tag', 'maxAttempts'],
    rrFunc: verifyFocusedElementIsOfCertainTag,
    print: {
      type: 'trueFalse',
      text: 'Focused element is of specified tag type.',
      false: 'Focused element is not of specified tag type.',
    },
  });
}

/** The only time that !args.verifyChannelLoaded === true is when no value is specified
  `rr --verifyChannelLoaded`
  Otherwise, every value, with the except of defaultValue, is the value specified.
  If `defaultValue` is received, this is set only when the argument is not passed in but set by argparse's defaultValue option
*/
if (args.verifyChannelLoaded !== 'defaultValue' || !args.verifyChannelLoaded) {
  const verifyIsChannelLoaded = params => {
    return runner.verifyIsChannelLoaded(params);
  };
  argsFunction({
    optsToParse: args.verifyChannelLoaded || 'dev',
    defaultOpt: 'id',
    okOpts: ['id, maxAttempts'],
    rrFunc: verifyIsChannelLoaded,
    print: { type: 'trueFalse', text: 'Channel is loaded.', false: 'Channel is not loaded' },
  });
}

/** The only time that !args.verifyPlaybackStarted === true is when no value is specified
  `rr --verifyPlaybackStarted`
  Otherwise, every value, with the except of defaultValue, is the value specified.
  If `defaultValue` is received, this is set only when the argument is not passed in but set by argparse's defaultValue option
*/
if (args.verifyPlaybackStarted !== 'defaultValue' || !args.verifyPlaybackStarted) {
  const verifyIsPlaybackStarted = params => {
    return runner.verifyIsPlaybackStarted(params);
  };
  argsFunction({
    optsToParse: args.verifyIsPlaybackStarted || '',
    okOpts: ['maxAttempts'],
    rrFunc: verifyIsPlaybackStarted,
    print: { type: 'trueFalse', text: 'Playback is started.', false: 'Playback is not started.' },
  });
}

if (args.getElement) {
  const getElement = params => {
    return runner.getElement(params);
  };
  argsFunction({
    optsToParse: args.getElement,
    parseElement: true,
    okOpts: ['data'],
    rrFunc: getElement,
    print: { type: 'json' },
  });
}

if (args.getElementByText) {
  const getElementByText = params => {
    return runner.getElementByTag(params);
  };
  argsFunction({
    optsToParse: args.getElementByText,
    parseElement: true,
    defaultOpt: 'value',
    okOpts: ['value'],
    rrFunc: getElementByText,
    print: { type: 'json' },
  });
}

if (args.getElementByAttr) {
  const getElementByAttr = params => {
    return runner.getElementByAttr(params);
  };
  argsFunction({
    optsToParse: args.getElementByAttr,
    parseElement: true,
    okOpts: ['value', 'attribute'],
    rrFunc: getElementByAttr,
    print: { type: 'json' },
  });
}

if (args.getElementByTag) {
  const getElementByTag = params => {
    return runner.getElementByTag(params);
  };
  argsFunction({
    optsToParse: args.getElementByTag,
    parseElement: true,
    defaultOpt: 'value',
    okOpts: ['value'],
    rrFunc: getElementByTag,
    print: { type: 'json' },
  });
}

if (args.getElements) {
  const getElements = params => {
    return runner.getElements(params);
  };
  argsFunction({
    optsToParse: args.getElements,
    parseElement: true,
    okOpts: ['data'],
    rrFunc: getElements,
    print: { type: 'json' },
  });
}

if (args.getElementsByText) {
  const getElementsByText = params => {
    return runner.getElementsByText(params);
  };
  argsFunction({
    optsToParse: args.getElementsByText,
    parseElement: true,
    defaultOpt: 'value',
    okOpts: ['value'],
    rrFunc: getElementsByText,
    print: { type: 'json' },
  });
}

if (args.getElementsByAttr) {
  const getElementsByAttr = params => {
    return runner.getElementsByAttr(params);
  };
  argsFunction({
    optsToParse: args.getElementsByAttr,
    parseElement: true,
    okOpts: ['value', 'attribute'],
    rrFunc: getElementsByAttr,
    print: { type: 'json' },
  });
}

if (args.getElementsByTag) {
  const getElementsByTag = params => {
    return runner.getElementsByTag(params);
  };
  argsFunction({
    optsToParse: args.getElementsByTag,
    parseElement: true,
    defaultOpt: 'value',
    okOpts: ['value'],
    rrFunc: getElementsByTag,
    print: { type: 'json' },
  });
}

if (args.pressBtn) {
  const pressBtn = params => {
    return runner.pressBtn(params);
  };
  argsFunction({
    optsToParse: args.pressBtn,
    defaultOpt: 'keyPress',
    okOpts: ['keyPress', 'params'],
    rrFunc: pressBtn,
    print: { type: 'status' },
  });
}

if (args.pressBtnDown) {
  const pressBtnDown = params => {
    return runner.pressBtnDown(params);
  };
  argsFunction({
    optsToParse: args.pressBtnDown,
    defaultOpt: 'keyDown',
    okOpts: ['keyDown', 'params'],
    rrFunc: pressBtnDown,
    print: { type: 'status' },
  });
}

if (args.pressBtnUp) {
  const pressBtnUp = params => {
    return runner.pressBtnUp(params);
  };
  argsFunction({
    optsToParse: args.pressBtnUp,
    defaultOpt: 'keyUp',
    okOpts: ['keyUp', 'params'],
    rrFunc: pressBtnUp,
    print: { type: 'status' },
  });
}

if (args.sendWord) {
  const sendWord = params => {
    return runner.sendWord(params);
  };
  argsFunction({
    optsToParse: args.sendWord,
    defaultOpt: 'word',
    okOpts: ['word', 'params'],
    rrFunc: sendWord,
    print: { type: 'json' },
  });
}

if (args.sendSequence) {
  const sendSequence = params => {
    return runner.sendButtonSequence(params);
  };
  argsFunction({
    optsToParse: args.sendSequence,
    defaultOpt: 'sequence',
    okOpts: ['sequence', 'params', 'keyType'],
    sequence: 'sequence',
    rrFunc: sendSequence,
    print: { type: 'json' },
  });
}

if (args.sendCustomSequence) {
  const sendCustomSequence = params => {
    return runner.sendMixedButtonSequence(params);
  };
  argsFunction({
    optsToParse: args.sendCustomSequence,
    defaultOpt: 'customSequence',
    okOpts: ['customSequence', 'params'],
    sequence: 'customSequence',
    rrFunc: sendCustomSequence,
    print: { type: 'json' },
  });
}

if (args.install) {
  const installChannel = params => {
    return runner.installChannel(params);
  };
  argsFunction({
    optsToParse: args.install,
    defaultOpt: 'channelLocation',
    okOpts: ['channelLocation'],
    rrFunc: installChannel,
    print: { type: 'status' },
    stringInsteadOfObject: true,
  });
}

if (args.replace) {
  const replaceChannel = params => {
    return runner.replaceChannel(params);
  };
  argsFunction({
    optsToParse: args.replace,
    defaultOpt: 'channelLocation',
    okOpts: ['channelLocation'],
    rrFunc: replaceChannel,
    print: { type: 'status' },
    stringInsteadOfObject: true,
  });
}

if (args.delete) {
  const deleteChannel = () => {
    return runner.deleteChannel();
  };
  argsFunction({
    optsToParse: '',
    rrFunc: deleteChannel,
    print: { type: 'status' },
  });
}

// Prints out config path and RokulRunnings instance
if (args.debug) {
  log(rrConfig);
  log(runner);
}
