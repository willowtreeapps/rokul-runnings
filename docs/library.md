# Library

The `library` class interacts with the `WebDriverServer`, sending commands from the client code to the `WebDriverServer`. The `WebDriverServer` then turns these commands into `ECP` requests and sends them to the Roku Device. The Roku responds to the `WebDriverServer`, which turns the response into a `json` response to the client code.

## Instantiating

To instantiate the Library class, simply create a new library object:

```
import { Library } from 'rokul-runnings';

const library = new Library('0.0.0.0');
```

### Parameters

| Parameter          | Type   | Description                                                                                                          |
| ------------------ | ------ | -------------------------------------------------------------------------------------------------------------------- |
| rokuIPAddress      | string | The IP Address of the Roku. Used to establish and maintain a session, created automatically by the `WebDriverServer` |
| timeoutInMillis    | number | _Optional_: Sets the timeout length for requests to the Roku, in milliseconds. Defaults to 0.                        |
| pressDelayInMillis | number | _Optional_: Sets the delay between key presses, in milliseconds. Defaults to 0.                                      |

## close()

This functions ends the current session, created by the `WebDriverServer`.

### Return

This function returns void.

### Examples

```
await library.close();
```

## launchTheChannel()

This function launches the specified channel.

| Parameter   | Type   | Description                                                                                                                                    |
| ----------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| channelCode | string | ID of the channel to be launched. Released Roku channels have a specific `id`, which is a number. Sideloaded channels have the `id` of `'dev'` |
| retries     | number | _Optional_: The number of times the axios call will be retried if a 500 error status is received. The default value is 3.                      |

### Return

