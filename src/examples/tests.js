const { buttons, Library } = require("../modules/library");
const assert = require("assert");
const { start, stop } = require("../utils/server");
const data = require("../utils/data");

let driver;

describe("Other tests", function() {
  //Setting the Mocha timeout to non-existant
  this.timeout(0);

  before(async function() {
    //before all tests, start the WebDriverServer
    await start();
  });

  beforeEach(async function() {
    //before each test, instantiate the driver
    driver = new Library("192.168.128.145", 0, 2000);
  });

  afterEach(async function() {
    //after each test, return to the Roku home screen
    await driver.pressBtn(buttons.home);
    //after each test, end the session
    await driver.close();
  });

  after(async function() {
    //after all tests, stop the WebDriverServer
    await stop();
  });

  it("Should Verify That The Channel Is Loaded", async function() {
    //launch the channel with the id of "dev"
    await driver.launchTheChannel("dev");

    //verify the currently displayed channel is "dev"
    const response = await driver.verifyIsChannelLoaded("dev");

    //assert that the response value is true
    assert.deepEqual(response, true, "Channel is not loaded successfully.");
  });

  it("Should Find ResizeList Item 2", async function() {
    //launch the channel with the id of "dev"
    await driver.launchTheChannel("dev");

    //create a data element with the text of ArcInterpolator
    const arcInterpolator = await data.elementDataText("ArcInterpolator");

    //verify that the screen is loaded, by finding the arcInterpolator element
    await driver.verifyIsScreenLoaded(arcInterpolator);

    //define button sequence
    const buttonSequence = [buttons.up, buttons.up, buttons.up, buttons.right];

    //send the button sequence
    await driver.sendButtonSequence(buttonSequence);

    //define the element data that we want to find
    const elementData = await data.elementDataText("Item 2");

    //find the appropriate element data
    const response = await driver.getElement(elementData);

    //format the values from `response` that we want to compare
    const values = {
      index: response.index,
      text: response.text,
      color: response.color
    };

    //create the expected values
    const expectedValues = {
      index: "0",
      text: "Item 2",
      color: "#ddddddff"
    };

    //assert that the values match
    assert.deepEqual(values, expectedValues, "Expected Values don't match!");
  });

  it("Should Verify That Channel 'dev' Exists", async function() {
    //assert that the channel "dev" exists, based on the list of channels from `getApps()`
    assert.deepEqual(
      await driver.verifyIsChannelExist(await driver.getApps(), "dev"),
      true,
      "Expected channel is not in the list of currently installed channels."
    );
  });

  it("Should Search For Netflix", async function() {
    //define button sequence
    const buttonSequence = [
      buttons.home,
      buttons.up,
      buttons.up,
      buttons.up,
      buttons.select
    ];

    //navigate according to the button sequence
    await driver.sendButtonSequence(buttonSequence);

    //enter the word "Netflix" into the search bar
    await driver.sendWord("Netflix");
  });
});
