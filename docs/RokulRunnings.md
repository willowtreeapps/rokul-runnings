# RokulRunnings

The `RokulRunnings` class sends commands to the Roku device. The Roku then mostly responds with XML bodies, which `RokulRunnings` parses and returns as JSON.

## Instantiating

To instantiate the RokulRunnings class, simply create a new RokulRunnings object:

```ts
import { RokulRunnings } from 'rokul-runnings';

const rr = new RokulRunnings(/*Roku IP Address =*/ '0.0.0.0', /*username=*/ 'username', /*password=*/ 'password', {
  pressDelayInMillis: 1000,
  retryDelayInMillis: 1000,
  retries: 1,
});
```

### Parameters

| Parameter          | Type   | Description                                                                                            |
| ------------------ | ------ | ------------------------------------------------------------------------------------------------------ |
| rokuIPAddress      | string | The IP Address of the Roku. Used to establish to communicate with the Roku                             |
| username           | string | The username used to log in to the Roku Development Application Installer                              |
| password           | string | The password used to log in to the Roku Development Application Installer                              |
| pressDelayInMillis | number | _Optional_: Sets the delay between key presses, in milliseconds. The default value is 1000.            |
| retryDelayInMillis | number | _Optional_: Sets the delay between retrying network calls, in milliseconds. The default value is 1000. |
| retries            | number | _Optional_: Sets the amount of times an action will be retried. The default value is 1.                |

#### Why Does RokulRunnings Need My Username and Password?

- RokulRunnings needs the username/password in order to successfully create a Digest Authentication header

## launchTheChannel()

This function launches the specified channel.

