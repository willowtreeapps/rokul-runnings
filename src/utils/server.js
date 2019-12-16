const { execFile } = require("child_process");

async function startWebDriverServer() {
  await execFile(".../WebDriverServer");
}

async function stopWebDriverServer() {
  //await //figure it out
}

module.exports = {
  start: startWebDriverServer,
  stop: stopWebDriverServer
};
