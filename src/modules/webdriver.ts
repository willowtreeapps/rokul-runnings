import {
  getCurrentAppResponse,
  getElementResponse,
  getElementsResponse,
  deleteSessionResponse,
  getAllSessionsResponse,
  sessionsResponse,
  getPlayerInfoResponse,
  getAllAppsResponse,
  getScreenSourceResponse,
  nullValueResponse,
  elementDataObject,
  getFocusedElementResponse,
  errorResponse,
} from '../types/webdriver';
import * as http from '../utils/http';
import * as sleep from '../utils/sleep';

export class WebDriver {
  constructor(
    public rokuIPAddress: string,
    public timeoutInMillis = 20000,
    public pressDelayInMillis = 2000,
    public sessionId = '',
    public baseURL = 'http://localhost:9000/v1',
  ) {
    this.rokuIPAddress = rokuIPAddress;
    this.timeoutInMillis = timeoutInMillis;
    this.pressDelayInMillis = pressDelayInMillis;
    this.sessionId = sessionId;
    this.baseURL = baseURL;
  }

  /** Creates a standard request body to be used in requests */
  buildRequestBody(additionalParams = {}) {
    return {
      ip: this.rokuIPAddress,
      timeout: this.timeoutInMillis,
      pressDelay: this.pressDelayInMillis,
      ...additionalParams,
    };
  }

  /** Creates the URL to which the request will be sent
   * Note: the WebDriverServer interprets `baseURL/session/{sessionId}` as distinct from `baseURL/session/{sessionId}/`
   * Because of this, we allow a string of one whitespace character to be passed in.
   * Interestingly enough, WebDriverServer does not interpret `baseURL/session/{sessionId}` as distinct from `baseURL/session/{sessionId} `
   */
  async buildURL(command = ''): Promise<string> {
    if (!command) return `${this.baseURL}/session`;
    else if (!this.sessionId) {
      this.sessionId = await this.createNewSession(1);
    }
    return Promise.resolve(`${this.baseURL}/session/${this.sessionId}${command}`);
  }

  /**
   * Creates a new session, returning the sessionId to create the 'base' URL for the session
   * If a session already exists for a specified IP address, that sessionId is used
   */
  async createNewSession(retries: number) {
    const url = await this.buildURL();
    const sessionsResponse = await this.getAllSessions(retries);
    if (sessionsResponse !== null) {
      for (let i = 0; i < sessionsResponse.length; i++) {
        if (sessionsResponse[i].value.ip === this.rokuIPAddress) {
          return sessionsResponse[i].sessionId;
        }
      }
    } else {
      const requestBody = this.buildRequestBody();
      const response = await http.basePOST<sessionsResponse>({ url, requestBody, retries });
      return response.body.sessionId;
    }
  }

  /** Returns all active sessions from the WebDriverServer */
  async getAllSessions(retries: number) {
    let url = await this.buildURL();
    url = `${url}s`;
    const response = await http.baseGET<getAllSessionsResponse>({ url, retries });
    return response.body;
  }

  /** Retrieves information about the specified session. */
  async getDeviceInfo(retries: number) {
    const url = await this.buildURL(' ');
    const response = await http.baseGET<sessionsResponse>({ url, retries });
    return response.body.value;
  }

  /** Retrieves information about the Roku media player. */
  async getPlayerInfo(retries: number) {
    const url = await this.buildURL('/player');
    const response = await http.baseGET<getPlayerInfoResponse>({ url, retries });
    return response.body.value;
  }

  /** Retrieves information about the Roku media player, allowing for non-200 responses */
  async getPlayerInfoError(retries: number) {
    const url = await this.buildURL('/player');
    const response = await http.baseGET<getPlayerInfoResponse | errorResponse>({ url, errorAllowed: true, retries });
    return response;
  }

  /** Returns a list of channels installed on the device. */
  async getApps(retries: number) {
    const url = await this.buildURL('/apps');
    const response = await http.baseGET<getAllAppsResponse>({ url, retries });
    return response.body;
  }

  /** Returns information about the channel currently loaded on the device. */
  async getCurrentApp(retries: number) {
    const url = await this.buildURL('/current_app');
    const response = await http.baseGET<getCurrentAppResponse>({ url, retries });
    return response.body.value;
  }

  /** Gets the current screen source. */
  async getScreenSource(retries: number) {
    const url = await this.buildURL('/source');
    const response = await http.baseGET<getScreenSourceResponse>({ url, retries });
    return response;
  }

