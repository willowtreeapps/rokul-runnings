# Plugin

The `plugin` class interacts directly with the Roku, mimicking functionality that exists in the Development Application Installer (accesible by navigating to the Roku's IP address in a browser.)

It is named as such because all network calls are directed to `/plugin_{someEndpoint}`

## Instantiating

To instantiate the Plugin class, simply create a new plugin object

```

const plugin = new Plugin('0.0.0.0', 'username', 'password');

```

### Why Does Plugin Need My Username and Password?

- Plugin needs the username/password in order to successfully create a Digest Authentication header

### Constructor parameters

| Parameter     | Type   | Description                             |
| ------------- | ------ | --------------------------------------- |
| rokuIPAddress | string | The IP Address of the Roku              |
| username      | string | The username used to log in to the Roku |
| password      | string | The password used to log in to the Roku |

## getScreenshot()

The `getScreenshot()` function has two primary sub-functions: `generateScreenshot()` and `saveScreenshot()`.

- `generateScreenshot()` submits a POST network request to `/plugin_inspect`, which creates a screenshot which is saved at `http://{rokuIPAddress}/pkgs/dev.jpg`
- `saveScreenshot()` submits a GET network request to `/pkgs/dev.jpg`, which retrieves the most-recent screenshot and then saves the image to a local path.

This function returns void.

| Parameter     | Type    | Description                                                                                                                                                                          |
| ------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| directoryPath | string  | _Optional_: The path to the directory where the image should be saved. If this is not included, it will default to `path.resolve(__dirname)/images`                                  |
| fileName      | string  | _Optional_: The name of the image file to be saved, not including the `.jpg`. If this is not included, it will default to a name based on the current time, as `MM-DD-YYYY_HH-MM-SS` |
| print         | boolean | _Optional_: Flag to determine if a message should be printed on succesfully saving the image. If this is not included, it will default to `false`                                    |

### Examples

If the function is executed from a file within the `/test` directory:

```
await plugin.getScreenshot({
    fileName: 'screenshot'
})
```

Would save an image to `/test/images/screenshot.jpg`

Another example:

```
await plugin.getScreenshot({
    directoryPath: '../test/resources/images',
    fileName: 'screenshot',
    print: true
})
```

Would save an image to `/test/resources/images/screenshot.jpg`, and print out a message that states `Saved at {fullPathToTestDirectory}/test/resources/images/screenshot.jpg`

## installChannel(), replaceChannel()

`installChannel()` and `replaceChannel()` are almost identical. Both use the `sideload()` function to submit a POST request to `/plugin_install`, and both require a channel to be attached as a `.zip` file. As far as I can tell, both have the same ending state, which is that the specified channel is installed on the device. The only difference is in the `mysubmit` form data body, where `installChannel()` uses `Install`, and `replaceChannel()` uses `Replace`.

These functions return the response from the Roku as a string. The response is an HTML file. An example can be found as `/test/resources/sideload-response.ts`

| Parameter       | Type   | Description                                 |
| --------------- | ------ | ------------------------------------------- |
| channelLocation | string | The filepath of the channel to be installed |

### Examples

```
await plugin.installChannel('./channel.zip');
```

```
await plugin.replaceChannel('./channel.zip');
```

## deleteChannel()

`deleteChannel()` removes the sideloaded channel from the device. It submits a POST request to `/plugin_install`, with the `mysubmit` form data body using `Delete`.

This function returns the response from the Roku as a string. The response is an HTML file. An example can be found as `/test/resources/sideload-response.ts`

### Example

```
await plugin.deleteChannel();
```
