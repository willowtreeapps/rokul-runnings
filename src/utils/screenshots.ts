import { generateHeaders } from './authHeaders';
import { populateFormData } from './formData';
import { sleep } from './sleep';
import axios from 'axios';
import * as indigestion from 'indigestion';
import fs = require('fs');
import path = require('path');

/** Function that saves the screenshot, using a `GET` request to `/pkgs/dev.jpg`. */
export async function saveScreenshot({
  directoryPath,
  fileName,
  print = false,
  fileType,
  username,
  password,
  rokuIPAddress,
}: {
  directoryPath: string;
  fileName: string;
  print: boolean;
  fileType: 'jpg' | 'png';
  username: string;
  password: string;
  rokuIPAddress: string;
}) {
  /** Define variables */
  const endpoint = `/pkgs/dev.${fileType}`;
  const address = `${rokuIPAddress}${endpoint}`;
  const method = 'GET';
  const headers = await generateHeaders({ method, address });
  const authenticateHeader = headers['www-authenticate'];
  const authorization = indigestion.generateDigestAuth({
    authenticateHeader,
    username,
    password,
    uri: endpoint,
    method,
  });

  /** Define file path variables */
  const filePath = path.resolve(directoryPath, `${fileName}.${fileType}`);
  const writer = fs.createWriteStream(filePath);

  /** Execute the GET command */
  const response = await axios.get(`${rokuIPAddress}${endpoint}`, {
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

/** Function that generates the screenshot by sending a POST to `/plugin_inspect` */
export async function generateScreenshot({
  username,
  password,
  rokuIPAddress,
}: {
  username: string;
  password: string;
  rokuIPAddress: string;
}) {
  /** define variables */
  const endpoint = '/plugin_inspect';
  const address = `${rokuIPAddress}${endpoint}`;
  const method = 'POST';
  let formData = await populateFormData({ action: 'Screenshot' });
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

  formData = await populateFormData({ action: 'Screenshot' });

  /** Execute the POST command */
  return new Promise((resolve, reject) => {
    formData.submit(
      {
        host: rokuIPAddress.replace('http://', ''),
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
