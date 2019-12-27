import http = require("../utils/http");
import sleep = require("../utils/sleep");
import { isArray } from "util";
import {
  getCurrentAppResponse,
  getElementResponse,
  getElementsResponse,
  deleteSessionResponse,
  getAllSessionsResponse,
  sessionsResponse,
  getPlayerInfoResponse,
  getAllAppsResponse,
  getScreenSrouceResponse,
  nullValueResponse,
  elementDataObject,
  getFocusedElementResponse,
  errorResponse
} from "../types/webdriver";

export const BASE_URL = "http://localhost:9000/v1";

export class WebDriver {
  constructor(
    public rokuIPAddress: string,
    public timeoutInMillis: Number = 20000,
    public pressDelayInMillis: Number = 2000,
    private sessionId: string = ""
  ) {
    this.rokuIPAddress = rokuIPAddress;
    this.timeoutInMillis = timeoutInMillis;
    this.pressDelayInMillis = pressDelayInMillis;
    this.sessionId = sessionId;
  }

  /**
   * Creates a standard request body to be used in requests
   *
   * @param {object} additionalParams Additional json objects to be included in the request body
   */
  buildRequestBody(additionalParams: object = {}) {
    return {
      ip: this.rokuIPAddress,
      timeout: this.timeoutInMillis,
      pressDelay: this.pressDelayInMillis,
      ...additionalParams
    };
  }

  /**
   * Creates the URL to which the request will be sent
   *
   * @param {string} command The endpoint to be reached, nullable
   */
  async buildURL(command: string): Promise<string> {
    if (!command) return `${BASE_URL}/session`;
    else {
      if (!this.sessionId) {
        this.sessionId = await this.createNewSession();
      }
    }
    return Promise.resolve(`${BASE_URL}/session/${this.sessionId}${command}`);
  }

  /**
   * Creates a new session, returning the sessionId to create the 'base' URL for the session
   * If a session already exists for a specified IP address, that sessionId is used
   */
  async createNewSession() {
    const url = await this.buildURL("");
    const sessionsResponse = await this.getAllSessions();
    if (sessionsResponse !== null) {
      for (let i = 0; i < sessionsResponse.length; i++) {
        if (sessionsResponse[i].value.ip === this.rokuIPAddress) {
          return sessionsResponse[i].sessionId;
        }
      }
    } else {
      const requestBody = this.buildRequestBody();
      const response = await http.basePOST<sessionsResponse>(url, requestBody);
      return response.body.sessionId;
    }
  }

  //GET

  async getAllSessions() {
    let url = await this.buildURL("");
    url = `${url}s`;
    const response = await http.baseGET<getAllSessionsResponse>(url);
    return response.body;
  }

  /**
   * Retrieves information about the specified session.
   */
  async getDeviceInfo() {
    const url = await this.buildURL(" ");
    const response = await http.baseGET<sessionsResponse>(url);
    return response.body.value;
  }

  /**
   * Retrieves information about the Roku media player.
   */
  async getPlayerInfo() {
    const url = await this.buildURL("/player");
    const response = await http.baseGET<getPlayerInfoResponse>(url);
    return response.body.value;
  }

  async getPlayerInfoError() {
    const url = await this.buildURL("/player");
    const response = await http.baseGET<getPlayerInfoResponse | errorResponse>(
      url,
      true
    );
    return response;
  }

  /**
   * Returns a list of channels installed on the device.
   */
  async getApps() {
    const url = await this.buildURL("/apps");
    const response = await http.baseGET<getAllAppsResponse>(url);
    return response.body;
  }

  /**
   * Returns information about the channel currently loaded on the device.
   */
  async getCurrentApp() {
    const url = await this.buildURL("/current_app");
    const response = await http.baseGET<getCurrentAppResponse>(url);
    return response.body.value;
  }

  /**
   * Gets the current screen source.
   */
  async getScreenSource() {
    const url = await this.buildURL("/source");
    const response = await http.baseGET<getScreenSrouceResponse>(url);
    return response;
  }

  //POST

  /**
   * Launches the specified channel. Most likely this will be 'dev'.
   *
   * @param {string} channelCode The ID of the channel to be launched
   */
  async sendLaunchChannel(channelCode: string) {
    const requestBody = this.buildRequestBody({ channelId: channelCode });
    const url = await this.buildURL("/launch");
    const response = await http.basePOST<nullValueResponse>(url, requestBody);
    await sleep.sleep(2000);
    return response;
  }

