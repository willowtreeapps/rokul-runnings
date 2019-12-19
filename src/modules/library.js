const WebDriver = require("./webdriver");
const sleep = require("../utils/sleep");

const buttons = {
  up: "up",
  down: "down",
  right: "right",
  left: "left",
  back: "back",
  select: "select",
  replay: "replay",
  play: "play",
  stop: "stop",
  rewind: "rewind",
  fast_forward: "fast forward",
  options: "options",
  home: "home"
};

class Library {
  constructor(rokuIPAddress, timeoutInMillis = 0, pressDelayInMillis = 0) {
    this.driver = new WebDriver.WebDriver(
      rokuIPAddress,
      timeoutInMillis,
      pressDelayInMillis
    );
  }

  /**
   * Closes the session
   */
  async close() {
    await this.driver.quiet();
  }

  /**
   * Launches the channel corresponding to the specified channel ID.
   *
   * @param {String} channelCode The ID of the channel to be launched
   */
  async launchTheChannel(channelCode) {
    return await this.driver.sendLaunchChannel(channelCode);
  }

  /**
   * Returns a list of installed channels as an array of objects
   */
  async getApps() {
    const response = await this.driver.getApps();
    return response.data.value;
  }

  /**
   * Verifies the specified channel is installed on the device.
   *
   * @param {Array} apps An array containing the channels currently installed on the device.
   * @param {String} id The ID of the channel to be verified. Use 'dev' to verify a sideloaded channel.
   */
  verifyIsChannelExist(apps, id) {
    return apps.find(app => app.ID === id) || false;
  }

  /**
   * Verify that the screen is loaded based on the provided element data.
   *
   * @param {Object} data An object with locators for elementData and parentData (parentData is optional).
   * @param {Number} maxRetries The number of requests that can be made before generating an error. This argument is optional, and it defaults to 10 if not specified.
   * @param {Number} delayInMillis The delay between retries. This argument is optional, and it defaults to 1000 millisecond if not specified.
   */
  async verifyIsScreenLoaded(data, maxRetries = 10, delayInMillis = 1000) {
    let retries = 0;
    while (retries < maxRetries) {
      const uiLayoutResponse = await this.driver.getUIElement(data, false);
      if (uiLayoutResponse.status != 200) retries++;
      else return true;
      await sleep.sleep(delayInMillis);
    }
    return false;
  }

  /**
   * Simulates the press and release of the specified key.
   *
   * @param {String} keyPress The key to be pressed and released, which may be one of the options in the "buttons" constant
   * @param {Number} delayInMillis The delay before the keypresses are executed. This argument is optional, and it defaults to 2000 milliseconds if not specified.
   */
  async pressBtn(keyPress, delayInMillis = 2000) {
    await sleep.sleep(delayInMillis);
    return await this.driver.sendKeypress(keyPress);
  }

  /**
   * Simulates the press and release of each letter in a word.
   *
   * @param {String} word The specified word to be entered.
   * @param {Number} delayInMillis The delay before the keypresses are executed. This argument is optional, and it defaults to 2000 milliseconds if not specified.
   */
  async sendWord(word, delayInMillis = 2000) {
    await sleep.sleep(delayInMillis);
    let wordResponse = {};
    for (let charIndex = 0; charIndex < word.length; charIndex++) {
      await sleep.sleep(500);
      wordResponse.charIndex = await this.driver.sendKeypress(
        "LIT_" + word.charAt(charIndex)
      );
    }
    return wordResponse;
  }

  /**
   * Simulates the sequence of keypresses and releases.
   *
   * @param {Array} sequence An array containing the sequence of keys to be pressed and released (for example, down, down, down, down, select).
   * @param {Number} delayInMillis The delay before the keypresses are executed. This argument is optional, and it defaults to 2000 milliseconds if not specified.
   */
  async sendButtonSequence(sequence, delayInMillis = 2000) {
    await sleep.sleep(delayInMillis);
    return await this.driver.sendSequence(sequence);
  }

  /**
   * Searches for an element on the page based on the specified locator starting from the screen root. Returns information on the first matching element.
   *
   * @param {Object} data An object with locators for elementData and parentData (parentData is optional)
   * @param {Number} delayInMillis The delay between retries. This argument is optional, and it defaults to 1000 millisecond if not specified.
   */
  async getElement(data, delayInMillis = 1000) {
    await sleep.sleep(delayInMillis);
    const response = await this.driver.getUIElement(data);
    const [attributes] = await this.getAllAttributes([response.body.value]);
    return attributes;
  }

  /**
   * Searches for elements on the page based on the specified locators starting from the screen root. Returns information on the matching elements.
   *
   * @param {Object} data An object with locators for elementData and parentData (parentData is optional)
   * @param {Number} delayInMillis The delay between retries. This argument is optional, and it defaults to 1000 millisecond if not specified.
   */
  async getElements(data, delayInMillis = 1000) {
    await sleep.sleep(delayInMillis);
    const response = await this.driver.getUIElements(data);
    const attributes = await this.getAllAttributes(response.body.value);
    return attributes;
  }

