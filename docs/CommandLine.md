# Command Line

Rokul Runnings has a CLI to execute all commands in the Rokul Runnings class via the command line.

## Setup

### Install

Rokul Runnings CLI can be set up to run either globally or at a project level. In order to use either, they must be installed:

```
// global
npm install -g @willowtreeapps/rokul-runnings
```

```
// project level
npm install @willowtreeapps/rokul-runnings
```

### Defining Config values

Rokul Runnings CLI creates an instance of the Rokul Runnings class based on defaults specified in a config JSON file. The structure of that file looks like:

```json
{
  "rokuIPAddress": "",
  "username": "rokudev",
  "password": "password",
  "options": {
    "pressDelayInMillis": 1000,
    "retryDelayInMillis": 1000,
    "retries": 1
  },
  "printOptions": {
    "trueStyle": "",
    "falseStyle": "",
    "jsonKeyStyle": "",
    "jsonValueStyle": {
      "stringStyle": "",
      "booleanStyle": "",
      "numberStyle": ""
    },
    "jsonIndentAmount": 4
  }
}
```

The `rokuIPAddress`, `username`, `password`, and `options` can be set via the CLI and refer to the constructor values for the Rokul Runnings class:

```
rr -ip 127.0.0.2 -u newUsername -p newPassword --retryDelayInMillis 2000 --pressDelayInMillis 2000 --retries 2
rr --ip 127.0.0.3 --username newUsername2 --password newPassword2
```

Setting any option via the CLI will also save them in the config JSON file.

`printOptions` can also be set as a comma-delimited list via the CLI:

```
rr --printOptions trueStyle=blue.bgRed.bold,falseStyle=red.bgBlue.bold,jsonKeyStyle=keyword\(\'pink\'\)
```

`jsonValueStyle` fields can be set by just refering their key name.

```
rr --printOptions stringStyle=red,booleanStyle=blue,numberStyle=green
```

