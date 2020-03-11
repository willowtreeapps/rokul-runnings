import * as elementData from '../src/utils/elementData';
import { Buttons, Library } from '../src/modules/library';
import { screenshotResponse } from './resources/screenshot-response';
import { sideloadResponse } from './resources/sideload-response';
import * as nock from 'nock';
import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';

let libraryDriver: Library;
const baseIP = '127.0.0.1';
let baseURL: string;
let baseURLWithoutPort: string;
const username = 'rokudev';
const password = 'password';
const defaultData = elementData.text('ArcInterpolator');
const channelLocation = './test/resources/main.zip';
const directoryPath = `${__dirname}/resources/images`;
const fileName = 'screenshot-test';
const authenticateHeader = {
  'www-authenticate': `Digest qop="auth", realm="rokudev", nonce="123456"`,
};
const headerMatcher = { reqheaders: { authorization: /".*"/ } };

function xmls(file: string) {
  return path.join(__dirname, `./resources/unitTest-XMLs/${file}.xml`);
}

function readXml(file: string) {
  return fs.readFileSync(xmls(file), 'utf8');
}

function jsons(file: string) {
  return path.join(__dirname, `./resources/unitTest-JSONs/${file}.json`);
}

function readJson(file: string) {
  return JSON.parse(fs.readFileSync(jsons(file), 'utf8'));
}

