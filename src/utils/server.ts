const { spawn } = require("child_process");

let startServer;

export async function start() {
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

export async function stop() {
  startServer.kill("SIGTERM");
}
