import { Plugin } from '../src/modules/plugin';
import { screenshotResponse } from './resources/screenshot-response';
import { sideloadResponse } from './resources/sideload-response';
import nock = require('nock');
import assert = require('assert');
import fs = require('fs');
import path = require('path');

describe('Plugin tests', function() {
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

  this.beforeEach(function() {
    plugin = new Plugin(rokuIP, username, password);
  });

  afterEach(function() {
    nock.cleanAll();
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

    assert.deepEqual(fileExists, true, 'Unable to find created screenshot.');
  });

  it('Should Install The Channel', async function() {
    nock(baseURL, headerMatcher)
      .post('/plugin_install')
      .reply(200, sideloadResponse);

    nock(baseURL)
      .post('/plugin_install')
      .reply(401, '', authenticateHeader);

    const response = await plugin.installChannel(channelLocation);

    assert.deepEqual(response, 200, 'Expected response status code does not match actual response status code!');
  });

  it('Should Replace The Channel', async function() {
    nock(baseURL, headerMatcher)
      .post('/plugin_install')
      .reply(200, sideloadResponse);

    nock(baseURL)
      .post('/plugin_install')
      .reply(401, '', authenticateHeader);

    const response = await plugin.replaceChannel(channelLocation);

    assert.deepEqual(response, 200, 'Expected response status code does not match actual response status code!');
  });

  it('Should Delete The Channel', async function() {
    nock(baseURL, headerMatcher)
      .post('/plugin_install')
      .reply(200, sideloadResponse);

    nock(baseURL)
      .post('/plugin_install')
      .reply(401, '', authenticateHeader);

    const response = await plugin.deleteChannel();

    assert.deepEqual(response, 200, 'Expected response status code does not match actual response status code!');
  });
});
