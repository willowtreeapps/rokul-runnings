const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const md5 = require("md5");

/**
 * Function that generates a screenshot by hitting the `/plugin_inspect` endpoint and then saves the screenshot to a specified location.
 *
 * @param {String} rokuIP The IP of the Roku device
 * @param {String} username The username used to sign in to the Development Application Installer (what is reached when navigating to the IP of the Roku)
 * @param {String} directoryPath Path of the directory where the screenshot will be saved. Defaults to `__dirname`
 * @param {String} directory Directory name where the screenshot will be saved. Defaults to `images`
 * @param {String} fileName Custom file name. Defaults to `YYYY-MM-DD_HH-MM-SS`. Does not need a file type (.jpg is automatically assigned)
 */
async function getScreenshot({
  rokuIP,
  username,
  directoryPath = "",
  directory = "",
  fileName = ""
}) {
  let formData = new FormData();
  formData.append("mysubmit", "Screenshot");
  formData.append("archive", fs.createReadStream("./main.zip"));

  const getAuthorization = `Digest username="${username}", realm="rokudev", nonce="1576852005", uri="/pkgs/dev.jpg", algorithm="MD5", qop=auth, nc=00000046, cnonce="d3544c2af87b7af3", response="27196a8a1a0334c7fb17534a99f7fc4e", opaque="8de98612f4255c38c164b3ee3024723b"`;
  const postAuthorization = `Digest username="${username}", realm="rokudev", nonce="1576852005", uri="/plugin_inspect", algorithm="MD5", qop=auth, nc=00000046, cnonce="d3544c2af87b7af3", response="1c534f1ec6a7a76f2e729f1683408d36", opaque="8de98612f4255c38c164b3ee3024723b"`;

  await getScreenshotRaw({
    rokuIP: rokuIP,
    formData: formData,
    authorization: postAuthorization
  });

  let imageURL = `${rokuIP}/pkgs/dev.jpg`;

  await saveScreenshot({
    imageURL: imageURL,
    authorization: getAuthorization,
    directoryPath: directoryPath,
    directory: directory,
    fileName: fileName
  });
}

/**
 * Function that generates the screenshot by sending a POST to `/plugin_inspect`
 *
 * @param {String} rokuIP The IP of the Roku device
 * @param {FormData} formData The associated formData, generated from the `getScreenshot` method
 * @param {String} authorization Digest authentication string, generated from `getScreenshot` and attached to the request as a header
 */
