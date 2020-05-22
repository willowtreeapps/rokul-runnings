import { Driver } from './Driver';
import { ElementDataObject, Apps, Params } from '../types/RokulRunnings';
import { squashAttributes } from '../utils/formatters';
import { generateScreenshot, saveScreenshot } from '../utils/screenshots';
import { sleep } from '../utils/sleep';
import path = require('path');

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

export class RokulRunnings {
  public driver: Driver;
  private pressDelayInMillis: number;
  private retryDelayInMillis: number;
  private retries: number;
  private devInstallerInfo = {
    username: this.username,
    password: this.password,
    rokuIPAddress: `http://${this.rokuIPAddress}`,
  };

  constructor(
    public rokuIPAddress: string,
    private username: string,
    private password: string,
    {
      pressDelayInMillis = 1000,
      retryDelayInMillis = 1000,
      retries = 1,
    }: { pressDelayInMillis?: number; retryDelayInMillis?: number; retries?: number },
  ) {
    this.rokuIPAddress = rokuIPAddress;
    this.pressDelayInMillis = pressDelayInMillis;
    this.driver = new Driver(rokuIPAddress, retries);
    this.retryDelayInMillis = retryDelayInMillis;
    this.retries = retries;
  }

  /** Launches the channel corresponding to the specified channel ID. */
  async launchTheChannel({
    channelCode,
    contentId,
    mediaType,
    retries = this.retries,
    params,
  }: {
    channelCode: string;
    contentId?: string;
    mediaType?: string;
    retries?: number;
    params?: Params;
  }) {
    return this.driver.sendLaunchChannel({ channelCode, contentId, mediaType, retries, params });
  }

  /** Deep Links into channel */
  deepLinkIntoChannel({
    channelCode,
    contentId,
    mediaType,
    retries = this.retries,
    params,
  }: {
    channelCode: string;
    contentId?: string;
    mediaType?: string;
    retries?: number;
    params?: Params;
  }) {
    return this.driver.deepLink({ channelCode, contentId, mediaType, retries, params });
  }

  /** Returns a list of installed channels as an array of objects */
  async getApps(retries = this.retries) {
    return this.driver.getApps(retries);
  }

  /** Verifies the specified channel is installed on the device. */
  async verifyIsChannelExist({ apps, id, retries }: { apps?: Apps; id: string; retries?: number }) {
    if (!apps) {
      apps = await this.getApps(retries);
    }
    for (const key of Object.keys(apps)) {
      if (apps[key].id === id) {
        return true;
      }
    }
    return false;
  }

  /** Verify that the screen is loaded based on the provided element data. */
  async verifyIsScreenLoaded({
    data,
    maxAttempts = 10,
    delayInMillis = this.retryDelayInMillis,
    httpRetries = this.retries,
  }: {
    data: ElementDataObject;
    maxAttempts?: number;
    delayInMillis?: number;
    httpRetries?: number;
  }) {
    let attempts = 0;
    while (attempts < maxAttempts) {
      try {
        const [response] = await this.driver.getUIElement({ data, retries: httpRetries });
        if (response) {
          return true;
        } else {
          attempts++;
          await sleep(delayInMillis);
        }
      } catch (error) {
        console.log(error);
        attempts++;
        await sleep(delayInMillis);
      }
    }
    return false;
  }

  /** Alias for verifyIsScreenLoaded with a more intuitive name */
  verifyIsElementOnScreen({
    data,
    maxAttempts = 10,
    delayInMillis = this.retryDelayInMillis,
    httpRetries = this.retries,
  }: {
    data: ElementDataObject;
    maxAttempts?: number;
    delayInMillis?: number;
    httpRetries?: number;
  }) {
    return this.verifyIsScreenLoaded({ data, maxAttempts, delayInMillis, httpRetries });
  }

  /** Simulates the press and release of the specified key. */
  async pressBtn({
    keyPress,
    delayInMillis = this.pressDelayInMillis,
    retries = this.retries,
    params,
  }: {
    keyPress: string;
    delayInMillis?: number;
    retries?: number;
    params?: Params;
  }) {
    const response = await this.driver.sendKey({ keyType: 'press', key: keyPress, retries, params });
    await sleep(delayInMillis);
    return response;
  }

  /** Simulates the press down of the specified key. */
  async pressBtnDown({
    keyDown,
    delayInMillis = this.pressDelayInMillis,
    retries = this.retries,
    params,
  }: {
    keyDown: string;
    delayInMillis?: number;
    retries?: number;
    params?: Params;
  }) {
    const response = await this.driver.sendKey({ keyType: 'down', key: keyDown, retries, params });
    await sleep(delayInMillis);
    return response;
  }

