const WebDriver = require("./webdriver");
const sleep = require("../utils");

class Library {
  constructor(
    rokuIPAddress,
    timeoutInMillis = 0,
    pressDelayInMillis = 0,
    path = ""
  ) {
    this.path = path;
    this.driver = new WebDriver(
      rokuIPAddress,
      timeoutInMillis,
      pressDelayInMillis
    );
  }

  /**
   * Closes the session
   */
  close() {
    this.driver.quiet();
  }

  /**
   * Launches the channel corresponding to the specified channel ID.
   *
   * @param {String} channelCode The ID of the channel to be launched
   */
  launchTheChannel(channelCode) {
    const response = this.driver.sendLaunchChannel(channelCode);
    print(response);
    return response;
  }

  /**
   * Returns a list of installed channels as an array of objects
   */
  getApps() {
    const response = this.driver.getApps();
    return response.text.value;
  }

  /**
   * Verifies the specified channel is installed on the device.
   *
   * @param {JSON} apps An array containing the channels currently installed on the device.
   * @param {String} id The ID of the channel to be verified. Use 'dev' to verify a sideloaded channel.
   */
  verifyIsChannelExist(apps, id) {
    apps.array.forEach(app => {
      if (app.id === id) return true;
    });
    return false;
  }

  /**
   * Verify that the screen is loaded based on the provided element data.
   *
   * @param {JSON} data An object with locators for elementData and parentData (parentData is optional).
   * @param {Number} maxRetries The number of requests that can be made before generating an error. This argument is optional, and it defaults to 10 if not specified.
   * @param {Number} delayInMillis The delay between retries. This argument is optional, and it defaults to 1000 millisecond if not specified.
   */
  verifyIsScreenLoaded(data, maxRetries = 10, delayInMillis = 1000) {
    print(data);
    retries = 0;
    while (retries < maxRetries) {
      const uiLayoutresponse = this.driver.getUIElement(data, false);
      if (uiLayoutResponse.status != 200) retries++;
      else return true;
      sleep(delayInMillis);
    }
    return false;
  }

  /**
   * Simulates the press and release of the specified key.
   *
   * @param {String} keyPress The key to be pressed and released, which may be one of the following:
   *                          "up", "down", "right", "left", "back, "select", "replay",
   *                          "play", "stop", "rewind", "fast forward", and "options"
   * @param {Number} delayInMillis The delay before the keypresses are executed. This argument is optional, and it defaults to 2000 milliseconds if not specified.
   */
  pressBtn(keyPress, delayInMillis = 2000) {
    sleep(delayInMillis);
    this.driver.sendKeypress(keyPress);
  }

  /**
   * Simulates the press and release of each letter in a word.
   *
   * @param {String} word The specified word to be entered.
   * @param {Number} delayInMillis The delay before the keypresses are executed. This argument is optional, and it defaults to 2000 milliseconds if not specified.
   */
  sendWord(word, delayInMillis = 2000) {
    sleep(delayInMillis);
    for (var charIndex = 0; charIndex < word.length; charIndex++) {
      sleep(500);
      const response = this.driver.sendKeypress(
        "LIT_" + word.charAt(charIndex)
      );
    }
  }

  /**
   * Simulates the sequence of keypresses and releases.
   *
   * @param {JSON} sequence An array containing the sequence of keys to be pressed and released (for example, down, down, down, down, select).
   * @param {Number} delayInMillis The delay before the keypresses are executed. This argument is optional, and it defaults to 2000 milliseconds if not specified.
   */
  sendButtonSequence(sequence, delayInMillis = 2000) {
    sleep(delayInMillis);
    this.driver.sendSequence(sequence);
  }

  /**
   * Searches for an element on the page based on the specified locator starting from the screen root. Returns information on the first matching element.
   *
   * @param {JSON} data An object with locators for elementData and parentData (parentData is optional)
   * @param {Number} delayInMillis The delay between retries. This argument is optional, and it defaults to 1000 millisecond if not specified.
   */
  getElement(data, delayInMillis = 1000) {
    sleep(delayInMillis);
    const response = this.driver.getUIElement(data);
    return response.text.value;
  }

  /**
   * Searches for elements on the page based on the specified locators starting from the screen root. Returns information on the matching elements.
   *
   * @param {JSON} data An object with locators for elementData and parentData (parentData is optional)
   * @param {Number} delayInMillis The delay between retries. This argument is optional, and it defaults to 1000 millisecond if not specified.
   */
  getElements(data, delayInMillis = 1000) {
    sleep(delayInMillis);
    const response = this.driver.getUIElements(data);
    print(delayInMillis);
    print(response.text.value.length);
    return response.text.value;
  }

  /**
   * Return the element on the screen that currently has focus.
   */
  getFocusedElement() {
    const response = this.driver.getActiveElement();
    return response.text.value;
  }

  /**
   * Verify that the specified channel has been launched.
   *
   * @param {String} id The ID of the channel to be launched. Use 'dev' to verify a sideloaded channel.
   * @param {Number} maxRetries The number of requests that can be made before generating an error. This argument is optional, and it defaults to 10 if not specified.
   * @param {Number} delayInMillis The delay between retries. This argument is optional, and it defaults to 1000 millisecond if not specified.
   */
  verifyIsChannelLoaded(id, maxRetries = 10, delayInMillis = 1000) {
    var retries = 0;
    while (retries < maxRetries) {
      const response = this.driver.getCurrentApp(false);
      if (response.text.value.id != id) retries++;
      else return true;
      sleep(delayInMillis);
    }
    return false;
  }

  /**
   * Returns an object containing information about the channel currently loaded.
   */
  getCurrentChannelInfo() {
    const response = this.driver.getCurrentApp();
    return response.text.value;
  }

  /**
   * Returns an object containing the information about the device.
   */
  getDeviceInfo() {
    const response = this.driver.getDeviceInfo();
    return response.text.value;
  }

  /**
   * Returns an object containing information about the Roku media player
   */
  getPlayerInfo() {
    const response = this.driver.getPlayerInfo();
    value = response.text.value;
    value.position = parseInt(value.position.split(" ")[0]);
    value.duration = parseInt(value.duration.split(" ")[0]);
    return value;
  }

  /**
   * Verify playback has started on the Roku media player.
   *
   * @param {Number} maxRetries The number of requests that can be made before generating an error. This argument is optional, and it defaults to 10 if not specified.
   * @param {Number} delayInMillis The delay between retries. This argument is optional, and it defaults to 1000 millisecond if not specified.
   */
  verifyIsPlaybackStarted(maxRetries = 10, delayInMillis = 1000) {
    var retries = 0;
    while (retries < maxRetries) {
      const response = this.driver.getPlayerInfo(false);
      if ((response.status != 200) | (response.text.value.state != "play"))
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
  setTimeout(timeoutInMillis) {
    this.driver.setTimeouts("implicit", timeoutInMillis);
  }

  /**
   * Sets the delay between key presses.
   *
   * @param {Number} timeoutInMillis The interval to be used between key presses.
   */
  setDelay(delayInMillis) {
    this.driver.setTimeouts("pressDelay", this.delayInMillis);
  }

  /**
   * Get attribute value.
   *
   * @param {JSON} element An object that contains element information (attributes, child nodes).
   * @param {String} attribute The name of the attribute to retrieved
   */
  getAttribute(element, attribute) {
    for (var i = 0; i < element.attrs.length; i++) {
      if (element.attrs[i].name.local === attribute)
        return element.attrs[i].value;
    }
    throw Error("Can't find attribute!");
  }
}
