const axios = require("axios");
const http = require("../utils");

const BASE_URL = "http://localhost:9000/v1/";

export class WebDriver {
  constructor(
    rokuIPAddress,
    timeoutInMillis = 20000,
    pressDelayInMillis = 2000
  ) {
    this.rokuIPAddress = rokuIPAddress;
    this.timeoutInMillis = timeoutInMillis;
    this.pressDelayInMillis = pressDelayInMillis;
    this.sessionId = this.createNewSession();
  }

  /**
   * Creates a standard request body to be used in requests
   *
   * @param {JSON} additionalParams Additional json objects to be included in the request body
   */
  buildRequestBody(additionalParams = {}) {
    return {
      ip: this.rokuIPAddress,
      timeout: this.timeoutInMillis,
      pressDelay: this.pressDelayInMillis,
      ...additionalParams
    };
  }

  /**
   * Creates the URL to which the request will be sent
   *
   * @param {String} command The endpoint to be reached, nullable
   */
  buildURL(command) {
    if (!command) return `${BASE_URL}/session`;
    else return `${BASE_URL}session/${this.sessionId}${command}`;
  }

  /**
   * Creates a new session, returning the sessionId to create the 'base' URL for the session
   *
   * @param {Boolean} check Determines if the response is checked, default to true
   */
  createNewSession(check = true) {
    const url = this.buildURL();
    response = this.basePOST(url);
    if (check) this.checkResponse(response);
    return response.sessionId;
  }

  //GET

  /**
   * Retrieves information about the specified session.
   *
   * @param {Boolean} check Determines if the response is checked, default to true
   */
  getDeviceInfo(check = true) {
    const url = this.buildURL("");
    const response = this.baseGET(url);
    if (check) this.checkResponse(response);
    return response;
  }

  /**
   * Retrieves information about the Roku media player.
   *
   * @param {Boolean} check Determines if the response is checked, default to true
   */
  getPlayerInfo(check = true) {
    const url = this.buildURL("/player");
    const response = this.baseGET(url);
    if (check) this.checkResponse(response);
    return response;
  }

  /**
   * Returns a list of channels installed on the device.
   *
   * @param {Boolean} check Determines if the response is checked, default to true
   */
  getApps(check = true) {
    const url = this.buildURL("/apps");
    const response = this.baseGET(url);
    if (check) this.checkResponse(response);
    return response;
  }

  /**
   * Returns information about the channel currently loaded on the device.
   *
   * @param {Boolean} check Determines if the response is checked, default to true
   */
  getCurrentApp(check = true) {
    const url = this.buildURL("/current_app");
    const response = this.baseGET(url);
    if (check) this.checkResponse(response);
    return response;
  }

  /**
   * Gets the current screen source.
   *
   * @param {Boolean} check Determines if the response is checked, default to true
   */
  getScreenSource(check = true) {
    const url = this.buildURL("/source");
    const response = this.baseGET(url);
    if (check) this.checkResponse(response);
    return response;
  }

  //POST

  /**
   * Launches the specified channel. Most likely this will be 'dev'.
   *
   * @param {String} channelCode The ID of the channel to be launched
   * @param {Boolean} check Determines if the response is checked, default to true
   */
  sendLaunchChannel(channelCode, check = true) {
    const requestBody = this.buildRequestBody({ channelId: channelCode });
    const url = this.buildURL("/launch");
    const response = this.basePOST(url, requestBody);
    if (check) this.checkResponse(response);
    return response;
  }

  /**
   * Installs the specified channel
   *
   * @param {String} channelCode The ID of the channel to be installed
   * @param {Boolean} check Determines if the response is checked, default to true
   */
  sendInstallChannel(channelCode, check = true) {
    const requestBody = this.buildRequestBody({ channelId: channelCode });
    const url = this.buildURL("/install");
    const response = this.basePOST(url, requestBody);
    if (check) this.checkResponse(response);
    return response;
  }

