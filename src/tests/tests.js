const nock = require("nock");
const mocha = require("mocha");
const assert = require("assert");
const library = require("../modules/library");
const webdriver = require("../modules/webdriver");

describe("Library tests", function() {
  this.beforeEach(function() {
    const libraryDriver = new library(
      "123.456.789.012",
      0,
      0,
      "...WebDriverServer"
    );
    const sessionId = nock(web.BASE_URL)
      .get("")
      .reply(200, {
        sessionId: "123456",
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

  it("Should Launch the Channel", function() {
    const mockResponse = {
      sessionId: "123456",
      status: 0,
      value: null
    };

    const scope = nock(webdriver.BASE_URL)
      .post(`/${sessionId}/launch`)
      .reply(200, mockResponse);

    given()
      .when((response = libraryDriver.launchTheChannel("dev")))

      .then("Assert response is as expected", function() {
        assert.deepEqual(
          response,
          mockResponse,
          "Did not receive the correct response when attempting to launch the channel"
        );
      });
  });
});
