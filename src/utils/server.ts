import * as path from 'path';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { sleep } from '../utils/sleep';
export class Server {
  private static serverBinaryLocation = path.resolve(__dirname, '../../redist/WebDriverServer');
  private static server: ChildProcessWithoutNullStreams;
  /** Function to start up the WebDriverServer */
  public static start(print = false) {
    this.server = spawn(Server.serverBinaryLocation);
    sleep(1250);
    this.server.stdout.on('data', data => {
      console.log(`[STDOUT]: ${data}`);
    });
    this.server.stderr.on('data', data => {
      console.error(`[STDERR]: ${data}`);
    });
    this.server.on('close', (code, signal) => {
      if (print) {
        console.log('Successfully terminated WebDriverServer');
      }
    });
  }

  /** Function to stop the WebDriverServer */
  public static stop() {
    this.server.kill('SIGTERM');
  }
}