All of the print options can be defined via [Chalk](https://www.npmjs.com/package/chalk). Certain characters will need to be escaped when being passed in via command line, such as `(`, `)`, `'`, and `'`.

If you need to find out where your file currently lives, the `debug` command will print out the config path, as well as the Rokul Runnings instance created:

```
rr --debug
```

```rr
Configstore {
  path: '/path/to/rrconfig.json'
}
RokulRunnings {
  rokuIPAddress: '127.0.0.1',
  username: 'rokudev',
  password: 'password',
  devInstallerInfo: {
    username: 'rokudev',
    password: 'password',
    rokuIPAddress: 'http://127.0.0.1'
  },
  pressDelayInMillis: 1000,
  driver: Driver {
    rokuIPAddress: '127.0.0.1',
    retries: 1,
    baseURL: 'http://127.0.0.1:8060'
  },
  retryDelayInMillis: 1000,
  retries: 1
}
```

## Use

All of the following commands do not accept any parameters:
|CLI Option|Rokul Runnings Function|
|----|----|
|`-ga`,<br>`--getApps`|`getApps()`|
|`-gp`,<br>`--getPlayerInfo`|`getPlayerInfo()`|
|`--getScreenSource`|`getScreenSource()`|
|`-gc`,<br>`--getCurrentlChannelInfo`|`getCurrentChannelInfo()`|
|`-gd`,<br>`--getDeviceInfo`|`getDeviceInfo()`|
|`-gf`,<br>`--getFocusedElement`|`getFocusedElement()`|
|`--delete`|`deleteChannel()`|
|`--debug`| N/A |

Parameters can be passed in to the commands below. Parameters can either use the default parameter, in which case no key is required. Otherwise, parameters should be specified in a comma-delimited list, in the form of key=value, like so:
<br>`rr --command defaultParameterValue`
<br>`rr --command key1=value1,key2=value2,key3=value3`
|CLI Option|Parameters|Default Paramter|Rokul Runnings Function|Examples|
|----|----|----|----|----|
|`-lc`,<br>`--launchChannel`| `channelCode`, `contentId`, `mediaType`, `params` | `channelCode` | `launchTheChannel()` | `rr -lc dev`<br>`rr --launchChannel channelCode=1234,mediaType=foo`<br>`rr -lc`<br>'dev' is the default if no value is provided.|
|`-dl`,<br>`--deepLink`| `channelCode`, `contentId`, `mediaType`, `params` | `channelCode` | `deepLinkIntoChannel()` | `rr -dl dev`<br>`rr --deepLink channelCode=1234,mediaType=foo`|
|`--sendInstallChannel`|`channelCode`, `params`|`channelCode`|`sendInstallChannel()`|`rr --sendInstallChannel 12`|
|`-btn`<br>`--pressBtn`| `keyPress`, `params`|`keyPress`|`pressBtn()`|`rr -btn home`<br>`rr --pressBtn keyPress=home`|
|`--pressBtnDown`|`keyDown`, `params`|`keyDown`|`pressBtnDown()`|`rr --pressBtnDown keyDown=right`
|`--pressBtnUp`|`keyUp`, `params`|`keyUp`|`pressBtnUp()`|`rr --pressBtnUp select`|
|`-w`, `--sendWord`|`word`, `params`|`word`|`sendWord()`|`rr -w roku`|
|`--sendSequence`|`sequence`, `params`, `keyType`|`sequence`|`sendButtonSequence()`|`rr --sendSequence sequence=up^up^down`<br>Presses in the sequence are separated by a `^`|
|`--sendCustomSequence`|`customSequence`, `params`|`customSequence`|`sendMixedButtonSequence()`|`rr --sendCustomSequence customSequence=keyUp.home^keyPress.select^keyDown.right`<br>Key types are separated from key values with a `.`<br>Presses in the sequence are separated by a `^`|
|`--verifyChannelExist`|`id`|`id`|`verifyIsChannelExist()`|`rr --verifyChannelExist dev`<br>`rr --verifyChannelExist id=1234`<br>`rr --verifyChannelExist`<br>'dev' is the default if no value is provided.|
|`--verifyScreenLoaded`|`using`, `value`, `attribute`, `maxAttempts`| N/A |`verifyIsScreenLoaded()`|`rr --verifyScreenLoaded using=text,value=ArcInterpolator`|
|`--verifyElementOnScreen`|`using`, `value`, `attribute`, `maxAttempts`| N/A |`verifyIsElementOnScreen()`|`rr --verifyElementOnScreen using=tag,value=Label`|
|`--verifyFocusedElementIsOfCertainTag`|`tag`, `maxAttempts`| `tag`| `verifyFocusedElementIsOfCertainTag`|`rr --verifyFocusedElementIsOfCertainTag Label`<br>`rr --verifyFocusedElementIsOfCertainTag tag=Label,maxAttempts=2`|
|`--verifyChannelLoaded`|`id`, `maxAttempts`|`id`|`verifyIsChannelLoaded()`|`rr --verifyChannelLoaded dev`<br>`rr --verifyChannelLoaded id=dev`<br>`rr --verifyChannelLoaded`<br>'dev' is the default if no value is provided.<br>`id` must be specified if `maxAttempts` is specified.|
|`--verifyPlaybackStarted`|`maxAttempts`|`maxAttempts`|`verifyIsPlaybackStarted()`|`rr --verifyPlaybackStarted`<br>`rr --verifyPlaybackStarted 10`<br>`rr --verifyPlaybackStated maxAttempts=10`<br>All of the above are equivalent|
|`--getElement`,<br>`--getElements`|`using`, `value`, `attribute`| N/A |`getElement()`<br>`getElements()`|`rr --getElement using=attr,value=3,attribute=children`<br>`rr --getElements using=text,value=ArcInterpolator`
|`--getElementByText`<br>`--getElementsByText`|`value`|`value`|`getElementByText()`<br>`getElementsByText()`|`rr --getElementByText ArcInterpolator`<br>`rr --getElementsByText value=ArcInterpolator`|
|`--getElementByAttr`<br>`--getElementsByAttr`|`value`, `attribute`| N/A | `getElementByAttr()`<br>`getElementsByAttr()`|`rr --getElementByAttr value=5,attribute=children`<br>`rr --getElementsByAttr value=true,attribute=focused`|
|`--getElementByTag`<br>`--getElementsByTag`|`value`|`value`|`getElementByTag()`<br>`getElementsByTag()`|`rr --getElementByTag value=Label`<br>`rr --getElementsByTag Label`|
|`-gs`<br>`--getScreenshot`|`directoryPath`, `fileName`, `fileType`|`directoryPath`|`getScreenshot()`|`rr -gs`<br>`rr --getScreenshot directoryPath='../images'`<br>getScreenshot will fail if executed and the directoryPath specified does not exist.<br>If no value is passed in, the image will be saved to PWD|
|`--install`|`channelLocation`|`channelLocation`|`installChannel()`|`rr --install '/path/to/zip.zip`|
|`--replace`|`channelLocation`|`channelLocation`|`replaceChannel()`|`rr --replace '/path/to/zip.zip`|

## Global vs. Local

Rokul Runnings CLI uses simple logic to determine what config file to use. If the present working directory that the command is executed from contains a file named `rrconfig.json`, then that file is used. Otherwise, the global config file will be used. This will look something like FIND OUT WHAT IT LOOKS LIKE.

You can determine if you are using a local or global config file by running `rr --debug`, which will print out the Configstore path for Rokul Runnings.
