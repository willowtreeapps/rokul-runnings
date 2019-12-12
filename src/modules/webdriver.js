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

  getSessionId(check = true) {
    const url = this.createURL();
    response = this.basePOST(url);
    if (check) this.checkResponse(response);
    return response.sessionId;
  }

  //GET
  getDeviceInfo(check = true) {
    const url = this.createURL("");
    const response = this.baseGET(url);
    if (check) this.checkResponse(response);
    return response;
  }

  getPlayerInfo(check = true) {
    const url = this.createURL("/player");
    const response = this.baseGET(url);
    if (check) this.checkResponse(response);
    return response;
  }

  getApps(check = true) {
    const url = this.createURL("/apps");
    const response = this.baseGET(url);
    if (check) this.checkResponse(response);
    return response;
  }

  getCurrentApp(check = true) {
    const url = this.createURL("/current_app");
    const response = this.baseGET(url);
    if (check) this.checkResponse(response);
    return response;
  }

  getScreenSource(check = true) {
    const url = this.createURL("/source");
    const response = this.baseGET(url);
    if (check) this.checkResponse(response);
    return response;
  }

  //POST
  sendLaunchChannel(channelCode, check = true) {
    const requestBody = this.buildRequestBody({ channelId: channelCode });
    const url = this.createURL("/launch");
    const response = this.basePOST(url, requestBody);
    if (check) this.checkResponse(response);
    return response;
  }

  sendInstallChannel(channelCode, check = true) {
    const requestBody = this.buildRequestBody({ channelId: channelCode });
    const url = this.createURL("/install");
    const response = this.basePOST(url, requestBody);
    if (check) this.checkResponse(response);
    return response;
  }

  sendSequence(sequence, check = true) {
    const requestBody = this.buildRequestBody({ button_sequence: sequence });
    const url = this.createURL("/press");
    const response = this.basePOST(url, requestBody);
    if (check) this.checkResponse(response);
    return response;
  }

  getUIElement(data, check = true) {
    const url = this.createURL("/element");
    response = this.basePOST(url, data);
    if (check) this.checkResponse(response);
    return response;
  }

  setTimeouts(timeoutType, delayInMillis, check = true) {
    const requestBody = this.buildRequestBody({
      type: timeoutType,
      ms: delayInMillis
    });
    const url = this.createURL("/timeouts");
    const response = this.basePOST(url, requestBody);
    if (check) this.checkResponse(response);
    return response;
  }

  getUIElements(data, check = true) {
    const url = this.createURL("/elements");
    const response = this.basePOST(url, data);
    if (check) this.checkResponse(response);
    return response;
  }

  sendKeypress(keyPress, check = true) {
    const requestBody = this.buildRequestBody({ button: keyPress });
    const url = this.createURL("/press");
    const response = this.basePOST(url, requestBody);
    if (check) this.checkResponse(response);
    return response;
  }

  getActiveElement(check = true) {
    const body = {};
    const url = this.createURL("/element/active");
    const response = this.basePOST(url, body);
    if (check) this.checkResponse(response);
    return response;
  }

  //DELETE
  quiet() {
    const url = this.createURL("");
    const response = this.baseDELETE(url);
    return response;
  }

  //RESPONSE CHECK
  checkResponse(response) {
    if (response.status === 400) throw Error(response.text);
    else if (response.status != 200) throw Error(response.value.message);
    else return true;
  }
}
