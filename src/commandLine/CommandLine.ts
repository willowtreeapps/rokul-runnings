#!/usr/bin/env node
/* eslint-disable dot-notation */

import { PrintPretty } from './printPretty';
import * as help from './helpers';
import { getArgs } from './args';
import { RokulRunnings as RR } from '../modules/RokulRunnings';
import * as fs from 'fs';
import * as path from 'path';
import { printer, rokuOptions } from './types';
import Configstore = require('configstore');
const log = console.log;

// Defaults for Configstore setup
const optionsDefaults: rokuOptions = { pressDelayInMillis: 1000, retryDelayInMillis: 1000, retries: 1 };
const printOptionsDefault: printer = {
  trueStyle: '',
  falseStyle: '',
  jsonKeyStyle: '',
  jsonValueStyle: {
    stringStyle: '',
    booleanStyle: '',
    numberStyle: '',
  },
};
const configDefaults = {
  rokuIPAddress: '',
  username: 'rokudev',
  password: 'password',
  options: optionsDefaults,
  printOptions: printOptionsDefault,
};

// get configs
const configPath = path.resolve(process.env.PWD, 'rrconfig.json');
let configPathObj = {};
if (fs.existsSync(configPath)) {
  configPathObj = { configPath };
}
const rrConfig = new Configstore('rrconfig', configDefaults, configPathObj);

// get args
const args = getArgs();

// Update config values based on arguments passed in
if (args.rokuIPAddress) {
  rrConfig.set('rokuIPAddress', args.rokuIPAddress);
}
if (args.username) {
  rrConfig.set('username', args.username);
}
if (args.password) {
  rrConfig.set('password', args.password);
}
if (args.pressDelayInMillis || args.retryDelayInMillis || args.retries) {
  const rrConfigOptions = rrConfig.get('options');
  const rokuOptions = {
    pressDelayInMillis: args.pressDelayInMillis ? args.pressDelayInMillis : rrConfigOptions.pressDelayInMillis,
    retryDelayInMillis: args.retryDelayInMillis ? args.retryDelayInMillis : rrConfigOptions.retryDelayInMillis,
    retries: args.retries ? args.retries : rrConfigOptions.retries,
  };
  rrConfig.set('options', rokuOptions);
}
if (args.printOptions) {
  const printConfig = args.printOptions.split(',');
  const printConfigObj: printer = {};
  printConfig.forEach(option => {
    const options = option.split('=');
    if (options[0] === 'stringStyle' || options[0] === 'booleanStyle' || options[0] === 'numberStyle') {
      printConfigObj['jsonValueStyle'][options[0]] = options[1];
    } else {
      printConfigObj[options[0]] = options[1];
    }
  });
  rrConfig.set('printOptions', printConfigObj);
}

// get parameters for starting the runner
const rokuIPAddress = rrConfig.get('rokuIPAddress');
const username = rrConfig.get('username');
const password = rrConfig.get('password');
const options = rrConfig.get('options');
const printOptions: printer = rrConfig.get('printOptions');

// Start runner
let runner;
if (!(rokuIPAddress && username && password) && !args.print) {
  throw Error('IP, Username, or Password is missing. Please set before executing commands.');
} else {
  runner = new RR(rokuIPAddress, username, password, {
    retryDelayInMillis: options.retryDelayInMillis,
    pressDelayInMillis: options.pressDelayInMillis,
    retries: options.retries,
  });
}

// Start PrintPretty
const pp = new PrintPretty(printOptions);

/** The only time that !args.launchChannel === true is when no value is specified
  `rr --launchChannel`
  Otherwise, every value, with the except of defaultValue, is the value specified.
  If `defaultValue` is received, this is set only when the argument is not passed in but set by argparse's defaultValue option
*/
if (args.launchChannel !== 'defaultValue' || !args.launchChannel) {
  const launchTheChannel = params => {
    return runner.launchTheChannel(params);
  };
  help.baseFunction({
    valuesToParse: args.launchChannel || 'dev',
    defaultOpt: 'channelCode',
    okOpts: ['channelCode', 'contentId', 'mediaType', 'params'],
    rrFunc: launchTheChannel,
    print: { type: 'status' },
    pp,
  });
}

if (args.deepLink) {
  const deepLinkIntoChannel = params => {
    return runner.deepLinkIntoChannel(params);
  };
  help.baseFunction({
    valuesToParse: args.deepLink,
    defaultOpt: 'channelCode',
    okOpts: ['channelCode', 'contentId', 'mediaType', 'params'],
    rrFunc: deepLinkIntoChannel,
    print: { type: 'status' },
    pp,
  });
}

if (args.sendInstallChannel) {
  const sendInstallChannel = params => {
    return runner.sendInstallChannel(params);
  };
  help.baseFunction({
    valuesToParse: args.sendInstallChannel,
    defaultOpt: 'channelCode',
    okOpts: ['channelCode', 'params'],
    rrFunc: sendInstallChannel,
    print: { type: 'status' },
    pp,
  });
}

