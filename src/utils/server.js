const { spawn } = require("child_process");

let startServer;

async function start() {
  startServer = spawn("./WebDriverServer");
  startServer.stdout.on("data", data => {
    console.log(`stdout: ${data}`);
  });
  startServer.stderr.on("data", data => {
    console.error(`stderr: ${data}`);
  });
  startServer.on("close", code => {
    console.log("Successfully terminated WebDriverServer");
  });
}

async function stop() {
  startServer.kill("SIGTERM");
}

module.exports = {
  start,
  stop
};