describe('Library Unit tests', function() {
  this.timeout(0);

  beforeEach(function() {
    libraryDriver = new Library(baseIP, username, password, { pressDelayInMillis: 200, retryDelayInMillis: 200 });

    baseURL = libraryDriver.driver.baseURL;
    // Development Application Installer requires the baseURL without the port attached.
    baseURLWithoutPort = baseURL.split(':8060')[0];
  });

  afterEach(function() {
    nock.cleanAll();
  });

  after(function() {
    fs.unlink(`${directoryPath}/${fileName}.jpg`, error => {
      if (error) {
        throw error;
      }
    });
  });

  it('Should Launch the Channel', async function() {
    nock(baseURL)
      .post(`/launch/dev`)
      .reply(200);

    const response = await libraryDriver.launchTheChannel({ channelCode: 'dev' });

    expect(response).to.eql(200);
  });

  it('Should Get a List of Channels', async function() {
    const file = 'apps';

    nock(baseURL)
      .get(`/query/apps`)
      .reply(200, readXml(file));

    const response = await libraryDriver.getApps();

    expect(response).to.eql(readJson(file));
  });

  it('Should Verify Channel exists', async function() {
    const file = 'apps';

    nock(baseURL)
      .get(`/query/apps`)
      .reply(200, readXml(file));

    const response = await libraryDriver.verifyIsChannelExist({ id: '552944' });

    expect(response).to.eql(true);
  });

  it('Should Verify Screen is Loaded', async function() {
    const file = 'app-ui';

    nock(baseURL)
      .get(`/query/app-ui`)
      .reply(200, readXml(file));

    expect(await libraryDriver.verifyIsScreenLoaded({ data: defaultData })).to.eql(true);
  });

  it('Should Verify Element Exists on Screen', async function() {
    const file = 'app-ui';

    nock(baseURL)
      .get(`/query/app-ui`)
      .reply(200, readXml(file));

    expect(await libraryDriver.verifyIsElementOnScreen({ data: defaultData })).to.eql(true);
  });

  it('Should Verify Button is Pressed', async function() {
    nock(baseURL)
      .post(`/keypress/up`)
      .reply(200);

    expect(await libraryDriver.pressBtn({ keyPress: Buttons.up })).to.eql(200);
  });

  it('Should Verify Word is Pressed', async function() {
    const word = 'hello';

    nock(baseURL)
      .post(/keypress\/LIT_./)
      .reply(200)
      .persist();

    const response = await libraryDriver.sendWord({ word });
    const expectedResponse: { [key: string]: number }[] = [];
    for (let charIndex = 0; charIndex < word.length; charIndex++) {
      const key = word.charAt(charIndex);
      expectedResponse.push({ ['LIT_' + key]: 200 });
    }

    expect(response).to.eql(expectedResponse);
  });

  it('Should Verify Button Sequence is Pressed', async function() {
    nock(baseURL)
      .post(/keypress\/.*/)
      .reply(200)
      .persist();

    const buttonSequence = [Buttons.up, Buttons.up, Buttons.down];
    const expectedResponse: { [key: string]: number }[] = [];
    for (let buttonIndex = 0; buttonIndex < buttonSequence.length; buttonIndex++) {
      const key = buttonSequence[buttonIndex];
      expectedResponse.push({ [key]: 200 });
    }

    const response = await libraryDriver.sendButtonSequence({ sequence: buttonSequence });

    expect(response).to.eql(expectedResponse);
  });

  it('Should Get The Element', async function() {
    const file = 'app-ui';

    nock(baseURL)
      .get(`/query/app-ui`)
      .reply(200, readXml(file));

    const response = await libraryDriver.getElement({ data: defaultData });

    expect(response).to.eql(readJson('getElement'));
  });

  it('Should Get Elements', async function() {
    const file = 'app-ui';

    nock(baseURL)
      .get(`/query/app-ui`)
      .reply(200, readXml(file))
      .persist();

    const response = await libraryDriver.getElements({ data: defaultData });

    expect(response).to.eql(readJson('getElements'));
  });

  it('Should Get Focused Element', async function() {
    const file = 'app-ui';

    nock(baseURL)
      .get(`/query/app-ui`)
      .reply(200, readXml(file));

    const response = await libraryDriver.getFocusedElement();

    expect(response).to.eql(readJson('getActiveElement'));
  });

  it('Should Verify the Focused Element Is Of A Certain Tag', async function() {
    const file = 'app-ui';

    nock(baseURL)
      .get(`/query/app-ui`)
      .reply(200, readXml(file));

    const response = await libraryDriver.verifyFocusedElementIsOfCertainTag({ tag: 'LabelList' });

    expect(response).to.eql(true);
  });

  it('Should Get The Screen Source', async function() {
    const file = 'app-ui';

    nock(baseURL)
      .get(`/query/app-ui`)
      .reply(200, readXml(file));

    const response = await libraryDriver.getScreenSource();

    expect(response).to.eql(readJson('app-ui'));
  });

  it('Should Verify Channel Is Loaded', async function() {
    const file = 'active-app';

    nock(baseURL)
      .get(`/query/active-app`)
      .reply(200, readXml(file));

    const response = await libraryDriver.verifyIsChannelLoaded({ id: 'dev' });

    expect(response).to.eql(true);
  });

  it('Should Get Current Channel Info', async function() {
    const file = 'active-app';

    nock(baseURL)
      .get(`/query/active-app`)
      .reply(200, readXml(file));

    const response = await libraryDriver.getCurrentChannelInfo();

    expect(response).to.eql(readJson(file));
  });

  it('Should Get Device Info', async function() {
    const file = 'device-info';

    nock(baseURL)
      .get(`/query/device-info`)
      .reply(200, readXml(file));

    const response = await libraryDriver.getDeviceInfo();

    expect(response).to.eql(readJson(file));
  });

  it('Should Get Player Info', async function() {
    const file = 'media-player';

    nock(baseURL)
      .get(`/query/media-player`)
      .reply(200, readXml(file));

    const response = await libraryDriver.getPlayerInfo();

    expect(response).to.eql(readJson(file));
  });

  it('Should Verify Playback Is Started', async function() {
    const file = 'media-player';

    nock(baseURL)
      .get(`/query/media-player`)
      .reply(200, readXml(file));

    const response = await libraryDriver.verifyIsPlaybackStarted({});

    expect(response).to.eql(true);
  });

  it('Should Get The Screenshot', async function() {
    nock(baseURLWithoutPort, headerMatcher)
      .post('/plugin_inspect')
      .reply(200, screenshotResponse);

    nock(baseURLWithoutPort)
      .post('/plugin_inspect')
      .reply(401, '', authenticateHeader);

    nock(baseURLWithoutPort, headerMatcher)
      .get('/pkgs/dev.jpg')
      .replyWithFile(200, `${__dirname}/resources/images/response.jpg`);

    nock(baseURLWithoutPort)
      .get('/pkgs/dev.jpg')
      .reply(401, '', authenticateHeader);

    await libraryDriver.getScreenshot({
      directoryPath,
      fileName,
    });

    const fileExists = fs.existsSync(path.resolve(directoryPath, `${fileName}.jpg`));

    expect(fileExists).to.eql(true);
  });

  it('Should Install The Channel', async function() {
    nock(baseURLWithoutPort, headerMatcher)
      .post('/plugin_install')
      .reply(200, sideloadResponse);

    nock(baseURLWithoutPort)
      .post('/plugin_install')
      .reply(401, '', authenticateHeader);

    expect(await libraryDriver.installChannel(channelLocation)).to.equal(200);
  });

  it('Should Replace The Channel', async function() {
    nock(baseURLWithoutPort, headerMatcher)
      .post('/plugin_install')
      .reply(200, sideloadResponse);

    nock(baseURLWithoutPort)
      .post('/plugin_install')
      .reply(401, '', authenticateHeader);

    expect(await libraryDriver.replaceChannel(channelLocation)).to.equal(200);
  });

  it('Should Delete The Channel', async function() {
    nock(baseURLWithoutPort, headerMatcher)
      .post('/plugin_install')
      .reply(200, sideloadResponse);

    nock(baseURLWithoutPort)
      .post('/plugin_install')
      .reply(401, '', authenticateHeader);

    expect(await libraryDriver.deleteChannel()).to.equal(200);
  });
});
