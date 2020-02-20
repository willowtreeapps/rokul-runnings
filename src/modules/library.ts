import { WebDriver } from './webdriver';
import { sleep } from '../utils/sleep';
import {
  elementValueParsed,
  appResponse,
  elementDataObject,
  nullValueResponse,
  elementValueRaw,
  elementValueRawAttrs,
} from '../types/webdriver';

export enum Buttons {
  up = 'up',
  down = 'down',
  right = 'right',
  left = 'left',
  back = 'back',
  select = 'select',
  replay = 'replay',
  play = 'play',
  stop = 'stop',
  rewind = 'rewind',
  fastForward = 'fast forward',
  options = 'options',
  home = 'home',
}

export class Library {
  constructor(
    rokuIPAddress: string,
    timeoutInMillis = 0,
    pressDelayInMillis = 0,
    public driver: WebDriver = new WebDriver(rokuIPAddress, timeoutInMillis, pressDelayInMillis),
  ) {
    this.driver = driver;
  }

  /** Closes the session */
  async close() {
    await this.driver.quiet();
  }

  /** Launches the channel corresponding to the specified channel ID. */
  async launchTheChannel({ channelCode, retries = 3 }: { channelCode: string; retries?: number }) {
    return this.driver.sendLaunchChannel({ channelCode, retries });
  }

  /** Returns a list of installed channels as an array of objects */
  async getApps(retries = 3) {
    const response = await this.driver.getApps(retries);
    return response.value;
  }

  /** Verifies the specified channel is installed on the device. */
  async verifyIsChannelExist({ apps, id, retries = 3 }: { apps?: appResponse[]; id: string; retries?: number }) {
    if (!apps) {
      apps = await this.getApps(retries);
    }
    return !!apps.find(app => app.ID === id);
  }

  /** Verify that the screen is loaded based on the provided element data. */
  async verifyIsScreenLoaded({
    data,
    maxRetries = 10,
    delayInMillis = 1000,
    postRetries = 3,
  }: {
    data: elementDataObject;
    maxRetries?: number;
    delayInMillis?: number;
    postRetries?: number;
  }) {
    let functionRetries = 0;
    while (functionRetries < maxRetries) {
      const uiLayoutResponse = await this.driver.getUIElementError({ data, retries: postRetries });
      if (uiLayoutResponse.status !== 200) functionRetries++;
      else return true;
      await sleep(delayInMillis);
    }
    return false;
  }

  /** Alias for verifyIsScreenLoaded with a more intuitive name */
  async verifyIsElementOnScreen({
    data,
    maxRetries = 10,
    delayInMillis = 1000,
    postRetries = 3,
  }: {
    data: elementDataObject;
    maxRetries?: number;
    delayInMillis?: number;
    postRetries?: number;
  }) {
    return this.verifyIsScreenLoaded({ data, maxRetries, delayInMillis, postRetries });
  }

  /** Simulates the press and release of the specified key. */
  async pressBtn({
    keyPress,
    delayInMillis = 2000,
    retries = 3,
  }: {
    keyPress: string;
    delayInMillis?: number;
    retries?: 3;
  }) {
    await sleep(delayInMillis);
    return this.driver.sendKeypress({ keyPress, retries });
  }

  /** Simulates the press and release of each letter in a word. */
  async sendWord({
    word,
    delayInMillis = 2000,
    retries = 3,
  }: {
    word: string;
    delayInMillis?: number;
    retries?: number;
  }) {
    await sleep(delayInMillis);
    const wordResponse: { [key: string]: nullValueResponse }[] = [];
    for (let charIndex = 0; charIndex < word.length; charIndex++) {
      await sleep(500);
      const key = word.charAt(charIndex);
      const value = await this.driver.sendKeypress({ keyPress: 'LIT_' + key, retries });
      wordResponse[charIndex] = { [key]: value };
    }
    return wordResponse;
  }

  /** Simulates the sequence of keypresses and releases. */
  async sendButtonSequence({
    sequence,
    delayInMillis = 2000,
    retries = 3,
  }: {
    sequence: Buttons[];
    delayInMillis?: number;
    retries?: number;
  }) {
    await sleep(delayInMillis);
    return this.driver.sendSequence({ sequence, retries });
  }

  /** Searches for an element on the page based on the specified locator starting from the screen root.
   * Returns information on the first matching element. */
  async getElement({
    data,
    delayInMillis = 1000,
    retries = 3,
  }: {
    data: elementDataObject;
    delayInMillis?: number;
    retries?: number;
  }) {
    await sleep(delayInMillis);
    const response = await this.driver.getUIElement({ data, retries });
    const [attributes] = await this.getAllAttributes([response.value]);
    return attributes;
  }

  /** Searches for elements on the page based on the specified locators starting from the screen root.
   * Returns information on all matching elements. */
  async getElements({
    data,
    delayInMillis = 1000,
    retries = 3,
  }: {
    data: elementDataObject;
    delayInMillis?: number;
    retries?: number;
  }) {
    await sleep(delayInMillis);
    const response = await this.driver.getUIElements({ data, retries });
    const attributes = await this.getAllAttributes(response);
    return attributes;
  }

