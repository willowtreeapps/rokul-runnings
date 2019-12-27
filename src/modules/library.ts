import { WebDriver } from "./webdriver";
import { sleep } from "../utils/sleep";
import {
  elementValueParsed,
  appResponse,
  elementDataObject,
  nullValueResponse,
  elementValueRaw,
  elementValueRawAttrs,
  getPlayerInfoResponse
} from "../types/webdriver";
export enum buttons {
  up = "up",
  down = "down",
  right = "right",
  left = "left",
  back = "back",
  select = "select",
  replay = "replay",
  play = "play",
  stop = "stop",
  rewind = "rewind",
  fast_forward = "fast forward",
  options = "options",
  home = "home"
}

export class Library {
  constructor(
    rokuIPAddress: string,
    timeoutInMillis: number = 0,
    pressDelayInMillis: number = 0,
    private driver: WebDriver = new WebDriver(
      rokuIPAddress,
      timeoutInMillis,
      pressDelayInMillis
    )
  ) {
    this.driver = driver;
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
   * @param {string} channelCode The ID of the channel to be launched
   */
  async launchTheChannel(channelCode: string) {
    return await this.driver.sendLaunchChannel(channelCode);
  }

  /**
   * Returns a list of installed channels as an array of objects
   */
  async getApps() {
    const response = await this.driver.getApps();
    return response.value;
  }

  /**
   * Verifies the specified channel is installed on the device.
   *
   * @param {appResponse[]} apps An array containing the channels currently installed on the device.
   * @param {string} id The ID of the channel to be verified. Use 'dev' to verify a sideloaded channel.
   */
  verifyIsChannelExist(apps: appResponse[], id: string) {
    return !!apps.find(app => app.ID === id);
  }

  /**
   * Verify that the screen is loaded based on the provided element data.
   *
   * @param {elementDataObject} data An object with locators for elementData and parentData (parentData is optional).
   * @param {number} maxRetries The number of requests that can be made before generating an error. This argument is optional, and it defaults to 10 if not specified.
   * @param {number} delayInMillis The delay between retries. This argument is optional, and it defaults to 1000 millisecond if not specified.
   */
  async verifyIsScreenLoaded(
    data: elementDataObject,
    maxRetries: number = 10,
    delayInMillis: number = 1000
  ) {
    let retries = 0;
    while (retries < maxRetries) {
      const uiLayoutResponse = await this.driver.getUIElementError(data);
      if (uiLayoutResponse.status !== 200) retries++;
      else return true;
      await sleep(delayInMillis);
    }
    return false;
  }

  /**
   * Simulates the press and release of the specified key.
   *
   * @param {string} keyPress The key to be pressed and released, which may be one of the options in the "buttons" constant
   * @param {number} delayInMillis The delay before the keypresses are executed. This argument is optional, and it defaults to 2000 milliseconds if not specified.
   */
  async pressBtn(keyPress: string, delayInMillis: number = 2000) {
    await sleep(delayInMillis);
    return await this.driver.sendKeypress(keyPress);
  }

  /**
   * Simulates the press and release of each letter in a word.
   *
   * @param {string} word The specified word to be entered.
   * @param {number} delayInMillis The delay before the keypresses are executed. This argument is optional, and it defaults to 2000 milliseconds if not specified.
   */
  async sendWord(word: string, delayInMillis: number = 2000) {
    await sleep(delayInMillis);
    let wordResponse: { [key: string]: nullValueResponse }[] = [];
    for (let charIndex = 0; charIndex < word.length; charIndex++) {
      await sleep(500);
      let key = word.charAt(charIndex);
      let value = await this.driver.sendKeypress("LIT_" + key);
      wordResponse.push({ key: value });
    }
    return wordResponse;
  }

  /**
   * Simulates the sequence of keypresses and releases.
   *
   * @param {buttons[]} sequence An array containing the sequence of keys to be pressed and released (for example, down, down, down, down, select).
   * @param {number} delayInMillis The delay before the keypresses are executed. This argument is optional, and it defaults to 2000 milliseconds if not specified.
   */
  async sendButtonSequence(sequence: buttons[], delayInMillis: number = 2000) {
    await sleep(delayInMillis);
    return await this.driver.sendSequence(sequence);
  }

  /**
   * Searches for an element on the page based on the specified locator starting from the screen root. Returns information on the first matching element.
   *
   * @param {elementDataObject} data An object with locators for elementData and parentData (parentData is optional)
   * @param {number} delayInMillis The delay between retries. This argument is optional, and it defaults to 1000 millisecond if not specified.
   */
  async getElement(data: elementDataObject, delayInMillis: number = 1000) {
    await sleep(delayInMillis);
    const response = await this.driver.getUIElement(data);
    const [attributes] = await this.getAllAttributes([response.value]);
    return attributes;
  }

  /**
   * Searches for elements on the page based on the specified locators starting from the screen root. Returns information on the matching elements.
   *
   * @param {elementDataObject} data An object with locators for elementData and parentData (parentData is optional)
   * @param {number} delayInMillis The delay between retries. This argument is optional, and it defaults to 1000 millisecond if not specified.
   */
  async getElements(data: elementDataObject, delayInMillis: number = 1000) {
    await sleep(delayInMillis);
    const response = await this.driver.getUIElements(data);
    const attributes = await this.getAllAttributes(response);
    return attributes;
  }

  /**
   * Return the element on the screen that currently has focus.
   */
  async getFocusedElement() {
    const response = await this.driver.getActiveElement();
    const [element] = await this.getAllAttributes([response.value]);
    return element;
  }

  /**
   * Verifies that the Focused Element returned from {@link getFocusedElement} is a RenderableNode
   *
   * @param {number} maxRetries Maximum number of attempts
   */
  async verifyFocusedElementIsRenderableNode(maxRetries: number = 10) {
    let retries = 0;
    let element: elementValueParsed;
    while (element.XMLName !== "RenderableNode" && retries < maxRetries) {
      const response = await this.driver.getActiveElement();
      [element] = await this.getAllAttributes([response.value]);
      retries++;
    }
    return element.XMLName === "RenderableNode";
  }

  /**
   * Verify that the specified channel has been launched.
   *
   * @param {string} id The ID of the channel to be launched. Use 'dev' to verify a sideloaded channel.
   * @param {number} maxRetries The number of requests that can be made before generating an error. This argument is optional, and it defaults to 10 if not specified.
   * @param {number} delayInMillis The delay between retries. This argument is optional, and it defaults to 1000 millisecond if not specified.
   */
  async verifyIsChannelLoaded({
    id,
    maxRetries = 10,
    delayInMillis = 1000
  }: {
    id: string;
    maxRetries?: number;
    delayInMillis?: number;
  }) {
    let retries: number = 0;
    while (retries < maxRetries) {
      const response = await this.driver.getCurrentApp();
      if (response.ID != id) retries++;
      else return true;
      await sleep(delayInMillis);
    }
    return false;
  }

  /**
   * Returns an object containing information about the channel currently loaded.
   */
  async getCurrentChannelInfo() {
    const response = await this.driver.getCurrentApp();
    return response;
  }

  /**
   * Returns an object containing the information about the device.
   */
  async getDeviceInfo() {
    return await this.driver.getDeviceInfo();
  }

  /**
   * Returns an object containing information about the Roku media player
   */
  async getPlayerInfo() {
    const response = await this.driver.getPlayerInfo();
    if (typeof response.Position === "string") {
      response.Position = parseInt(response.Position.split(" ")[0]);
    }
    if (typeof response.Duration === "string") {
      response.Duration = parseInt(response.Duration.split(" ")[0]);
    }
    return response;
  }

  /**
   * Verify playback has started on the Roku media player.
   *
   * @param {number} maxRetries The number of requests that can be made before generating an error. This argument is optional, and it defaults to 10 if not specified.
   * @param {number} delayInMillis The delay between retries. This argument is optional, and it defaults to 1000 millisecond if not specified.
   */
  async verifyIsPlaybackStarted(
    maxRetries: number = 10,
    delayInMillis: number = 1000
  ) {
    let retries = 0;
    while (retries < maxRetries) {
      const response = await this.driver.getPlayerInfoError();
      if (response.status !== 200) {
        retries++;
      } else if (Object.keys(response.body.value).includes("State")) {
        if (response.body.value["State"] !== "play") {
          retries++;
        } else return true;
        await sleep(delayInMillis);
      }
    }
    return false;
  }

  /**
   * Sets the timeout for Web driver client requests.
   *
   * @param {number} timeoutInMillis The amount of time that Web driver client requests are allowed to run.
   */
  async setTimeout(timeoutInMillis: number) {
    await this.driver.setTimeouts("implicit", timeoutInMillis);
  }

  /**
   * Sets the delay between key presses.
   *
   * @param {number} timeoutInMillis The interval to be used between key presses.
   */
  async setDelay(delayInMillis) {
    await this.driver.setTimeouts("pressDelay", delayInMillis);
  }

  /**
   * Returns all elements in an array, with their attributes in Name.Local:Value pairs, and their child nodes in an array.
   *
   * @param {elementValueRaw[]} elements Array of elements to derive attributes.
   */
  async getAllAttributes(elements: elementValueRaw[]) {
    let allElements: elementValueParsed[] = [];
    for (let i = 0; i < elements.length; i++) {
      let element = elements[i].Attrs;
      let allAttributesForElement: elementValueParsed = await this.parseAttributes(
        element
      );
      if (elements[i].Nodes !== null) {
        allAttributesForElement.Nodes = await this.parseAttributeNodes(
          elements[i].Nodes
        );
      }
      allAttributesForElement.XMLName = elements[i].XMLName.Local;
      allElements[i] = allAttributesForElement;
    }
    return allElements;
  }

  /**
   * Parses the given JSON object and returns it as an object with Name.Local:Value pairs.
   *
   * @param {elementValueRawAttrs} element JSON Object to be parsed
   */
  async parseAttributes(element: elementValueRawAttrs) {
    let parsedElement: elementValueParsed = { XMLName: "", Attrs: {} };
    for (let i = 0; i < element.length; i++) {
      let key = element[i].Name.Local;
      parsedElement.Attrs[key] = element[i].Value;
    }
    return parsedElement;
  }

  /**
   * Resursive function to parse all child nodes of the parent element
   *
   * @param {elementValueRaw[]} node The entire element to be parsed
   */
  async parseAttributeNodes(node: elementValueRaw[]) {
    let allAttributesForElement = [];
    for (let i = 0; i < node.length; i++) {
      allAttributesForElement[i] = await this.parseAttributes(node[i].Attrs);
      if (node[i].Nodes !== null) {
        allAttributesForElement[i].Nodes = [];
        for (let j = 0; j < node[i].Nodes.length; j++)
          allAttributesForElement[i].Nodes[j] = await this.parseAttributeNodes(
            node[i].Nodes
          );
      }
    }
    return allAttributesForElement;
  }
}
