import { buttons, Library } from '../modules/library';
import { start, stop } from '../utils/server';
import * as data from '../utils/elementData';
import { Plugin } from '../modules/plugin';
import * as assert from 'assert';

let driver: Library;

describe('Other tests', function() {
  // Setting the Mocha timeout to non-existant
  this.timeout(0);
  const plugin = new Plugin('0.0.0.0', 'username', 'password');

  before(async function() {
    // ensure the channel is sideloaded
    await plugin.installChannel('./main.zip');
    // before all tests, start the WebDriverServer
    await start();
  });

  beforeEach(async function() {
    // before each test, instantiate the driver
    // The first parameter should be the IP address of the Roku device
    driver = new Library('0.0.0.0', 0, 2000);
  });

  afterEach(async function() {
    // after each test, return to the Roku home screen
    await driver.pressBtn(buttons.home);
    // after each test, end the session
    await driver.close();
  });

  after(async function() {
    // after all tests, stop the WebDriverServer
    await stop();
    // remove the sideloaded channel
    await plugin.deleteChannel('./main.zip');
  });

  it('Should Verify That The Channel Is Loaded', async function() {
    // launch the channel
    await driver.launchTheChannel('dev');
    // verify the currently displayed channel is "dev"
    const response = await driver.verifyIsChannelLoaded({ id: 'dev' });

    // assert that the response value is true
    assert.deepEqual(response, true, 'Channel is not loaded successfully.');
  });

  it('Should Find ResizeList Item 2', async function() {
    // launch the channel with the id of "dev"
    await driver.launchTheChannel('dev');

    // create a data element with the text of ArcInterpolator
    const arcInterpolator = data.text('ArcInterpolator');

    // verify that the screen is loaded, by finding the arcInterpolator element
    await driver.verifyIsScreenLoaded(arcInterpolator);

    // define button sequence
    const buttonSequence = [buttons.up, buttons.up, buttons.up, buttons.right];

    // send the button sequence
    await driver.sendButtonSequence(buttonSequence);

    // define the element data that we want to find
    const elementData = data.text('Item 2');

    // find the appropriate element data
    const response = await driver.getElement(elementData);

    // create the expected values
    const expectedValues = {
      index: '0',
      text: 'Item 2',
      color: '#ddddddff',
    };

    let isAllMatchesFound: boolean = false;

    // iterate over the keys in expectedValues and see if they have a matching key in response.Attrs
    for (let i = 0; i < Object.keys(expectedValues).length; i++) {
      const key = Object.keys(expectedValues).keys()[i];
      if (expectedValues[key] === response.Attrs[key]) isAllMatchesFound = true;
      else {
        isAllMatchesFound = false;
        break;
      }
    }

    // assert that the values match
    assert.deepEqual(
      isAllMatchesFound,
      true,
      `Expected Values don't match! Expected: ${JSON.stringify(expectedValues)} \n but found: ${JSON.stringify(
        response.Attrs,
      )}`,
    );
  });

  it("Should Verify That Channel 'dev' Exists", async function() {
    // assert that the channel "dev" exists, based on the list of channels from `getApps()`
    assert.deepEqual(
      driver.verifyIsChannelExist(await driver.getApps(), 'dev'),
      true,
      'Expected channel is not in the list of currently installed channels.',
    );
  });

  it('Should Search For Roku', async function() {
    // launch the channel with the id of "dev"
    await driver.launchTheChannel('dev');

    // define button sequence
    const buttonSequence = [buttons.home, buttons.up, buttons.up, buttons.up, buttons.select];

    // navigate according to the button sequence
    await driver.sendButtonSequence(buttonSequence);

    // enter the word "Roku" into the search bar
    await driver.sendWord('Roku');
  });
});
