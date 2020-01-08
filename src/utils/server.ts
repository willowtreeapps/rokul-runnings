const { spawn } = require('child_process');

let startServer;

/** Function to start up the WebDriverServer */
export async function start(print = false) {
  startServer = spawn('./WebDriverServer');
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
