TBD: Porting webDriver.py from the Roku Robot Framework to js

## WebDriverServer

WebDriverServer is a binary compiled from the Go source code that Roku provided for [automated testing](https://github.com/rokudev/automated-channel-testing). It provides routing and handlers to forward commands to a Roku device.

Note: this binary was compiled for OS X and will not work for Linux or Windows

## Todo

- Add documentation above functions
- - Maybe hook it up to swagger for even better documentation?
- Name the .js files better
- Figure out setUp/tearDown
- unit-ish tests
- real testing
- assertions (no assertions for now, maybe integrate them later?)