  /** Simulates the press up of the specified key. */
  async pressBtnUp({
    keyUp,
    delayInMillis = this.pressDelayInMillis,
    retries = this.retries,
    params,
  }: {
    keyUp: string;
    delayInMillis?: number;
    retries?: number;
    params?: Params;
  }) {
    const response = await this.driver.sendKey({ keyType: 'up', key: keyUp, retries, params });
    await sleep(delayInMillis);
    return response;
  }

  /** Simulates the press and release of each letter in a word. */
  async sendWord({
    word,
    delayInMillis = this.pressDelayInMillis,
    retries = this.retries,
    params,
  }: {
    word: string;
    delayInMillis?: number;
    retries?: number;
    params?: Params;
  }) {
    const sequence: string[] = [];
    for (let charIndex = 0; charIndex < word.length; charIndex++) {
      const key = word.charAt(charIndex);
      sequence.push(`LIT_${key}`);
    }
    const response = this.sendButtonSequence({ sequence, delayInMillis, retries, params });
    return response;
  }

  /** Simulates the sequence of keypresses and releases. */
  async sendButtonSequence({
    sequence,
    delayInMillis = this.pressDelayInMillis,
    retries = this.retries,
    params,
    keyType = 'press',
  }: {
    sequence: (Buttons | string)[];
    delayInMillis?: number;
    retries?: number;
    params?: Params;
    keyType?: 'up' | 'down' | 'press';
  }) {
    const newSequence: ({ up: string | Buttons } | { down: string | Buttons } | { press: string | Buttons })[] = [];
    sequence.forEach(button => {
      switch (keyType) {
        case 'down':
          newSequence.push({ down: button });
          break;
        case 'press':
          newSequence.push({ press: button });
          break;
        case 'up':
          newSequence.push({ up: button });
          break;
      }
    });
    const response = await this.driver.sendSequence({ sequence: newSequence, delayInMillis, params, retries });
    const formattedResponse: { [key: string]: number }[] = [];
    response.forEach(responseObject => {
      const key = Object.keys(responseObject)[0];
      const newKey = key.replace(`${keyType}:`, '');
      formattedResponse.push({ [newKey]: responseObject[key] });
    });
    return formattedResponse;
  }

  /** Allows for a sequence to be sent that uses keyUp, keyDown, and keyPress */
  async sendMixedButtonSequence({
    customSequence,
    delayInMillis = this.pressDelayInMillis,
    retries = this.retries,
    params,
  }: {
    customSequence: ({ up: string } | { down: string } | { press: string })[];
    delayInMillis?: number;
    retries?: number;
    params?: Params;
  }) {
    const response = await this.driver.sendSequence({ sequence: customSequence, delayInMillis, retries, params });
    return response;
  }

  /** Searches for an element on the page based on the specified locator starting from the screen root.
   * Returns information on the first matching element. */
  async getElement({ data, retries = this.retries }: { data: ElementDataObject; retries?: number }) {
    const response = await this.driver.getUIElement({ data, retries });
    return squashAttributes(response)[0];
  }

  async getElementByText({ value, retries = this.retries }: { value: string; retries?: number }) {
    const data: ElementDataObject = { using: 'text', value };
    return this.getElement({ data, retries });
  }

  async getElementByAttr({
    attribute,
    value,
    retries = this.retries,
  }: {
    attribute: string;
    value: string;
    retries?: number;
  }) {
    const data: ElementDataObject = { using: 'attr', attribute, value };
    return this.getElement({ data, retries });
  }

  async getElementByTag({ value, retries = this.retries }: { value: string; retries?: number }) {
    const data: ElementDataObject = { using: 'tag', value };
    return this.getElement({ data, retries });
  }

  /** Searches for elements on the page based on the specified locators starting from the screen root.
   * Returns information on all matching elements. */
  async getElements({ data, retries = this.retries }: { data: ElementDataObject; retries?: number }) {
    const response = await this.driver.getUIElements({ data, retries });
    return squashAttributes(response);
  }

  async getElementsByText({ value, retries = this.retries }: { value: string; retries?: number }) {
    const data: ElementDataObject = { using: 'text', value };
    return this.getElements({ data, retries });
  }

  async getElementsByAttr({
    attribute,
    value,
    retries = this.retries,
  }: {
    attribute: string;
    value: string;
    retries?: number;
  }) {
    const data: ElementDataObject = { using: 'attr', attribute, value };
    return this.getElements({ data, retries });
  }

  async getElementsByTag({ value, retries = this.retries }: { value: string; retries?: number }) {
    const data: ElementDataObject = { using: 'tag', value };
    return this.getElements({ data, retries });
  }