  /** Return the element on the screen that currently has focus. */
  async getFocusedElement(retries = 3) {
    const response = await this.driver.getActiveElement(retries);
    const [element] = await this.getAllAttributes([response.value]);
    return element;
  }

  /** Verifies that the Focused Element returned from {@link getFocusedElement} is of a certain type (XMLName/tag) */
  async verifyFocusedElementIsOfCertainTag({
    tag,
    maxRetries = 10,
    postRetries = 3,
  }: {
    tag: string;
    maxRetries?: number;
    postRetries?: number;
  }) {
    let functionRetries = 0;
    let element: elementValueParsed;
    while (element.XMLName !== tag && functionRetries < maxRetries) {
      const response = await this.driver.getActiveElement(postRetries);
      [element] = await this.getAllAttributes([response.value]);
      functionRetries++;
    }
    return element.XMLName === tag;
  }

  /** Verify that the specified channel has been launched. */
  async verifyIsChannelLoaded({
    id,
    maxRetries = 10,
    delayInMillis = 1000,
    getRetries = 3,
  }: {
    id: string;
    maxRetries?: number;
    delayInMillis?: number;
    getRetries?: number;
  }) {
    let functionRetries = 0;
    while (functionRetries < maxRetries) {
      const response = await this.driver.getCurrentApp(getRetries);
      if (response.ID !== id) functionRetries++;
      else return true;
      await sleep(delayInMillis);
    }
    return false;
  }

  /** Returns an object containing information about the channel currently loaded. */
  async getCurrentChannelInfo(retries = 3) {
    const response = await this.driver.getCurrentApp(retries);
    return response;
  }

  /** Returns an object containing the information about the device. */
  async getDeviceInfo(retries = 3) {
    return this.driver.getDeviceInfo(retries);
  }

  /** Returns an object containing information about the Roku media player */
  async getPlayerInfo(retries = 3) {
    const response = await this.driver.getPlayerInfo(retries);
    if (typeof response.Position === 'string') {
      response.Position = parseInt(response.Position.split(' ')[0]);
    }
    if (typeof response.Duration === 'string') {
      response.Duration = parseInt(response.Duration.split(' ')[0]);
    }
    return response;
  }

  /** Verify playback has started on the Roku media player. */
  async verifyIsPlaybackStarted({
    maxRetries = 10,
    delayInMillis = 1000,
    getRetries = 3,
  }: {
    maxRetries?: number;
    delayInMillis?: number;
    getRetries?: number;
  }) {
    let functionRetries = 0;
    while (functionRetries < maxRetries) {
      const response = await this.driver.getPlayerInfoError(getRetries);
      if (response.status !== 200) {
        functionRetries++;
      } else if (Object.keys(response.body.value).includes('State')) {
        // eslint-disable-next-line dot-notation
        if (response.body.value['State'] !== 'play') {
          functionRetries++;
        } else return true;
        await sleep(delayInMillis);
      }
    }
    return false;
  }

  /** Sets the timeout for Web driver client requests. */
  async setTimeout({ timeoutInMillis, retries = 3 }: { timeoutInMillis: number; retries?: number }) {
    await this.driver.setTimeouts({ timeoutType: 'implicit', delayInMillis: timeoutInMillis, retries });
  }

  /** Sets the delay between key presses. */
  async setDelay({ delayInMillis, retries = 3 }: { delayInMillis: number; retries?: number }) {
    await this.driver.setTimeouts({ timeoutType: 'pressDelay', delayInMillis, retries });
  }

  /** Returns all elements in an array, with their attributes in Name.Local:Value pairs, and their child nodes in an array. */
  private async getAllAttributes(elements: elementValueRaw[]) {
    const allElements: elementValueParsed[] = [];
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i].Attrs;
      const allAttributesForElement: elementValueParsed = await this.parseAttributes(element);
      if (elements[i].Nodes !== null) {
        allAttributesForElement.Nodes = await this.parseAttributeNodes(elements[i].Nodes);
      }
      allAttributesForElement.XMLName = elements[i].XMLName.Local;
      allElements[i] = allAttributesForElement;
    }
    return allElements;
  }

  /** Parses the given JSON object and returns it as an object with Name.Local:Value pairs. */
  private async parseAttributes(element: elementValueRawAttrs) {
    const parsedElement: elementValueParsed = { XMLName: '', Attrs: {} };
    for (let i = 0; i < element.length; i++) {
      const key = element[i].Name.Local;
      parsedElement.Attrs[key] = element[i].Value;
    }
    return parsedElement;
  }

  /** Resursive function to parse all child nodes of the parent element */
  private async parseAttributeNodes(node: elementValueRaw[]) {
    const allAttributesForElement = [];
    for (let i = 0; i < node.length; i++) {
      allAttributesForElement[i] = await this.parseAttributes(node[i].Attrs);
      if (node[i].Nodes !== null) {
        allAttributesForElement[i].Nodes = [];
        for (let j = 0; j < node[i].Nodes.length; j++)
          allAttributesForElement[i].Nodes[j] = await this.parseAttributeNodes(node[i].Nodes);
      }
    }
    return allAttributesForElement;
  }
}
