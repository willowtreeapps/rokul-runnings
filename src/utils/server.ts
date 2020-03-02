import * as path from 'path';
import * as pm2 from 'pm2';
import { sleep } from '../utils/sleep';

export class Server {
  private static serverBinaryLocation = path.resolve(__dirname, '../../../redist/WebDriverServer');
  /** Function to start up the WebDriverServer */
  public static start() {
    pm2.start(this.serverBinaryLocation, error => {
      if (error) {
        throw error;
      }
    });
    sleep(500);
  }

  /** Function to stop the WebDriverServer */
  public static stop() {
    pm2.stop('WebDriverServer', error => {
      if (error) {
        throw error;
      }
    });
    pm2.delete('WebDriverServer', error => {
      if (error) {
        throw error;
      }
    });
  }
}
