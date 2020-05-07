import { ElementDataObject, XMLAttributes, AppUIResponseObject, Params, Action } from '../types/RokulRunnings';
import * as http from '../utils/http';
import { sleep } from '../utils/sleep';
import { Buttons } from './RokulRunnings';
import { populateFormData } from '../utils/formData';
import * as indigestion from 'indigestion';
import { generateHeaders } from '../utils/authHeaders';
import { jsonFormatterDeviceInfo, jsonFormatterMediaPlayer, jsonFormatterApps } from '../utils/formatters';
import { xmlParser as parser } from '../utils/xmlParser';

export class Driver {
  constructor(public rokuIPAddress: string, public retries: number) {
    this.rokuIPAddress = rokuIPAddress;
    this.retries = retries;
  }

  /** Interaction with the Roku occurs at the Roku's IP on port 8060 */
  baseURL = `http://${this.rokuIPAddress}:8060`;

  /** All GET requests begin with `/query` */
  queryUrl(endpoint: string) {
    return `${this.baseURL}/query/${endpoint}`;
  }

  /** Retrieves information about the specified session. */
  async getDeviceInfo(retries: number) {
    const url = this.queryUrl('device-info');
    const response = await http.baseGET({ url, retries });
    return jsonFormatterDeviceInfo(parser(response));
  }

  /** Retrieves information about the Roku media player. */
  async getPlayerInfo(retries: number) {
    const url = this.queryUrl('media-player');
    const response = await http.baseGET({ url, retries });
    return jsonFormatterMediaPlayer(parser(response));
  }

  /** Retrives the list of installed channels */
  async getApps(retries: number) {
    const url = this.queryUrl('apps');
    const response = await http.baseGET({ url, retries });
    return jsonFormatterApps(parser(response));
  }

  /** Returns information about the channel currently loaded on the device. */
  async getCurrentApp(retries: number) {
    const url = this.queryUrl('active-app');
    const response = await http.baseGET({ url, retries });
    return jsonFormatterApps(parser(response));
  }

  /** Gets the current screen source.
   * The version of this in the automated-channel-testing library returns a base64 encoded string which can be turned into an XML of the entire screen
   * Because this library already formats XML into JSON, this function will just pass the parsed JSON
   */
  async getScreenSource(retries: number) {
    const url = this.queryUrl('app-ui');
    const response = await http.baseGET({ url, retries });
    return parser(response);
  }

  /** Launches the specified channel. Most likely this will be 'dev'.
   * This command often executes much faster than the actual channel appearing
   * To avoid timing issues, consider using the `sleepsAfterLaunch` and `sleepTimeInMillis` parameters.
   */
  async sendLaunchChannel({
    channelCode = 'dev',
    contentId,
    mediaType,
    retries,
    sleepsAfterLaunch = false,
    sleepTimeInMillis = 2000,
    params,
    deepLink = false,
  }: {
    channelCode?: string;
    contentId: string;
    mediaType: string;
    retries: number;
    sleepsAfterLaunch?: boolean;
    sleepTimeInMillis?: number;
    params: Params;
    deepLink?: boolean;
  }) {
    const endpoint = deepLink ? 'input' : 'launch';
    let url = `${this.baseURL}/${endpoint}/${channelCode}`;
    if (contentId) {
      url = `${url}?contentId=${contentId}`;
    }
    if (mediaType) {
      url = `${url}?mediaType=${mediaType}`;
    }
    const response = await http.basePOST({ url, params, retries });
    if (sleepsAfterLaunch) await sleep(sleepTimeInMillis);
    // Responses do not contain a response body, so response is just the status code. Anything in the 200's is considered successful.
    return response;
  }

  async deepLink({
    channelCode = 'dev',
    contentId,
    mediaType,
    retries,
    sleepsAfterLaunch = false,
    sleepTimeInMillis = 2000,
    params,
  }: {
    channelCode?: string;
    contentId: string;
    mediaType: string;
    retries: number;
    sleepsAfterLaunch?: boolean;
    sleepTimeInMillis?: number;
    params: Params;
  }) {
    return this.sendLaunchChannel({
      channelCode,
      contentId,
      mediaType,
      retries,
      sleepsAfterLaunch,
      sleepTimeInMillis,
      params,
      deepLink: true,
    });
  }

  /**
   * Installs the specified channel
   * Can't be used to sideload a channel
   */
  async sendInstallChannel({ channelCode, retries, params }: { channelCode: string; retries: number; params: Params }) {
    const url = `${this.baseURL}/install/${channelCode}`;
    const response = await http.basePOST({ url, params, retries });
    // Responses do not contain a response body, so response is just the status code. Anything in the 200's is considered successful.
    return response;
  }

  async sendKey({ keyType, key, retries, params }: { keyType: string; key: string; retries: number; params: Params }) {
    const url = `${this.baseURL}/key${keyType}/${key}`;
    const response = await http.basePOST({ url, retries, params });
    // Responses do not contain a response body, so response is just the status code. Anything in the 200's is considered successful.
    return response;
  }