  /**
   * Installs the specified channel
   *
   * @param {string} channelCode The ID of the channel to be installed
   */
  async sendInstallChannel(channelCode: string) {
    const requestBody = this.buildRequestBody({ channelId: channelCode });
    const url = await this.buildURL("/install");
    const response = await http.basePOST<nullValueResponse>(url, requestBody);
    return response;
  }

  /**
   * Sends a sequence of keys to be input by the device
   *
   * @param {string[]} sequence An array containing the sequence of keys to be pressed and released
   */
  async sendSequence(sequence: string[]) {
    const requestBody = this.buildRequestBody({ button_sequence: sequence });
    const url = await this.buildURL("/press");
    const response = await http.basePOST<nullValueResponse>(url, requestBody);
    return response;
  }

  /**
   * Searches for an element on the page, starting from the screen root. The first located element will be returned as a WebElement JSON object.
   *
   * @param {elementDataObject} data An elementData array and optional parentData array with the following objects that can be used to locate an element:
   *                            using - {string}: The locator strategy to use. This may be one of the following values:
   *                              text: Returns an element whose text matches the search value.
   *                              attr: Returns an element whose specified attributes matches the search value.
   *                              tag: Returns an element whose tag name matches the search value.
   *                            value - {string}: The search target.
   *                            attribute - {string}: The attribute name (optional, used only for "attr" strategy)
   * @param {boolean} errorAllowed Determines if the response is checked, default to false
   */
  async getUIElement(data: elementDataObject) {
    const requestBody = this.buildRequestBody({ elementData: [data] });
    const url = await this.buildURL("/element");
    const response = await http.basePOST<getElementResponse>(url, requestBody);
    return response.body;
  }

  async getUIElementError(data: elementDataObject) {
    const requestBody = this.buildRequestBody({ elementData: [data] });
    const url = await this.buildURL("/element");
    const response = await http.basePOST<getElementResponse | errorResponse>(
      url,
      requestBody,
      true
    );
    return response;
  }

  /**
   * Configure the amount of time that an operation can be executed before it is aborted.
   *
   * @param {string} timeoutType Either "implicit" (ECP commands) or "pressDelay" (delay between press cmd execution)
   * @param {Number} delayInMillis The amount of time that time-limited commands are permitted to run.
   */
  async setTimeouts(timeoutType: string, delayInMillis: number) {
    const requestBody = this.buildRequestBody({
      type: timeoutType,
      ms: delayInMillis
    });
    const url = await this.buildURL("/timeouts");
    const response = await http.basePOST<nullValueResponse>(url, requestBody);
    return response;
  }

  /**
   * Searches for elements on the page matching the search criteria, starting from the screen root. All the matching elements will be returned in a WebElement JSON object.
   *
   * @param {elementDataObject} data An elementData array and optional parentData array with the following objects that can be used to locate an element:
   *                              using - {string}: The locator strategy to use. This may be one of the following values:
   *                                text: Returns an element whose text matches the search value.
   *                                attr: Returns an element whose specified attributes matches the search value.
   *                                tag: Returns an element whose tag name matches the search value.
   *                              value - {string}: The search target.
   *                              attribute - {string}: The attribute name (optional, used only for "attr" strategy)
   */
  async getUIElements(data: elementDataObject) {
    const requestBody = this.buildRequestBody({ elementData: [data] });
    const url = await this.buildURL("/elements");
    const response = await http.basePOST<getElementsResponse>(url, requestBody);
    return response.body.value;
  }

  /**
   * Simulates the press and release of the specified key.
   *
   * @param {string} keyPress The name of the key to be pressed ("home", "up", "down", "left", "right").
   */
  async sendKeypress(keyPress: string) {
    const requestBody = this.buildRequestBody({ button: keyPress });
    const url = await this.buildURL("/press");
    const response = await http.basePOST<nullValueResponse>(url, requestBody);
    return response.body;
  }

  /**
   * Retrieves the element on the page that currently has focus.
   */
  async getActiveElement() {
    const url = await this.buildURL("/element/active");
    const response = await http.basePOST<getFocusedElementResponse>(url, {});
    return response.body;
  }

  //DELETE

  /**
   * Deletes the session specified in the URL path.
   */
  async quiet() {
    const url = await this.buildURL(" ");
    const response = await http.baseDELETE<deleteSessionResponse>(url);
    return response;
  }
}
