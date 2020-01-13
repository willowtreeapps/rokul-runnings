# Utils

## Server

The `Server` util is used to start and stop the `WebDriverServer`.

### start()

This function starts the server by running the binary `WebDriverServer`.

#### Examples

```
server.start();
```

### stop()

This function stops the server.

#### Examples

```
server.stop()
```

## elementData

This util can be used to create an object that matches the elementData type, to be passed in when searching for an element.

### Examples

```
const textElement = elementData.text('text-value');
// the following two lines are functionally equal
const textElementInfo = await library.getElement(textElement);
const textElementInfo2 = await library.getElement({using: "text", value: "text-value"})

const attrElement = elementData.attr('attribute-to-find', 'attribute-value');
// the following two lines are functionally equal
const attrElementsInfo = await library.getElements(attrElement);
const attrElementsInfo2 = await library.getElements({using: "attr", attribute: "attribute-to-find", value: "attribute-value"})

const tagElement = elementData.tag('tag-value');
// the following two lines are functionally equal
const tagElementInfo = await library.getElement(tagElement);
const tagElementInfo2 = await library.getElement({using: "tag", value: "tag-value"});
```
