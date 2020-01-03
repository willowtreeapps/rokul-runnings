import FormData = require("form-data");
import fs = require("fs");
import path = require("path");
import axios from "axios";
import md5 = require("md5");
import { IncomingHttpHeaders } from "http";

export class Plugin {
  rokuIPAddress: string;
  username: string;
  password: string;
  constructor(rokuIPAddress: string, username: string, password: string) {
    this.rokuIPAddress = rokuIPAddress;
    this.username = username;
    this.password = password;
  }

  /** Function that generates a screenshot by hitting the `/plugin_inspect` endpoint and then saves the screenshot to a specified location. */
  async getScreenshot({
    channelLocation,
    directoryPath = path.resolve(__dirname),
    directory = "images",
    fileName = new Date(new Date().toString().split("GMT")[0] + " UTC")
      .toISOString()
      .split(".")[0]
      .replace(/:/g, "-")
      .replace("T", "_"),
    print = false
  }: {
    channelLocation?: string;
    directoryPath?: string;
    directory?: string;
    fileName?: string;
    print?: boolean;
  }) {
    /** generate FormData for POST */
    let formData = await this.populateFormData({
      action: "Screenshot",
      channelLocation: channelLocation
    });

    /** Generate the screenshot from the provided FormData */
    await this.generateScreenshot(formData);

    /** Save screenshot from Roku to local */
    await this.saveScreenshot({ directoryPath, directory, fileName, print });
  }

  /** Function that generates the screenshot by sending a POST to `/plugin_inspect` */
  async generateScreenshot(formData: FormData) {
    /** define variables */
    let endpoint: string = "/plugin_inspect";
    let authorization: string;
    /** Generate a Digest Authentication string */
    authorization = await this.generateDigestAuth({
      endpoint: endpoint,
      formData: formData,
      method: "POST"
    });

    /** Execute the POST command */
    formData.submit(
      {
        host: `${this.rokuIPAddress}`,
        path: "/plugin_inspect",
        headers: {
          Authorization: `${authorization}`
        }
      },
      function(error, res) {
        if (error) {
          console.error(error);
        } else {
          const chunks = [];
          res.on("data", function(chunk) {
            chunks.push(chunk);
          });
          res.on("end", function() {
            return res;
          });
        }
      }
    );
  }

  /** Function that saves the screenshot, using a `GET` request to `/pkgs/dev.jpg`. */
  async saveScreenshot({
    directoryPath,
    directory,
    fileName,
    print = false
  }: {
    directoryPath: string;
    directory: string;
    fileName: string;
    print: boolean;
  }) {
    /** Define variables */
    let endpoint: string = "/pkgs/dev.jpg";
    let authorization: string;
    /** Generate a Digest Authentication string */
    authorization = await this.generateDigestAuth({
      endpoint: `${endpoint}`,
      method: "GET"
    });

    /** Define file path variables */
    const filePath = path.resolve(directoryPath, directory, `${fileName}.jpg`);
    const writer = fs.createWriteStream(filePath);

    /** Execute the GET command */
    const response = await axios.get(
      `http://${this.rokuIPAddress}${endpoint}`,
      {
        headers: { Authorization: authorization },
        responseType: "stream"
      }
    );

    /** Write the response to a file */
    response.data.pipe(writer);

    /** Close the writer */
    return new Promise((resolve, reject) => {
      writer.on("finish", function() {
        writer.end();
        if (print)
          console.log(`Saved at ${directoryPath}/${directory}/${fileName}.jpg`);
        resolve();
      });
      writer.on("error", reject);
    });
  }

  /** Function to install a channel, by submitting a `POST` to `/plugin_install`*/
  async installChannel(channelLocation: string) {
    return await this.sideload({
      action: "Install",
      channelLocation: channelLocation
    });
  }

  /** Function to replace a previously installed channel, by submitting a `POST` to `/plugin_install`*/
  async replaceChannel(channelLocation: string) {
    return await this.sideload({
      action: "Replace",
      channelLocation: channelLocation
    });
  }

  /** Function to replace a previously installed channel, by submitting a `POST` to `/plugin_install` */
  async deleteChannel(channelLocation: string = "") {
    return await this.sideload({
      action: "Delete",
      channelLocation: channelLocation
    });
  }