if (args.getApps) {
  const getApps = () => {
    return runner.getApps();
  };
  help.storeTrue(getApps, pp);
}

if (args.getFocusedElement) {
  const getFocusedElement = () => {
    return runner.getFocusedElement();
  };
  help.storeTrue(getFocusedElement, pp);
}

if (args.getScreenSource) {
  const getScreenSource = () => {
    return runner.getScreenSource();
  };
  help.storeTrue(getScreenSource, pp);
}

if (args.getCurrentChannelInfo) {
  const getCurrentChannelInfo = () => {
    return runner.getCurrentChannelInfo();
  };
  help.storeTrue(getCurrentChannelInfo, pp);
}

if (args.getDeviceInfo) {
  const getDeviceInfo = () => {
    return runner.getDeviceInfo();
  };
  help.storeTrue(getDeviceInfo, pp);
}

if (args.getPlayerInfo) {
  const getPlayerInfo = () => {
    return runner.getPlayerInfo();
  };
  help.storeTrue(getPlayerInfo, pp);
}

// This won't work if the folder where the screenshot should be saved doesn't exist
if (args.getScreenshot !== 'defaultValue' || !args.getScreenshot) {
  const getScreenshot = params => {
    return runner.getScreenshot(params);
  };
  help.baseFunction({
    valuesToParse: args.getScreenshot || './',
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
  help.baseFunction({
    valuesToParse: args.verifyScreenLoaded,
    parseElementDataObject: true,
    okOpts: screenLoadedOkOpts,
    rrFunc: verifyIsScreenLoaded,
    print: { type: 'trueFalse', text: `Screen has been loaded.`, false: 'Screen has not been loaded.' },
    pp,
  });
}

if (args.verifyElementOnScreen) {
  const verifyIsElementOnScreen = params => {
    return runner.verifyIsElementOnScreen(params);
  };
  help.baseFunction({
    valuesToParse: args.verifyElementOnScreen,
    parseElementDataObject: true,
    okOpts: screenLoadedOkOpts,
    rrFunc: verifyIsElementOnScreen,
    print: { type: 'trueFalse', text: 'Element is on the screen', false: 'Element is not on the screen"' },
    pp,
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
  help.baseFunction({
    valuesToParse: args.verifyChannelExist || 'dev',
    defaultOpt: 'id',
    okOpts: ['id'],
    rrFunc: verifyIsChannelExist,
    print: { type: 'trueFalse', text: 'Channel exists.', false: 'Channel does not exist.' },
    pp,
  });
}

if (args.verifyFocusedElementIsOfCertainTag) {
  const verifyFocusedElementIsOfCertainTag = params => {
    return runner.verifyFocusedElementIsOfCertainTag(params);
  };
  help.baseFunction({
    valuesToParse: args.verifyFocusedElementIsOfCertainTag,
    defaultOpt: 'tag',
    okOpts: ['tag', 'maxAttempts'],
    rrFunc: verifyFocusedElementIsOfCertainTag,
    print: {
      type: 'trueFalse',
      text: 'Focused element is of specified tag type.',
      false: 'Focused element is not of specified tag type.',
    },
    pp,
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
  help.baseFunction({
    valuesToParse: args.verifyChannelLoaded || 'dev',
    defaultOpt: 'id',
    okOpts: ['id, maxAttempts'],
    rrFunc: verifyIsChannelLoaded,
    print: { type: 'trueFalse', text: 'Channel is loaded.', false: 'Channel is not loaded' },
    pp,
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
  help.baseFunction({
    valuesToParse: args.verifyIsPlaybackStarted || '',
    okOpts: ['maxAttempts'],
    rrFunc: verifyIsPlaybackStarted,
    print: { type: 'trueFalse', text: 'Playback is started.', false: 'Playback is not started.' },
    pp,
  });
}

if (args.getElement) {
  const getElement = params => {
    return runner.getElement(params);
  };
  help.baseFunction({
    valuesToParse: args.getElement,
    parseElementDataObject: true,
    okOpts: ['data'],
    rrFunc: getElement,
    print: { type: 'json' },
    pp,
  });
}

if (args.getElementByText) {
  const getElementByText = params => {
    return runner.getElementByTag(params);
  };
  help.baseFunction({
    valuesToParse: args.getElementByText,
    parseElementDataObject: true,
    defaultOpt: 'value',
    okOpts: ['value'],
    rrFunc: getElementByText,
    print: { type: 'json' },
    pp,
  });
}

if (args.getElementByAttr) {
  const getElementByAttr = params => {
    return runner.getElementByAttr(params);
  };
  help.baseFunction({
    valuesToParse: args.getElementByAttr,
    parseElementDataObject: true,
    okOpts: ['value', 'attribute'],
    rrFunc: getElementByAttr,
    print: { type: 'json' },
    pp,
  });
}

if (args.getElementByTag) {
  const getElementByTag = params => {
    return runner.getElementByTag(params);
  };
  help.baseFunction({
    valuesToParse: args.getElementByTag,
    parseElementDataObject: true,
    defaultOpt: 'value',
    okOpts: ['value'],
    rrFunc: getElementByTag,
    print: { type: 'json' },
    pp,
  });
}

if (args.getElements) {
  const getElements = params => {
    return runner.getElements(params);
  };
  help.baseFunction({
    valuesToParse: args.getElements,
    parseElementDataObject: true,
    okOpts: ['data'],
    rrFunc: getElements,
    print: { type: 'json' },
    pp,
  });
}

if (args.getElementsByText) {
  const getElementsByText = params => {
    return runner.getElementsByText(params);
  };
  help.baseFunction({
    valuesToParse: args.getElementsByText,
    parseElementDataObject: true,
    defaultOpt: 'value',
    okOpts: ['value'],
    rrFunc: getElementsByText,
    print: { type: 'json' },
    pp,
  });
}

if (args.getElementsByAttr) {
  const getElementsByAttr = params => {
    return runner.getElementsByAttr(params);
  };
  help.baseFunction({
    valuesToParse: args.getElementsByAttr,
    parseElementDataObject: true,
    okOpts: ['value', 'attribute'],
    rrFunc: getElementsByAttr,
    print: { type: 'json' },
    pp,
  });
}

if (args.getElementsByTag) {
  const getElementsByTag = params => {
    return runner.getElementsByTag(params);
  };
  help.baseFunction({
    valuesToParse: args.getElementsByTag,
    parseElementDataObject: true,
    defaultOpt: 'value',
    okOpts: ['value'],
    rrFunc: getElementsByTag,
    print: { type: 'json' },
    pp,
  });
}

if (args.pressBtn) {
  const pressBtn = params => {
    return runner.pressBtn(params);
  };
  help.baseFunction({
    valuesToParse: args.pressBtn,
    defaultOpt: 'keyPress',
    okOpts: ['keyPress', 'params'],
    rrFunc: pressBtn,
    print: { type: 'status' },
    pp,
  });
}

if (args.pressBtnDown) {
  const pressBtnDown = params => {
    return runner.pressBtnDown(params);
  };
  help.baseFunction({
    valuesToParse: args.pressBtnDown,
    defaultOpt: 'keyDown',
    okOpts: ['keyDown', 'params'],
    rrFunc: pressBtnDown,
    print: { type: 'status' },
    pp,
  });
}

if (args.pressBtnUp) {
  const pressBtnUp = params => {
    return runner.pressBtnUp(params);
  };
  help.baseFunction({
    valuesToParse: args.pressBtnUp,
    defaultOpt: 'keyUp',
    okOpts: ['keyUp', 'params'],
    rrFunc: pressBtnUp,
    print: { type: 'status' },
    pp,
  });
}

if (args.sendWord) {
  const sendWord = params => {
    return runner.sendWord(params);
  };
  help.baseFunction({
    valuesToParse: args.sendWord,
    defaultOpt: 'word',
    okOpts: ['word', 'params'],
    rrFunc: sendWord,
    print: { type: 'json' },
    pp,
  });
}

if (args.sendSequence) {
  const sendSequence = params => {
    return runner.sendButtonSequence(params);
  };
  help.baseFunction({
    valuesToParse: args.sendSequence,
    defaultOpt: 'sequence',
    okOpts: ['sequence', 'params', 'keyType'],
    sequence: 'sequence',
    rrFunc: sendSequence,
    print: { type: 'json' },
    pp,
  });
}

if (args.sendCustomSequence) {
  const sendCustomSequence = params => {
    return runner.sendMixedButtonSequence(params);
  };
  help.baseFunction({
    valuesToParse: args.sendCustomSequence,
    defaultOpt: 'customSequence',
    okOpts: ['customSequence', 'params'],
    sequence: 'customSequence',
    rrFunc: sendCustomSequence,
    print: { type: 'json' },
    pp,
  });
}

if (args.install) {
  const installChannel = params => {
    return runner.installChannel(params);
  };
  help.baseFunction({
    valuesToParse: args.install,
    defaultOpt: 'channelLocation',
    okOpts: ['channelLocation'],
    rrFunc: installChannel,
    print: { type: 'status' },
    pp,
    stringInsteadOfObject: true,
  });
}

if (args.replace) {
  const replaceChannel = params => {
    return runner.replaceChannel(params);
  };
  help.baseFunction({
    valuesToParse: args.replace,
    defaultOpt: 'channelLocation',
    okOpts: ['channelLocation'],
    rrFunc: replaceChannel,
    print: { type: 'status' },
    pp,
    stringInsteadOfObject: true,
  });
}

if (args.delete) {
  const deleteChannel = () => {
    return runner.deleteChannel();
  };
  help.baseFunction({
    valuesToParse: '',
    rrFunc: deleteChannel,
    print: { type: 'status' },
    pp,
  });
}

// Prints out config path and RokulRunnings instance
if (args.debug) {
  log(rrConfig);
  log(runner);
}
