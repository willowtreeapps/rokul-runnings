# js-roku-automation

## Setup

- TBD

## WebDriverServer

WebDriverServer is a binary compiled from the Go source code that Roku provided for [automated testing](https://github.com/rokudev/automated-channel-testing). It provides routing and handlers to forward commands to a Roku device.

Note: this binary was compiled for OS X and will not work for Linux or Windows

## FAQ

- What is this?
- - This library is an alternative to the Roku-provided framework written in python and robot framework [found here](https://github.com/rokudev/automated-channel-testing)
- Why?
- - Most test engineers are more familiar with javascript than they are with robot framework (and maybe also python.) By having the same functionality, but in a more well known language, it will allow more people to automate their tests and interactions with Roku devices
- Does this Library have built in assertions?
- - Somewhat. A few of the functions in the `library.js` class return boolean values (well, they actually just return `true`) and can be used with your favorite assertion libraries to verify that certain actions have been achieved.
- - But by and large, this library does not have it's own assertion methods. We anticipate that you can use the responses from the various methods to inform your testing assertions.
- What if I have suggestions or find issues?
- - Write up any feature suggestions or issues on the Github.

## Todo

- Add documentation above functions `priority: 1`
- - Maybe hook it up to swagger for even better documentation? `priority: 10`
- Figure out setUp/tearDown `priority: 3`
- unit-ish tests `priority: 4`
- real testing `priority: 2`
- assertions (no assertions for now, maybe integrate them later?) `priority: 5`
- - should we have the verification methods that return true also return false? `priority: 2 (with real testing)`
- also test everything because this is still all theoretical