  /** Function to communicate with the Roku device, by submitting a `POST` to `/plugin_install` */
  async sideload({
    action,
    channelLocation
  }: {
    action: string;
    channelLocation: string;
  }) {
    /** Define variables */
    let authorization: string;
    let endpoint: string = "/plugin_install";
    /** Generate FormData */
    let formData = await this.populateFormData({ action, channelLocation });
    /** Generate a Digest Authentication string */
    authorization = await this.generateDigestAuth({
      endpoint: endpoint,
      method: "POST",
      formData: formData
    });

    /** Regenerate FormData */
    formData = await this.populateFormData({ action, channelLocation });

    /** Execute POST */
    formData.submit(
      {
        host: `${this.rokuIPAddress}`,
        path: `${endpoint}`,
        headers: {
          Authorization: `${authorization}`
        }
      },
      function(error, res) {
        if (error) {
          console.error(error);
        } else {
          return res;
        }
      }
    );
  }

  /** Function to generate the Digest authentication string */
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
    /** Retrieve headers */
    let headers: any = await this.generateHeaders({
      method,
      endpoint,
      formData
    });
    /** Define variable */
    let nonce: string, qop: string;
    /** Manipulate returned headers into variables */
    try {
      if (headers) {
        let authenticate = headers["www-authenticate"];
        [, nonce] = authenticate.match(/nonce="([^"]+)"/);
        [, qop] = authenticate.match(/qop="([^"]+)"/);
      }
    } catch (e) {
      console.error(e);
    }

    /** Define variables */
    const nc = "00000000";
    const cnonce = "";
    /** Generate hash strings based off of Digest authentication specifications */
    const h1 = md5(`${this.username}:${realm}:${this.password}`);
    const h2 = md5(`${method}:${endpoint}`);
    const response = md5(`${h1}:${nonce}:${nc}:${cnonce}:${qop}:${h2}`);

    /** Return composed Digest auth string, to be used in header */
    return `Digest username="${this.username}", realm="${realm}", nonce="${nonce}", uri="${endpoint}", algorithm="MD5", qop="${qop}", nc=${nc}, cnonce="${cnonce}", response="${response}"`;
  }

  /** Function to generate auth headers */
  generateHeaders({
    method,
    endpoint,
    formData
  }: {
    method: string;
    endpoint: string;
    formData?: FormData;
  }): Promise<any> {
    return new Promise(async (resolve, reject) => {
      /** Declare variable */
      let headers: any = {};
      /** If executing a GET */
      if (method === "GET") {
        headers = await this.generateGetHeaders(
          `http://${this.rokuIPAddress}${endpoint}`
        );
        resolve(headers);
      } else {
        /** If executing a POST */
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

  /** Function to return headers for a GET request */
  async generateGetHeaders(url: string): Promise<IncomingHttpHeaders> {
    return new Promise((resolve, reject) => {
      axios
        .get(url)
        .then(result => {
          resolve(result.headers);
        })
        .catch(error => {
          if (error.response.status !== 401) reject(error);
          else resolve(error.response.headers);
        });
    });
  }

  /** Function to return headers for a POST request */
  async generatePostHeaders({
    endpoint,
    formData
  }: {
    endpoint: string;
    formData: FormData;
  }): Promise<IncomingHttpHeaders> {
    return new Promise((resolve, reject) => {
      axios
        .post(`http://${this.rokuIPAddress}${endpoint}`, formData, {
          headers: formData.getHeaders()
        })
        .then(result => {
          resolve(result.headers);
        })
        .catch(error => {
          if (error.response.status !== 401) reject(error);
          else {
            resolve(error.response.headers);
          }
        });
    });
  }

  /** Function to create FormData */
  populateFormData({
    action,
    channelLocation
  }: {
    action: string;
    channelLocation?: string;
  }): Promise<FormData> {
    return new Promise(resolve => {
      /** Declare variable */
      let formData = new FormData();
      /** Append data for `mysubmit` */
      formData.append("mysubmit", action);
      /** Append data depending on `mysubmit` value */
      if (action === "Install" || action === "Replace") {
        let file = fs.createReadStream(channelLocation, { emitClose: true });
        let fileNameArray = channelLocation.split("/");
        let fileName = fileNameArray[fileNameArray.length - 1];
        formData.append("archive", file, {
          contentType: "application/zip",
          filename: fileName
        });
      } else formData.append("archive", "");

      /** Return the FormData */
      resolve(formData);
    });
  }
}
