import { buttons, Library } from '../modules/library';
import { start, stop } from '../utils/server';
import * as data from '../utils/elementData';
import { Plugin } from '../modules/plugin';
import * as assert from 'assert';
import { sleep } from '../../dist/src/utils/sleep';

let driver: Library;

describe('Other tests', function() {
  // Setting the Mocha timeout to non-existant
  this.timeout(0);
  // Creating plugin driver
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
    await plugin.deleteChannel();
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

  it('Should Verify That An Element With Tag "Poster" and Text "Roku" exists', async function() {
    // launch the channel with the id of "dev"
    await driver.launchTheChannel('dev');

    // wait 2 seconds for the channel to load
    await sleep(2000);

    // create a data element with the tag (XMLName) of Poster
    const poster = data.tag('Poster');

    // return Object of all elements on the screen with a tag of Poster
    const elements = await driver.getElements(poster);

    // create variable for if the correct element is found
    let isCorrectElementFound = false;

    // iterate over each element returned and check if it has an Attribute of "text" that is equal to Roku
    elements.forEach(index => {
      if (index.Attrs.text && index.Attrs.text === 'Roku') isCorrectElementFound = true;
    });

    assert.deepEqual(isCorrectElementFound, true, 'Expected element not found!');
  });

  it("Should Verify That Channel 'dev' Exists", async function() {
    // assert that the channel "dev" exists, based on the list of channels from `getApps()`
    assert.deepEqual(
      await driver.verifyIsChannelExist({ id: 'dev' }),
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

  it('Should Return a Focused Element That Has The Text of ArcInterpolator', async function() {
    // launch the channel with the id of "dev"
    await driver.launchTheChannel('dev');

    // wait for the channel to load
    await sleep(3000);

    // return the focused element
    const focusedElement = await driver.getFocusedElement();

    // create the expected focused element
    const expectedElement = {
      XMLName: 'RenderableNode',
      Attrs: {
        Bounds: '{0, -984, 340, 48}',
        Focusable: 'true',
        Focused: 'true',
        Index: '0',
        Text: 'ArcInterpolator',
      },
    };

    assert.deepEqual(
      focusedElement,
      expectedElement,
      `Expected Values don't match! Expected: ${JSON.stringify(expectedElement)} \n but found: ${JSON.stringify(
        focusedElement,
      )}`,
    );
  });

  it('Should Verify An Element is a RenderableNode', async function() {
    // launch the channel with the id of "dev"
    await driver.launchTheChannel('dev');

    // wait for the channel to load
    await sleep(3000);

    // return a boolean value for if the currently focused element is a `RenderableNode`
    const isRenderableNode = await driver.verifyFocusedElementIsOfCertainTag('RenderableNode');

    assert.deepEqual(isRenderableNode, true, 'Focused element is not a "RenderableNode"!');
  });

  it('Should Return The Channel Information', async function() {
    // launch the channel with the id of "dev"
    await driver.launchTheChannel('dev');

    // wait for the channel to load
    await sleep(3000);

    // get current channel info
    const channelInfo = await driver.getCurrentChannelInfo();

    const expectedChannelInfo = {
      Title: 'Some Channel',
      ID: '12345',
      Type: 'appl',
      Version: '1.0.1',
      Subtype: 'rsga',
    };

    assert.deepEqual(
      channelInfo,
      expectedChannelInfo,
      'Expected Channel Information does not match actual Channel Information!',
    );
  });

  it('Should Only Execute If The Language is Not English', async function() {
    const deviceInfo = await driver.getDeviceInfo();

    if (deviceInfo.language !== 'en') {
      // Do some function
    } else {
      // Do some other function
    }
  });
});