  /** Launches the specified channel. Most likely this will be 'dev'.
   * Note: this command often executes much faster than the actual channel appearing
   * To avoid timing issues, consider using the `sleepsAfterLaunch` and `sleepTimeInMillis` parameters.
   */
  async sendLaunchChannel({
    channelCode = 'dev',
    retries,
    sleepsAfterLaunch = false,
    sleepTimeInMillis = 2000,
  }: {
    channelCode?: string;
    retries: number;
    sleepsAfterLaunch?: boolean;
    sleepTimeInMillis?: number;
  }) {
    const requestBody = this.buildRequestBody({ channelId: channelCode });
    const url = await this.buildURL('/launch');
    const response = await http.basePOST<nullValueResponse>({ url, requestBody, retries });
    if (sleepsAfterLaunch) await sleep.sleep(sleepTimeInMillis);
    return response;
  }

  /**
   * Installs the specified channel
   * Can't be used to sideload a channel
   */
  async sendInstallChannel({ channelCode, retries }: { channelCode: string; retries: number }) {
    const requestBody = this.buildRequestBody({ channelId: channelCode });
    const url = await this.buildURL('/install');
    const response = await http.basePOST<nullValueResponse>({ url, requestBody, retries });
    return response;
  }

  /** Sends a sequence of keys to be input by the device */
  async sendSequence({ sequence, retries }: { sequence: string[]; retries: number }) {
    const requestBody = this.buildRequestBody({ button_sequence: sequence });
    const url = await this.buildURL('/press');
    const response = await http.basePOST<nullValueResponse>({ url, requestBody, retries });
    return response;
  }

  /** Searches for an element on the page, starting from the screen root. The first located element will be returned as a WebElement JSON object. */
  async getUIElement({ data, retries }: { data: elementDataObject; retries: number }) {
    const requestBody = this.buildRequestBody({ elementData: [data] });
    const url = await this.buildURL('/element');
    const response = await http.basePOST<getElementResponse>({ url, requestBody, retries });
    return response.body;
  }

  /**
   * Searches for an element on the page, starting from the screen root. The first located element will be returned as a WebElement JSON object.
   * Allows for returning a non-200 response
   */
  async getUIElementError({ data, retries }: { data: elementDataObject; retries: number }) {
    const requestBody = this.buildRequestBody({ elementData: [data] });
    const url = await this.buildURL('/element');
    const response = await http.basePOST<getElementResponse | errorResponse>({
      url,
      requestBody,
      errorAllowed: true,
      retries,
    });
    return response;
  }

  /** Configure the amount of time that an operation can be executed before it is aborted. */
  async setTimeouts({
    timeoutType,
    delayInMillis,
    retries,
  }: {
    timeoutType: string;
    delayInMillis: number;
    retries: number;
  }) {
    const requestBody = this.buildRequestBody({
      type: timeoutType,
      ms: delayInMillis,
    });
    const url = await this.buildURL('/timeouts');
    const response = await http.basePOST<nullValueResponse>({ url, requestBody, retries });
    return response;
  }

  /** Searches for elements on the page matching the search criteria, starting from the screen root. All the matching elements will be returned in a WebElement JSON object. */
  async getUIElements({ data, retries }: { data: elementDataObject; retries: number }) {
    const requestBody = this.buildRequestBody({ elementData: [data] });
    const url = await this.buildURL('/elements');
    const response = await http.basePOST<getElementsResponse>({ url, requestBody, retries });
    return response.body.value;
  }

  /** Simulates the press and release of the specified key. */
  async sendKeypress({ keyPress, retries }: { keyPress: string; retries: number }) {
    const requestBody = this.buildRequestBody({ button: keyPress });
    const url = await this.buildURL('/press');
    const response = await http.basePOST<nullValueResponse>({ url, requestBody, retries });
    return response.body;
  }

  /** Retrieves the element on the page that currently has focus. */
  async getActiveElement(retries: number) {
    const url = await this.buildURL('/element/active');
    const response = await http.basePOST<getFocusedElementResponse>({ url, requestBody: {}, retries });
    return response.body;
  }

  /** Deletes the session specified in the URL path. */
  async quiet() {
    const url = await this.buildURL(' ');
    const response = await http.baseDELETE<deleteSessionResponse>(url);
    return response;
  }
}
