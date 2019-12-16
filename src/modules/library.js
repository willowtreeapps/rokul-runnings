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
    const response = await this.driver.sendLaunchChannel(channelCode);
    console.log(response);
    return response;
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
   * @param {JSON} apps An array containing the channels currently installed on the device.
   * @param {String} id The ID of the channel to be verified. Use 'dev' to verify a sideloaded channel.
   */
  verifyIsChannelExist(apps, id) {
    var isChannelExist = false;
    apps.forEach(app => {
      if (app.ID === id) isChannelExist = true;
    });
    return isChannelExist;
  }

  /**
   * Verify that the screen is loaded based on the provided element data.
   *
   * @param {JSON} data An object with locators for elementData and parentData (parentData is optional).
   * @param {Number} maxRetries The number of requests that can be made before generating an error. This argument is optional, and it defaults to 10 if not specified.
   * @param {Number} delayInMillis The delay between retries. This argument is optional, and it defaults to 1000 millisecond if not specified.
   */
  async verifyIsScreenLoaded(data, maxRetries = 10, delayInMillis = 1000) {
    console.log(data);
    const retries = 0;
    while (retries < maxRetries) {
      const uiLayoutResponse = await this.driver.getUIElement(data, false);
      if (uiLayoutResponse.status != 200) retries++;
      else return true;
      sleep(delayInMillis);
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
    sleep.sleep(delayInMillis);
    const response = await this.driver.sendKeypress(keyPress);
    return response;
  }

  /**
   * Simulates the press and release of each letter in a word.
   *
   * @param {String} word The specified word to be entered.
   * @param {Number} delayInMillis The delay before the keypresses are executed. This argument is optional, and it defaults to 2000 milliseconds if not specified.
   */
  async sendWord(word, delayInMillis = 2000) {
    sleep.sleep(delayInMillis);
    var wordResponse = {};
    for (let charIndex = 0; charIndex < word.length; charIndex++) {
      sleep.sleep(500);
      wordResponse.charIndex = await this.driver.sendKeypress(
        "LIT_" + word.charAt(charIndex)
      );
    }
    return wordResponse;
  }

  /**
   * Simulates the sequence of keypresses and releases.
   *
   * @param {JSON} sequence An array containing the sequence of keys to be pressed and released (for example, down, down, down, down, select).
   * @param {Number} delayInMillis The delay before the keypresses are executed. This argument is optional, and it defaults to 2000 milliseconds if not specified.
   */
  async sendButtonSequence(sequence, delayInMillis = 2000) {
    sleep.sleep(delayInMillis);
    const response = await this.driver.sendSequence(sequence);
    return response;
  }

  /**
   * Searches for an element on the page based on the specified locator starting from the screen root. Returns information on the first matching element.
   *
   * @param {JSON} data An object with locators for elementData and parentData (parentData is optional)
   * @param {Number} delayInMillis The delay between retries. This argument is optional, and it defaults to 1000 millisecond if not specified.
   */
  async getElement(data, delayInMillis = 1000) {
    sleep.sleep(delayInMillis);
    const response = await this.driver.getUIElement(data);
    return response.body.value;
  }

  /**
   * Searches for elements on the page based on the specified locators starting from the screen root. Returns information on the matching elements.
   *
   * @param {JSON} data An object with locators for elementData and parentData (parentData is optional)
   * @param {Number} delayInMillis The delay between retries. This argument is optional, and it defaults to 1000 millisecond if not specified.
   */
  async getElements(data, delayInMillis = 1000) {
    sleep.sleep(delayInMillis);
    const response = await this.driver.getUIElements(data);
    console.log(delayInMillis);
    console.log(response.body.value.length);
    return response.body.value;
  }

  /**
   * Return the element on the screen that currently has focus.
   */
  async getFocusedElement() {
    const response = await this.driver.getActiveElement();
    return response.body.value;
  }

  /**
   * Verify that the specified channel has been launched.
   *
   * @param {String} id The ID of the channel to be launched. Use 'dev' to verify a sideloaded channel.
   * @param {Number} maxRetries The number of requests that can be made before generating an error. This argument is optional, and it defaults to 10 if not specified.
   * @param {Number} delayInMillis The delay between retries. This argument is optional, and it defaults to 1000 millisecond if not specified.
   */
  async verifyIsChannelLoaded(id, maxRetries = 10, delayInMillis = 1000) {
    var retries = 0;
    while (retries < maxRetries) {
      const response = await this.driver.getCurrentApp(false);
      if (response.data.value.ID != id) retries++;
      else return true;
      sleep.sleep(delayInMillis);
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
    const value = response.data.value;
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
    var retries = 0;
    while (retries < maxRetries) {
      const response = await this.driver.getPlayerInfo(false);
      if ((response.status != 200) | (response.data.value.State != "play"))
        retries++;
      else return true;
      sleep(delayInMillis);
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
   * Get attribute value.
   *
   * @param {JSON} element An object that contains element information (attributes, child nodes).
   * @param {String} attribute The name of the attribute to retrieved
   */
  async getAttribute(element, attribute) {
    for (var i = 0; i < element.Attrs.length; i++) {
      if (element.Attrs[i].Name.Local === attribute)
        return element.Attrs[i].Value;
    }
    throw Error("Can't find attribute!");
  }
}

module.exports = {
  buttons,
  Library
};