  /**
   * Return the element on the screen that currently has focus.
   */
  async getFocusedElement() {
    const response = await this.driver.getActiveElement();
    const [element] = await this.getAllAttributes([response.body.value]);
    return element;
  }

  async verifyFocusedElementIsRenderableNode(maxRetries = 10) {
    let retries = 0;
    let element;
    while (element.XMLName !== "RenderableNode" && retries < maxRetries) {
      element = await this.driver.getActiveElement();
      retries++;
    }
    return element.XMLName === "RenderableNode";
  }

  /**
   * Verify that the specified channel has been launched.
   *
   * @param {String} id The ID of the channel to be launched. Use 'dev' to verify a sideloaded channel.
   * @param {Number} maxRetries The number of requests that can be made before generating an error. This argument is optional, and it defaults to 10 if not specified.
   * @param {Number} delayInMillis The delay between retries. This argument is optional, and it defaults to 1000 millisecond if not specified.
   */
  async verifyIsChannelLoaded(id, maxRetries = 10, delayInMillis = 1000) {
    let retries = 0;
    while (retries < maxRetries) {
      const response = await this.driver.getCurrentApp(false);
      if (response.data.value.ID != id) retries++;
      else return true;
      await sleep.sleep(delayInMillis);
    }
    return false;
  }

  /**
   * Returns an object containing information about the channel currently loaded.
   */
  async getCurrentChannelInfo() {
    const response = await this.driver.getCurrentApp();
    return response.data.value;
  }

  /**
   * Returns an object containing the information about the device.
   */
  async getDeviceInfo() {
    const response = await this.driver.getDeviceInfo();
    return response.data.value;
  }

  /**
   * Returns an object containing information about the Roku media player
   */
  async getPlayerInfo() {
    const response = await this.driver.getPlayerInfo();
    let value = response.data.value;
    value.Position = parseInt(value.Position.split(" ")[0]);
    value.Duration = parseInt(value.Duration.split(" ")[0]);
    return value;
  }

  /**
   * Verify playback has started on the Roku media player.
   *
   * @param {Number} maxRetries The number of requests that can be made before generating an error. This argument is optional, and it defaults to 10 if not specified.
   * @param {Number} delayInMillis The delay between retries. This argument is optional, and it defaults to 1000 millisecond if not specified.
   */
  async verifyIsPlaybackStarted(maxRetries = 10, delayInMillis = 1000) {
    let retries = 0;
    while (retries < maxRetries) {
      const response = await this.driver.getPlayerInfo(false);
      if ((response.status !== 200) | (response.data.value.State !== "play"))
        retries++;
      else return true;
      await sleep.sleep(delayInMillis);
    }
    return false;
  }

  /**
   * Sets the timeout for Web driver client requests.
   *
   * @param {Number} timeoutInMillis The amount of time that Web driver client requests are allowed to run.
   */
  async setTimeout(timeoutInMillis) {
    await this.driver.setTimeouts("implicit", timeoutInMillis);
  }

  /**
   * Sets the delay between key presses.
   *
   * @param {Number} timeoutInMillis The interval to be used between key presses.
   */
  async setDelay(delayInMillis) {
    await this.driver.setTimeouts("pressDelay", this.delayInMillis);
  }

  /**
   * Returns all elements in an array, with their attributes in Name.Local:Value pairs, and their child nodes in an array.
   *
   * @param {Array} elements Array of elements to derive attributes.
   */
  async getAllAttributes(elements) {
    let allElements = [];
    for (let i = 0; i < elements.length; i++) {
      let element = elements[i].Attrs;
      let allAttributesForElement = await this.parseAttributes(element);
      if (elements[i].Nodes !== null) {
        allAttributesForElement.Nodes = await this.parseAttributeNodes(
          elements[i].Nodes
        );
      }
      allAttributesForElement.XMLName = elements[i].XMLName.Local;
      allElements[i] = allAttributesForElement;
    }
    return allElements;
  }

  /**
   * Parses the given JSON object and returns it as an object with Name.Local:Value pairs.
   *
   * @param {Object} element JSON Object to be parsed
   */
  async parseAttributes(element) {
    let parsedElement = {};
    for (let i = 0; i < element.length; i++) {
      let key = element[i].Name.Local;
      parsedElement[key] = element[i].Value;
    }
    return parsedElement;
  }

  /**
   * Resursive function to parse all child nodes of the parent element
   *
   * @param {Array} node The array of nodes to be parsed
   */
  async parseAttributeNodes(node) {
    let allAttributesForElement = [];
    for (let i = 0; i < node.length; i++) {
      allAttributesForElement[i] = await this.parseAttributes(node[i].Attrs);
      if (node[i].Nodes !== null) {
        allAttributesForElement[i].Nodes = [];
        for (let j = 0; j < node[i].Nodes.length; j++)
          allAttributesForElement[i].Nodes[j] = await this.parseAttributeNodes(
            node[i].Nodes
          );
      }
    }
    return allAttributesForElement;
  }
}

module.exports = {
  buttons,
  Library
};
