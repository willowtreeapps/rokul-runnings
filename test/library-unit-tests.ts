import { start, stop } from '../src/utils/server';
import * as elementData from '../src/utils/elementData';
import * as mockData from './resources/webdriver-mock-data';
import { buttons, Library } from '../src/modules/library';
import assert = require('assert');
import nock = require('nock');

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

describe('Library tests', function() {
  this.timeout(0);

  before(async function() {
    await start();
  });

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

  after(async function() {
    await stop();
  });

  it('Should Launch the Channel', async function() {
    const { httpMock, mockResponse } = buildMockResponse(defaultResponses);

    nock(libraryDriver.driver.baseURL)
      .post(`/session/${sessionId}/launch`)
      .reply(200, httpMock);

    const response = await libraryDriver.launchTheChannel('dev');
    assert.deepEqual(
      response,
      mockResponse,
      'Did not receive the correct response when attempting to launch the channel',
    );
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

    assert.deepEqual(response, value, 'Did not receive the correct response when attempting to retrieve all channels.');
  });

  it('Should Verify Channel exists', async function() {
    const value = mockData.verifyChannelExists;

    const { httpMock } = buildMockResponse({
      responseValue: value,
    });
    nock(libraryDriver.driver.baseURL)
      .get(`/session/${sessionId}/apps`)
      .reply(200, httpMock);

    const response = await libraryDriver.getApps();

    assert.deepEqual(
      libraryDriver.verifyIsChannelExist(response, 'dev'),
      true,
      'Unable to find channel from list of chanels provided.',
    );
  });

  it('Should Verify Screen is Loaded', async function() {
    const { httpMock } = buildMockResponse(defaultResponses);
    nock(libraryDriver.driver.baseURL)
      .post(`/session/${sessionId}/element`)
      .reply(200, httpMock);

    assert.deepEqual(
      await libraryDriver.verifyIsScreenLoaded(defaultData),
      true,
      'Unable to find identifying element that signals the screen as loaded',
    );
  });

  it('Should Verify Button is Pressed', async function() {
    const { httpMock } = buildMockResponse(defaultResponses);

    nock(libraryDriver.driver.baseURL)
      .post(`/session/${sessionId}/press`)
      .reply(200, httpMock);

    assert.deepEqual(
      await libraryDriver.pressBtn(buttons.up),
      httpMock,
      'Incorrect response when attempting to send a button to the device.',
    );
  });

  it('Should Verify Word is Pressed', async function() {
    const { httpMock } = buildMockResponse(defaultResponses);

    const word: string = 'hello';

    nock(libraryDriver.driver.baseURL)
      .post(`/session/${sessionId}/press`)
      .reply(200, httpMock)
      .persist();

    const response = await libraryDriver.sendWord(word);
    const finalMockResponse: { [key: string]: object }[] = [];
    for (let charIndex = 0; charIndex < word.length; charIndex++) {
      const key = word.charAt(charIndex);
      finalMockResponse.push({ [key]: httpMock });
    }

    assert.deepEqual(response, finalMockResponse, 'Not all responses from sending a word matched.');
  });

  it('Should Verify Button Sequence is Entered', async function() {
    const { httpMock, mockResponse } = buildMockResponse(defaultResponses);

    nock(libraryDriver.driver.baseURL)
      .post(`/session/${sessionId}/press`)
      .reply(200, httpMock)
      .persist();

    const buttonSequence = [buttons.up, buttons.up, buttons.down];

    const response = await libraryDriver.sendButtonSequence(buttonSequence);

    assert.deepEqual(response, mockResponse, 'Button sequence response did not match.');
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

    const response = await libraryDriver.getElement(defaultData);

    assert.deepEqual(response, mockResponse, 'Element response did not match expected value.');
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

    const response = await libraryDriver.getElements(defaultData);

    assert.deepEqual(response, mockResponse, 'Elements response did not match expected value.');
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

    assert.deepEqual(response, mockResponse, 'Focused element response value is not as expected.');
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

    assert.deepEqual(response, true, 'Current App is not launched.');
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

    assert.deepEqual(response, responseValue, 'Current App value does not match expected Current App value.');
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

    assert.deepEqual(response, responseValue, 'Device Info value does not match expected Device Info value.');
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

    assert.deepEqual(response, responseValue.value, 'Player Info value does not match expcted Player Info value.');
  });

  it('Should Verify Playback Is Started', async function() {
    const responseValue = mockData.verifyPlaybackIsStarted;
    const { httpMock } = buildMockResponse({ responseValue: responseValue });

    nock(libraryDriver.driver.baseURL)
      .get(`/session/${sessionId}/player`)
      .reply(200, httpMock);

    const response = await libraryDriver.verifyIsPlaybackStarted();

    assert.deepEqual(response, true, 'Playback is started returned false, when true was expected.');
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
