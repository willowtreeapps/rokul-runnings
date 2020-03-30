import { Driver } from './Driver';
import { sleep } from '../utils/sleep';
import {
  ElementDataObject,
  Apps,
  Params,
  AppUIResponseObject,
  Action,
  Method,
  SquashedAppUIObject,
} from '../types/RokulRunnings';
import * as FormData from 'form-data';
import * as indigestion from 'indigestion';
import axios from 'axios';
import { IncomingHttpHeaders } from 'http';
import path = require('path');
import fs = require('fs');

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
  launchTheChannel({
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
  getApps(retries = this.retries) {
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
        const response = await this.driver.getUIElement({ data, retries: httpRetries });
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
  async getElement({
    data,
    retries = this.retries,
  }: {
    data: ElementDataObject;
    delayInMillis?: number;
    retries?: number;
  }) {
    const response = await this.driver.getUIElement({ data, retries });
    return this.squashAttributes(response)[0];
  }

  /** Searches for elements on the page based on the specified locators starting from the screen root.
   * Returns information on all matching elements. */
  async getElements({
    data,
    retries = this.retries,
  }: {
    data: ElementDataObject;
    delayInMillis?: number;
    retries?: number;
  }) {
    const response = await this.driver.getUIElements({ data, retries });
    return this.squashAttributes(response);
  }

  /** Return the element on the screen that currently has focus. */
  async getFocusedElement(retries = this.retries) {
    const response = await this.driver.getActiveElement(retries);
    return this.squashAttributes(response)[0];
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
      if (Object.keys(response)[0] === tag) {
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
  }: {
    directoryPath?: string;
    fileName?: string;
    print?: boolean;
  }) {
    /** Generate the screenshot from the provided FormData */
    await this.generateScreenshot();

    /** Save screenshot from Roku to local */
    await this.saveScreenshot({ directoryPath, fileName, print });
  }

  /** Function that generates the screenshot by sending a POST to `/plugin_inspect` */
  private async generateScreenshot() {
    /** define variables */
    const endpoint = '/plugin_inspect';
    const method = 'POST';
    let formData = await this.populateFormData({ action: 'Screenshot' });
    const headers = await this.generateHeaders({
      method,
      endpoint,
      formData,
    });
    const authenticateHeader = headers['www-authenticate'];
    const authorization = indigestion.generateDigestAuth({
      authenticateHeader,
      username: this.username,
      password: this.password,
      uri: endpoint,
      method,
    });

    formData = await this.populateFormData({ action: 'Screenshot' });

    /** Execute the POST command */
    return new Promise((resolve, reject) => {
      formData.submit(
        {
          host: this.rokuIPAddress,
          path: '/plugin_inspect',
          headers: {
            Authorization: authorization,
          },
        },
        function(error, res) {
          const chunks = [];
          if (error) {
            reject(error);
          } else {
            res.on('data', data => {
              chunks.push(data);
            });
            res.on('end', () => {
              // eslint-disable-next-line dot-notation
              if (res.socket['_httpMessage']) {
                // eslint-disable-next-line dot-notation
                res.socket['_httpMessage'].writable = false;
              } else {
                res.emit('close');
              }
            });
            res.on('close', () => {
              resolve(res.statusCode);
            });
          }
        },
      );
    });
  }

  /** Function that saves the screenshot, using a `GET` request to `/pkgs/dev.jpg`. */
  private async saveScreenshot({
    directoryPath,
    fileName,
    print = false,
  }: {
    directoryPath: string;
    fileName: string;
    print: boolean;
  }) {
    /** Define variables */
    const endpoint: string = '/pkgs/dev.jpg';
    const method = 'GET';
    const headers = await this.generateHeaders({ method, endpoint });
    const authenticateHeader = headers['www-authenticate'];
    const authorization = indigestion.generateDigestAuth({
      authenticateHeader,
      username: this.username,
      password: this.password,
      uri: endpoint,
      method,
    });

    /** Define file path variables */
    const filePath = path.resolve(directoryPath, `${fileName}.jpg`);
    const writer = fs.createWriteStream(filePath);

    /** Execute the GET command */
    const response = await axios.get(`http://${this.rokuIPAddress}${endpoint}`, {
      headers: { Authorization: authorization },
      responseType: 'stream',
    });

    /** Write the response to a file */
    response.data.pipe(writer);

    /** Close the writer */
    return new Promise((resolve, reject) => {
      writer.on('finish', function() {
        writer.end();
        if (print) console.log(`Saved at ${directoryPath}/${fileName}.jpg`);
        resolve();
      });
      writer.on('error', reject);
    });
  }

  /** Function to install a channel, by submitting a `POST` to `/plugin_install` */
  installChannel(channelLocation: string) {
    return this.sideload({
      action: 'Install',
      channelLocation: channelLocation,
    });
  }

  /** Function to replace a previously installed channel, by submitting a `POST` to `/plugin_install` */
  replaceChannel(channelLocation: string) {
    return this.sideload({
      action: 'Replace',
      channelLocation: channelLocation,
    });
  }

  /** Function to replace a previously installed channel, by submitting a `POST` to `/plugin_install` */
  deleteChannel() {
    return this.sideload({
      action: 'Delete',
      channelLocation: '',
    });
  }

  /** Function to communicate with the Roku device, by submitting a `POST` to `/plugin_install` */
  private async sideload({ action, channelLocation }: { action: Action; channelLocation: string }) {
    /** Define variables */
    const endpoint = '/plugin_install';
    const method = 'POST';
    /** Generate FormData */
    let formData = await this.populateFormData({ action, channelLocation });
    /** Generate a Digest Authentication string */
    const headers = await this.generateHeaders({
      method,
      endpoint,
      formData,
    });
    let attempts = 0;
    // eslint-disable-next-line no-unmodified-loop-condition
    while (headers === undefined && attempts < 8) {
      await sleep(250);
      attempts++;
    }
    const authenticateHeader = headers['www-authenticate'];
    const authorization = indigestion.generateDigestAuth({
      authenticateHeader,
      username: this.username,
      password: this.password,
      uri: endpoint,
      method,
    });

    /** Regenerate FormData */
    formData = await this.populateFormData({ action, channelLocation });

    /** Execute POST */
    return new Promise((resolve, reject) => {
      formData.submit(
        {
          host: this.rokuIPAddress,
          path: endpoint,
          headers: {
            Authorization: authorization,
            Connection: 'Close',
          },
        },
        function(error, res) {
          const chunks = [];
          if (error) {
            reject(error);
          } else {
            res.on('data', data => {
              chunks.push(data);
            });
            res.on('end', () => {
              // eslint-disable-next-line dot-notation
              if (res.socket['_httpMessage']) {
                // eslint-disable-next-line dot-notation
                res.socket['_httpMessage'].writable = false;
              } else {
                res.emit('close');
              }
            });
            res.on('close', () => {
              resolve(res.statusCode);
            });
          }
        },
      );
    });
  }

  /** Function to generate auth headers */
  private generateHeaders({
    method,
    endpoint,
    formData,
  }: {
    method: Method;
    endpoint: string;
    formData?: FormData;
  }): Promise<IncomingHttpHeaders> {
    /** If executing a GET */
    if (method === 'GET') {
      return this.generateGetHeaders(`http://${this.rokuIPAddress}${endpoint}`);
    } else {
      /** If executing a POST */
      return this.generatePostHeaders({
        endpoint: endpoint,
        formData: formData,
      });
    }
  }

  /** Function to return headers for a GET request */
  private async generateGetHeaders(url: string): Promise<IncomingHttpHeaders> {
    try {
      const result = await axios.get(url);
      return result.headers;
    } catch (error) {
      if (error.response) {
        if (error.response.status !== 401) console.error(error);
        else return error.response.headers;
      }
    }
  }

  /** Function to return headers for a POST request */
  private async generatePostHeaders({
    endpoint,
    formData,
  }: {
    endpoint: string;
    formData: FormData;
  }): Promise<IncomingHttpHeaders> {
    try {
      const result = await axios.post(`http://${this.rokuIPAddress}${endpoint}`, formData, {
        headers: formData.getHeaders(),
      });
      return result.headers;
    } catch (error) {
      if (error.response) {
        if (error.response.status !== 401) throw error;
        else {
          return error.response.headers;
        }
      }
    }
  }

  /** Function to create FormData */
  private populateFormData({
    action,
    channelLocation,
  }: {
    action: Action;
    channelLocation?: string;
  }): Promise<FormData> {
    return new Promise(resolve => {
      /** Declare variable */
      const formData = new FormData();
      /** Append data for `mysubmit` */
      formData.append('mysubmit', action);
      /** Append data depending on `mysubmit` value */
      if (action === 'Install' || action === 'Replace') {
        const file = fs.createReadStream(channelLocation);
        const fileNameArray = channelLocation.split('/');
        const fileName = fileNameArray[fileNameArray.length - 1];
        formData.append('archive', file, {
          contentType: 'application/zip',
          filename: fileName,
        });
      } else formData.append('archive', '');

      /** Return the FormData */
      resolve(formData);
    });
  }

  private squashAttributes(responseObject: AppUIResponseObject[]) {
    const elementsArray: SquashedAppUIObject[] = [];
    responseObject.forEach(element => {
      const elementName = Object.keys(element)[0];
      const childElement = element[elementName] as AppUIResponseObject;
      elementsArray.push({ [elementName]: childElement.attributes } as SquashedAppUIObject);
    });
    return elementsArray;
  }
}
