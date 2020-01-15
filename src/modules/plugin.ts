import { Action, Method } from '../types/plugin';
import * as indigestion from 'indigestion';
import * as FormData from 'form-data';
import { IncomingHttpHeaders } from 'http';
import axios from 'axios';
import fs = require('fs');
import path = require('path');

export class Plugin {
  constructor(public rokuIPAddress: string, public username: string, public password: string) {
    this.rokuIPAddress = rokuIPAddress;
    this.username = username;
    this.password = password;
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
    /** generate FormData for POST */
    const formData = await this.populateFormData({
      action: 'Screenshot',
    });

    /** Generate the screenshot from the provided FormData */
    await this.generateScreenshot(formData);

    /** Save screenshot from Roku to local */
    await this.saveScreenshot({ directoryPath, fileName, print });
  }

  /** Function that generates the screenshot by sending a POST to `/plugin_inspect` */
  private async generateScreenshot(formData: FormData) {
    /** define variables */
    const endpoint = '/plugin_inspect';
    const method = 'POST';
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

    /** Execute the POST command */
    formData.submit(
      {
        host: this.rokuIPAddress,
        path: '/plugin_inspect',
        headers: {
          Authorization: authorization,
        },
      },
      function(error, res) {
        if (error) {
          console.error(error);
        } else {
          res.on('data', function() {
            res.resume();
          });
          res.on('end', function() {
            return res;
          });
        }
      },
    );
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
  async sideload({ action, channelLocation }: { action: Action; channelLocation: string }) {
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
          },
        },
        function(error, res) {
          if (error) {
            reject(error);
          } else {
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
  generateHeaders({
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
  generateGetHeaders(url: string): Promise<IncomingHttpHeaders> {
    return axios
      .get(url)
      .then(result => {
        return result.headers;
      })
      .catch(error => {
        if (error.response.status !== 401) console.error(error);
        else return error.response.headers;
      });
  }

  /** Function to return headers for a POST request */
  generatePostHeaders({ endpoint, formData }: { endpoint: string; formData: FormData }): Promise<IncomingHttpHeaders> {
    return axios
      .post(`http://${this.rokuIPAddress}${endpoint}`, formData, {
        headers: formData.getHeaders(),
      })
      .then(result => {
        return result.headers;
      })
      .catch(error => {
        if (error.response.status !== 401) throw error;
        else {
          return error.response.headers;
        }
      });
  }

  /** Function to create FormData */
  populateFormData({ action, channelLocation }: { action: Action; channelLocation?: string }): Promise<FormData> {
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
}
