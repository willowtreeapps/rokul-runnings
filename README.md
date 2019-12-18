# js-roku-automation

## Setup

- In your project, install via `npm install "future name of project"`

### WebDriverServer

- Import `/src/utils/server`, specifically the `start()` and `stop()` functions.
- In your test setup, be sure to include `start()`.
- In your test teardown, be sure to include `stop()`.
  - For reference, look at `Before()` and `After()` in `/src/examples/tests`.

### Library

- Import `/src/modules/library`, specifically the `Library` class.
- Before the tests begin running, you'll also need to instantiate the `Library` class
- After your test has finished, you'll want to close the existing session, through the `Library.close()` function.
  - For reference, look at `BeforeEach()` and `AfterEach()` in `/src/examples/tests`.

## WebDriverServer

WebDriverServer is a binary compiled from the Go source code that Roku provided for [automated testing](https://github.com/rokudev/automated-channel-testing). It provides routing and handlers to forward commands to a Roku device.

Note: this binary was compiled for OS X and will not work for Linux or Windows

## FAQ

- What is this?
  - This library is an alternative to the Roku-provided framework, which was written in python and robot framework [found here](https://github.com/rokudev/automated-channel-testing)
- Why?
  - Most test engineers are more familiar with javascript than they are with robot framework (and maybe also python.) By having the same functionality, but in a more well known language, it will allow more people to automate their tests and interactions with Roku devices
- Does this Library have built in assertions?
  - Somewhat. A few of the functions in the `library.js` class return boolean values and can be used with your favorite assertion libraries to verify that certain actions have been achieved.
  - But by and large, this library does not have it's own assertion methods. We anticipate that you can use the responses from the various methods to inform your testing assertions. If you need ideas about how the data is returned or how assertions can work, the `library-unit-tests.js` file might be a good place to start.
- What if I have suggestions or find issues?
  - Write up any feature suggestions or issues on the Github.

## Documentation

Most of the documentation provided in the JSDocs information was provided from the Roku documentation for the [Roku Robot Framework Library](https://developer.roku.com/en-ca/docs/developer-program/dev-tools/automated-channel-testing/robot-framework-library.md) and [Roku WebDriver](https://developer.roku.com/en-ca/docs/developer-program/dev-tools/automated-channel-testing/web-driver.md).

## Todo

- real testing hook ins `priority: 3`
- Maybe hook it up to swagger for even better documentation? `priority: 10`
- dev dependencies for shipping
