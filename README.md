# Rokul Runnings

This library is used to automate a Roku device.

[![npm version](https://img.shields.io/npm/v/@willowtreeapps/rokul-runnings.svg?style=plastic)](https://www.npmjs.org/package/@willowtreeapps/rokul-runnings)
[![node version](https://img.shields.io/node/v/@willowtreeapps/rokul-runnings?style=plastic&color=blue)](https://www.npmjs.org/package/@willowtreeapps/rokul-runnings)
[![CircleCI](https://circleci.com/gh/willowtreeapps/rokul-runnings.svg?style=svg)](https://circleci.com/gh/willowtreeapps/rokul-runnings)

## Setup

- In your project, install via `npm install @willowtreeapps/rokul-runnings`

### WebDriverServer

See [Server section of the Utils doc](./docs/utils.md#Server) for information on starting and stopping `WebDriverServer` automatically.

### Library

See [Library](./docs/library.md#Instantiating) docs file for more information.

## WebDriverServer

WebDriverServer is a binary compiled from the Go source code that Roku provided for [automated testing](https://github.com/rokudev/automated-channel-testing). It provides routing and handlers to forward commands to a Roku device.

Note: this binary was compiled for OS X and will not work for Linux or Windows

## Plugin

Both pieces of core functionality in the `plugin` class are unstable. They will execute, however they have been known to have a stream that continues after all functions have completed. They currently do not throw errors (although debugging for all exceptions may yield some results), but do not be surprised if you use these functions if they cause your tests to continue to "run" for a minute or more after completion.

For more information, look at the [Plugin documentation](./docs/plugin.md).

## FAQ

- What is this?
  - This library is an alternative to the Roku-provided framework, which was written in python and robot framework [found here](https://github.com/rokudev/automated-channel-testing)
- Why?
  - Most test engineers are more familiar with TypeScript than they are with robot framework (and maybe also python.) By having the same functionality, but in a more well known language, it will allow more people to automate their tests and interactions with Roku devices
- Does this Library have built in assertions?
  - Somewhat. A few of the functions in the `library.ts` class return boolean values and can be used with your favorite assertion libraries to verify that certain actions have been achieved.
  - But by and large, this library does not have it's own assertion methods. We anticipate that you can use the responses from the various methods to inform your testing assertions. If you need ideas about how the data is returned or how assertions can work, the `library-unit-tests.ts` file might be a good place to start.
- What if I have suggestions or find issues?
  - Write up any feature suggestions or issues on the Github.
- Most of the functions provided are asynchronous. Why?
  - A majority of the functions are either HTTP requests or rely on responses from HTTP requests. In order to ensure that the requests have completed and the responses have returned, the functions were made asynchronous.
- I need to test the requests or responses. Is there any easier way to do that than running writing automation?
  - Yes! One of the contributors to this project has created a Postman collection. [See the collection here.](https://gist.github.com/aaron-goff/64152b5162bc4c0003c1962d8f811d9e)

## Documentation

Most of the documentation provided in the inline comments was provided from the Roku documentation for the [Roku Robot Framework Library](https://developer.roku.com/en-ca/docs/developer-program/dev-tools/automated-channel-testing/robot-framework-library.md) and [Roku WebDriver](https://developer.roku.com/en-ca/docs/developer-program/dev-tools/automated-channel-testing/web-driver.md).
