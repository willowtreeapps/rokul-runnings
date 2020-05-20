#!/usr/bin/env node
/* eslint-disable dot-notation */

import * as pp from './printPretty';
import * as help from './helpers';
import { getArgs } from './args';
const log = console.log;
const RR = require('../modules/RokulRunnings').RokulRunnings;
const Configstore = require('configstore');

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
    retries: args.retries ? args.retries : rrConfigOptions.retries,
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

if (args.launchChannel) {
  const opts = help.parseOpts({ opts: args.launchChannel, defaultOpt: 'channelCode' });
  const okOpts = ['channelCode', 'contentId', 'mediaType', 'params'];
  help.validateOpts(opts, okOpts);
  Promise.resolve(log(runner.launchTheChannel(opts))).then(response => {
    log(response);
  });
}

if (args.deepLink) {
  const opts = help.parseOpts({ opts: args.deepLink, defaultOpt: 'channelCode' });
  const okOpts = ['channelCode', 'contentId', 'mediaType', 'params'];
  help.validateOpts(opts, okOpts);
  Promise.resolve(runner.deepLinkIntoChannel(opts)).then(response => {
    log(response);
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
  const opts = help.parseOpts({ opts: args.getScreenshot, defaultOpt: 'directoryPath' });
  const okOpts = ['directoryPath', 'fileName', 'fileType'];
  help.validateOpts(opts, okOpts);
  const fullOpts = { ...opts, print: true };
  Promise.resolve(runner.getScreenshot(fullOpts)).then(response => {
    log(response);
  });
}

const screenLoadedOkOpts = ['data', 'maxAttempts'];

if (args.verifyScreenLoaded) {
  const opts = help.parseElement(help.parseOpts({ opts: args.verifyScreenLoaded }));
  help.validateOpts(opts, screenLoadedOkOpts);
  Promise.resolve(runner.verifyIsScreenLoaded(opts)).then(response => {
    response ? pp.trueText('Screen has been loaded.') : pp.falseText('Screen has not been loaded.');
  });
}

if (args.verifyElementOnScreen) {
  const opts = help.parseElement(help.parseOpts({ opts: args.verifyElementOnScreen }));
  help.validateOpts(opts, screenLoadedOkOpts);
  Promise.resolve(runner.verifyIsElementOnScreen(opts)).then(response => {
    response ? pp.trueText('Element is on the screen.') : pp.falseText('Element is not on the screen.');
  });
}

if (args.verifyChannelExist) {
  const opts = help.parseOpts({ opts: args.verifyChannelExist, defaultOpt: 'id' });
  const okOpts = ['id'];
  help.validateOpts(opts, okOpts);
  Promise.resolve(runner.verifyIsChannelExist(opts)).then(response => {
    const id = opts['id'];
    response ? pp.trueText(`${id} exists.`) : pp.falseText(`${id} does not exist.`);
  });
}

if (args.verifyFocusedElementIsOfCertainTag) {
  const opts = help.parseOpts({ opts: args.verifyFocusedElementIsOfCertainTag, defaultOpt: 'tag' });
  help.validateOpts(opts, ['tag', 'maxAttempts']);
  Promise.resolve(runner.verifyFocusedElementIsOfCertainTag(opts)).then(response => {
    response
      ? pp.trueText(`Focused element is of tag type: ${opts['tag']}`)
      : pp.falseText(`Focused element is not of tag type: ${opts['tag']}`);
  });
}

if (args.verifyChannelLoaded) {
  const opts = help.parseOpts({ opts: args.verifyChannelLoaded, defaultOpt: 'id' });
  help.validateOpts(opts, ['id', 'maxAttempts']);
  Promise.resolve(runner.verifyIsChannelLoaded(opts)).then(response => {
    response ? pp.trueText(`Channel is loaded.`) : pp.falseText(`Channel is not loaded.`);
  });
}

if (args.verifyPlaybackStarted) {
  const opts = help.parseOpts({ opts: args.verifyPlaybackStarted });
  help.validateOpts(opts, ['maxAttempts']);
  Promise.resolve(runner.verifyIsPlaybackStarted(opts)).then(response => {
    response ? pp.trueText(`Playback is started.`) : pp.falseText(`Playback is not started.`);
  });
}

if (args.getElement) {
  const opts = help.parseElement(help.parseOpts({ opts: args.getElement }));
  help.validateOpts(opts, ['data']);
  Promise.resolve(runner.getElement(opts)).then(response => {
    pp.json(response);
  });
}

if (args.getElementByText) {
  const opts = help.parseElement(help.parseOpts({ opts: args.getElementByText, defaultOpt: 'value' }));
  help.validateOpts(opts, ['value']);
  Promise.resolve(runner.getElementByText(opts)).then(response => {
    pp.json(response);
  });
}

if (args.getElementByAttr) {
  const opts = help.parseElement(help.parseOpts({ opts: args.getElementByAttr }));
  help.validateOpts(opts, ['value', 'attribute']);
  Promise.resolve(runner.getElementByAttr(opts)).then(response => {
    pp.json(response);
  });
}

if (args.getElementByTag) {
  const opts = help.parseElement(help.parseOpts({ opts: args.getElementByTag, defaultOpt: 'value' }));
  help.validateOpts(opts, ['value']);
  Promise.resolve(runner.getElementByTag(opts)).then(response => {
    pp.json(response);
  });
}

if (args.getElements) {
  const opts = help.parseElement(help.parseOpts({ opts: args.getElements }));
  help.validateOpts(opts, ['data']);
  Promise.resolve(runner.getElements(opts)).then(response => {
    pp.json(response);
  });
}

if (args.getElementsByText) {
  const opts = help.parseElement(help.parseOpts({ opts: args.getElementsByText, defaultOpt: 'value' }));
  help.validateOpts(opts, ['value']);
  Promise.resolve(runner.getElementsByText(opts)).then(response => {
    pp.json(response);
  });
}

if (args.getElementsByAttr) {
  const opts = help.parseElement(help.parseOpts({ opts: args.getElementsByAttr }));
  help.validateOpts(opts, ['value', 'attribute']);
  Promise.resolve(runner.getElementsByAttr(opts)).then(response => {
    pp.json(response);
  });
}

if (args.getElementsByTag) {
  const opts = help.parseElement(help.parseOpts({ opts: args.getElementsByTag, defaultOpt: 'value' }));
  help.validateOpts(opts, ['value']);
  Promise.resolve(runner.getElementsByTag(opts)).then(response => {
    pp.json(response);
  });
}

const okOptsBtnPress = ['keyPress', 'params'];

if (args.pressBtn) {
  const opts = help.parseOpts({ opts: args.pressBtn, defaultOpt: 'keyPress' });
  help.validateOpts(opts, okOptsBtnPress);
  Promise.resolve(runner.pressBtn(opts)).then(response => {
    response === 200 ? pp.trueText('Status is 200') : pp.falseText(`${response}`);
  });
}

if (args.pressBtnDown) {
  const opts = help.parseOpts({ opts: args.pressBtnDown, defaultOpt: 'keyDown' });
  help.validateOpts(opts, okOptsBtnPress);
  Promise.resolve(runner.pressBtnDown(opts)).then(response => {
    response === 200 ? pp.trueText('Status is 200') : pp.falseText(`${response}`);
  });
}

if (args.pressBtnUp) {
  const opts = help.parseOpts({ opts: args.pressBtnUp, defaultOpt: 'keyUp' });
  help.validateOpts(opts, okOptsBtnPress);
  Promise.resolve(runner.pressBtnUp(opts)).then(response => {
    response === 200 ? pp.trueText('Status is 200') : pp.falseText(`${response}`);
  });
}

if (args.sendWord) {
  const opts = help.parseOpts({ opts: args.sendWord, defaultOpt: 'word' });
  help.validateOpts(opts, ['word', 'params']);
  Promise.resolve(runner.sendWord(opts)).then(response => {
    pp.json(response);
  });
}

if (args.sendSequence) {
  const opts = help.parseOpts({ opts: args.sendSequence, defaultOpt: 'sequence' });
  const okOpts = ['sequence', 'params', 'keyType'];
  help.validateOpts(opts, okOpts);
  opts['sequence'] = help.parseButtonSequence(opts['sequence']);
  Promise.resolve(runner.sendButtonSequence(opts)).then(response => {
    pp.json(response);
  });
}

if (args.sendCustomSequence) {
  const opts = help.parseOpts({ opts: args.sendCustomSequence, defaultOpt: 'customSequence' });
  const okOpts = ['customSequence', 'params'];
  opts['customSequence'] = help.parseButtonSequence(opts['customSequence']);
  help.validateOpts(opts, okOpts);
  Promise.resolve(runner.sendMixedButtonSequence(opts)).then(response => {
    pp.json(response);
  });
}

// Figure out what this should do or if it should be yeeted
if (args.print) {
  log(rrConfig);
  log(runner);
}
