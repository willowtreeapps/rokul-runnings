import FormData = require("form-data");
import fs = require("fs");
import path = require("path");
import * as axios from "axios";

/**
 * Function that generates a screenshot by hitting the `/plugin_inspect` endpoint and then saves the screenshot to a specified location.
 *
 * @param {string} rokuIP The IP of the Roku device
 * @param {string} username The username used to sign in to the Development Application Installer (what is reached when navigating to the IP of the Roku)
 * @param {string} channelLocation The location of the channel .zip file to be used
 * @param {string} directoryPath Path of the directory where the screenshot will be saved. Defaults to `__dirname`
 * @param {string} directory Directory name where the screenshot will be saved. Defaults to `images`
 * @param {string} fileName Custom file name. Defaults to `YYYY-MM-DD_HH-MM-SS`. Does not need a file type (.jpg is automatically assigned)
 */
export async function getScreenshot({
  rokuIP,
  username,
  channelLocation,
  directoryPath = "",
  directory = "",
  fileName = ""
}: {
  rokuIP: string;
  username: string;
  channelLocation: string;
  directoryPath: string;
  directory: string;
  fileName: string;
}) {
  let formData = new FormData();
  formData.append("mysubmit", "Screenshot");
  formData.append("archive", fs.createReadStream(channelLocation));

  const getAuthorization: string = `Digest username="${username}", realm="rokudev", nonce="1576852005", uri="/pkgs/dev.jpg", algorithm="MD5", qop=auth, nc=00000046, cnonce="d3544c2af87b7af3", response="27196a8a1a0334c7fb17534a99f7fc4e", opaque="8de98612f4255c38c164b3ee3024723b"`;
  const postAuthorization: string = `Digest username="${username}", realm="rokudev", nonce="1576852005", uri="/plugin_inspect", algorithm="MD5", qop=auth, nc=00000046, cnonce="d3544c2af87b7af3", response="1c534f1ec6a7a76f2e729f1683408d36", opaque="8de98612f4255c38c164b3ee3024723b"`;

  await getScreenshotRaw(rokuIP, formData, postAuthorization);

  let imageURL = `${rokuIP}/pkgs/dev.jpg`;

  await saveScreenshot(
    imageURL,
    getAuthorization,
    directoryPath,
    directory,
    fileName
  );
}

/**
 * Function that generates the screenshot by sending a POST to `/plugin_inspect`
 *
 * @param {string} rokuIP The IP of the Roku device
 * @param {FormData} formData The associated formData, generated from the `getScreenshot` method
 * @param {string} authorization Digest authentication string , generated from `getScreenshot` and attached to the request as a header
 */
async function getScreenshotRaw(
  rokuIP: string,
  formData: FormData,
  authorization: String
) {
  return new Promise(resolve => {
    let result;
    formData.submit(
      {
        host: `${rokuIP}`,
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
            result = Buffer.concat(chunks).toString();
            resolve(result);
          });
        }
      }
    );
  });
}

/**
 * Function that saves the screenshot, using a `GET` request to `/pkgs/dev.jpg`.
 *
 * @param {string} rokuIP The IP of the Roku device
 * @param {string} authorization Digest authentication string , generated from `getScreenshot` and attached to the request as a header
 * @param {string} directoryPath Path of the directory where the screenshot will be saved. Defaults to `__dirname`
 * @param {string} directory Directory name where the screenshot will be saved. Defaults to `images`
 * @param {string} fileName Custom file name. Defaults to `YYYY-MM-DD_HH-MM-SS`. Does not need a file type (.jpg is automatically assigned)
 */
