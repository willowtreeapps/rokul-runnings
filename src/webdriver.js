const axios = require("axios");

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
    this.sessionId = this.getSessionId();
  }

  buildRequestBody(additionalParams = {}) {
    return {
      ip: this.rokuIPAddress,
      timeout: this.timeoutInMillis,
      pressDelay: this.pressDelayInMillis,
      ...additionalParams
    };
  }

  createURL(command) {
    if (!command) return `${BASE_URL}/session`;
    else return `${BASE_URL}session/${this.sessionId}${command}`;
  }

  getSessionId() {
    const url = this.createURL();
    response = this.basePOST(url);
    return response.sessionId;
  }

  //GET
  baseGET(url) {
    return axios
      .get(url)
      .then(function(response) {
        return response;
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  getDeviceInfo() {
    const url = this.createURL("");
    return this.baseGET(url);
  }

  getPlayerInfo() {
    const url = this.createURL("/player");
    return this.baseGET(url);
  }

  getApps() {
    const url = this.createURL("/apps");
    return this.baseGET(url);
  }

  getCurrentApp() {
    const url = this.createURL("/current_app");
    return this.baseGET(url);
  }

  getScreenSource() {
    const url = this.createURL("/source");
    return this.baseGET(url);
  }

  //POST
  basePOST(url, requestBody) {
    return axios
      .post(url, newRequestBody)
      .then(function(response) {
        return response;
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  sendLaunchChannel(channelCode) {
    const requestBody = this.buildRequestBody({ channelId: channelCode });
    const url = this.createURL("/launch");
    return this.basePOST(url, requestBody);
  }

  sendInstallChannel(channelCode) {
    const requestBody = this.buildRequestBody({ channelId: channelCode });
    const url = this.createURL("/install");
    return this.basePOST(url, requestBody);
  }

  sendSequence(sequence) {
    const requestBody = this.buildRequestBody({ button_sequence: sequence });
    const url = this.createURL("/press");
    return this.basePOST(url, requestBody);
  }

  getUIElement(data) {
    const url = this.createURL("/element");
    return this.basePOST(url, data);
  }

  setTimeouts(timeoutType, delayInMillis) {
    const requestBody = this.buildRequestBody({
      type: timeoutType,
      ms: delayInMillis
    });
    const url = this.createURL("/timeouts");
    return this.basePOST(url, requestBody);
  }

  getUIElements(data) {
    const url = this.createURL("/elements");
    return this.basePOST(url, data);
  }

  sendKeypress(keyPress) {
    const requestBody = this.buildRequestBody({ button: keyPress });
    const url = this.createURL("/press");
    return this.basePOST(url, newRequestBody);
  }

  getActiveElement() {
    const body = {};
    const url = this.createURL("/element/active");
    return this.basePOST(url, body);
  }

  //DELETE
  baseDELETE(url) {
    return axios
      .delete(url)
      .then(function(response) {
        return response;
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  quiet() {
    const url = this.createURL("");
    return this.baseDELETE(url);
  }
}
