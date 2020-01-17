# Utils

## Server

The `Server` util is used to start and stop the `WebDriverServer`.

```
import { Server } from 'rokul-runnings';
```

### start()

This function starts the server by running the binary `WebDriverServer`.

#### Examples

```
Server.start();
```

### stop()

This function stops the server.

#### Examples

```
Server.stop()
```

## ElementData

This util can be used to create an object that matches the ElementData type, to be passed in when searching for an element

```
import { ElementData } from 'rokul-runnings';
```

### Examples

```
const textElement = ElementData.text('text-value');
// the following two lines are functionally equal
const textElementInfo = await library.getElement(textElement);
const textElementInfo2 = await library.getElement({using: "text", value: "text-value"})

const attrElement = ElementData.attr('attribute-to-find', 'attribute-value');
// the following two lines are functionally equal
const attrElementsInfo = await library.getElements(attrElement);
const attrElementsInfo2 = await library.getElements({using: "attr", attribute: "attribute-to-find", value: "attribute-value"})

const tagElement = ElementData.tag('tag-value');
// the following two lines are functionally equal
const tagElementInfo = await library.getElement(tagElement);
const tagElementInfo2 = await library.getElement({using: "tag", value: "tag-value"});
```
