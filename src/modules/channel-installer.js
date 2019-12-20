const FormData = require("form-data");
const fs = require("fs");

async function installChannel({ rokuIP, fileLocation, username }) {
  return this.sideload({
    rokuIP: rokuIP,
    fileLocation: fileLocation,
    action: "Install",
    username: username
  });
}

async function replaceChannel({ rokuIP, fileLocation, username }) {
  return this.sideload({
    rokuIP: rokuIP,
    fileLocation: fileLocation,
    action: "Replace",
    username: username
  });
}

async function deleteChannel({ rokuIP, fileLocation, username }) {
  return this.sideload({
    rokuIP: rokuIP,
    fileLocation: fileLocation,
    action: "Delete",
    username: username
  });
}

async function sideload({ rokuIP, fileLocation, action, username }) {
  let formData = new FormData();
  formData.append("mysubmit", action);
  if (action !== "Delete") {
    formData.append("archive", fs.createReadStream(fileLocation));
  } else {
    formData.append("archive", "");
  }
  return formData.submit(
    {
      host: `${rokuIP}`,
      path: "/plugin_install",
      headers: {
        //need to verify that these won't need to be changed
        Authorization: `Digest username=${username}, realm="rokudev", nonce="${generateNonce()}", uri="/plugin_install", algorithm="MD5", qop=auth, nc=0000002f, cnonce="17d467e22f08469c", response="27d431aeb5855eae6a2ba8dcd1192a5e", opaque="27d431aeb5855eae6a2ba8dcd1192a5e"`
      }
    },
    async function(response) {
      response.resume();
    }
  );
}

function generateNonce() {
  let nonce;
  let digits = Math.floor(Math.random() * 20);
  for (let i = 0; i < digits; i++) {
    nonce += Math.floor(Math.random() * 10).toString();
  }
  return nonce;
}
module.exports = {
  installChannel,
  replaceChannel,
  deleteChannel
};
