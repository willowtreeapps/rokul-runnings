import nock = require("nock");
import assert = require("assert");
import fs = require("fs");
import path = require("path");
import { Plugin } from "../src/modules/plugin";
import { screenshotResponse } from "./resources/screenshot-response";
import { sideloadResponse } from "./resources/sideload-response";

describe("Plugin tests", function() {
  this.timeout(0);
  const rokuIP: string = "192.168.128.145";
  const username: string = "rokudev";
  const password: string = "Pass123";
  const channelLocation: string = "./test/resources/main.zip";
  const directoryPath: string = "./test/resources";
  const directory: string = "images";
  const fileName: string = "screenshot-test";
  let plugin: Plugin;

  this.beforeEach(function() {
    plugin = new Plugin(rokuIP, username, password);
  });

  afterEach(function() {
    nock.cleanAll();
  });

  it("Should sideload", async function() {
    try {
      await plugin.installChannel(channelLocation);
    } catch (e) {
      console.error(e);
    }
  });

  // it("Should Get a Screenshot", async function() {
  //   try {
  //     await plugin.getScreenshot({
  //       channelLocation: channelLocation
  //     });
  //   } catch (e) {
  //     console.error(e);
  //   }
  // });

  // it("Should Install The Channel", async function() {
  //   nock(`http://${rokuIP}`)
  //     .post("/plugin_install")
  //     .reply(200, sideloadResponse);

  //   await plugin.installChannel(channelLocation);
  //   //No error indicates the channel was installed successfully.
  // });

  // it("Should Get The Screenshot", async function() {
  //   nock(`http://${rokuIP}`)
  //     .post("/plugin_inspect")
  //     .reply(200, screenshotResponse);

  //   nock(`http://${rokuIP}`)
  //     .get("/pkgs/dev.jpg")
  //     .replyWithFile(200, "./test/resources/images/response.jpg");

  //   await plugin.getScreenshot({
  //     channelLocation,
  //     directoryPath,
  //     directory,
  //     fileName
  //   });

  //   const fileExists = fs.existsSync(
  //     path.resolve(directoryPath, directory, `${fileName}.jpg`)
  //   );

  //   assert.deepEqual(fileExists, true, "Unable to find created screenshot.");
  // });
});
