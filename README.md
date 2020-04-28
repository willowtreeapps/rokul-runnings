# Rokul Runnings

This library is used to automate a Roku device.

[![npm version](https://img.shields.io/npm/v/@willowtreeapps/rokul-runnings.svg?style=plastic)](https://www.npmjs.org/package/@willowtreeapps/rokul-runnings)
[![node version](https://img.shields.io/node/v/@willowtreeapps/rokul-runnings?style=plastic&color=blue)](https://www.npmjs.org/package/@willowtreeapps/rokul-runnings)
[![CircleCI](https://circleci.com/gh/willowtreeapps/rokul-runnings.svg?style=svg)](https://circleci.com/gh/willowtreeapps/rokul-runnings)

## Setup

- In your project, install via `npm install @willowtreeapps/rokul-runnings`
- Before using the `RokulRunnings` class, you will also need to instantiate the RokulRunnings class.

An example using Mocha and TypeScript:

```
import { RokulRunnings } from 'rokul-runnings';

describe('Tests for the X screen', function() {
    let rr: RokulRunnings;

    before(function() {
        // Start the class before the suite runs
        rr = new RokulRunnings(/*Roku IP Address =*/'0.0.0.0',
          /*username=*/'username',
          /*password=*/'password),
          {
            pressDelayInMillis: 1000,
            retryDelayInMillis: 1000,
            retries: 1
          }
    })

    it('Should Launch The Channel', async function() {
        await rr.launchTheChannel({channelCode: 'dev'});
    })

    it('Should Delete The Channel', async function() {
        await rr.deleteChannel();
    }
})
```

### RokulRunnings Class

See [RokulRunnings](./docs/RokulRunnings.md) docs file for more information.

#### Development Application Installer functions

Sideloading (specifically `installChannel()` and `replaceChannel()`) and Screenshotting (`getScreenshot()`) are somewhat flaky. They will execute, however they have been known to have a stream that continues after all functions have completed. They currently do not throw errors (although debugging for all exceptions may yield some results), but do not be surprised if you use these functions if they cause your tests to continue to "run" for a minute or more after completion.

For more information, look at the [RokulRunnings documentation](./docs/RokulRunnings.md).

## FAQ

- What is this?
  - This library is an alternative to the Roku-provided framework, which was written in python and robot framework [found here](https://github.com/rokudev/automated-channel-testing)
- Why?
  - Most test engineers are more familiar with TypeScript than they are with robot framework (and maybe also python.) By having the same functionality in a different language, it will allow more people to automate their tests and interactions with Roku devices in a language they may be more familiar with for automated testing.
- Does this have built in assertions?
  - Somewhat. A few of the functions in the `RokulRunnings` class return boolean values and can be used with your favorite assertion libraries to verify that certain actions have been achieved.
  - But by and large, this library does not have it's own assertion methods. We anticipate that you can use the responses from the various methods to inform your testing assertions. If you need ideas about how the data is returned or how assertions can work, the `rokul-runnings-unit-tests.ts` file might be a good place to start, or looking at the various responses in the [RokulRunnings documentation](./docs/RokulRunnings.md)
- What if I have suggestions or find issues?
  - Write up any feature suggestions or issues on the Github.
- Most of the functions provided are asynchronous. Why?
  - A majority of the functions are either HTTP requests or rely on responses from HTTP requests. In order to ensure that the requests have completed and the responses have returned, the functions were made asynchronous.
- I need to test the requests or responses. Is there any easier way to do that than running writing automation?
  - Yes! One of the contributors to this project has created a Postman collection. [See the collection here.](https://gist.github.com/aaron-goff/b2306f4446da3e1623488512b5973ad1)
- Whoa that screenshot you use in the unit tests is super cool! How'd you generate it?
  - It is a screenshot from a Roku component library, created by WillowTree! Check out (Rocute)[https://github.com/willowtreeapps/rocute] for ideas on how to create some components.

## Documentation

Most of the documentation provided in the inline comments was provided from the Roku documentation for the [Roku Robot Framework Library](https://developer.roku.com/en-ca/docs/developer-program/dev-tools/automated-channel-testing/robot-framework-library.md) and [Roku WebDriver](https://developer.roku.com/en-ca/docs/developer-program/dev-tools/automated-channel-testing/web-driver.md).
