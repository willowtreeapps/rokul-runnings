import { sleep } from '../../dist/src/utils/sleep';

const { spawn } = require('child_process');
const path = require('path');

let startServer;

/** Function to start up the WebDriverServer */
export async function start(print = false) {
  const fileLocation = path.resolve(__dirname, '../../redist/WebDriverServer');
  startServer = spawn(fileLocation);
  sleep(1250);
  startServer.stdout.on('data', data => {
    console.log(`stdout: ${data}`);
  });
  startServer.stderr.on('data', data => {
    console.error(`stderr: ${data}`);
  });
  startServer.on('close', code => {
    if (print) console.log('Successfully terminated WebDriverServer');
  });
}

/** Function to stop the WebDriverServer */
export async function stop() {
  startServer.kill('SIGTERM');
}
