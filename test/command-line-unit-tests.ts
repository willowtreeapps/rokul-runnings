import { configs } from '../src/commandLine/types';
import * as nock from 'nock';
import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import { exec, execSync, spawn } from 'child_process';
import * as shell from 'shelljs';
import Axios from 'axios';

const rrconfigFilePath = 'rrconfig.json';
const rrconfigDefault = {
  rokuIPAddress: '10.0.0.118',
  username: 'rokudev',
  password: 'Pass123',
  options: {
    pressDelayInMillis: 1000,
    retryDelayInMillis: 1000,
    retries: 1,
  },
  printOptions: {
    trueStyle: '',
    falseStyle: '',
    jsonKeyStyle: '',
    jsonValueStyle: {
      stringStyle: '',
      booleanStyle: '',
      numberStyle: '',
    },
    jsonIndentAmount: 4,
  },
};
const baseUrl = `http://${rrconfigDefault.rokuIPAddress}:8060`;

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

async function configReader(file = rrconfigFilePath) {
  const data = fs.readFileSync(file);
  return JSON.parse(data.toString()) as configs;
}

function generatePrintOptionsString(configData: configs) {
  let printOptionsString: string = '';
  const printKeys = Object.keys(configData.printOptions);
  printKeys.forEach(key => {
    if (key !== 'jsonValueStyle') {
      if (printOptionsString.length !== 0) {
        printOptionsString += ',';
      }
      printOptionsString += `${key}=${configData.printOptions[key]}`;
    } else {
      const valueKeys = Object.keys(configData.printOptions.jsonValueStyle);
      valueKeys.forEach(valueKey => {
        if (printOptionsString.length !== 0) {
          printOptionsString += ',';
        }
        printOptionsString += `${valueKey}=${configData.printOptions.jsonValueStyle[valueKey]}`;
      });
    }
  });
  return printOptionsString;
}

describe('Rokul Runnings Command Line Tests', function() {
  this.timeout(0);

  afterEach(async function() {
    nock.cleanAll();
  });

  beforeEach(function() {
    fs.writeFileSync(rrconfigFilePath, JSON.stringify(rrconfigDefault));
  });

  it('Should Set the Configs', async function() {
    const expectedConfigData = {
      rokuIPAddress: '0.0.0.0',
      username: 'testUser',
      password: 'testPass',
      options: {
        pressDelayInMillis: 100,
        retryDelayInMillis: 100,
        retries: 2,
      },
      printOptions: {
        trueStyle: 'red',
        falseStyle: 'blue',
        jsonKeyStyle: 'blue',
        jsonValueStyle: {
          stringStyle: 'green',
          booleanStyle: 'green',
          numberStyle: 'green',
        },
        jsonIndentAmount: 8,
      },
    };

    const printOptionsString = generatePrintOptionsString(expectedConfigData);

    execSync(`rr -ip ${expectedConfigData.rokuIPAddress}`);
    execSync(`rr -u ${expectedConfigData.username}`);
    execSync(`rr -p ${expectedConfigData.password}`);
    execSync(`rr --pressDelayInMillis ${expectedConfigData.options.pressDelayInMillis}`);
    execSync(`rr --retryDelayInMillis ${expectedConfigData.options.retryDelayInMillis}`);
    execSync(`rr --retries ${expectedConfigData.options.retries}`);
    execSync(`rr --printOptions ${printOptionsString}`);

    const actualConfigData: configs = await configReader();

    expect(actualConfigData).to.eql(expectedConfigData);
  });

  //   it('Should Launch the Channel', async function() {
  //     nock('http://10.0.0.118:8060')
  //       .post(/\/launch\/dev/)
  //       .reply(200);

  //     console.log('entering execSync...');

  //     exec('rr -lc dev', (error, stdout, stderr) => {
  //       if (error) {
  //         console.error(`exec error: ${error}`);
  //       }
  //       console.log(`stdout: ${stdout}`);
  //       console.error(`stderr: ${stderr}`);
  //     });
  //   });

  it('Should Get The Apps', async function() {
    const file = 'apps';
    nock(baseUrl)
      .get(`/query/apps`)
      .reply(200, readXml(file));

    shell.exec('rr -ga');
  });
  //     console.log(nock.isActive());
  //     console.log(nock.activeMocks());

  //     const response = Promise.resolve(
  //       exec('rr -ga', { encoding: 'utf-8' }, function(error, stdout, stderr) {
  //         if (error) {
  //           console.error(`exec error: ${error}`);
  //         }
  //         console.log(`stdout: ${stdout}`);
  //         console.error(`stderr: ${stderr}`);
  //       }),
  //     );
  //     console.log(response);
  //   });
});
