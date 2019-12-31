import FormData = require("form-data");
import fs = require("fs");
import path = require("path");
import axios from "axios";
import md5 = require("md5");
import { IncomingHttpHeaders } from "http";
import { Stream } from "stream";

export class Plugin {
  rokuIPAddress: string;
  username: string;
  password: string;
  constructor(rokuIPAddress: string, username: string, password: string) {
    this.rokuIPAddress = rokuIPAddress;
    this.username = username;
    this.password = password;
  }

  /**
   * Function that generates a screenshot by hitting the `/plugin_inspect` endpoint and then saves the screenshot to a specified location.
   *
   * @param {string} channelLocation The location of the channel .zip file to be used
   * @param {string} directoryPath Path of the directory where the screenshot will be saved. Defaults to `__dirname`
   * @param {string} directory Directory name where the screenshot will be saved. Defaults to `images`
   * @param {string} fileName Custom file name. Defaults to `YYYY-MM-DD_HH-MM-SS`. Does not need a file type (.jpg is automatically assigned)
   */
  async getScreenshot({
    channelLocation,
    directoryPath = path.resolve(__dirname),
    directory = "images",
    fileName = new Date(new Date().toString().split("GMT")[0] + " UTC")
      .toISOString()
      .split(".")[0]
      .replace(/:/g, "-")
      .replace("T", "_")
  }: {
    channelLocation: string;
    directoryPath?: string;
    directory?: string;
    fileName?: string;
  }) {
    const getFormData = () =>
      this.populateFormData({
        action: "Screenshot",
        channelLocation: channelLocation
      });

    await this.generateScreenshot(getFormData);

    await this.saveScreenshot({ directoryPath, directory, fileName });
  }

  /**
   * Function that generates the screenshot by sending a POST to `/plugin_inspect`
   *
   * @param {FormData} formData The associated formData, generated from the `getScreenshot` method
   */
  async generateScreenshot(getFormData: () => FormData) {
    let endpoint: string = "/plugin_inspect";
    let authorization: string;
    try {
      authorization = await this.generateDigestAuth({
        endpoint: endpoint,
        formData: getFormData(),
        method: "POST"
      });
    } catch (e) {
      console.error(e);
    }

    return new Promise(resolve => {
      getFormData().submit(
        {
          host: `${this.rokuIPAddress}`,
          path: "/plugin_inspect",
          headers: {
            Authorization: `${authorization}`
          }
        },
        function(error, res) {
          if (error) {
            console.log(error);
          } else {
            const chunks = [];
            res.on("data", function(chunk) {
              chunks.push(chunk);
            });
            res.on("end", function() {
              resolve();
            });
          }
        }
      );
    });
  }

