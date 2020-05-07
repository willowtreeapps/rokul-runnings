import { ElementDataObject, AppUIResponseObject, XMLAttributes } from '../types/RokulRunnings';

/** Finds all elements that match the specified search terms */
export function matchElements(
  searchElements: ElementDataObject,
  actualElement: AppUIResponseObject,
  elementName: string,
) {
  const foundElements = [];
  // Iterate over each key in the passed in element
  for (const key of Object.keys(actualElement)) {
    if (typeof actualElement[key] === 'object') {
      if (Array.isArray(actualElement[key])) {
        const elementArray = actualElement[key];
        for (let i = 0; i < elementArray.length; i++) {
          // If `actualElement[key]` is an Array object, each element needs to be iterated over
          foundElements.push(...this.matchElements(searchElements, actualElement[key][i], key));
        }
      } else {
        if (key === 'attributes' && this.checkElements({ searchElements, actualElement: actualElement[key] })) {
          // This covers the cases where `searchElements.using` === 'text' or 'attribute'
          foundElements.push({ [elementName]: actualElement });
        } else if (key !== 'attributes' && this.checkElements({ searchElements, elementTag: key })) {
          // This covers the case where `searchElements.using` === 'tag'
          foundElements.push({ [key]: actualElement[key] });
        } else {
          // If the above conditions are not met, then the element needs to be passed through this function
          foundElements.push(...this.matchElements(searchElements, actualElement[key] as AppUIResponseObject, key));
        }
      }
    }
  }

  return foundElements;
}

/** Determines if a singular element matches the search criteria */
export function checkElements({
  searchElements,
  actualElement = {},
  elementTag = '',
}: {
  searchElements: ElementDataObject;
  actualElement?: XMLAttributes;
  elementTag?: string;
}) {
  if (searchElements.using === 'text' && actualElement.text) {
    return searchElements.value === actualElement.text;
  } else if (searchElements.using === 'attr' && actualElement[searchElements.attribute]) {
    return searchElements.value === actualElement[searchElements.attribute];
  } else if (searchElements.using === 'tag') {
    return searchElements.value === elementTag;
  } else {
    return false;
  }
}