async function getScreenshotRaw({ rokuIP, formData, authorization }) {
  return new Promise(resolve => {
    let result;
    formData.submit(
      {
        host: `${rokuIP}`,
        path: "/plugin_inspect",
        headers: {
          Authorization: authorization
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
 * @param {String} rokuIP The IP of the Roku device
 * @param {String} authorization Digest authentication string, generated from `getScreenshot` and attached to the request as a header
 * @param {String} directoryPath Path of the directory where the screenshot will be saved. Defaults to `__dirname`
 * @param {String} directory Directory name where the screenshot will be saved. Defaults to `images`
 * @param {String} fileName Custom file name. Defaults to `YYYY-MM-DD_HH-MM-SS`. Does not need a file type (.jpg is automatically assigned)
 */
async function saveScreenshot({
  imageURL,
  authorization,
  directoryPath = path.resolve(__dirname),
  directory = "images",
  fileName = new Date(new Date().toString().split("GMT")[0] + " UTC")
    .toISOString()
    .split(".")[0]
    .replace(/:/g, "-")
    .replace("T", "_")
}) {
  const filePath = path.resolve(directoryPath, directory, `${fileName}.jpg`);
  const writer = fs.createWriteStream(filePath);

  const response = await axios({
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
 * @param {String} rokuIP The IP of the Roku device
 * @param {String} username The username used to sign in to the Development Application Installer (what is reached when navigating to the IP of the Roku)
 * @param {String} password The password used to sign in to the Development Application Installer (what is reached when navigating to the IP of the Roku)
 * @param {String} fileLocation The location of the channel to be installed
 */
async function installChannel({ rokuIP, username, password, fileLocation }) {
  return await sideload({
    rokuIP: rokuIP,
    action: "Install",
    username: username,
    password: password,
    fileLocation: fileLocation
  });
}

/**
 * Function to replace a previously installed channel, by submitting a `POST` to `/plugin_install`
 *
 * @param {String} rokuIP The IP of the Roku device
 * @param {String} username The username used to sign in to the Development Application Installer (what is reached when navigating to the IP of the Roku)
 * @param {String} password The password used to sign in to the Development Application Installer (what is reached when navigating to the IP of the Roku)
 * @param {String} fileLocation The location of the channel to be installed over the existing channel
 */
async function replaceChannel({ rokuIP, username, password, fileLocation }) {
  return await sideload({
    rokuIP: rokuIP,
    action: "Replace",
    username: username,
    password: password,
    fileLocation: fileLocation
  });
}

/**
 * Function to replace a previously installed channel, by submitting a `POST` to `/plugin_install`
 *
 * @param {String} rokuIP The IP of the Roku device
 * @param {String} username The username used to sign in to the Development Application Installer (what is reached when navigating to the IP of the Roku)
 * @param {String} password The password used to sign in to the Development Application Installer (what is reached when navigating to the IP of the Roku)
 * @param {String} fileLocation The location of the channel to be deleted. Not required
 */
async function deleteChannel({
  rokuIP,
  username,
  password,
  fileLocation = ""
}) {
  try {
    await sideload({
      rokuIP: rokuIP,
      action: "Delete",
      username: username,
      password: password,
      fileLocation: fileLocation
    });
    console.log("success");
    return "";
  } catch (e) {
    console.error(e);
  }
}

/**
 * Function to replace a previously installed channel, by submitting a `POST` to `/plugin_install`
 *
 * @param {String} rokuIP The IP of the Roku device
 * @param {String} action Action to be taken. Sets the value of the `mysubmit` key
 * @param {String} username The username used to sign in to the Development Application Installer (what is reached when navigating to the IP of the Roku)
 * @param {String} password The password used to sign in to the Development Application Installer (what is reached when navigating to the IP of the Roku)
 * @param {String} fileLocation The location of the channel to be deleted. Not required
 */
async function sideload({ rokuIP, action, username, password, fileLocation }) {
  let formData = new FormData();
  formData.append("mysubmit", action);
  if (action !== "Delete") {
    formData.append("archive", fs.createReadStream(fileLocation));
  } else {
    formData.append("archive", "");
  }

  let authorization;

  try {
    authorization = await generateDigestAuth({
      rokuIP: rokuIP,
      endpoint: "/plugin_install",
      username: username,
      method: "POST",
      password: password,
      formData: formData
    });
  } catch (e) {
    console.error(e);
  }

  return axios
    .post(`http://${rokuIP}/plugin_install`, formData, {
      headers: {
        Authorization: `${authorization}`
      }
    })
    .then(response => {
      console.log(response);
    })
    .catch(error => {
      console.log(error);
    });

  // return new Promise((resolve, reject) => {
  //   formData.submit(
  //     {
  //       host: `${rokuIP}`,
  //       path: `/plugin_install`,
  //       headers: {
  //         Authorization: `${authorization}`,
  //         "content-type": "application/x-www-form-urlencoded"
  //       }
  //     },
  //     function(error, res) {
  //       if (error) {
  //         console.error(error);
  //         reject(console.error(error));
  //       } else {
  //         console.log(res);
  //         resolve(res);
  //       }
  //     }
  //   );
  // });
}

async function generateDigestAuth({
  rokuIP,
  endpoint,
  username,
  realm = "rokudev",
  formData,
  method,
  password
}) {
  let headers;
  if (method === "GET") {
    headers = await generateGetNonce(`http://${rokuIP}${endpoint}`);
  } else {
    headers = await generatePostNonce(rokuIP, endpoint, formData);
  }

  const nonce = headers["www-authenticate"].split('nonce="')[1].split('"')[0];
  const qop = headers["www-authenticate"].split('qop="')[1].split('"')[0];
  const nc = "00000000";
  const cnonce = "";
  const h1 = md5(`${username}:${realm}:${password}`);
  const h2 = md5(`${method}:${endpoint}`);
  const response = md5(`${h1}:${nonce}:${nc}:${cnonce}:${qop}:${h2}`);

  return Promise.resolve(
    `Digest username="${username}", realm="${realm}", nonce="${nonce}", uri="/plugin_install", algorithm="MD5", qop="${qop}", nc=${nc}, cnonce="${cnonce}", response="${response}"`
  );
}

async function generateGetNonce(url) {
  return axios
    .get(url)
    .then(function(response) {
      return response.headers;
    })
    .catch(function(error) {
      if (error.response.status === 401) {
        return error.response.headers;
      } else {
        console.log(error);
        throw error;
      }
    });
}

function generatePostNonce(baseURL, endpoint, formData) {
  return new Promise((resolve, reject) => {
    formData.submit(
      {
        host: `${baseURL}`,
        path: `${endpoint}`,
        headers: {
          "content-type": "application/x-www-form-urlencoded"
        }
      },
      function(error, res) {
        if (error) {
          reject(error);
        } else {
          resolve(res.headers);
        }
      }
    );
  });
}

module.exports = {
  installChannel,
  replaceChannel,
  deleteChannel,
  getScreenshot
};