This function returns the response from the network call, which is an object containing the status code (most likely `200`) and the response data. The difference in statuses (`status` vs `body.status`) refers to the network call status (`status`) vs. the specific JSON Wire Protocol response (`body.status`). More information about the posible JSON Wire Protocol responses are available [here](https://developer.roku.com/en-ca/docs/developer-program/dev-tools/automated-channel-testing/web-driver.md#command-responses).

```
status: number,
body: {
  sessionId: string;
  status: 0;
  value: null;
}
```

### Example

```
const response = await library.launchTheChannel({channelCode: 'dev'});
```

## getApps()

| Parameter | Type   | Description                                                                                                               |
| --------- | ------ | ------------------------------------------------------------------------------------------------------------------------- |
| retries   | number | _Optional_: The number of times the axios call will be retried if a 500 error status is received. The default value is 3. |

This function returns the list of all apps (channels) currently installed on the device.

### Return

This function returns the value of the response from the `WebDriverServer` as an array of the follow objects:

```

{
Title: string;
ID: string;
Type: string;
Version: string;
Subtype: string;
}

```

### Examples

```

const allApps = await library.getApps();

```

## verifyIsChannelExist()

This function verifies that a specific channel is installed on the device.

The parameters in this function are passed in as a JSON object.

| Parameter | Type   | Description                                                                                                                                                          |
| --------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| apps      | array  | _Optional_: An array of the apps installed. This should be the response from `getApps()`. If this is not specified, the array will be the response from `getApps()`. |
| id        | string | The ID of the app to be found. Released Roku channels have a specific `id`, which is a number. Sideloaded channels have the `id` of `'dev'`                          |
| retries   | number | _Optional_: The number of times the axios call will be retried if a 500 error status is received. The default value is 3.                                            |

### Return

This function returns a boolean value, with `true` meaning the specified ID was found, and `false` meaning the specified ID was not found.

### Examples

```
const isChannelExist = await library.verifyIsChannelExist({id: 'dev'});
```

## verifyIsScreenLoaded(), verifyIsElementOnScreen()

These functions are identical. `verifyIsScreenLoaded()` contains the logic, and the name is exactly the same as the similar function in the original Roku Robot Framework. `verifyIsElementOnScreen()` is a name more in line with the intended use of the function.

| Parameter     | Type              | Description                                                                                                                                     |
| ------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| data          | elementDataObject | Element to be found on the screen. elementDataObject can easily be created by importing the `elementData` module and using one of the functions |
| maxRetries    | number            | _Optional_: The maximum amount of times that the function should attempt to find the element. Defaults to `10`.                                 |
| delayInMillis | number            | _Optional_: The amount of time to wait between retries, in milliseconds. Defaults to `1000`                                                     |
| retries       | number            | _Optional_: The number of times the axios call will be retried if a 500 error status is received. The default value is 3.                       |

```
{
  using: string;
  value: string;
  attribute?: string;
}
```

`attribute` is only used if the `using` value is `'attr'`.

### Return

This function returns a boolean value, with `true` meaning that the element was found and `false` meaning that the element was not found.

### Examples

```
// Create data to be passed in
const data = elementData.text('textOnElement');

// Verify if element is found on screen
const isElementOnScreen = await library.verifyIsElementOnScreen({data});
```

## pressBtn()

This function simulates the pressing of a specific key. It is highly suggested that you import the `Buttons` enum to know the possible button strings.

| Parameter     | Type   | Description                                                                                                               |
| ------------- | ------ | ------------------------------------------------------------------------------------------------------------------------- |
| keyPress      | string | The key to be pressed. This can be any of the values from the `buttons` enum                                              |
| delayInMillis | number | _Optional_: The delay before sending the key press, in milliseconds. If no value is provided, it defaults to `2000`       |
| retries       | number | _Optional_: The number of times the axios call will be retried if a 500 error status is received. The default value is 3. |

### Return

This function returns the response from the `WebDriverServer`. The `status` refers to the specific JSON Wire Protocol response. More information about the posible JSON Wire Protocol responses are available [here](https://developer.roku.com/en-ca/docs/developer-program/dev-tools/automated-channel-testing/web-driver.md#command-responses).

```
{
  sessionId: string;
  status: 0;
  value: null;
}
```

### Examples

```
const response = await library.pressBtn({keyPress: Buttons.up});
```

## sendWord()

This function sends a word to be entered as part of a keyboard entry screen (say for searching for something). It accomplishes this by iterating over each letter in the provided word and sending each letter as part of a separate request body as `LIT_{letter}`.

| Parameter     | Type   | Description                                                                                                               |
| ------------- | ------ | ------------------------------------------------------------------------------------------------------------------------- |
| word          | string | The word to be entered                                                                                                    |
| delayInMillis | number | _Optional_: The delay before sending the key press, in milliseconds. If no value is provided, it defaults to `2000`       |
| retries       | number | _Optional_: The number of times the axios call will be retried if a 500 error status is received. The default value is 3. |

### Return

This function returns an array of objects with the key being the letter passed in, and the values as objects resembling the following:

```
{
  sessionId: string;
  status: 0;
  value: null;
}
```

The `status` refers to the specific JSON Wire Protocol response. More information about the posible JSON Wire Protocol responses are available [here](https://developer.roku.com/en-ca/docs/developer-program/dev-tools/automated-channel-testing/web-driver.md#command-responses).

### Examples

```
const response = await library.sendWord({word: 'Roku'});
```

## sendButtonSequence()

This function sends an array of key presses to the Roku.

| Parameter     | Type          | Description                                                                                                               |
| ------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------- |
| sequence      | buttons array | The sequence of key presses to be sent. It must be an array of button enums.                                              |
| delayInMillis | number        | _Optional_: The delay before sending the key press, in milliseconds. If no value is provided, it defaults to `2000`       |
| retries       | number        | _Optional_: The number of times the axios call will be retried if a 500 error status is received. The default value is 3. |

### Return

This function returns the response from the `WebDriverServer`. The `status` refers to the specific JSON Wire Protocol response. More information about the posible JSON Wire Protocol responses are available [here](https://developer.roku.com/en-ca/docs/developer-program/dev-tools/automated-channel-testing/web-driver.md#command-responses).

```
{
  sessionId: string;
  status: 0;
  value: null;
}
```

### Examples

```
const buttonSequence = [ buttons.up, buttons.up, buttons.select ]

const response = await library.sendButtonSequence({sequence: buttonSequence});
```

## getElement(), getElements()

These functions return information about the specified elements. They are not used to interact with the specified elements. Do not think of these functions as something like `findElementBy...`.

The differ only in responses. `getElement()` returns information for the first element found, while `getElements()` returns information for all elements found.

| Parameter     | Type              | Description                                                                                                                       |
| ------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| data          | elementDataObject | Element to be found. elementDataObject can easily be created by importing the `elementData` module and using one of the functions |
| delayInMillis | number            | _Optional_: The amount of time to wait between retries, in milliseconds. Defaults to `1000`                                       |
| retries       | number            | _Optional_: The number of times the axios call will be retried if a 500 error status is received. The default value is 3.         |

```
{
  using: string;
  value: string;
  attribute?: string;
}
```

`attribute` is only used if the `using` value is `'attr'`.

### Return

These functions return information about the specified elements. `getElement()` returns a singular object, where `getElements()` returns an array of objects:

```
{
  XMLName: string;
  Attrs: { [key: string]: string };
  Nodes?: elementValueParsed[];
}
```

`elementValueParsed[]` is an array of objects that have the same structure as the object above. So a response could theoretically look like:

```
{
    XMLName: "RenderableNode",
    Attrs: {
        Name: "Object",
        Index: "0"
    },
    Nodes: [{
        XMLName: "List",
        Attrs: {
            Name: "ListObject",
            Index: "0"
        }
    }, {
        XMLName: "Poster",
        Attrs: {
            Name: "PosterObject",
            Index: "1"
        },
        Nodes: [{
            XMLName: "RenderableNode",
            Attrs: {
                Name: "NewNode",
                Index: "0"
            }
        }]
    }]
}
```

### Examples

```
const data = elementData.tag('RenderableNode');

const firstElement = await library.getElement({data});

const allElements = await library.getElements({data});
```

## getFocusedElement()

This function returns the information about the currently focused element.

| Parameter | Type   | Description                                                                                                               |
| --------- | ------ | ------------------------------------------------------------------------------------------------------------------------- |
| retries   | number | _Optional_: The number of times the axios call will be retried if a 500 error status is received. The default value is 3. |

### Return

This function returns an object:

```
{
  XMLName: string;
  Attrs: { [key: string]: string };
  Nodes?: elementValueParsed[];
}
```

`elementValueParsed[]` is an array of objects that have the same structure as the object above.

### Examples

```
const element = await library.getFocusedElement();
```

## verifyFocusedElementIsOfCertainTag()

This function verifies if the response from `getFocusedElement()` is of a certain tag or XMLName.

| Parameter  | Type   | Description                                                                                                               |
| ---------- | ------ | ------------------------------------------------------------------------------------------------------------------------- |
| tag        | string | The tag or XMLName expected to be found                                                                                   |
| maxRetries | number | _Optional_: The maximum amount of times to retry finding the correct element. If not specified, defaults to `10`.         |
| retries    | number | _Optional_: The number of times the axios call will be retried if a 500 error status is received. The default value is 3. |

### Return

This function returns a boolean value, with `true` meaning the focused element is of the correct XMLName, and `false` meaning it is not.

### Example

```
const isElementRenderableNode = await library.verifyFocusedelementIsOfCertainTag({tag: 'RenderableNode'});
```

## verifyIsChannelLoaded()

This function verifies if the current channel is the specified channel. Note: this function does not validate that the channel actually is currently appearing on the screen. The channel may be in the process of loading and still return true. Parameters for this function as passed in as an object.

| Parameter     | Type   | Description                                                                                                                                 |
| ------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| id            | string | The ID of the app to be found. Released Roku channels have a specific `id`, which is a number. Sideloaded channels have the `id` of `'dev'` |
| maxRetries    | number | _Optional_: The maximum amount of times that the function should attempt to find the element. Defaults to `10`.                             |
| delayInMillis | number | _Optional_: The amount of time to wait between retries, in milliseconds. Defaults to `1000`                                                 |
| retries       | number | _Optional_: The number of times the axios call will be retried if a 500 error status is received. The default value is 3.                   |

### Return

This function returns a boolean value, where `true` means that the current channel is the specified channel, and `false` means that the current channel is not the specified channel

### Examples

```
const isChannelLoaded = await library.verifyIsChannelLoaded({id: 'dev'});
```

## getCurrentChannelInfo()

This function returns information about the currently launched channel

| Parameter | Type   | Description                                                                                                               |
| --------- | ------ | ------------------------------------------------------------------------------------------------------------------------- |
| retries   | number | _Optional_: The number of times the axios call will be retried if a 500 error status is received. The default value is 3. |

### Return

This function returns information about the currently launched channel as an object:

```
{
  Title: string;
  ID: string;
  Type: string;
  Version: string;
  Subtype: string;
}
```

### Examples

```
const channelInfo = await library.getCurrentChannelInfo();
```

## getDeviceInfo()

| Parameter | Type   | Description                                                                                                               |
| --------- | ------ | ------------------------------------------------------------------------------------------------------------------------- |
| retries   | number | _Optional_: The number of times the axios call will be retried if a 500 error status is received. The default value is 3. |

This function returns information about the Roku device

### Return

This function returns information about the Roku device as an object:

```
{
  sessionId: string;
  status: number;
  value: {
    ip: string;
    timeout: number;
    pressDelay: number;
    vendorName: string;
    modelName: string;
    language: string;
    country: string;
    };
}
```

### Examples

```
const deviceInfo = await library.getDeviceInfo();
```

## getPlayerInfo()

| Parameter | Type   | Description                                                                                                               |
| --------- | ------ | ------------------------------------------------------------------------------------------------------------------------- |
| retries   | number | _Optional_: The number of times the axios call will be retried if a 500 error status is received. The default value is 3. |

This function returns information about the media player.

### Return

This function returns information about the media player as an object:

```
{
    Error: string;
    State: string;
    Format: {
      Audio: string;
      Captions: string;
      Container: string;
      Drm: string;
      Video: string;
      VideoRes: string;
    };
    Buffering: {
      Current: string;
      Max: string;
      Target: string;
    };
    NewStream: {
      Speed: string;
    };
    Position: number;
    Duration: number;
    IsLive: string;
    Runtime: string;
    StreamSegment: {
      Bitrate: string;
      MediaSequence: string;
      SegmentType: string;
      Time: string;
    };
  }
```

Note: `Position` and `Duration` are expected to be returned as a string, such as `1234 ms`, but are parsed down to just the numbers by the function, and are returned as a `number` instead of a `string`.

### Examples

```
const playerInfo = await library.getPlayerInfo();
```

## verifyIsPlaybackStarted()

This function verifies if playback has been started on the device

| Parameter     | Type   | Description                                                                                                               |
| ------------- | ------ | ------------------------------------------------------------------------------------------------------------------------- |
| maxRetries    | number | _Optional_: The maximum amount of times that the function should attempt to find the element. Defaults to `10`.           |
| delayInMillis | number | _Optional_: The amount of time to wait between retries, in milliseconds. Defaults to `1000`                               |
| retries       | number | _Optional_: The number of times the axios call will be retried if a 500 error status is received. The default value is 3. |

### Return

This function returns a boolean value, where `true` means playback has started, and `false` means it has not.

### Examples

```
const isPlaybackStarted = await library.verifyIsPlaybackStarted();
```

## setTimeout()

This function sets the timeout for the `WebDriverServer` requests.

| Parameter       | Type   | Description                                                                                                               |
| --------------- | ------ | ------------------------------------------------------------------------------------------------------------------------- |
| timeoutInMillis | number | The timeout length, in milliseconds                                                                                       |
| retries         | number | _Optional_: The number of times the axios call will be retried if a 500 error status is received. The default value is 3. |

### Return

This function returns void.

### Examples

```
await library.setTimeout({timeoutInMillis: 1000});
```

## setDelay()

This function sets the delay between key presses for the `WebDriverServer`.

| Parameter     | Type   | Description                                                                                                               |
| ------------- | ------ | ------------------------------------------------------------------------------------------------------------------------- |
| delayInMillis | number | The delay length, in milliseconds                                                                                         |
| retries       | number | _Optional_: The number of times the axios call will be retried if a 500 error status is received. The default value is 3. |

### Return

This function returns void.

### Examples

```
await library.setDelay({delayInMIllis: 1000});
```