  /** Sends a sequence of keys to be input by the device */
  async sendSequence({
    sequence,
    delayInMillis,
    retries,
    params,
  }: {
    sequence: ({ up: string | Buttons } | { down: string | Buttons } | { press: string | Buttons })[];
    delayInMillis: number;
    retries: number;
    params: Params;
  }) {
    const responseArray: { [key: string]: number }[] = [];
    for (let i = 0; i < sequence.length; i++) {
      const keyObject = sequence[i];
      if (Object.keys(keyObject).length === 1) {
        const keyValue = Object.keys(keyObject)[0];
        const response = await this.sendKey({ keyType: keyValue, key: keyObject[keyValue], retries, params });
        await sleep(delayInMillis);
        responseArray.push({ [`${keyValue}:${keyObject[keyValue]}`]: response });
      } else {
        throw Error(
          'Sequence is not formatted correctly. Sequence should be an array of objects, with each object containing one key of either up, down, or press',
        );
      }
    }
    // Responses do not contain a response body, so responseArray is an array of status codes. Anything in the 200's is considered successful
    return responseArray;
  }

  /** Finds all elements that match the specified search terms */
  matchElements(searchElements: ElementDataObject, actualElement: AppUIResponseObject, elementName: string) {
    const foundElements = [];
    // Iterate over each key in the passed in element
    for (const key of Object.keys(actualElement)) {
      if (typeof actualElement[key] === 'object') {
        if (Array.isArray(actualElement[key])) {
          const elementArray = actualElement[key];
          for (let i = 0; i < elementArray.length; i++) {
            // If `actualElement[key]` is an Array object, each element needs to be iterated over
            foundElements.push(...this.matchElements(searchElements, actualElement[key][i], key));
          }
        } else {
          if (key === 'attributes' && this.checkElements({ searchElements, actualElement: actualElement[key] })) {
            // This covers the cases where `searchElements.using` === 'text' or 'attribute'
            foundElements.push({ [elementName]: actualElement });
          } else if (key !== 'attributes' && this.checkElements({ searchElements, elementTag: key })) {
            // This covers the case where `searchElements.using` === 'tag'
            foundElements.push({ [key]: actualElement[key] });
          } else {
            // If the above conditions are not met, then the element needs to be passed through this function
            foundElements.push(...this.matchElements(searchElements, actualElement[key] as AppUIResponseObject, key));
          }
        }
      }
    }

    return foundElements;
  }

  /** Determines if a singular element matches the search criteria */
  checkElements({
    searchElements,
    actualElement = {},
    elementTag = '',
  }: {
    searchElements: ElementDataObject;
    actualElement?: XMLAttributes;
    elementTag?: string;
  }) {
    if (searchElements.using === 'text' && actualElement.text) {
      return searchElements.value === actualElement.text;
    } else if (searchElements.using === 'attr' && actualElement[searchElements.attribute]) {
      return searchElements.value === actualElement[searchElements.attribute];
    } else if (searchElements.using === 'tag') {
      return searchElements.value === elementTag;
    } else {
      return false;
    }
  }

  /** Searches for an element on the page, starting from the screen root. The first located element will be returned as a WebElement JSON object. */
  async getUIElement({ data, retries }: { data: ElementDataObject; retries: number }) {
    const elements = await this.getUIElements({ data, retries });
    return [elements[0]];
  }

  /** Searches for elements on the page matching the search criteria, starting from the screen root. All the matching elements will be returned in a WebElement JSON object. */
  async getUIElements({ data, retries }: { data: ElementDataObject; retries: number }) {
    const url = this.queryUrl('app-ui');
    const response = await http.baseGET({ url, retries });
    const jsonResponse = parser(response);
    const screen = jsonResponse['app-ui'].topscreen.screen;
    let sceneName: string;
    let elements: AppUIResponseObject;
    // required to find the root scene
    for (const key of Object.keys(screen)) {
      const value = screen[key];
      if (key === 'Scene' || (value.attributes && value.attributes.extends === 'Scene')) {
        elements = value;
        sceneName = key;
        break;
      }
    }
    if (!sceneName || !elements) {
      throw new Error('Cannot find root Scene component');
    }
    const foundElements = this.matchElements(data, elements, sceneName);

    return foundElements;
  }

  /** Retrieves the element on the page that currently has focus. */
  async getActiveElement(retries: number) {
    return this.getUIElement({ data: { using: 'attr', attribute: 'focusItem', value: '0' }, retries });
  }

  /** Function to communicate with the Roku device, by submitting a `POST` to `/plugin_install` */
  async sideload({
    action,
    channelLocation,
    username,
    password,
    rokuIPAddress,
  }: {
    action: Action;
    channelLocation: string;
    username: string;
    password: string;
    rokuIPAddress: string;
  }) {
    /** Define variables */
    const endpoint = '/plugin_install';
    const address = `${rokuIPAddress}${endpoint}`;
    const method = 'POST';
    /** Generate FormData */
    let formData = await populateFormData({ action, channelLocation });
    /** Generate a Digest Authentication string */
    const headers = await generateHeaders({
      method,
      address,
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
      username,
      password,
      uri: endpoint,
      method,
    });

    /** Regenerate FormData */
    formData = await populateFormData({ action, channelLocation });

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
}
