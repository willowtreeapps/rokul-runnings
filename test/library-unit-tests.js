const { buttons, Library } = require("../src/modules/library");
const mocha = require("mocha");
const assert = require("assert");
const nock = require("nock");
const { WebDriver, BASE_URL } = require("../src/modules/webdriver");
const { start, stop } = require("../src/utils/server");

let libraryDriver;
const sessionId = "123456";
const elementData = [
  {
    using: "text",
    value: "test"
  }
];

function buildMockResponse(responseStatus = 0, responseValue = null) {
  const response = {
    sessionId: sessionId,
    status: responseStatus,
    value: responseValue
  };
  return { httpMock: response, mockResponse: { body: response, status: 200 } };
}

describe("Library tests", function() {
  before(async function() {
    //start();
    //Method not properly implemented
  });

  beforeEach(function() {
    libraryDriver = new Library("123.456.789.012");
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

  after(async function() {
    //stop();
    //method not properly implemented
  });

  it("Should Launch the Channel", async function() {
    const { httpMock, mockResponse } = buildMockResponse();

    nock(BASE_URL)
      .post(`/session/${sessionId}/launch`)
      .reply(200, httpMock);

    response = await libraryDriver.launchTheChannel("dev");
    assert.deepEqual(
      response,
      mockResponse,
      "Did not receive the correct response when attempting to launch the channel"
    );
  });

  it("Should Get a List of Channels", async function() {
    const value = [
      {
        Title: "YouTube TV",
        ID: "195316",
        Type: "appl",
        Version: "1.0.80000001",
        Subtype: "ndka"
      },
      {
        Title: "rocute",
        ID: "dev",
        Type: "appl",
        Version: "1.0.1",
        Subtype: "rsga"
      }
    ];
    const { httpMock, mockResponse } = buildMockResponse(0, value);

    nock(BASE_URL)
      .get(`/session/${sessionId}/apps`)
      .reply(200, httpMock);

    response = await libraryDriver.getApps();

    assert.deepEqual(
      response,
      value,
      "Did not receive the correct response when attempting to retrieve all channels."
    );
  });

  it("Should Verify Channel exists", async function() {
    const value = [
      {
        Title: "YouTube TV",
        ID: "195316",
        Type: "appl",
        Version: "1.0.80000001",
        Subtype: "ndka"
      },
      {
        Title: "rocute",
        ID: "dev",
        Type: "appl",
        Version: "1.0.1",
        Subtype: "rsga"
      }
    ];

    const { httpMock, mockResponse } = buildMockResponse(0, value);
    nock(BASE_URL)
      .get(`/session/${sessionId}/apps`)
      .reply(200, httpMock);

    response = await libraryDriver.getApps();

    assert.deepEqual(
      libraryDriver.verifyIsChannelExist(response, "dev"),
      true,
      "Unable to find channel from list of chanels provided."
    );
  });

  it("Should Verify Screen is Loaded", async function() {
    const { httpMock, mockResponse } = buildMockResponse();
    nock(BASE_URL)
      .post(`/session/${sessionId}/element`)
      .reply(200, httpMock);

    assert.deepEqual(
      await libraryDriver.verifyIsScreenLoaded(elementData),
      true,
      "Unable to find identifying element that signals the screen as loaded"
    );
  });

  it("Should Verify Button is Pressed", async function() {
    const { httpMock, mockResponse } = buildMockResponse();

    nock(BASE_URL)
      .post(`/session/${sessionId}/press`)
      .reply(200, httpMock);

    assert.deepEqual(
      await libraryDriver.pressBtn(buttons.up),
      mockResponse,
      "Incorrect response when attempting to send a button to the device."
    );
  });

  it("Should Verify Word is Pressed", async function() {
    const { httpMock, mockResponse } = buildMockResponse();

    const word = "hello";

    nock(BASE_URL)
      .post(`/session/${sessionId}/press`)
      .reply(200, httpMock)
      .persist();

    const response = await libraryDriver.sendWord(word);
    let finalMockResponse = {};
    for (let charIndex = 0; charIndex < word.length; charIndex++) {
      finalMockResponse.charIndex = mockResponse;
    }

    assert.deepEqual(
      response,
      finalMockResponse,
      "Not all responses from sending a word matched."
    );
  });

  it("Should Verify Button Sequence is Entered", async function() {
    const { httpMock, mockResponse } = buildMockResponse();

    nock(BASE_URL)
      .post(`/session/${sessionId}/press`)
      .reply(200, httpMock)
      .persist();

    buttonSequence = [buttons.up, buttons.up, buttons.down];

    const response = await libraryDriver.sendButtonSequence(buttonSequence);

    assert.deepEqual(
      response,
      mockResponse,
      "Button sequence response did not match."
    );
  });

  it("Should Get The Element", async function() {
    const valueResponse = {
      XMLName: {
        Space: "",
        Local: "Label"
      },
      Attrs: [
        {
          Name: {
            Space: "",
            Local: "bounds"
          },
          Value: "{0, 11, 340, 48}"
        },
        {
          Name: {
            Space: "",
            Local: "color"
          },
          Value: "#ddddddff"
        },
        {
          Name: {
            Space: "",
            Local: "index"
          },
          Value: "0"
        },
        {
          Name: {
            Space: "",
            Local: "text"
          },
          Value: "Item 1"
        }
      ],
      Nodes: null
    };

    const { httpMock, mockResponse } = buildMockResponse(0, valueResponse);

    nock(BASE_URL)
      .post(`/session/${sessionId}/element`)
      .reply(200, httpMock);

    const response = await libraryDriver.getElement(elementData);

    assert.deepEqual(
      response,
      valueResponse,
      "Element response did not match expected value."
    );
  });

  it("Should Get Elements", async function() {
    const responseValue = [
      {
        XMLName: {
          Space: "",
          Local: "Label"
        },
        Attrs: [
          {
            Name: {
              Space: "",
              Local: "bounds"
            },
            Value: "{0, 11, 340, 48}"
          },
          {
            Name: {
              Space: "",
              Local: "color"
            },
            Value: "#ddddddff"
          },
          {
            Name: {
              Space: "",
              Local: "index"
            },
            Value: "0"
          },
          {
            Name: {
              Space: "",
              Local: "text"
            },
            Value: "HOME"
          }
        ],
        Nodes: null
      },
      {
        XMLName: {
          Space: "",
          Local: "Label"
        },
        Attrs: [
          {
            Name: {
              Space: "",
              Local: "color"
            },
            Value: "#ddddddff"
          },
          {
            Name: {
              Space: "",
              Local: "index"
            },
            Value: "0"
          },
          {
            Name: {
              Space: "",
              Local: "opacity"
            },
            Value: "0"
          },
          {
            Name: {
              Space: "",
              Local: "text"
            },
            Value: "HOME"
          },
          {
            Name: {
              Space: "",
              Local: "visible"
            },
            Value: "false"
          }
        ],
        Nodes: null
      }
    ];
    const { httpMock, mockResponse } = buildMockResponse(0, responseValue);

    nock(BASE_URL)
      .post(`/session/${sessionId}/elements`)
      .reply(200, httpMock)
      .persist();

    const response = await libraryDriver.getElements(elementData);

    assert.deepEqual(
      response,
      responseValue,
      "Elements response did not match expected value."
    );
  });

  it("Should Get Focused Element", async function() {
    const responseValue = {
      XMLName: {
        Space: "",
        Local: "RenderableNode"
      },
      Attrs: [
        {
          Name: {
            Space: "",
            Local: "bounds"
          },
          Value: "{0, 0, 340, 48}"
        },
        {
          Name: {
            Space: "",
            Local: "children"
          },
          Value: "1"
        },
        {
          Name: {
            Space: "",
            Local: "focusable"
          },
          Value: "true"
        },
        {
          Name: {
            Space: "",
            Local: "focused"
          },
          Value: "true"
        },
        {
          Name: {
            Space: "",
            Local: "index"
          },
          Value: "0"
        }
      ],
      Nodes: [
        {
          XMLName: {
            Space: "",
            Local: "LabelListItem"
          },
          Attrs: [
            {
              Name: {
                Space: "",
                Local: "index"
              },
              Value: "0"
            }
          ],
          Nodes: [
            {
              XMLName: {
                Space: "",
                Local: "Poster"
              },
              Attrs: [
                {
                  Name: {
                    Space: "",
                    Local: "index"
                  },
                  Value: "0"
                },
                {
                  Name: {
                    Space: "",
                    Local: "opacity"
                  },
                  Value: "0"
                }
              ],
              Nodes: null
            },
            {
              XMLName: {
                Space: "",
                Local: "Poster"
              },
              Attrs: [
                {
                  Name: {
                    Space: "",
                    Local: "index"
                  },
                  Value: "1"
                }
              ],
              Nodes: null
            },
            {
              XMLName: {
                Space: "",
                Local: "Label"
              },
              Attrs: [
                {
                  Name: {
                    Space: "",
                    Local: "color"
                  },
                  Value: "#262626ff"
                },
                {
                  Name: {
                    Space: "",
                    Local: "index"
                  },
                  Value: "0"
                },
                {
                  Name: {
                    Space: "",
                    Local: "text"
                  },
                  Value: "HOME"
                },
                {
                  Name: {
                    Space: "",
                    Local: "visible"
                  },
                  Value: "false"
                }
              ],
              Nodes: null
            },
            {
              XMLName: {
                Space: "",
                Local: "ScrollingLabel"
              },
              Attrs: [
                {
                  Name: {
                    Space: "",
                    Local: "bounds"
                  },
                  Value: "{0, 11, 340, 26}"
                },
                {
                  Name: {
                    Space: "",
                    Local: "children"
                  },
                  Value: "2"
                },
                {
                  Name: {
                    Space: "",
                    Local: "index"
                  },
                  Value: "0"
                }
              ],
              Nodes: [
                {
                  XMLName: {
                    Space: "",
                    Local: "Label"
                  },
                  Attrs: [
                    {
                      Name: {
                        Space: "",
                        Local: "color"
                      },
                      Value: "#262626ff"
                    },
                    {
                      Name: {
                        Space: "",
                        Local: "index"
                      },
                      Value: "0"
                    },
                    {
                      Name: {
                        Space: "",
                        Local: "opacity"
                      },
                      Value: "0"
                    },
                    {
                      Name: {
                        Space: "",
                        Local: "text"
                      },
                      Value: "HOME"
                    },
                    {
                      Name: {
                        Space: "",
                        Local: "visible"
                      },
                      Value: "false"
                    }
                  ],
                  Nodes: null
                },
                {
                  XMLName: {
                    Space: "",
                    Local: "Label"
                  },
                  Attrs: [
                    {
                      Name: {
                        Space: "",
                        Local: "bounds"
                      },
                      Value: "{0, 0, 340, 26}"
                    },
                    {
                      Name: {
                        Space: "",
                        Local: "color"
                      },
                      Value: "#262626ff"
                    },
                    {
                      Name: {
                        Space: "",
                        Local: "index"
                      },
                      Value: "1"
                    },
                    {
                      Name: {
                        Space: "",
                        Local: "text"
                      },
                      Value: "HOME"
                    }
                  ],
                  Nodes: null
                }
              ]
            }
          ]
        }
      ]
    };

    const { httpMock, mockResponse } = buildMockResponse(0, responseValue);

    nock(BASE_URL)
      .post(`/session/${sessionId}/element/active`)
      .reply(200, httpMock);

    const response = await libraryDriver.getFocusedElement();

    assert.deepEqual(
      response,
      responseValue,
      "Focused element response value is not as expected."
    );
  });

  it("Should Verify Channel Is Loaded", async function() {
    const responseValue = {
      Title: "rocute",
      ID: "dev",
      Type: "appl",
      Version: "1.0.1",
      Subtype: "rsga"
    };
    const { httpMock, mockResponse } = buildMockResponse(0, responseValue);

    nock(BASE_URL)
      .get(`/session/${sessionId}/current_app`)
      .reply(200, httpMock);

    const response = await libraryDriver.verifyIsChannelLoaded("dev");

    assert.deepEqual(response, true, "Current App is not launched.");
  });

  it("Should Get Current Channel Info", async function() {
    const responseValue = {
      Title: "rocute",
      ID: "dev",
      Type: "appl",
      Version: "1.0.1",
      Subtype: "rsga"
    };
    const { httpMock, mockResponse } = buildMockResponse(0, responseValue);

    nock(BASE_URL)
      .get(`/session/${sessionId}/current_app`)
      .reply(200, httpMock);

    const response = await libraryDriver.getCurrentChannelInfo();

    assert.deepEqual(
      response,
      responseValue,
      "Current App value does not match expected Current App value."
    );
  });

  it("Should Get Device Info", async function() {
    const responseValue = {
      ip: "123.456.789.012",
      timeout: 30000,
      pressDelay: 1000,
      vendorName: "Roku",
      modelName: "Roku Stick",
      language: "en",
      country: "US"
    };
    const { httpMock, mockResponse } = buildMockResponse(0, responseValue);

    nock(BASE_URL)
      .get(`/session/${sessionId}`)
      .reply(200, httpMock);

    const response = await libraryDriver.getDeviceInfo();

    assert.deepEqual(
      response,
      responseValue,
      "Device Info value does not match expected Device Info value."
    );
  });

  it("Should Get Player Info", async function() {
    let responseValue = {
      Error: "false",
      State: "play",
      Format: {
        Audio: "aac_adts",
        Captions: "none",
        Container: "",
        Drm: "none",
        Video: "mpeg4_10b",
        VideoRes: ""
      },
      Buffering: {
        Current: "",
        Max: "",
        Target: ""
      },
      NewStream: {
        Speed: ""
      },
      Position: "8500 ms",
      Duration: "5000 ms",
      IsLive: "false",
      Runtime: "",
      StreamSegment: {
        Bitrate: "",
        MediaSequence: "",
        SegmentType: "",
        Time: ""
      }
    };
    const { httpMock, mockResponse } = buildMockResponse(0, responseValue);

    nock(BASE_URL)
      .get(`/session/${sessionId}/player`)
      .reply(200, httpMock);

    const response = await libraryDriver.getPlayerInfo();
    responseValue.Position = parseInt(responseValue.Position.split(" ")[0]);
    responseValue.Duration = parseInt(responseValue.Duration.split(" ")[0]);

    assert.deepEqual(
      response,
      responseValue,
      "Player Info value does not match expcted Player Info value."
    );
  });

  it("Should Verify Playback Is Started", async function() {
    let responseValue = {
      Error: "false",
      State: "play",
      Format: {
        Audio: "aac_adts",
        Captions: "none",
        Container: "",
        Drm: "none",
        Video: "mpeg4_10b",
        VideoRes: ""
      },
      Buffering: {
        Current: "",
        Max: "",
        Target: ""
      },
      NewStream: {
        Speed: ""
      },
      Position: "8500 ms",
      Duration: "5000 ms",
      IsLive: "false",
      Runtime: "",
      StreamSegment: {
        Bitrate: "",
        MediaSequence: "",
        SegmentType: "",
        Time: ""
      }
    };
    const { httpMock, mockResponse } = buildMockResponse(0, responseValue);

    nock(BASE_URL)
      .get(`/session/${sessionId}/player`)
      .reply(200, httpMock);

    const response = await libraryDriver.verifyIsPlaybackStarted();

    assert.deepEqual(
      response,
      true,
      "Playback is started returned false, when true was expected."
    );
  });

  it("Should Set Implicit Timeout", async function() {
    //To Do -- unable to see anywhere that the Timeout is actually set
    //will use libraryDriver.setTimeout()
  });

  it("Should Set Delay Press Timeout", async function() {
    //To Do -- unable to see anywhere that the Timeout is actually set
    //will use libraryDriver.setDelay()
  });

  it("Should Get Attribute", async function() {
    const responseValue = {
      XMLName: {
        Space: "",
        Local: "Label"
      },
      Attrs: [
        {
          Name: {
            Space: "",
            Local: "bounds"
          },
          Value: "{0, 11, 340, 48}"
        },
        {
          Name: {
            Space: "",
            Local: "color"
          },
          Value: "#ddddddff"
        },
        {
          Name: {
            Space: "",
            Local: "index"
          },
          Value: "0"
        },
        {
          Name: {
            Space: "",
            Local: "text"
          },
          Value: "Item 1"
        }
      ],
      Nodes: null
    };

    const { httpMock, mockResponse } = buildMockResponse(0, responseValue);
    nock(BASE_URL)
      .post(`/session/${sessionId}/element`)
      .reply(200, httpMock);

    const response = await libraryDriver.getElement(elementData);

    const attributeValue = await libraryDriver.getAttribute(response, "color");

    assert.deepEqual(
      attributeValue,
      "#ddddddff",
      "Attribute value does not match."
    );
  });
});
