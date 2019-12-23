# js-roku-automation

## Setup

- In your project, install via `npm install "future name of project"`

### WebDriverServer

- Import `/src/utils/server`, specifically the `start()` and `stop()` functions.
- In your test setup, be sure to include `start()`.
- In your test teardown, be sure to include `stop()`.
- Mocha example:

```
const { start, stop } = require('./src/utils/server');

before(async function() {
    await start();
})

after(async function() {
    await stop();
})
```

### Library

- Import `/src/modules/library`, specifically the `Library` class.
- Before the tests begin running, you'll also need to instantiate the `Library` class
- After your test has finished, you'll want to close the existing session, through the `Library.close()` function.
- Mocha Example:

```
const Library = require('./src/modules/library');

beforeEach(async function() {
    const driver = new Library('0.0.0.0');
})

afterEach(async function() {
    await library.close();
})
```

## WebDriverServer

WebDriverServer is a binary compiled from the Go source code that Roku provided for [automated testing](https://github.com/rokudev/automated-channel-testing). It provides routing and handlers to forward commands to a Roku device.

Note: this binary was compiled for OS X and will not work for Linux or Windows

## Sideloading

You can sideload a new channel, replace the existing sideloaded channel, or remove the currently sidedloaded channel. This can be done through the exported functions from `plugin`.

```
const channel = require('channel-installer');

await channel.installChannel({
    rokuIP: "0.0.0.0",
    fileLocation: "./main.zip",
    username: "rokudev"
});
```

All of the functions require the IP address of the roku, the location of the channel (as a .zip file), and the username used to log in to the Development Application Installer. You do not need the WebDriverServer active to sideload a channel, as the command goes directly from client to Roku device.

## Screenshots

You can screenshot what is currently displayed on the screen. This can be done through the `getScreenshot()` function in `plugin`

```
const { screenshot } = require('plugin').getScreenshot;

await screenshot({
    rokuIP: "0.0.0.0"
    username: "rokudev",
    directoryPath: "/Users/my-user/Code/WillowTreeApps/js-roku-automation/", //path to the directory, optional
    directory: "images" //directory name, optional
    fileName: "" //custom file name, optional
});
```

The above would take a screenshot on the Roku device found at `0.0.0.0` and would save the screenshot to `/Users/my-user/Code/WillowTreeApps/js-roku-automation/images/` as a .jpg.

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
- Most of the functions provided are asynchronous. Why?
  - A majority of the functions are either HTTP requests or rely on responses from HTTP requests. In order to ensure that the requests have completed and the responses have returned, the functions were made asynchronous.
- I need to test the requests or responses. Is there any easier way to do that than running writing automation?
  - Yes! One of the contributors to this project has created a Postman collection. [See the collection here.](https://gist.github.com/aaron-goff/64152b5162bc4c0003c1962d8f811d9e)

## Documentation

Most of the documentation provided in the JSDocs information was provided from the Roku documentation for the [Roku Robot Framework Library](https://developer.roku.com/en-ca/docs/developer-program/dev-tools/automated-channel-testing/robot-framework-library.md) and [Roku WebDriver](https://developer.roku.com/en-ca/docs/developer-program/dev-tools/automated-channel-testing/web-driver.md).

## Todo

- Update references to files within the project to what they would look like to someone using the project as a dependency
- Maybe hook it up to swagger for even better documentation? `priority: 10`
- switch to typescript?
- dev dependencies for shipping

```

```

```

```
