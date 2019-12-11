const WebDriver = require("./webdriver");

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

  close() {
    this.driver.quiet();
  }

  launchTheChannel(channelCode) {
    const response = this.driver.sendLaunchChannel(channelCode);
    print(response);
    return this.checkResponse(response);
  }

  getApps() {
    const response = this.driver.getApps();
    this.checkResponse(response);
    return response.text.value;
  }

  verifyIsChannelExist(apps, id) {
    apps.array.forEach(app => {
      if (app.id === id) return true;
    });
    throw Error("Channel does not exist!");
  }

  verifyIsScreenLoaded(data, maxRetries = 10, delayInMillis = 1000) {
    print(data);
    retries = 0;
    while (retries < maxRetries) {
      const uiLayoutresponse = this.driver.getUIElement(data);
      if (uiLayoutResponse.status != 200) retries++;
      else return true;
      sleep(delayInMillis);
    }
  }

  pressBtn(keyPress, delayInMillis = 2000) {
    sleep(delayInMillis);
    const response = this.driver.sendKeypress(keyPress);
    this.checkResponse(response);
  }

  sendWord(word, delayInMillis = 2000) {
    sleep(delayInMillis);
    for (var charIndex = 0; charIndex < word.length; charIndex++) {
      sleep(500);
      const response = this.driver.sendKeypress(
        "LIT_" + word.charAt(charIndex)
      );
      this.checkResponse(response);
    }
  }

  sendButtonSequence(sequence, delayInMillis = 2000) {
    sleep(delayInMillis);
    const response = this.driver.sendSequence(sequence);
    this.checkResponse(response);
  }

  getElement(data, delayInMillis = 1000) {
    sleep(delayInMillis);
    const response = this.driver.getUIElement(data);
    this.checkResponse(response);
    return response.text.value;
  }

  getElements(data, delayInMillis = 1000) {
    sleep(delayInMillis);
    const response = this.driver.getUIElements(data);
    this.checkResponse(response);
    print(delayInMillis);
    print(response.text.value.length);
    return response.text.value;
  }

  getFocusedElement() {
    const response = this.driver.getActiveElement();
    this.checkResponse(response);
    return response.text.value;
  }

  verifyIsChannelLoaded(id, maxRetries = 10, delayInMillis = 1000) {
    var retries = 0;
    while (retries < maxRetries) {
      const response = this.driver.getCurrentApp();
      this.checkResponse(response);
      if (response.text.value.id != id) retries++;
      else return true;
      sleep(delayInMillis);
    }
    throw Error("Channel isn't launched");
  }

  getCurrentChannelInfo() {
    const response = this.driver.getCurrentApp();
    this.checkResponse(response);
    return response.text.value;
  }

  getDeviceInfo() {
    const response = this.driver.getDeviceInfo();
    this.checkResponse(response);
    return response.text.value;
  }

  getPlayerInfo() {
    const response = this.driver.getPlayerInfo();
    this.checkResponse(response);
    value = response.text.value;
    value.position = parseInt(value.position.split(" ")[0]);
    value.duration = parseInt(value.duration.split(" ")[0]);
    return value;
  }

  verifyIsPlaybackStarted(maxRetries = 10, delayInMillis = 1000) {
    var retries = 0;
    while (retries < maxRetries) {
      const response = this.driver.getPlayerInfo();
      if ((response.status != 200) | (response.text.value.state != "play"))
        retries++;
      else return true;
      sleep(delayInMillis);
    }
  }

  setTimeout(timeoutInMillis) {
    const response = this.driver.setTimeouts("implicit", timeoutInMillis);
    this.checkResponse(response);
  }

  setDelay(delayInMillis) {
    const response = this.driver.setTimeouts("pressDelay", this.delayInMillis);
    this.checkResponse(response);
  }

  getAttribute(element, attribute) {
    for (var i = 0; i < element.attrs.length; i++) {
      if (element.attrs[i].name.local === attribute)
        return element.attrs[i].value;
    }
    throw Error("Can't find attribute!");
  }

  checkResponse(response) {
    if (response.status === 400) throw Error(response.text);
    else if (response.status != 200) throw Error(response.value.message);
    else return true;
  }
}

const sleep = milliseconds => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};