| Parameter   | Type   | Description                                                                                                                                                                                    |
| ----------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| channelCode | string | ID of the channel to be launched. Released Roku channels have a specific `id`, which is a number. Sideloaded channels have the `id` of `'dev'`.                                                |
| contentId   | string | _Optional_: The ID of the [content](https://developer.roku.com/en-ca/docs/developer-program/discovery/implementing-deep-linking.md#understanding-deep-linking-parameters) to be played         |
| mediaType   | string | _Optional_: The [mediaType](https://developer.roku.com/en-ca/docs/developer-program/discovery/implementing-deep-linking.md#understanding-deep-linking-parameters) of the content to be played. |
| retries     | number | _Optional_: The number of times the axios call will be retried if a 500 error status is received. The default value is 3.                                                                      |
| params      | object | _Optional_: Parameters to be passed into the POST request, appended as query parameters on the end of the request URL. There is no default value.                                              |

### Return

This function returns the response status from the network call.

### Example

```ts
const response = await rr.launchTheChannel({ channelCode: 'dev', retries: 1 });
```

## deepLinkIntoChannel()

This function deep links into the specified channel

| Parameter   | Type   | Description                                                                                                                                                                        |
| ----------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| channelCode | string | ID of the channel to be launched. Released Roku channels have a specific `id`, which is a number. Sideloaded channels have the `id` of `'dev'`.                                    |
| contentId   | string | The ID of the [content](https://developer.roku.com/en-ca/docs/developer-program/discovery/implementing-deep-linking.md#understanding-deep-linking-parameters) to be played         |
| mediaType   | string | The [mediaType](https://developer.roku.com/en-ca/docs/developer-program/discovery/implementing-deep-linking.md#understanding-deep-linking-parameters) of the content to be played. |
| retries     | number | _Optional_: The number of times the axios call will be retried if a 500 error status is received. The default value is 3.                                                          |
| params      | object | _Optional_: Parameters to be passed into the POST request, appended as query parameters on the end of the request URL. There is no default value.                                  |

### Return

This function returns the response status from the network call.

### Example

```ts
const response = await rr.deepLinkIntoChannel({ channelCode: 'dev', contentId: 'myMovieId', mediaType: 'movie' });
```

## getApps()

| Parameter | Type   | Description                                                                                                                                            |
| --------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| retries   | number | _Optional_: The number of times the axios call will be retried if a 500 error status is received. The default value is RokulRunning's `retries` value. |

This function returns the list of all apps (channels) currently installed on the device.

### Return

This function returns an object that contains each channel as an object. Each channel object contains relevant information, as strings.

```json
{
  "Roku Media Player": { "id": "2213", "subtype": "sdka", "type": "appl", "version": "4.2.1657" },
  "Roku Tips & Tricks": { "id": "552944", "subtype": "rsga", "type": "appl", "version": "1.2.51" },
  "Roku Streaming Player Intro": { "id": "184661", "subtype": "sdka", "type": "appl", "version": "1.0.45" }
}
```

### Examples

```ts
const allApps = await rr.getApps();
```

## verifyIsChannelExist()

This function verifies that a specific channel is installed on the device.

The parameters in this function are passed in as a JSON object.

| Parameter | Type   | Description                                                                                                                                                          |
| --------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| apps      | array  | _Optional_: An array of the apps installed. This should be the response from `getApps()`. If this is not specified, the array will be the response from `getApps()`. |
| id        | string | The ID of the app to be found. Released Roku channels have a specific `id`, which is a number. Sideloaded channels have the `id` of `'dev'`                          |
| retries   | number | _Optional_: The number of times the axios call will be retried if a 500 error status is received. The default value is RokulRunning's `retries` value.               |

### Return

This function returns a boolean value, with `true` meaning the specified ID was found, and `false` meaning the specified ID was not found.

### Examples

```ts
const isChannelExist = await rr.verifyIsChannelExist({ id: 'dev' });
```

## verifyIsScreenLoaded(), verifyIsElementOnScreen()

These functions are identical. `verifyIsScreenLoaded()` contains the logic, and the name is exactly the same as the similar function in the original Roku Robot Framework. `verifyIsElementOnScreen()` is a name more in line with the intended use of the function.

| Parameter     | Type              | Description                                                                                                                                            |
| ------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| data          | elementDataObject | Element to be found on the screen. elementDataObject can easily be created by importing the `elementData` module and using one of the functions        |
| maxRetries    | number            | _Optional_: The maximum amount of times that the function should attempt to find the element. Defaults to `10`.                                        |
| delayInMillis | number            | _Optional_: The amount of time to wait between retries, in milliseconds. Defaults to RokulRunning's `retryDelayInMillis` value                         |
| httpRetries   | number            | _Optional_: The number of times the axios call will be retried if a 500 error status is received. The default value is RokulRunning's `retries` value. |

```ts
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

```ts
// Create data to be passed in
const data = elementData.text('textOnElement');

// Verify if element is found on screen
const isElementOnScreen = await rr.verifyIsElementOnScreen({ data });
```

## pressBtn() / pressBtnDown() / pressBtnUp/

This function simulates the press and release, press down, or release (press up) of a specific key. It is highly suggested that you import the `Buttons` enum to know the possible button strings.

| Parameter                  | Type   | Description                                                                                                                                            |
| -------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| keyPress / keyDown / keyUp | string | The key to be sent. This can be any of the values from the `buttons` enum, or an alphanumeric key (`LIT_{key}`)                                        |
| delayInMillis              | number | _Optional_: The delay before sending the key press, in milliseconds. The default value is RokulRunning's `pressDelayInMillis` value.                   |
| retries                    | number | _Optional_: The number of times the axios call will be retried if a 500 error status is received. The default value is RokulRunning's `retries` value. |
| params                     | object | _Optional_: Parameters to be passed into the POST request, appended as query parameters on the end of the request URL. There is no default value.      |

### Return

This function returns the response status from the network call.

### Examples

```ts
const pressResponse = await rr.pressBtn({ keyPress: Buttons.right });
const downResponse = await rr.pressBtnDown({ keyDown: Buttons.select });
const upResponse = await rr.pressBtnUp({ keyUp: Buttons.left });
```

## sendWord()

This function sends a word to be entered as part of a keyboard entry screen (say for searching for something). It accomplishes this by iterating over each letter in the provided word and sending each letter as part of a separate request body as `LIT_{letter}`.

| Parameter     | Type   | Description                                                                                                                                            |
| ------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| word          | string | The word to be entered                                                                                                                                 |
| delayInMillis | number | _Optional_: The delay before sending the key press, in milliseconds. The default value is RokulRunning's `pressDelayInMillis` value.                   |
| retries       | number | _Optional_: The number of times the axios call will be retried if a 500 error status is received. The default value is RokulRunning's `retries` value. |
| params        | object | _Optional_: Parameters to be passed into the POST request, appended as query parameters on the end of the request URL. There is no default value.      |

### Return

This function returns an array of objects, with the `LIT_{letter}` as the key and the response statuses as the value.

```json
[
  {
    "R": 200
  },
  {
    "O": 200
  },
  {
    "K": 200
  },
  {
    "U": 200
  }
]
```

### Examples

```ts
const response = await rr.sendWord({ word: 'Roku' });
```

## sendButtonSequence()

This function sends an array of keys, all of the same keyType (up, down, or press) to the Roku.

| Parameter     | Type                           | Description                                                                                                                                            |
| ------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| sequence      | an array of Buttons or strings | The sequence of keys to be sent.                                                                                                                       |
| delayInMillis | number                         | _Optional_: The delay before sending the key press, in milliseconds. The default value is RokulRunning's `pressDelayInMillis` value.                   |
| retries       | number                         | _Optional_: The number of times the axios call will be retried if a 500 error status is received. The default value is RokulRunning's `retries` value. |
| params        | object                         | _Optional_: Parameters to be passed into the POST request, appended as query parameters on the end of the request URL. There is no default value.      |
| keyType       | 'up', 'down', or 'press'       | _Optional_: The key type to be sent, associated with all keys in the sequence. Default value is `'press'`                                              |

### Return

This function returns an array of objects, with the `Button` as the key and the response statuses as the value.

```json
[
  {
    "up": 200
  },
  {
    "up": 200
  },
  {
    "select": 200
  }
]
```

### Examples

```ts
const buttonSequence = [buttons.up, buttons.up, buttons.select];

const response = await rr.sendButtonSequence({ sequence: buttonSequence });

const upResponse = await rr.sendButtonSequence({ sequence: buttonSequence, keyType: 'up' });
```

## sendMixedButtonSequence

This function sends an array of keys, with mixed keyTypes (up, down, or press) to the Roku.

| Parameter      | Type                | Description                                                                                                                                                                            |
| -------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| customSequence | an array of objects | The sequence of keys and keyTypes to be sent. Each object in the array should take the format of the keyType (up, down, or press) as the object key, and the key to send as the value. |
| delayInMillis  | number              | _Optional_: The delay before sending the key press, in milliseconds. The default value is RokulRunning's `pressDelayInMillis` value.                                                   |
| retries        | number              | _Optional_: The number of times the axios call will be retried if a 500 error status is received. The default value is RokulRunning's `retries` value.                                 |
| params         | object              | _Optional_: Parameters to be passed into the POST request, appended as query parameters on the end of the request URL. There is no default value.                                      |

### Return

This function returns an array of objects, with the keyType and key as the object key (as `"keyType:key"`), and the response statuses as the value.

```json
[
  {
    "up:select": 200
  },
  {
    "down:right": 200
  },
  {
    "press:left": 200
  }
]
```

### Example

```ts
const customSequence = [{ up: Buttons.select }, { down: Buttons.right }, { press: Buttons.left }];

const response = await rr.sendMixedButtonSequence({ customSequence });
```

## getElement(), getElements()

These functions return information about the specified elements. They are not used to interact with the specified elements. Do not think of these functions as something like `findElementBy...`.

The differ only in responses. `getElement()` returns information for the first element found, while `getElements()` returns information for all elements found.

| Parameter | Type              | Description                                                                                                                                            |
| --------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| data      | elementDataObject | Element to be found. elementDataObject can easily be created by importing the `elementData` module and using one of the functions                      |
| retries   | number            | _Optional_: The number of times the axios call will be retried if a 500 error status is received. The default value is RokulRunning's `retries` value. |

```ts
{
  using: string;
  value: string;
  attribute?: string;
}
```

`attribute` is only used if the `using` value is `'attr'`.

### Return

These functions return information about the specified elements. `getElement()` returns a singular object, where `getElements()` returns an array of objects:

```json
{
  "Label": {
    "color": "#262626ff",
    "focusable": false,
    "focused": false,
    "index": 0,
    "tag": "Label",
    "text": "ArcInterpolator",
    "visible": false
  }
}
```

```json
[
  {
    "Label": {
      "color": "#262626ff",
      "focusable": false,
      "focused": false,
      "index": 0,
      "tag": "Label",
      "text": "ArcInterpolator",
      "visible": false
    }
  },
  {
    "Label": {
      "color": "#262626ff",
      "focusable": false,
      "focused": false,
      "index": 0,
      "opacity": 0,
      "tag": "Label",
      "text": "ArcInterpolator",
      "visible": false
    }
  },
  {
    "Label": {
      "bounds": {
        "x": 0,
        "y": 0,
        "height": 340,
        "width": 26
      },
      "color": "#262626ff",
      "focusable": false,
      "focused": false,
      "index": 1,
      "tag": "Label",
      "text": "ArcInterpolator",
      "visible": true
    }
  }
]
```

The `bounds` key will return an object with this shape:

```ts
"bounds": {
  x: number;
  y: number;
  height: number;
  width: number;
}
```

The following keys will return a number (not a string): children, count, focusItem, index, opacity, and loadStatus.
Any key whose value returned from the Roku as a string `"true"` or `"false"` will be translated into an actual boolean - `true` or `false`.
All other keys will remain as strings.
The following keys have default values that will be added if not provided from the Roku: `focusable: false`, `focused: false`, and `visible: true`.

If an element returned has an attribute of 'name', then the element will be returned with the name value as the key, and a tag attribute with the XML name.

```json
{
  "Label": {
    "color": "#262626ff",
    "focusable": false,
    "focused": false,
    "index": 0,
    "name": "ExampleElement",
    "text": "ArcInterpolator",
    "visible": false
  }
}
```

would be returned as

```json
{
  "ExampleElement": {
    "color": "#262626ff",
    "focusable": false,
    "focused": false,
    "index": 0,
    "tag": "Label",
    "text": "ArcInterpolator",
    "visible": false
  }
}
```

### Examples

```ts
const data = elementData.text('ArcInterpolator');

const firstElement = await rr.getElement({ data });

const allElements = await rr.getElements({ data });
```

## getElementByText(), getElementByTag(), getElementsByText(), getElementByTags()

These functions return information about the specified elements. They are not used to interact with the specified elements. Do not think of these functions as something like `findElementBy...`.

The differ only in responses. `getElementBy...()` returns information for the first element found, while `getElementsBy...()` returns information for all elements found.

| Parameter | Type   | Description                                                                                                                                            |
| --------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| value     | string | Value to be passed along to the `elementDataObject`. For `...ByText()` this will be text, and for `...ByTag()` this will be the tag (XML)              |
| retries   | number | _Optional_: The number of times the axios call will be retried if a 500 error status is received. The default value is RokulRunning's `retries` value. |

### Return

These functions return information about the specified elements. `getElementBy...()` returns a singular object, where `getElementsBy...()` returns an array of objects:

```json
{
  "Label": {
    "color": "#262626ff",
    "focusable": false,
    "focused": false,
    "index": 0,
    "tag": "Label",
    "text": "ArcInterpolator",
    "visible": false
  }
}
```

```json
[
  {
    "Label": {
      "color": "#262626ff",
      "focusable": false,
      "focused": false,
      "index": 0,
      "tag": "Label",
      "text": "ArcInterpolator",
      "visible": false
    }
  },
  {
    "Label": {
      "color": "#262626ff",
      "index": 0,
      "opacity": 0,
      "tag": "Label",
      "text": "ArcInterpolator",
      "visible": false
    }
  },
  {
    "Label": {
      "bounds": { "x": 0, "y": 0, "height": 340, "width": 26 },
      "color": "#262626ff",
      "index": 1,
      "tag": "Label",
      "text": "ArcInterpolator",
      "visible": true
    }
  }
]
```

If an element returned has an attribute of 'name', then the element will be returned with the name value as the key, and a tag attribute with the XML name.

```json
{
  "Label": {
    "color": "#262626ff",
    "index": 0,
    "name": "ExampleElement",
    "text": "ArcInterpolator",
    "visible": false
  }
}
```

would be returned as

```json
{
  "ExampleElement": {
    "color": "#262626ff",
    "index": 0,
    "tag": "Label",
    "text": "ArcInterpolator",
    "visible": false
  }
}
```

### Examples

```ts
const textElement = await rr.getElementByText({ value: 'ArcInterpolator' });
const tagElement = await rr.getElementByTag({ value: 'Label' });

const textElements = await rr.getElementsByText({ value: 'ArcInterpolator' });
const tagElements = await rr.getElementsByTag({ value: 'Label' });
```

## getElementByAttribute(), getElementByAttributes()

These functions return information about the specified elements. They are not used to interact with the specified elements. Do not think of these functions as something like `findElementBy...`.

The differ only in responses. `getElementByAttribute()` returns information for the first element found, while `getElementsByAttribute()` returns information for all elements found.

| Parameter | Type   | Description                                                                                                                                            |
| --------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| attribute | string | Attribute to be passed along to the `elementDataObject`                                                                                                |
| value     | string | Attribute value to be passed along to the `elementDataObject`                                                                                          |
| retries   | number | _Optional_: The number of times the axios call will be retried if a 500 error status is received. The default value is RokulRunning's `retries` value. |

### Return

These functions return information about the specified elements. `getElementByAttribute()` returns a singular object, where `getElementsByAttribute()` returns an array of objects:

```json
{
  "Label": {
    "color": "#262626ff",
    "focusable": false,
    "focused": false,
    "index": 0,
    "tag": "Label",
    "text": "ArcInterpolator",
    "visible": false
  }
}
```

```json
[
  {
    "Label": {
      "color": "#262626ff",
      "index": 0,
      "focusable": false,
      "focused": false,
      "tag": "Label",
      "text": "ArcInterpolator",
      "visible": false
    }
  },
  {
    "Label": {
      "color": "#262626ff",
      "index": 0,
      "opacity": 0,
      "focusable": false,
      "focused": false,
      "tag": "Label",
      "text": "ArcInterpolator",
      "visible": false
    }
  },
  {
    "Label": {
      "bounds": { "x": 0, "y": 0, "height": 340, "width": 26 },
      "color": "#262626ff",
      "focusable": false,
      "focused": false,
      "index": 1,
      "tag": "Label",
      "text": "ArcInterpolator",
      "visible": true
    }
  }
]
```

If an element returned has an attribute of 'name', then the element will be returned with the name value as the key, and a tag attribute with the XML name.

```json
{
  "Label": {
    "color": "#262626ff",
    "index": 0,
    "name": "ExampleElement",
    "text": "ArcInterpolator",
    "visible": false
  }
}
```

would be returned as

```json
{
  "ExampleElement": {
    "color": "#262626ff",
    "index": 0,
    "tag": "Label",
    "text": "ArcInterpolator",
    "visible": false
  }
}
```

### Examples

```ts
const attributeElement = await rr.getElementByAttribute({ attribute: 'color', value: '#252525ff' });

const attributeElements = await rr.getElementsByAttribute({ attribute: 'color', value: '#252525ff' });
```

## getFocusedElement()

This function returns the information about the currently focused element.

| Parameter | Type   | Description                                                                                                                                            |
| --------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| retries   | number | _Optional_: The number of times the axios call will be retried if a 500 error status is received. The default value is RokulRunning's `retries` value. |

### Return

This function returns an object with element information:

```json
{
  "LabelList": {
    "bounds": { "x": 0, "y": 37, "height": 388, "width": 612 },
    "children": 23,
    "count": 21,
    "focusItem": 0,
    "focusable": true,
    "focused": true,
    "index": 0,
    "visible": true
  }
}
```

If an element returned has an attribute of 'name', then the element will be returned with the name value as the key, and a tag attribute with the XML name.

```json
{
  "LabelList": {
    "bounds": {
      "x": 0,
      "y": 37,
      "height": 388,
      "width": 612
    },
    "children": 23,
    "count": 21,
    "focusItem": 0,
    "focusable": true,
    "focused": true,
    "index": 0,
    "name": "componentList",
    "visible": true
  }
}
```

would be returned as

```json
{
  "componentList": {
    "bounds": {
      "x": 0,
      "y": 37,
      "height": 388,
      "width": 612
    },
    "children": 23,
    "count": 21,
    "focusItem": 0,
    "focusable": true,
    "focused": true,
    "index": 0,
    "name": "componentList",
    "tag": "LabelList",
    "visible": true
  }
}
```

The `bounds` key will return an object with this shape:

```ts
"bounds": {
  x: number;
  y: number;
  height: number;
  width: number;
}
```

The following keys will return a number (not a string): children, count, focusItem, index, opacity, and loadStatus.
Any key whose value returned from the Roku as a string `"true"` or `"false"` will be translated into an actual boolean - `true` or `false`.
All other keys will remain as strings.

### Examples

```ts
const element = await rr.getFocusedElement();
```

## verifyFocusedElementIsOfCertainTag()

This function verifies if the response from `getFocusedElement()` is of a certain tag or XMLName. It will check if the element returned's key matches the tag first. If it does not match, then it will check if the element's attributes contain a `tag` attribute and check that.

| Parameter     | Type   | Description                                                                                                                                            |
| ------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| tag           | string | The tag or XMLName expected to be found                                                                                                                |
| maxRetries    | number | _Optional_: The maximum amount of times to retry finding the correct element. If not specified, defaults to `10`.                                      |
| delayInMillis | number | _Optional_: The amount of time to wait between retries, in milliseconds. Defaults to RokulRunning's `retryDelayInMillis` value                         |
| retries       | number | _Optional_: The number of times the axios call will be retried if a 500 error status is received. The default value is RokulRunning's `retries` value. |

### Return

This function returns a boolean value, with `true` meaning the focused element is of the correct XMLName, and `false` meaning it is not.

### Example

```ts
const isElementRenderableNode = await rr.verifyFocusedElementIsOfCertainTag({ tag: 'RenderableNode' });
```

## getScreenSource()

This function returns the entirety of the screen.

| Parameter | Type   | Description                                                                                                                                            |
| --------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| retries   | number | _Optional_: The number of times the axios call will be retried if a 500 error status is received. The default value is RokulRunning's `retries` value. |

### Return

This function returns a JSON object that contains information about all elements on the screen.

To preserve space in this file, an example is stored in [a test JSON file](../test/resources/unitTest-JSONs/app-ui.json).

### Example

```ts
const allElements = await rr.getScreenSource();
```

## verifyIsChannelLoaded()

This function verifies if the current channel is the specified channel. Note: this function does not validate that the channel actually is currently appearing on the screen. The channel may be in the process of loading and still return true. Parameters for this function as passed in as an object.

| Parameter     | Type   | Description                                                                                                                                            |
| ------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| id            | string | The ID of the app to be found. Released Roku channels have a specific `id`, which is a number. Sideloaded channels have the `id` of `'dev'`            |
| maxRetries    | number | _Optional_: The maximum amount of times that the function should attempt to find the element. Defaults to `10`.                                        |
| delayInMillis | number | _Optional_: The amount of time to wait between retries, in milliseconds. Defaults to RokulRunning's `retryDelayInMillis` value                         |
| httpRetries   | number | _Optional_: The number of times the axios call will be retried if a 500 error status is received. The default value is RokulRunning's `retries` value. |

### Return

This function returns a boolean value, where `true` means that the current channel is the specified channel, and `false` means that the current channel is not the specified channel

### Examples

```ts
const isChannelLoaded = await rr.verifyIsChannelLoaded({ id: 'dev' });
```

## getCurrentChannelInfo()

This function returns information about the currently launched channel

| Parameter | Type   | Description                                                                                                                                            |
| --------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Retries   | number | _Optional_: The number of times the axios call will be retried if a 500 error status is received. The default value is RokulRunning's `retries` value. |

### Return

This function returns information about the currently launched channel as an object:

```json
{
  "rocute": {
    "id": "dev",
    "subtype": "rsga",
    "type": "appl",
    "version": "1.0.1"
  }
}
```

### Examples

```ts
const channelInfo = await rr.getCurrentChannelInfo();
```

## getDeviceInfo()

| Parameter | Type   | Description                                                                                                                                            |
| --------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Retries   | number | _Optional_: The number of times the axios call will be retried if a 500 error status is received. The default value is RokulRunning's `retries` value. |

This function returns information about the Roku device

### Return

This function returns information about the Roku device as an object:

To preserve space in this file, an example is stored in [a test JSON file](../test/resources/unitTest-JSONs/device-info.json).

### Examples

```ts
const deviceInfo = await rr.getDeviceInfo();
```

## getPlayerInfo()

| Parameter | Type   | Description                                                                                                                                            |
| --------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Retries   | number | _Optional_: The number of times the axios call will be retried if a 500 error status is received. The default value is RokulRunning's `retries` value. |

This function returns information about the media player.

### Return

This function returns information about the media player as an object:

```json
{
  "attributes": { "error": "false", "state": "play" },
  "plugin": {
    "bandwidth": "925831054 bps",
    "id": "dev",
    "name": "rocute"
  },
  "format": {
    "audio": "aac",
    "captions": "none",
    "container": "mp4",
    "drm": "none",
    "video": "mpeg4_15",
    "video_res": "1280x546"
  },
  "buffering": {
    "current": "1000",
    "max": "1000",
    "target": "0"
  },
  "new_stream": { "speed": "128000 bps" },
  "position": 270717,
  "duration": 887999,
  "is_live": "false",
  "runtime": "887999 ms",
  "stream_segment": {
    "bitrate": "0",
    "media_sequence": "89",
    "segment_type": "mux",
    "time": "268098"
  }
}
```

Note: `Position` and `Duration` are expected to be returned as a string, such as `1234 ms`, but are parsed down to just the numbers by the function, and are returned as a `number` instead of a `string`.

### Examples

```ts
const playerInfo = await rr.getPlayerInfo();
```

## verifyIsPlaybackStarted()

This function verifies if playback has been started on the device

| Parameter     | Type   | Description                                                                                                                                            |
| ------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| maxRetries    | number | _Optional_: The maximum amount of times that the function should attempt to find the element. Defaults to `10`.                                        |
| delayInMillis | number | _Optional_: The amount of time to wait between retries, in milliseconds. Defaults to RokulRunning's `retryDelayInMillis` value                         |
| httpRetries   | number | _Optional_: The number of times the axios call will be retried if a 500 error status is received. The default value is RokulRunning's `retries` value. |

### Return

This function returns a boolean value, where `true` means playback has started, and `false` means it has not.

### Examples

```ts
const isPlaybackStarted = await rr.verifyIsPlaybackStarted();
```

## getScreenshot()

The `getScreenshot()` function has two primary sub-functions: `generateScreenshot()` and `saveScreenshot()`.

- `generateScreenshot()` submits a POST network request to `/plugin_inspect`, which creates a screenshot which is saved at `http://{rokuIPAddress}/pkgs/dev.jpg`
- `saveScreenshot()` submits a GET network request to `/pkgs/dev.jpg`, which retrieves the most-recent screenshot and then saves the image to a local path.

| Parameter     | Type    | Description                                                                                                                                                                          |
| ------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| directoryPath | string  | _Optional_: The path to the directory where the image should be saved. If this is not included, it will default to `path.resolve(__dirname)/images`                                  |
| fileName      | string  | _Optional_: The name of the image file to be saved, not including the `.jpg`. If this is not included, it will default to a name based on the current time, as `MM-DD-YYYY_HH-MM-SS` |
| print         | boolean | _Optional_: Flag to determine if a message should be printed on succesfully saving the image. If this is not included, it will default to `false`                                    |

### Return

This function returns void.

### Examples

If the function is executed from a file within the `/test` directory:

```ts
await rr.getScreenshot({
  fileName: 'screenshot',
});
```

Would save an image to `/test/images/screenshot.jpg`

```ts
await rr.getScreenshot({
  directoryPath: '../test/resources/images',
  fileName: 'secondExample',
  print: true,
});
```

Would save an image to `/test/resources/images/secondExample.jpg`, and print out a message that states `Saved at {fullPathToTestDirectory}/test/resources/images/secondExample.jpg`

## installChannel(), replaceChannel()

`installChannel()` and `replaceChannel()` are almost identical. Both use the `sideload()` function to submit a POST request to `/plugin_install`, and both require a channel to be attached as a `.zip` file. As far as I can tell, both have the same ending state, which is that the specified channel is installed on the device. The only difference is in the `mysubmit` form data body, where `installChannel()` uses `Install`, and `replaceChannel()` uses `Replace`.

| Parameter       | Type   | Description                                 |
| --------------- | ------ | ------------------------------------------- |
| channelLocation | string | The filepath of the channel to be installed |

### Return

This function returns the response status code from the Roku as a number.

### Examples

```ts
await rr.installChannel('./channel.zip');
```

```ts
await rr.replaceChannel('./channel.zip');
```

## deleteChannel()

`deleteChannel()` removes the sideloaded channel from the device. It submits a POST request to `/plugin_install`, with the `mysubmit` form data body using `Delete`.

### Return

This function returns the response status code from the Roku as a number.

### Example

```ts
await rr.deleteChannel();
```
