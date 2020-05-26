#!/usr/bin/env node
/* eslint-disable dot-notation */

import * as pp from './printPretty';
import * as help from './helpers';
import { getArgs } from './args';
import { RokulRunnings as RR } from '../modules/RokulRunnings';
const Configstore = require('configstore');
const log = console.log;

// get configs
const rrConfig = new Configstore('Rokul Runnings', {
  ip: '',
  username: '',
  password: '',
  options: { pressDelay: 1000, retryDelay: 1000, retries: 1 },
});

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

// get parameters for starting the runner
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

function argsFunction({
  optsToParse,
  parseElement = false,
  defaultOpt,
  okOpts,
  sequence,
  screenshot = false,
  rrFunc,
  print,
}: {
  optsToParse: string;
  parseElement?: boolean;
  defaultOpt?: string;
  okOpts: string[];
  sequence?: 'sequence' | 'customSequence';
  screenshot?: boolean;
  rrFunc: Function;
  print?: { type?: 'trueFalse' | 'json' | 'status'; text?: string; false?: string };
}) {
  let opts = parseElement
    ? help.parseElement(help.parseOpts({ opts: optsToParse, defaultOpt }))
    : help.parseOpts({ opts: optsToParse, defaultOpt });
  help.validateOpts(opts, okOpts);
  if (sequence) {
    opts[sequence] = help.parseButtonSequence(opts[sequence]);
  }
  if (screenshot) {
    opts = { ...opts, print: true };
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

if (args.launchChannel) {
  const launchTheChannel = params => {
    return runner.launchTheChannel(params);
  };
  argsFunction({
    optsToParse: args.launchChannel,
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

// Re-usable function for the basic get functions
function getFunction(func) {
  Promise.resolve(
    func.then(response => {
      pp.json(response);
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

// This won't work if the folder where the screenshot should be saved doesn't exist
if (args.getScreenshot) {
  const getScreenshot = params => {
    return runner.getScreenshot(params);
  };
  argsFunction({
    optsToParse: args.getScreenshot,
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

if (args.verifyChannelExist) {
  const verifyIsChannelExist = params => {
    return runner.verifyIsChannelExist(params);
  };
  argsFunction({
    optsToParse: args.verifyChannelExist,
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

if (args.verifyChannelLoaded) {
  const verifyIsChannelLoaded = params => {
    return runner.verifyIsChannelLoaded(params);
  };
  argsFunction({
    optsToParse: args.verifyChannelLoaded,
    defaultOpt: 'id',
    okOpts: ['id, maxAttempts'],
    rrFunc: verifyIsChannelLoaded,
    print: { type: 'trueFalse', text: 'Channel is loaded.', false: 'Channel is not loaded' },
  });
}

if (args.verifyPlaybackStarted) {
  const verifyIsPlaybackStarted = params => {
    return runner.verifyIsPlaybackStarted(params);
  };
  argsFunction({
    optsToParse: args.verifyIsPlaybackStarted,
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
    optsToParse: args.getElementByTag,
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

const okOptsBtnPress = ['keyPress', 'params'];

if (args.pressBtn) {
  const pressBtn = params => {
    return runner.pressBtn(params);
  };
  argsFunction({
    optsToParse: args.pressBtn,
    defaultOpt: 'keyPress',
    okOpts: okOptsBtnPress,
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
    okOpts: okOptsBtnPress,
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
    okOpts: okOptsBtnPress,
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

// Figure out what this should do or if it should be yeeted
if (args.print) {
  log(rrConfig);
  log(runner);
}
