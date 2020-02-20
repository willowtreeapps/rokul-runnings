import { Plugin } from '../src/modules/plugin';
import { screenshotResponse } from './resources/screenshot-response';
import { sideloadResponse } from './resources/sideload-response';
import chai = require('chai');
import fs = require('fs');
import nock = require('nock');
import path = require('path');

const expect = chai.expect;

describe('Plugin Unit Tests', function() {
  this.timeout(0);

  const rokuIP = '0.0.0.0';
  const baseURL = `http://${rokuIP}`;
  const username = 'rokudev';
  const password = 'password';
  const channelLocation = './test/resources/main.zip';
  const directoryPath = `${__dirname}/resources/images`;
  const fileName = 'screenshot-test';
  let plugin: Plugin;
  const authenticateHeader = {
    'www-authenticate': `Digest qop="auth", realm="rokudev", nonce="123456"`,
  };
  const headerMatcher = { reqheaders: { authorization: /".*"/ } };

  beforeEach(function() {
    plugin = new Plugin(rokuIP, username, password);
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

  it('Should Get The Screenshot', async function() {
    nock(baseURL, headerMatcher)
      .post('/plugin_inspect')
      .reply(200, screenshotResponse);

    nock(baseURL)
      .post('/plugin_inspect')
      .reply(401, '', authenticateHeader);

    nock(baseURL, headerMatcher)
      .get('/pkgs/dev.jpg')
      .replyWithFile(200, `${__dirname}/resources/images/response.jpg`);

    nock(baseURL)
      .get('/pkgs/dev.jpg')
      .reply(401, '', authenticateHeader);

    await plugin.getScreenshot({
      directoryPath,
      fileName,
    });

    const fileExists = fs.existsSync(path.resolve(directoryPath, `${fileName}.jpg`));

    expect(fileExists).to.eql(true);
  });

  it('Should Install The Channel', async function() {
    nock(baseURL, headerMatcher)
      .post('/plugin_install')
      .reply(200, sideloadResponse);

    nock(baseURL)
      .post('/plugin_install')
      .reply(401, '', authenticateHeader);

    expect(await plugin.installChannel(channelLocation)).to.equal(200);
  });

  it('Should Replace The Channel', async function() {
    nock(baseURL, headerMatcher)
      .post('/plugin_install')
      .reply(200, sideloadResponse);

    nock(baseURL)
      .post('/plugin_install')
      .reply(401, '', authenticateHeader);

    expect(await plugin.replaceChannel(channelLocation)).to.equal(200);
  });

  it('Should Delete The Channel', async function() {
    nock(baseURL, headerMatcher)
      .post('/plugin_install')
      .reply(200, sideloadResponse);

    nock(baseURL)
      .post('/plugin_install')
      .reply(401, '', authenticateHeader);

    expect(await plugin.deleteChannel()).to.equal(200);
  });
});
