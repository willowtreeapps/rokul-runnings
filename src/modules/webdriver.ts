import { elementDataObject, Apps, attributeObject, elementsResponseObject, paramObject } from '../types/webdriver';
import * as http from '../utils/http';
import * as sleep from '../utils/sleep';
import * as xmljs from 'xml-js';

export class WebDriver {
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

  /** Custom settings for parsing the XML responses to JSON */
  xmlToJsonOptions = {
    compact: true,
    attributesKey: 'attributes',
    textKey: 'text',
    declarationKey: 'declaration',
  };

  /** Custom parser turning XML responses from Roku into JSON */
  parser(response: string) {
    if (!response.startsWith('Request Failed with an error code of:')) {
      return xmljs.xml2js(response, this.xmlToJsonOptions);
    } else {
      throw Error(response);
    }
  }

  /** Specific formatting for responses from the `/query/apps` and `/query/active-app` calls
   *  Expected to be used in the following way: `this.jsonFormatterApps(this.parser(responseToParse))`
   */
  jsonFormatterApps(responseObject: any) {
    const responseArray = responseObject.apps ? responseObject.apps.app : [responseObject['active-app'].app];
    const newResponseObject: Apps = {};
    for (let i = 0; i < responseArray.length; i++) {
      const text = responseArray[i].text;
      const attribute = responseArray[i].attributes;
      newResponseObject[text] = attribute;
    }

    if (responseObject.apps) {
      responseObject.apps = newResponseObject;
    } else {
      responseObject['active-app'] = newResponseObject;
    }

    return newResponseObject;
  }

  /** Specific formatting for responses from the `/query/media-player` call
   *  Expected to be used in the following way: `this.jsonFormatterMediaPlayer(this.parser(responseToParse))`
   */
  jsonFormatterMediaPlayer(responseObject: any) {
    const player = responseObject.player;
    Object.keys(player).forEach(key => {
      if (Object.keys(player[key]).length === 1) {
        player[key] = player[key][Object.keys(player[key])[0]];
      }
    });
    return player;
  }

  /** Retrieves information about the specified session. */
  async getDeviceInfo(retries: number) {
    const url = this.queryUrl('device-info');
    const response = await http.baseGET({ url, retries });
    return this.parser(response);
  }

  /** Retrieves information about the Roku media player. */
  async getPlayerInfo(retries: number) {
    const url = this.queryUrl('media-player');
    const response = await http.baseGET({ url, retries });
    return this.jsonFormatterMediaPlayer(this.parser(response));
  }

  /** Retrives the list of installed channels */
  async getApps(retries: number) {
    const url = this.queryUrl('apps');
    const response = await http.baseGET({ url, retries });
    return this.jsonFormatterApps(this.parser(response));
  }

  /** Returns information about the channel currently loaded on the device. */
  async getCurrentApp(retries: number) {
    const url = this.queryUrl('active-app');
    const response = await http.baseGET({ url, retries });
    return this.jsonFormatterApps(this.parser(response));
  }

  /** Gets the current screen source.
   * The version of this in the automated-channel-testing library returns a base64 encoded string which can be turned into an XML of the entire screen
   * Because this library already formats XML into JSON, this function will just pass the parsed JSON
   */
  async getScreenSource(retries: number) {
    const url = this.queryUrl('app-ui');
    const response = await http.baseGET({ url, retries });
    return this.parser(response);
  }

  /** Launches the specified channel. Most likely this will be 'dev'.
   * This command often executes much faster than the actual channel appearing
   * To avoid timing issues, consider using the `sleepsAfterLaunch` and `sleepTimeInMillis` parameters.
   */
  async sendLaunchChannel({
    channelCode = 'dev',
    retries,
    sleepsAfterLaunch = false,
    sleepTimeInMillis = 2000,
    params,
  }: {
    channelCode?: string;
    retries: number;
    sleepsAfterLaunch?: boolean;
    sleepTimeInMillis?: number;
    params: paramObject;
  }) {
    const url = `${this.baseURL}/launch/${channelCode}`;
    const response = await http.basePOST({ url, params, retries });
    if (sleepsAfterLaunch) await sleep.sleep(sleepTimeInMillis);
    // Responses do not contain a response body, so response is just the status code. Anything in the 200's is considered successful.
    return response;
  }

  /**
   * Installs the specified channel
   * Can't be used to sideload a channel
   */
  async sendInstallChannel({
    channelCode,
    retries,
    params,
  }: {
    channelCode: string;
    retries: number;
    params: paramObject;
  }) {
    const url = `${this.baseURL}/install/${channelCode}`;
    const response = await http.basePOST({ url, params, retries });
    // Responses do not contain a response body, so response is just the status code. Anything in the 200's is considered successful.
    return response;
  }

  /** Simulates the press and release of the specified key. */
  async sendKeypress({ keyPress, retries, params }: { keyPress: string; retries: number; params: paramObject }) {
    const url = `${this.baseURL}/keypress/${keyPress}`;
    const response = await http.basePOST({ url, retries, params });
    // Responses do not contain a response body, so response is just the status code. Anything in the 200's is considered successful.
    return response;
  }

  /** Sends a sequence of keys to be input by the device */
  async sendSequence({ sequence, retries, params }: { sequence: string[]; retries: number; params: paramObject }) {
    const responseArray: { [key: string]: number }[] = [];
    sequence.forEach(async press => {
      const url = `${this.baseURL}/keypress/${press}`;
      const response = await http.basePOST({ url, params, retries });
      responseArray.push({ [press]: response });
    });
    // Responses do not contain a response body, so responseArray is an array of status codes. Anything in the 200's is considered successful
    return responseArray;
  }

  /** Finds all elements that match the specified search terms */
  matchElements(searchElements: elementDataObject, actualElement: elementsResponseObject, elementName: string) {
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
            foundElements.push(
              ...this.matchElements(searchElements, actualElement[key] as elementsResponseObject, key),
            );
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
    searchElements: elementDataObject;
    actualElement?: attributeObject;
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
  async getUIElement({ data, retries }: { data: elementDataObject; retries: number }) {
    const url = this.queryUrl('app-ui');
    const response = await http.baseGET({ url, retries });
    const jsonResponse = this.parser(response);
    const elements = jsonResponse['app-ui'].topscreen.screen.AppScene;

    const foundElements = this.matchElements(data, elements, 'AppScene');

    // Return the first element in the foundElements array
    return [foundElements[0]];
  }

  /** Searches for elements on the page matching the search criteria, starting from the screen root. All the matching elements will be returned in a WebElement JSON object. */
  async getUIElements({ data, retries }: { data: elementDataObject; retries: number }) {
    const url = this.queryUrl('app-ui');
    const response = await http.baseGET({ url, retries });
    const jsonResponse = this.parser(response);
    const elements = jsonResponse['app-ui'].topscreen.screen.AppScene;

    const foundElements = this.matchElements(data, elements, 'AppScene');

    return foundElements;
  }

  /** Retrieves the element on the page that currently has focus. */
  async getActiveElement(retries: number) {
    return this.getUIElement({ data: { using: 'attr', attribute: 'focusItem', value: '0' }, retries });
  }
}
