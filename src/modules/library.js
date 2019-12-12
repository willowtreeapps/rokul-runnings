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

  close() {
    this.driver.quiet();
  }

  launchTheChannel(channelCode) {
    const response = this.driver.sendLaunchChannel(channelCode);
    print(response);
    return response;
  }

  getApps() {
    const response = this.driver.getApps();
    return response.text.value;
  }

  verifyIsChannelExist(apps, id) {
    apps.array.forEach(app => {
      if (app.id === id) return true;
    });
    return false;
  }

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

  pressBtn(keyPress, delayInMillis = 2000) {
    sleep(delayInMillis);
    this.driver.sendKeypress(keyPress);
  }

  sendWord(word, delayInMillis = 2000) {
    sleep(delayInMillis);
    for (var charIndex = 0; charIndex < word.length; charIndex++) {
      sleep(500);
      const response = this.driver.sendKeypress(
        "LIT_" + word.charAt(charIndex)
      );
    }
  }

  sendButtonSequence(sequence, delayInMillis = 2000) {
    sleep(delayInMillis);
    this.driver.sendSequence(sequence);
  }

  getElement(data, delayInMillis = 1000) {
    sleep(delayInMillis);
    const response = this.driver.getUIElement(data);
    return response.text.value;
  }

  getElements(data, delayInMillis = 1000) {
    sleep(delayInMillis);
    const response = this.driver.getUIElements(data);
    print(delayInMillis);
    print(response.text.value.length);
    return response.text.value;
  }

  getFocusedElement() {
    const response = this.driver.getActiveElement();
    return response.text.value;
  }

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

  getCurrentChannelInfo() {
    const response = this.driver.getCurrentApp();
    return response.text.value;
  }

  getDeviceInfo() {
    const response = this.driver.getDeviceInfo();
    return response.text.value;
  }

  getPlayerInfo() {
    const response = this.driver.getPlayerInfo();
    value = response.text.value;
    value.position = parseInt(value.position.split(" ")[0]);
    value.duration = parseInt(value.duration.split(" ")[0]);
    return value;
  }

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

  setTimeout(timeoutInMillis) {
    this.driver.setTimeouts("implicit", timeoutInMillis);
  }

  setDelay(delayInMillis) {
    this.driver.setTimeouts("pressDelay", this.delayInMillis);
  }

  getAttribute(element, attribute) {
    for (var i = 0; i < element.attrs.length; i++) {
      if (element.attrs[i].name.local === attribute)
        return element.attrs[i].value;
    }
    throw Error("Can't find attribute!");
  }
}
