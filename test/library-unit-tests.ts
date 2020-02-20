import * as elementData from '../src/utils/elementData';
import * as mockData from './resources/webdriver-mock-data';
import { Buttons, Library } from '../src/modules/library';
import nock = require('nock');
import chai = require('chai');

const expect = chai.expect;

let libraryDriver: Library;
const sessionId = '123456';
const defaultData = elementData.text('test');
const defaultResponses = { responsesStatus: 0, responseValue: null };

function buildMockResponse({
  responseStatus,
  responseValue,
}: {
  responseStatus?: number;
  responseValue?: object | Array<object>;
}) {
  if (!responseStatus) responseStatus = 0;
  if (!responseValue) responseValue = null;
  const response = {
    sessionId: sessionId,
    status: responseStatus,
    value: responseValue,
  };
  const httpMock = response;
  const mockResponse = { body: response, status: 200 };
  return { httpMock, mockResponse };
}

describe('Library Unit tests', function() {
  this.timeout(0);

  beforeEach(async function() {
    libraryDriver = new Library('123.456.789.012');
    nock(libraryDriver.driver.baseURL)
      .get('/sessions')
      .reply(200, null);
    nock(libraryDriver.driver.baseURL)
      .post('/session')
      .reply(200, {
        sessionId: sessionId,
        status: 0,
        value: {
          ip: '123.456.789.012',
          timeout: 30000,
          pressDelay: 1000,
          vendorName: 'Roku',
          modelName: 'Roku Stick',
          language: 'en',
          country: 'us',
        },
      });
  });

  afterEach(async function() {
    nock(libraryDriver.driver.baseURL)
      .delete(`/session/${sessionId}`)
      .reply(200, defaultData);

    await libraryDriver.close();
    nock.cleanAll();
  });

  it('Should Launch the Channel', async function() {
    const { httpMock, mockResponse } = buildMockResponse(defaultResponses);

    nock(libraryDriver.driver.baseURL)
      .post(`/session/${sessionId}/launch`)
      .reply(200, httpMock);

    const response = await libraryDriver.launchTheChannel({ channelCode: 'dev' });

    expect(response).to.eql(mockResponse);
  });

  it('Should Get a List of Channels', async function() {
    const value = [
      {
        Title: 'YouTube TV',
        ID: '195316',
        Type: 'appl',
        Version: '1.0.80000001',
        Subtype: 'ndka',
      },
      {
        Title: 'rocute',
        ID: 'dev',
        Type: 'appl',
        Version: '1.0.1',
        Subtype: 'rsga',
      },
    ];
    const { httpMock } = buildMockResponse({
      responseValue: value,
    });

    nock(libraryDriver.driver.baseURL)
      .get(`/session/${sessionId}/apps`)
      .reply(200, httpMock);

    const response = await libraryDriver.getApps();

    expect(response).to.eql(value);
  });

  it('Should Verify Channel exists', async function() {
    const value = mockData.verifyChannelExists;

    const { httpMock } = buildMockResponse({
      responseValue: value,
    });
    nock(libraryDriver.driver.baseURL)
      .get(`/session/${sessionId}/apps`)
      .reply(200, httpMock);

    const response = await libraryDriver.verifyIsChannelExist({ id: 'dev' });

    expect(response).to.eql(true);
  });

  it('Should Verify Screen is Loaded', async function() {
    const { httpMock } = buildMockResponse(defaultResponses);
    nock(libraryDriver.driver.baseURL)
      .post(`/session/${sessionId}/element`)
      .reply(200, httpMock);

    expect(await libraryDriver.verifyIsScreenLoaded({ data: defaultData })).to.eql(true);
  });

  it('Should Verify Button is Pressed', async function() {
    const { httpMock } = buildMockResponse(defaultResponses);

    nock(libraryDriver.driver.baseURL)
      .post(`/session/${sessionId}/press`)
      .reply(200, httpMock);

    expect(await libraryDriver.pressBtn({ keyPress: Buttons.up })).to.eql(httpMock);
  });

  it('Should Verify Word is Pressed', async function() {
    const { httpMock } = buildMockResponse(defaultResponses);

    const word: string = 'hello';

    nock(libraryDriver.driver.baseURL)
      .post(`/session/${sessionId}/press`)
      .reply(200, httpMock)
      .persist();

    const response = await libraryDriver.sendWord({ word });
    const finalMockResponse: { [key: string]: object }[] = [];
    for (let charIndex = 0; charIndex < word.length; charIndex++) {
      const key = word.charAt(charIndex);
      finalMockResponse.push({ [key]: httpMock });
    }

    expect(response).to.eql(finalMockResponse);
  });

  it('Should Verify Button Sequence is Entered', async function() {
    const { httpMock, mockResponse } = buildMockResponse(defaultResponses);

    nock(libraryDriver.driver.baseURL)
      .post(`/session/${sessionId}/press`)
      .reply(200, httpMock)
      .persist();

    const buttonSequence = [Buttons.up, Buttons.up, Buttons.down];

    const response = await libraryDriver.sendButtonSequence({ sequence: buttonSequence });

    expect(response).to.eql(mockResponse);
  });

  it('Should Get The Element', async function() {
    const responseValue = mockData.getElement;

    const { httpMock } = buildMockResponse({
      responseValue: responseValue,
    });

    const mockResponse = {
      Attrs: {
        bounds: '{0, 11, 340, 48}',
        color: '#ddddddff',
        index: '0',
        text: 'Item 1',
      },
      XMLName: 'Label',
    };

    nock(libraryDriver.driver.baseURL)
      .post(`/session/${sessionId}/element`)
      .reply(200, httpMock);

    const response = await libraryDriver.getElement({ data: defaultData });

    expect(response).to.eql(mockResponse);
  });

  it('Should Get Elements', async function() {
    const responseValue = mockData.getElements;
    const { httpMock } = buildMockResponse({
      responseValue: responseValue,
    });

    const mockResponse = mockData.getElementsMockResponse;

    nock(libraryDriver.driver.baseURL)
      .post(`/session/${sessionId}/elements`)
      .reply(200, httpMock)
      .persist();

    const response = await libraryDriver.getElements({ data: defaultData });

    expect(response).to.eql(mockResponse);
  });

  it('Should Get Focused Element', async function() {
    const responseValue = mockData.getFocusedElement;

    const mockResponse = {
      XMLName: 'RenderableNode',
      Attrs: {
        bounds: '{0, 0, 340, 48}',
        children: '1',
        focusable: 'true',
        focused: 'true',
        index: '0',
      },
    };

    const { httpMock } = buildMockResponse({ responseValue: responseValue });

    nock(libraryDriver.driver.baseURL)
      .post(`/session/${sessionId}/element/active`)
      .reply(200, httpMock);

    const response = await libraryDriver.getFocusedElement();

    expect(response).to.eql(mockResponse);
  });

  it('Should Verify Channel Is Loaded', async function() {
    const responseValue = {
      Title: 'rocute',
      ID: 'dev',
      Type: 'appl',
      Version: '1.0.1',
      Subtype: 'rsga',
    };
    const { httpMock } = buildMockResponse({ responseValue: responseValue });

    nock(libraryDriver.driver.baseURL)
      .get(`/session/${sessionId}/current_app`)
      .reply(200, httpMock);

    const response = await libraryDriver.verifyIsChannelLoaded({ id: 'dev' });

    expect(response).to.eql(true);
  });

  it('Should Get Current Channel Info', async function() {
    const responseValue = {
      Title: 'rocute',
      ID: 'dev',
      Type: 'appl',
      Version: '1.0.1',
      Subtype: 'rsga',
    };
    const { httpMock } = buildMockResponse({ responseValue: responseValue });

    nock(libraryDriver.driver.baseURL)
      .get(`/session/${sessionId}/current_app`)
      .reply(200, httpMock);

    const response = await libraryDriver.getCurrentChannelInfo();

    expect(response).to.eql(responseValue);
  });

  it('Should Get Device Info', async function() {
    const responseValue = {
      ip: '123.456.789.012',
      timeout: 30000,
      pressDelay: 1000,
      vendorName: 'Roku',
      modelName: 'Roku Stick',
      language: 'en',
      country: 'US',
    };
    const { httpMock } = buildMockResponse({ responseValue: responseValue });

    nock(libraryDriver.driver.baseURL)
      .get(`/session/${sessionId}`)
      .reply(200, httpMock);

    const response = await libraryDriver.getDeviceInfo();

    expect(response).to.eql(responseValue);
  });

  it('Should Get Player Info', async function() {
    const responseValue = mockData.getPlayerInfo(sessionId);
    const { httpMock } = buildMockResponse({
      responseValue: responseValue.value,
    });

    nock(libraryDriver.driver.baseURL)
      .get(`/session/${sessionId}/player`)
      .reply(200, httpMock);

    const response = await libraryDriver.getPlayerInfo();
    responseValue.value.Position = 8500;
    responseValue.value.Duration = 5000;

    expect(response).to.eql(responseValue.value);
  });

  it('Should Verify Playback Is Started', async function() {
    const responseValue = mockData.verifyPlaybackIsStarted;
    const { httpMock } = buildMockResponse({ responseValue: responseValue });

    nock(libraryDriver.driver.baseURL)
      .get(`/session/${sessionId}/player`)
      .reply(200, httpMock);

    const response = await libraryDriver.verifyIsPlaybackStarted({});

    expect(response).to.eql(true);
  });

  it('Should Set Implicit Timeout', async function() {
    // To Do -- unable to see anywhere that the Timeout is actually set
    // will use libraryDriver.setTimeout()
  });

  it('Should Set Delay Press Timeout', async function() {
    // To Do -- unable to see anywhere that the Timeout is actually set
    // will use libraryDriver.setDelay()
  });
});
