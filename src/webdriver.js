const axios = require("axios");

const BASE_URL = "http://localhost:9000/v1/";

class WebDriver {
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

  //may need to re-work
  createURL(command) {
    if (!command) return `${BASE_URL}/session`;
    else return `${BASE_URL}session/${this.sessionId}${command}`;
  }

  getSessionId() {
    const url = this.createURL();
    const newRequestBody = this.buildRequestBody();
    return axios
      .post(url, newRequestBody)
      .then(function(response) {
        return response.sessionId;
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  //interacting with the API

  //GET
  getDeviceInfo() {
    const url = this.createURL("");
    return axios
      .get(url)
      .then(function(response) {
        return response;
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  getPlayerInfo() {
    const url = this.createURL("/player");
    return axios
      .get(url)
      .then(function(response) {
        return response;
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  //POST

  basePOST(url, requestBody) {
    return axios
      .post(url, requestBody)
      .then(function(response) {
        return response;
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  sendLaunchChannel(channelCode) {
    const newRequestBody = this.buildRequestBody({ channelId: channelCode });
    const url = this.createURL("/launch");

    return this.basePOST(url, newRequestBody);
  }

  sendInstallChannel(channelCode) {
    const newRequestBody = this.buildRequestBody({ channelId: channelCode });
    const url = this.createURL("/install");

    return this.basePOST(url, newRequestBody);
  }

  sendSequence(sequence) {
    const newRequestBody = this.buildRequestBody({ button_sequence: sequence });
    const url = this.createURL("/press");

    return this.basePOST(url, newRequestBody);
  }

  getUIElement(data) {
    const url = this.createURL("/element");

    return this.basePOST(url, data);
  }
}