async function saveScreenshot(
  imageURL: string,
  authorization: string,
  directoryPath: string = "",
  directory: string = "",
  fileName: string = ""
) {
  if (!directoryPath) directoryPath = path.resolve(__dirname);
  if (!directory) directory = "images";
  if (!fileName) {
    //returns Date as YYY-MM-DD_HH-MM-SS:
    fileName = new Date(new Date().toString().split("GMT")[0] + " UTC")
      .toISOString()
      .split(".")[0]
      .replace(/:/g, "-")
      .replace("T", "_");
  }

  const filePath = path.resolve(directoryPath, directory, `${fileName}.jpg`);
  const writer = fs.createWriteStream(filePath);

  const response = await axios.default({
    url: `http://${imageURL}`,
    method: "GET",
    headers: {
      Authorization: authorization
    },
    responseType: "stream"
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", function() {
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
 * @param {string} rokuIP The IP of the Roku device
 * @param {string} username The username used to sign in to the Development Application Installer (what is reached when navigating to the IP of the Roku)
 * @param {string} channelLocation The location of the channel to be installed
 */
export async function installChannel({
  rokuIP,
  username,
  channelLocation
}: {
  rokuIP: string;
  username: string;
  channelLocation: string;
}) {
  return await sideload({
    rokuIP: rokuIP,
    action: "Install",
    username: username,
    channelLocation: channelLocation
  });
}

/**
 * Function to replace a previously installed channel, by submitting a `POST` to `/plugin_install`
 *
 * @param {string} rokuIP The IP of the Roku device
 * @param {string} username The username used to sign in to the Development Application Installer (what is reached when navigating to the IP of the Roku)
 * @param {string} channelLocation The location of the channel to be installed over the existing channel
 */
export async function replaceChannel({
  rokuIP,
  username,
  channelLocation
}: {
  rokuIP: string;
  username: string;
  channelLocation: string;
}) {
  return await sideload({
    rokuIP: rokuIP,
    action: "Replace",
    username: username,
    channelLocation: channelLocation
  });
}

/**
 * Function to replace a previously installed channel, by submitting a `POST` to `/plugin_install`
 *
 * @param {string} rokuIP The IP of the Roku device
 * @param {string} username The username used to sign in to the Development Application Installer (what is reached when navigating to the IP of the Roku)
 * @param {string} channelLocation The location of the channel to be deleted. Not required
 */
export async function deleteChannel({
  rokuIP,
  username,
  channelLocation = ""
}: {
  rokuIP: string;
  username: string;
  channelLocation: string;
}) {
  return await sideload({
    rokuIP: rokuIP,
    action: "Delete",
    username: username,
    channelLocation: channelLocation
  });
}

/**
 * Function to communicate with the Roku device
 *
 * @param {string} rokuIP The IP of the Roku device
 * @param {string} action Action to be taken. Sets the value of the `mysubmit` key
 * @param {string} username The username used to sign in to the Development Application Installer (what is reached when navigating to the IP of the Roku)
 * @param {string} channelLocation The location of the channel to be used.
 */
async function sideload({
  rokuIP,
  action,
  username,
  channelLocation
}: {
  rokuIP: string;
  action: string;
  username: string;
  channelLocation: string;
}) {
  let formData = new FormData();
  formData.append("mysubmit", action);
  if (action !== "Delete") {
    formData.append("archive", fs.createReadStream(channelLocation));
  } else {
    formData.append("archive", "");
  }

  const authorization = `Digest username="${username}", realm="rokudev", nonce="1577114671", uri="/plugin_install", algorithm="MD5", qop=auth, nc=0000002f, cnonce="", response="54116ad359a809de059a3e11d8d78ce0"`;

  return new Promise(resolve => {
    let result;
    formData.submit(
      {
        host: `${rokuIP}`,
        path: "/plugin_install",
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
            result = Buffer.concat(chunks).toString();
            resolve(result);
          });
        }
      }
    );
  });
}

function generateNonce() {
  let nonce = "";
  let digits = Math.floor(Math.random() * 10);
  for (let i = 0; i < digits; i++) {
    nonce += Math.floor(Math.random() * 10).toString();
  }
  return nonce;
}