  /**
   * Sends a sequence of keys to be input by the device
   *
   * @param {*} sequence An array containing the sequence of keys to be pressed and released
   * @param {Boolean} check Determines if the response is checked, default to true
   */
  sendSequence(sequence, check = true) {
    const requestBody = this.buildRequestBody({ button_sequence: sequence });
    const url = this.buildURL("/press");
    const response = this.basePOST(url, requestBody);
    if (check) this.checkResponse(response);
    return response;
  }

  /**
   * Searches for an element on the page, starting from the screen root. The first located element will be returned as a WebElement JSON object.
   *
   * @param {JSON} data An elementData array and optional parentData array with the following objects that can be used to locate an element:
   *                  using - {string}: The locator strategy to use. This may be one of the following values:
   *                  text: Returns an element whose text matches the search value.
   *                  attr: Returns an element whose specified attributes matches the search value.
   *                  tag: Returns an element whose tag name matches the search value.
   *                  attribute - {string}: The attribute name (used only for "attr" strategy)
   *                  value - {string}: The search target.
   * @param {Boolean} check Determines if the response is checked, default to true
   */
  getUIElement(data, check = true) {
    const url = this.buildURL("/element");
    response = this.basePOST(url, data);
    if (check) this.checkResponse(response);
    return response;
  }

  /**
   * Configure the amount of time that an operation can be executed before it is aborted.
   *
   * @param {String} timeoutType Either "implicit" (ECP commands) or "pressDelay" (delay between press cmd execution)
   * @param {Number} delayInMillis The amount of time that time-limited commands are permitted to run.
   * @param {Boolean} check Determines if the response is checked, default to true
   */
  setTimeouts(timeoutType, delayInMillis, check = true) {
    const requestBody = this.buildRequestBody({
      type: timeoutType,
      ms: delayInMillis
    });
    const url = this.buildURL("/timeouts");
    const response = this.basePOST(url, requestBody);
    if (check) this.checkResponse(response);
    return response;
  }

  /**
   * Searches for elements on the page matching the search criteria, starting from the screen root. All the matching elements will be returned in a WebElement JSON object.
   *
   * @param {JSON} data An elementData array and optional parentData array with the following objects that can be used to locate an element:
   *                  using - {string}: The locator strategy to use. This may be one of the following values:
   *                  text: Returns an element whose text matches the search value.
   *                  attr: Returns an element whose specified attributes matches the search value.
   *                  tag: Returns an element whose tag name matches the search value.
   *                  attribute - {string}: The attribute name (used only for "attr" strategy)
   *                  value - {string}: The search target.
   * @param {Boolean} check Determines if the response is checked, default to true
   */
  getUIElements(data, check = true) {
    const url = this.buildURL("/elements");
    const response = this.basePOST(url, data);
    if (check) this.checkResponse(response);
    return response;
  }

  /**
   * Simulates the press and release of the specified key.
   *
   * @param {String} keyPress The name of the key to be pressed ("home", "up", "down", "left", "right").
   * @param {Boolean} check Determines if the response is checked, default to true
   */
  sendKeypress(keyPress, check = true) {
    const requestBody = this.buildRequestBody({ button: keyPress });
    const url = this.buildURL("/press");
    const response = this.basePOST(url, requestBody);
    if (check) this.checkResponse(response);
    return response;
  }

  /**
   * Retrieves the element on the page that currently has focus.
   *
   * @param {Boolean} check Determines if the response is checked, default to true
   */
  getActiveElement(check = true) {
    const body = {};
    const url = this.buildURL("/element/active");
    const response = this.basePOST(url, body);
    if (check) this.checkResponse(response);
    return response;
  }

  //DELETE

  /**
   * Deletes the session specified in the URL path.
   */
  quiet() {
    const url = this.buildURL("");
    const response = this.baseDELETE(url);
    return response;
  }

  //RESPONSE CHECK
  /**
   * Checks a response's status to determine if the request was successful
   *
   * @param {JSON} response Response to be checked, provided by a request
   */
  checkResponse(response) {
    if (response.status === 400) throw Error(response.text);
    else if (response.status != 200) throw Error(response.value.message);
    else return true;
  }
}
