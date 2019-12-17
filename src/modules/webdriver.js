const http = require("../utils/http");

const BASE_URL = "http://localhost:9000/v1";

class WebDriver {
  constructor(
    rokuIPAddress,
    timeoutInMillis = 20000,
    pressDelayInMillis = 2000
  ) {
    this.rokuIPAddress = rokuIPAddress;
    this.timeoutInMillis = timeoutInMillis;
    this.pressDelayInMillis = pressDelayInMillis;
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
  async buildURL(command) {
    if (!command) return `${BASE_URL}/session`;
    else {
      if (!this.sessionId) {
        this.sessionId = await this.createNewSession();
      }
    }
    return `${BASE_URL}/session/${this.sessionId}${command}`;
  }

  /**
   * Creates a new session, returning the sessionId to create the 'base' URL for the session
   * If a session already exists for a specified IP address, that sessionId is used
   *
   * @param {Boolean} check Determines if the response is checked, default to true
   */
  async createNewSession(check = true) {
    const url = await this.buildURL();
    const sessionsURL = `${url}s`;
    const sessionsResponse = await this.getAllSessions();
    if (sessionsResponse.data !== null) {
      for (let i = 0; i < sessionsResponse.data.length; i++) {
        if (sessionsResponse.data[i].value.ip === this.rokuIPAddress) {
          return sessionsResponse.data[i].sessionId;
        }
      }
    } else {
      const requestBody = this.buildRequestBody();
      const response = await http.basePOST(url, requestBody);
      if (check) this.checkResponse(response);
      return response.body.sessionId;
    }
  }

  //GET

  async getAllSessions(check = true) {
    let url = await this.buildURL();
    url = `${url}s`;
    const response = await http.baseGET(url);
    if (check) this.checkResponse(response);
    return response;
  }

  /**
   * Retrieves information about the specified session.
   *
   * @param {Boolean} check Determines if the response is checked, default to true
   */
  async getDeviceInfo(check = true) {
    const url = await this.buildURL(" ");
    const response = await http.baseGET(url);
    if (check) this.checkResponse(response);
    return response;
  }

  /**
   * Retrieves information about the Roku media player.
   *
   * @param {Boolean} check Determines if the response is checked, default to true
   */
  async getPlayerInfo(check = true) {
    const url = await this.buildURL("/player");
    const response = await http.baseGET(url);
    if (check) this.checkResponse(response);
    return response;
  }

  /**
   * Returns a list of channels installed on the device.
   *
   * @param {Boolean} check Determines if the response is checked, default to true
   */
  async getApps(check = true) {
    const url = await this.buildURL("/apps");
    const response = await http.baseGET(url);
    if (check) this.checkResponse(response);
    return response;
  }

  /**
   * Returns information about the channel currently loaded on the device.
   *
   * @param {Boolean} check Determines if the response is checked, default to true
   */
  async getCurrentApp(check = true) {
    const url = await this.buildURL("/current_app");
    const response = await http.baseGET(url);
    if (check) this.checkResponse(response);
    return response;
  }

  /**
   * Gets the current screen source.
   *
   * @param {Boolean} check Determines if the response is checked, default to true
   */
  async getScreenSource(check = true) {
    const url = await this.buildURL("/source");
    const response = await http.baseGET(url);
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
  async sendLaunchChannel(channelCode, check = true) {
    const requestBody = this.buildRequestBody({ channelId: channelCode });
    const url = await this.buildURL("/launch");
    const response = await http.basePOST(url, requestBody);
    if (check) this.checkResponse(response);
    return response;
  }

  /**
   * Installs the specified channel
   *
   * @param {String} channelCode The ID of the channel to be installed
   * @param {Boolean} check Determines if the response is checked, default to true
   */
  async sendInstallChannel(channelCode, check = true) {
    const requestBody = this.buildRequestBody({ channelId: channelCode });
    const url = await this.buildURL("/install");
    const response = await http.basePOST(url, requestBody);
    if (check) this.checkResponse(response);
    return response;
  }

  /**
   * Sends a sequence of keys to be input by the device
   *
   * @param {*} sequence An array containing the sequence of keys to be pressed and released
   * @param {Boolean} check Determines if the response is checked, default to true
   */
  async sendSequence(sequence, check = true) {
    const requestBody = this.buildRequestBody({ button_sequence: sequence });
    const url = await this.buildURL("/press");
    const response = await http.basePOST(url, requestBody);
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
  async getUIElement(data, check = true) {
    const requestBody = this.buildRequestBody({ elementData: data });
    const url = await this.buildURL("/element");
    const response = await http.basePOST(url, requestBody);
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
  async setTimeouts(timeoutType, delayInMillis, check = true) {
    const requestBody = this.buildRequestBody({
      type: timeoutType,
      ms: delayInMillis
    });
    const url = await this.buildURL("/timeouts");
    const response = await http.basePOST(url, requestBody);
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
  async getUIElements(data, check = true) {
    const requestBody = this.buildRequestBody({ elementData: data });
    const url = await this.buildURL("/elements");
    const response = await http.basePOST(url, requestBody);
    if (check) this.checkResponse(response);
    return response;
  }

  /**
   * Simulates the press and release of the specified key.
   *
   * @param {String} keyPress The name of the key to be pressed ("home", "up", "down", "left", "right").
   * @param {Boolean} check Determines if the response is checked, default to true
   */
  async sendKeypress(keyPress, check = true) {
    const requestBody = this.buildRequestBody({ button: keyPress });
    const url = await this.buildURL("/press");
    const response = await http.basePOST(url, requestBody);
    if (check) this.checkResponse(response);
    return response;
  }

  /**
   * Retrieves the element on the page that currently has focus.
   *
   * @param {Boolean} check Determines if the response is checked, default to true
   */
  async getActiveElement(check = true) {
    const body = {};
    const url = await this.buildURL("/element/active");
    const response = await http.basePOST(url, body);
    if (check) this.checkResponse(response);
    return response;
  }

  //DELETE

  /**
   * Deletes the session specified in the URL path.
   */
  async quiet() {
    const url = await this.buildURL(" ");
    const response = await http.baseDELETE(url);
    return response;
  }

  //RESPONSE CHECK
  /**
   * Checks a response's status to determine if the request was successful
   *
   * @param {JSON} response Response to be checked, provided by a request
   */
  checkResponse(response) {
    if (response.status === 400) throw Error(response.body.text);
    else if (response.status !== 200) throw Error(response.body.value.message);
    else return true;
  }
}

module.exports = {
  WebDriver,
  BASE_URL
};
