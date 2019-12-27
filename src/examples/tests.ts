import { buttons, Library } from "../modules/library";
import assert = require("assert");
import { start, stop } from "../utils/server";
import * as data from "../utils/elementData";
import * as plugin from "../modules/plugin";

let driver: Library;

describe("Other tests", function() {
  //Setting the Mocha timeout to non-existant
  this.timeout(0);

  before(async function() {
    //ensure the channel is sideloaded
    await plugin.installChannel({
      rokuIP: "0.0.0.0",
      channelLocation: "./main.zip",
      username: "rokudev"
    });
    //before all tests, start the WebDriverServer
    await start();
  });

  beforeEach(async function() {
    //before each test, instantiate the driver
    //The first parameter should be the IP address of the Roku device
    driver = new Library("0.0.0.0", 0, 2000);
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
    //remove the sideloaded channel
    await plugin.deleteChannel({
      rokuIP: "0.0.0.0",
      channelLocation: "./main.zip",
      username: "rokudev"
    });
  });

  it("Should Verify That The Channel Is Loaded", async function() {
    //verify the currently displayed channel is "dev"
    const response = await driver.verifyIsChannelLoaded("dev");

    //assert that the response value is true
    assert.deepEqual(response, true, "Channel is not loaded successfully.");
  });

  it("Should Find ResizeList Item 2", async function() {
    //launch the channel with the id of "dev"
    await driver.launchTheChannel("dev");

    //create a data element with the text of ArcInterpolator
    const arcInterpolator = data.text("ArcInterpolator");

    //verify that the screen is loaded, by finding the arcInterpolator element
    await driver.verifyIsScreenLoaded(arcInterpolator);

    //define button sequence
    const buttonSequence = [buttons.up, buttons.up, buttons.up, buttons.right];

    //send the button sequence
    await driver.sendButtonSequence(buttonSequence);

    //define the element data that we want to find
    const elementData = data.text("Item 2");

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
      driver.verifyIsChannelExist(await driver.getApps(), "dev"),
      true,
      "Expected channel is not in the list of currently installed channels."
    );
  });

  it("Should Search For Roku", async function() {
    //launch the channel with the id of "dev"
    await driver.launchTheChannel("dev");

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

    //enter the word "Roku" into the search bar
    await driver.sendWord("Roku");
  });
});
