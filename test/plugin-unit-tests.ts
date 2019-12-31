import nock = require("nock");
import assert = require("assert");
import fs = require("fs");
import path = require("path");
import * as plugin from "../src/modules/plugin";
import { screenshotResponse } from "./resources/screenshot-response";
import { sideloadResponse } from "./resources/sideload-response";

describe("Plugin tests", function() {
  this.timeout(0);
  const rokuIP: string = "123.456.789.012";
  const username: string = "rokudev";
  const channelLocation: string = "./test/resources/main.zip";
  const directoryPath: string = "./test/resources";
  const directory: string = "images";
  const fileName: string = "screenshot-test";

  afterEach(function() {
    nock.cleanAll();
  });

  it("Should sideload", async function() {
    try {
      await plugin.installChannel({
        rokuIP: "192.168.128.145",
        username: "rokudev",
        channelLocation: "./main.zip"
      });
    } catch (e) {
      console.log(e);
    }
  });

  it("Should Install The Channel", async function() {
    nock(`http://${rokuIP}`)
      .post("/plugin_install")
      .reply(200, sideloadResponse);

    await plugin.installChannel({ rokuIP, username, channelLocation });
    //No error indicates the channel was installed successfully.
  });

  it("Should Get The Screenshot", async function() {
    nock(`http://${rokuIP}`)
      .post("/plugin_inspect")
      .reply(200, screenshotResponse);

    nock(`http://${rokuIP}`)
      .get("/pkgs/dev.jpg")
      .replyWithFile(200, "./test/resources/images/response.jpg");

    await plugin.getScreenshot({
      rokuIP,
      username,
      channelLocation,
      directoryPath,
      directory,
      fileName
    });

    const fileExists = fs.existsSync(
      path.resolve(directoryPath, directory, `${fileName}.jpg`)
    );

    assert.deepEqual(fileExists, true, "Unable to find created screenshot.");
  });
});