  /** Return the element on the screen that currently has focus. */
  async getFocusedElement(retries = this.retries) {
    const response = await this.driver.getActiveElement(retries);
    return squashAttributes(response)[0];
  }

  /** Verifies that the Focused Element returned from {@link getFocusedElement} is of a certain type (XMLName/tag) */
  async verifyFocusedElementIsOfCertainTag({
    tag,
    maxAttempts = 10,
    delayInMillis = this.retryDelayInMillis,
    httpRetries = this.retries,
  }: {
    tag: string;
    maxAttempts?: number;
    delayInMillis?: number;
    httpRetries?: number;
  }) {
    let attempts = 0;
    while (attempts < maxAttempts) {
      const response = await this.getFocusedElement(httpRetries);
      const nameOrTag = Object.keys(response)[0];
      if (nameOrTag === tag) {
        return true;
      } else if (response[nameOrTag].tag === tag) {
        return true;
      }
      attempts++;
      await sleep(delayInMillis);
    }
    return false;
  }

  /** Returns the current screen elements. */
  async getScreenSource(retries = this.retries) {
    return this.driver.getScreenSource(retries);
  }

  /** Verify that the specified channel has been launched. */
  async verifyIsChannelLoaded({
    id,
    maxAttempts = 10,
    delayInMillis = this.retryDelayInMillis,
    httpRetries = this.retries,
  }: {
    id: string;
    maxAttempts?: number;
    delayInMillis?: number;
    httpRetries?: number;
  }) {
    let attempts = 0;
    while (attempts < maxAttempts) {
      const response = await this.getCurrentChannelInfo(httpRetries);
      if (response[Object.keys(response)[0]].id === id) {
        return true;
      }
      attempts++;
      await sleep(delayInMillis);
    }
    return false;
  }

  /** Returns an object containing information about the channel currently loaded. */
  getCurrentChannelInfo(retries = this.retries) {
    return this.driver.getCurrentApp(retries);
  }

  /** Returns an object containing the information about the device. */
  getDeviceInfo(retries = this.retries) {
    return this.driver.getDeviceInfo(retries);
  }

  /** Returns an object containing information about the Roku media player */
  async getPlayerInfo(retries = this.retries) {
    const response = await this.driver.getPlayerInfo(retries);
    if (typeof response.position === 'string') {
      response.position = parseInt(response.position.split(' ')[0]);
    }
    if (typeof response.duration === 'string') {
      response.duration = parseInt(response.duration.split(' ')[0]);
    }
    return response;
  }

  /** Verify playback has started on the Roku media player. */
  async verifyIsPlaybackStarted({
    maxAttempts = 10,
    delayInMillis = this.retryDelayInMillis,
    httpRetries = this.retries,
  }: {
    maxAttempts?: number;
    delayInMillis?: number;
    httpRetries?: number;
  }) {
    let attempts = 0;
    while (attempts < maxAttempts) {
      const response = await this.driver.getPlayerInfo(httpRetries);
      if (response.attributes.state === 'play') {
        return true;
      }
      attempts++;
      await sleep(delayInMillis);
    }
    return false;
  }

  /** Function that generates a screenshot by hitting the `/plugin_inspect` endpoint and then saves the screenshot to a specified location. */
  async getScreenshot({
    directoryPath = `${path.resolve(__dirname)}/images`,
    fileName = new Date(new Date().toString().split('GMT')[0] + ' UTC')
      .toISOString()
      .split('.')[0]
      .replace(/:/g, '-')
      .replace('T', '_'),
    print = false,
    fileType = 'jpg',
  }: {
    directoryPath?: string;
    fileName?: string;
    print?: boolean;
    fileType?: 'jpg' | 'png';
  }) {
    /** Generate the screenshot from the provided FormData */
    await generateScreenshot({ ...this.devInstallerInfo });

    /** Save screenshot from Roku to local */
    await saveScreenshot({ directoryPath, fileName, print, fileType, ...this.devInstallerInfo });
  }

  /** Function to install a channel, by submitting a `POST` to `/plugin_install` */
  installChannel(channelLocation: string) {
    return this.driver.sideload({
      action: 'Install',
      channelLocation: channelLocation,
      ...this.devInstallerInfo,
    });
  }

  /** Function to replace a previously installed channel, by submitting a `POST` to `/plugin_install` */
  replaceChannel(channelLocation: string) {
    return this.driver.sideload({
      action: 'Replace',
      channelLocation: channelLocation,
      ...this.devInstallerInfo,
    });
  }

  /** Function to replace a previously installed channel, by submitting a `POST` to `/plugin_install` */
  deleteChannel() {
    return this.driver.sideload({
      action: 'Delete',
      channelLocation: '',
      ...this.devInstallerInfo,
    });
  }
}