  /**
   * Function that saves the screenshot, using a `GET` request to `/pkgs/dev.jpg`.
   *
   * @param {string} directoryPath Path of the directory where the screenshot will be saved. Defaults to `__dirname`
   * @param {string} directory Directory name where the screenshot will be saved. Defaults to `images`
   * @param {string} fileName Custom file name. Defaults to `YYYY-MM-DD_HH-MM-SS`. Does not need a file type (.jpg is automatically assigned)
   */
  async saveScreenshot({
    directoryPath,
    directory,
    fileName
  }: {
    directoryPath: string;
    directory: string;
    fileName: string;
  }) {
    let endpoint: string = "/pkgs/dev.jpg";
    let authorization: string;
    try {
      authorization = await this.generateDigestAuth({
        endpoint: `${endpoint}`,
        method: "GET"
      });
    } catch (e) {
      console.error(e);
    }

    const filePath = path.resolve(directoryPath, directory, `${fileName}.jpg`);
    const writer = fs.createWriteStream(filePath);

    const response = await axios.get(
      `http://${this.rokuIPAddress}${endpoint}`,
      {
        headers: { Authorization: authorization },
        responseType: "stream"
      }
    );

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", function() {
        writer.end();
        resolve(
          console.log(`Saved at ${directoryPath}/${directory}/${fileName}.jpg`)
        );
      });
      writer.on("error", reject);
    });
  }

  /**
   * Function to install a channel, by submitting a `POST` to `/plugin_install`
   *
   * @param {string} channelLocation The location of the channel to be installed
   */
  async installChannel(channelLocation: string) {
    try {
      return await this.sideload({
        action: "Install",
        channelLocation: channelLocation
      });
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * Function to replace a previously installed channel, by submitting a `POST` to `/plugin_install`
   *
   * @param {string} channelLocation The location of the channel to be installed over the existing channel
   */
  async replaceChannel(channelLocation: string) {
    return await this.sideload({
      action: "Replace",
      channelLocation: channelLocation
    });
  }

  /**
   * Function to replace a previously installed channel, by submitting a `POST` to `/plugin_install`
   *
   * @param {string} channelLocation The location of the channel to be deleted. Not required
   */
  async deleteChannel(channelLocation: string = "") {
    return await this.sideload({
      action: "Delete",
      channelLocation: channelLocation
    });
  }

  /**
   * Function to communicate with the Roku device
   *
   * @param {string} action Action to be taken. Sets the value of the `mysubmit` key
   * @param {string} channelLocation The location of the channel to be used.
   */
  async sideload({
    action,
    channelLocation
  }: {
    action: string;
    channelLocation: string;
  }) {
    const getFormData = () =>
      this.populateFormData({
        action: action,
        channelLocation: channelLocation
      });

    let authorization: string;
    try {
      authorization = await this.generateDigestAuth({
        endpoint: "/plugin_install",
        method: "POST",
        formData: getFormData()
      });
    } catch (e) {
      console.error(e);
    }

    return new Promise((resolve, reject) => {
      let formData = getFormData();
      formData.submit(
        {
          host: `${this.rokuIPAddress}`,
          path: `/plugin_install`,
          headers: {
            Authorization: `${authorization}`
          }
        },
        function(error, res) {
          if (error) {
            reject(error);
          } else {
            resolve(res);
          }
        }
      );
    });
  }

  async generateDigestAuth({
    endpoint,
    realm = "rokudev",
    formData,
    method
  }: {
    endpoint: string;
    realm?: string;
    formData?: FormData;
    method: string;
  }) {
    let headers: IncomingHttpHeaders = await this.generateHeaders({
      method,
      endpoint,
      formData
    });
    let nonce: string, qop: string;
    try {
      if (headers) {
        let authenticate = headers["www-authenticate"];
        [, nonce] = authenticate.match(/nonce="([^"]+)"/);
        [, qop] = authenticate.match(/qop="([^"]+)"/);
      }
    } catch (e) {
      console.error(e);
    }

    const nc = "00000000";
    const cnonce = "";
    const h1 = md5(`${this.username}:${realm}:${this.password}`);
    const h2 = md5(`${method}:${endpoint}`);
    const response = md5(`${h1}:${nonce}:${nc}:${cnonce}:${qop}:${h2}`);

    return `Digest username="${this.username}", realm="${realm}", nonce="${nonce}", uri="${endpoint}", algorithm="MD5", qop="${qop}", nc=${nc}, cnonce="${cnonce}", response="${response}"`;
  }

  generateHeaders({
    method,
    endpoint,
    formData
  }: {
    method: string;
    endpoint: string;
    formData?: FormData;
  }): Promise<IncomingHttpHeaders> {
    return new Promise(async (resolve, reject) => {
      let headers: IncomingHttpHeaders = {};
      if (method === "GET") {
        headers = await this.generateGetHeaders(
          `http://${this.rokuIPAddress}${endpoint}`
        );
        resolve(headers);
      } else {
        try {
          headers = await this.generatePostHeaders({
            endpoint: endpoint,
            formData: formData
          });
          resolve(headers);
        } catch (e) {
          console.error(e);
          reject(e);
        }
      }
    });
  }

  async generateGetHeaders(url: string): Promise<IncomingHttpHeaders> {
    return axios
      .get(url)
      .then(function(response) {
        return response.headers;
      })
      .catch(function(error) {
        if (error.response.status === 401) {
          return error.response.headers;
        } else {
          console.error(error);
        }
      });
  }

  async generatePostHeaders({
    endpoint,
    formData
  }: {
    endpoint: string;
    formData: FormData;
  }): Promise<IncomingHttpHeaders> {
    return new Promise((resolve, reject) => {
      try {
        formData.submit(
          {
            host: `${this.rokuIPAddress}`,
            path: `${endpoint}`
          },
          function(error, res) {
            if (error) {
              reject(error);
            } else {
              resolve(res.headers);
            }
          }
        );
      } catch (e) {
        console.error(e);
      }
    });
  }

  populateFormData({
    action,
    channelLocation
  }: {
    action: string;
    channelLocation: string;
  }) {
    let formData = new FormData();
    formData.append("mysubmit", action);
    if (action !== "Delete") {
      formData.append("archive", fs.createReadStream(channelLocation));
    } else {
      formData.append("archive", "");
    }
    return formData;
  }
}
