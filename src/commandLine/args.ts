const ArgumentParser = require('argparse').ArgumentParser;

export function getArgs() {
  const parser = new ArgumentParser({
    version: '0.0.1',
    addHelp: true,
    description: 'CLI for Rokul Runnings',
  });

  // setup args
  parser.addArgument(['-ip', '--rokuIPAddress'], { help: 'set the IP Address for the Roku' });
  parser.addArgument(['-u', '--username'], { help: 'set the username for the Roku' });
  parser.addArgument(['-p', '--password'], { help: 'set the password for the Roku' });
  parser.addArgument(['--pressDelay, --pressDelayInMillis'], { help: 'set the press delay' });
  parser.addArgument(['--retryDelay, --retryDelayInMillis'], { help: 'set the retry delay' });
  parser.addArgument(['--retries'], { help: 'set the retries' });
  parser.addArgument(['--printOptions'], { help: 'set the print options' });

  // functional args
  parser.addArgument(['-lc', '--launchChannel'], {
    defaultValue: 'defaultValue',
    nargs: '?',
    help: 'launch the specified channel',
  });
  parser.addArgument(['-dl', '--deepLink'], { help: 'deep link into the specified channel' });
  parser.addArgument(['--sendInstallChannel'], { help: 'installs the channel according to the channel code' });
  parser.addArgument(['-btn', '--pressBtn'], { help: 'sends a button press to the Roku' });
  parser.addArgument(['--pressBtnDown'], { help: 'sends a button down press to the Roku' });
  parser.addArgument(['--pressBtnUp'], { help: 'sends a button up press to the Roku' });
  parser.addArgument(['-w', '--sendWord'], { help: 'sends a word to the Roku' });
  parser.addArgument(['--sendSequence'], { help: 'sends a button sequence' });
  parser.addArgument(['--sendCustomSequence'], { help: 'sends a custom sequence' });

  // get info args
  parser.addArgument(['-ga', '--getApps'], {
    action: 'storeTrue',
    help: 'returns currently installed channels; does not accept parameters',
  });
  parser.addArgument(['-gp', '--getPlayerInfo'], { action: 'storeTrue', help: 'get the player information' });
  parser.addArgument(['--getScreenSource'], { action: 'storeTrue', help: 'get current screen source' });
  parser.addArgument(['-gc', '--getCurrentChannelInfo'], {
    action: 'storeTrue',
    help: 'get current channel information',
  });
  parser.addArgument(['-gd', '--getDeviceInfo'], { action: 'storeTrue', help: 'get device information' });

  parser.addArgument(['-gs', '--getScreenshot'], {
    defaultValue: 'defaultValue',
    nargs: '?',
    help: 'gets a screenshot',
  });

  // verify args
  parser.addArgument(['--verifyChannelExist'], {
    defaultValue: 'defaultValue',
    nargs: '?',
    help: 'verifies that a specific channel exists',
  });
  parser.addArgument(['--verifyScreenLoaded'], { help: 'verifies that the screen has been loaded' });
  parser.addArgument(['--verifyElementOnScreen'], { help: 'verifies that the element specified is on the screen' });
  parser.addArgument(['--verifyFocusedElementIsOfCertainTag'], {
    help: 'verifies that the focused element is of a certain tag type',
  });
  parser.addArgument(['--verifyChannelLoaded'], {
    defaultValue: 'defaultValue',
    nargs: '?',
    help: 'verifies that the channel has been loaded',
  });
  parser.addArgument(['--verifyPlaybackStarted'], {
    defaultValue: 'defaultValue',
    nargs: '?',
    help: 'verifies that playback was stated',
  });

  // get element args
  parser.addArgument(['-gf', '--getFocusedElement'], { action: 'storeTrue', help: 'get focused element' });
  parser.addArgument(['--getElement'], { help: 'returns the first element found' });
  parser.addArgument(['--getElementByText'], { help: 'returns the first element found with the text value' });
  parser.addArgument(['--getElementByAttr'], { help: 'returns the first element found with the attribute value' });
  parser.addArgument(['--getElementByTag'], { help: 'returns the first element found with the tag value' });
  // get elements args
  parser.addArgument(['--getElements'], { help: 'returns all elements found' });
  parser.addArgument(['--getElementsByText'], { help: 'returns the first element found with the text value' });
  parser.addArgument(['--getElementsByAttr'], { help: 'returns the first element found with the attribute value' });
  parser.addArgument(['--getElementsByTag'], { help: 'returns the first element found with the tag value' });

  // sideload args
  parser.addArgument(['--install'], { help: 'sideloads a channel' });
  parser.addArgument(['--replace'], { help: 'replaces a sideloaded channel' });
  parser.addArgument(['--delete'], { action: 'storeTrue', help: 'deletes a sideloaded channel' });

  // debug arg
  parser.addArgument(['--debug'], { action: 'storeTrue', help: 'print for debugging, does not require value' });

  const args = parser.parseArgs();

  return args;
}
