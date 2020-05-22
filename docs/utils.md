# Utils

## ElementData

This util can be used to create an object that matches the ElementData type, to be passed in when searching for an element

```
import { ElementData } from 'rokul-runnings';
```

### Examples

```ts
const textElement = ElementData.text('text-value');
// the following three lines are functionally equal
const textElementInfo = await rr.getElement({ data: textElement });
const textElementInfo2 = await rr.getElement({ data: { using: 'text', value: 'text-value' } });
const textElementInfo3 = await rr.getElementByText({ value: 'text-value' });

const attrElement = ElementData.attr('attribute-to-find', 'attribute-value');
// the following three lines are functionally equal
const attrElementsInfo = await rr.getElements({ data: attrElement });
const attrElementsInfo2 = await rr.getElements({
  data: {
    using: 'attr',
    attribute: 'attribute-to-find',
    value: 'attribute-value',
  },
});
const attrElementsInfo3 = await rr.getElementsByAttr({ attribute: 'attribute-to-find', value: 'attribute-value' });

const tagElement = ElementData.tag('tag-value');
// the following three lines are functionally equal
const tagElementInfo = await rr.getElement({ data: tagElement });
const tagElementInfo2 = await rr.getElement({ data: { using: 'tag', value: 'tag-value' } });
const tagElementInfo3 = await rr.getElementByTag({ value: 'tag-value' });
```
