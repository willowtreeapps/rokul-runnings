const library = require("../src/modules/library");
const mocha = require("mocha");
const assert = require("assert");
const nock = require("nock");
const { WebDriver, BASE_URL } = require("../src/modules/webdriver");

// describe("Test tests", function() {
//   it("Should launch the channel", async function() {
//     const libraryDriver = new library.Library("192.168.128.145");

//     await libraryDriver.launchTheChannel("dev");
//     await libraryDriver.close();
//   });
// });
let libraryDriver;
const sessionId = "123456";

beforeEach(function() {
  libraryDriver = new library.Library("123.456.789.012");
  nock(BASE_URL)
    .post("/session")
    .reply(200, {
      sessionId: sessionId,
      status: 0,
      value: {
        ip: "123.456.789.012",
        timeout: 30000,
        pressDelay: 1000,
        vendorName: "Roku",
        modelName: "Roku Stick",
        language: "en",
        country: "us"
      }
    });
});

afterEach(function() {
  nock.cleanAll();
});

describe("Library tests", function() {
  it("Should Launch the Channel", async function() {
    const mockResponse = {
      sessionId: sessionId,
      status: 0,
      value: null
    };

    nock(BASE_URL)
      .post(`/session/${sessionId}/launch`)
      .reply(200, mockResponse);

    response = await libraryDriver.launchTheChannel("dev");
    assert.deepEqual(
      response,
      { body: mockResponse, status: 200 },
      "Did not receive the correct response when attempting to launch the channel"
    );
  });
});
