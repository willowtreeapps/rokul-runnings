# Rokul Runnings

This library is used to automate a Roku device.

[![npm version](https://img.shields.io/npm/v/@willowtreeapps/rokul-runnings.svg?style=plastic)](https://www.npmjs.org/package/@willowtreeapps/rokul-runnings)
[![node version](https://img.shields.io/node/v/@willowtreeapps/rokul-runnings?style=plastic&color=blue)](https://www.npmjs.org/package/@willowtreeapps/rokul-runnings)
[![CircleCI](https://circleci.com/gh/willowtreeapps/rokul-runnings.svg?style=svg)](https://circleci.com/gh/willowtreeapps/rokul-runnings)

## Setup

- In your project, install via `npm install @willowtreeapps/rokul-runnings`
- Before using the `Library` class, you will need to start the WebDriverServer.
- Before using the `Library` class, you will also need to start the Library.
- Before using the `Plugin` class, you will need to start the Plugin.

An example using Mocha and TypeScript:

```
import { Library, Plugin, Server } from 'rokul-runnings';

describe('Tests for the X screen', () = >{
    let library: Library;
    let plugin: Plugin;

    before(() => {
        // Starting the WebDriverServer before the suite runs
        Server.start();
        // Start the library before the suite runs
        library = new Library('0.0.0.0')
        // Start the plugin before the suite runs
        plugin = new Plugin('0.0.0.0', 'username', 'password')
    })

    afterEach(async () => {
        // Close the session with the WebDriverServer
        await library.close();
    })

    after(() => {
        // Stopping the WebDriverServer after the suite runs
        Server.stop();
    })

    it('Should Launch The Channel', async () => {
        await library.launchTheChannel('dev');
    })

    it('Should Delete The Channel', () => {
        await plugin.deleteChannel();
    }
})
```

As can be seen, there is a corresponding `close()` function for the `Library` class. This does not destroy the Library, but instead closes the session that has been established with the WebDriverServer. This does not _have_ to be executed, but is in best practice to not let sessions hang around. Each Roku device can only have one concurrent session between the WebDriverServer and itself. The `buildURL()` and `createNewSession()` functions in `webdriver.ts` handle all of the logic for determining if a session currently exists (in which case, we just use that session), and if one does not, creating a session.

### WebDriverServer

See [Server section of the Utils doc](./docs/utils.md#Server) for more information on starting and stopping `WebDriverServer` automatically.

### Library

See [Library](./docs/library.md) docs file for more information.

### Plugin

Both pieces of core functionality in the `plugin` class are unstable. They will execute, however they have been known to have a stream that continues after all functions have completed. They currently do not throw errors (although debugging for all exceptions may yield some results), but do not be surprised if you use these functions if they cause your tests to continue to "run" for a minute or more after completion.

For more information, look at the [Plugin documentation](./docs/plugin.md).

## WebDriverServer

WebDriverServer is a binary compiled from the Go source code that Roku provided for [automated testing](https://github.com/rokudev/automated-channel-testing). It provides routing and handlers to forward commands to a Roku device.

Note: this binary was compiled for OS X and will not work for Linux or Windows

## FAQ

- What is this?
  - This library is an alternative to the Roku-provided framework, which was written in python and robot framework [found here](https://github.com/rokudev/automated-channel-testing)
- Why?
  - Most test engineers are more familiar with TypeScript than they are with robot framework (and maybe also python.) By having the same functionality in a different language, it will allow more people to automate their tests and interactions with Roku devices in a language they may be more familiar with for automated testing.
- Does this have built in assertions?
  - Somewhat. A few of the functions in the `library.ts` class return boolean values and can be used with your favorite assertion libraries to verify that certain actions have been achieved.
  - But by and large, this library does not have it's own assertion methods. We anticipate that you can use the responses from the various methods to inform your testing assertions. If you need ideas about how the data is returned or how assertions can work, the `library-unit-tests.ts` file might be a good place to start, or looking at the various responses in the [library documentation](./docs/library.md)
- What if I have suggestions or find issues?
  - Write up any feature suggestions or issues on the Github.
- Most of the functions provided are asynchronous. Why?
  - A majority of the functions are either HTTP requests or rely on responses from HTTP requests. In order to ensure that the requests have completed and the responses have returned, the functions were made asynchronous.
- I need to test the requests or responses. Is there any easier way to do that than running writing automation?
  - Yes! One of the contributors to this project has created a Postman collection. [See the collection here.](https://gist.github.com/aaron-goff/64152b5162bc4c0003c1962d8f811d9e) You will still need to spin up a WebDriverServer, which can be done by either cloning this repo and executing the binary, or following the instructions in the [Roku Robot Framework repository](https://github.com/rokudev/automated-channel-testing).

## Documentation

Most of the documentation provided in the inline comments was provided from the Roku documentation for the [Roku Robot Framework Library](https://developer.roku.com/en-ca/docs/developer-program/dev-tools/automated-channel-testing/robot-framework-library.md) and [Roku WebDriver](https://developer.roku.com/en-ca/docs/developer-program/dev-tools/automated-channel-testing/web-driver.md).
