# Utils

## ElementData

This util can be used to create an object that matches the ElementData type, to be passed in when searching for an element

```
import { ElementData } from 'rokul-runnings';
```

### Examples

```
const textElement = ElementData.text('text-value');
// the following two lines are functionally equal
const textElementInfo = await rr.getElement(textElement);
const textElementInfo2 = await rr.getElement({using: "text", value: "text-value"})

const attrElement = ElementData.attr('attribute-to-find', 'attribute-value');
// the following two lines are functionally equal
const attrElementsInfo = await rr.getElements(attrElement);
const attrElementsInfo2 = await rr.getElements({using: "attr", attribute: "attribute-to-find", value: "attribute-value"})

const tagElement = ElementData.tag('tag-value');
// the following two lines are functionally equal
const tagElementInfo = await rr.getElement(tagElement);
const tagElementInfo2 = await rr.getElement({using: "tag", value: "tag-value"});
```
