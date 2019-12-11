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
    this.requestBody = this.buildRequestBody();
    this.sessionId = this.getSessionId();
  }

  buildRequestBody() {
    return {
      ip: this.rokuIPAddress,
      timeout: this.timeoutInMillis,
      pressDelay: this.pressDelayInMillis
    };
  }

  addToRequestBody(key, value, requestBody = this.requestBody) {
    newRequestBody = requestBody;
    newRequestBody.key = value;
    return newRequestBody;
  }

  //may need to re-work
  createURL(command = null) {
    if (command == null) return BASE_URL + "session";
    else return BASE_URL + "session/" + this.sessionId + command;
  }

  getSessionId() {
    var url = this.createURL();
    axios
      .post(url, this.requestBody)
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
    var url = this.createURL("");
    axios
      .get(url)
      .then(function(response) {
        return response;
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  getPlayerInfo() {
    var url = this.createURL("/player");
    axios
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
    axios
      .post(url, newRequestBody)
      .then(function(response) {
        return response;
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  sendLaunchChannel(channelCode) {
    newRequestBody = this.addToRequestBody("channelId", channelCode);
    var url = this.createURL("/launch");
    this.basePOST(url, newRequestBody);
  }

  sendInstallChannel(channelCode) {
    newRequestBody = this.addToRequestBody("channelId", channelCode);
    var url = this.createURL("/install");
    this.basePOST(url, newRequestBody);
  }

  sendSequence(sequence) {
    newRequestBody = this.addToRequestBody("button_sequence", sequence);
    var url = this.createURL("/press");
    this.basePOST(url, newRequestBody);
  }

  getUIElement(data) {
    var url = this.createURL("/element");
    this.basePOST(url, data);
  }
}
