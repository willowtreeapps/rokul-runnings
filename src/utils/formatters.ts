import { XMLAttributes, bounds, AppUIResponseObject, SquashedAppUIObject } from '../types/RokulRunnings';

/** Default XML attributes to be passed in when typeifying attributes */
const defaultAttributes = {
  focusable: false,
  focused: false,
  visible: true,
};

/** Function to turn string attributes to their actual types */
function typeifyAttributes(attributes: XMLAttributes) {
  const keys = Object.keys(attributes);
  keys.forEach(key => {
    if (typeof attributes[key] === 'string') {
      if (key === 'bounds' && typeof attributes.bounds === 'string') {
        const regexp = /\d+/g;
        const boundsKeys = ['x', 'y', 'height', 'width'];
        let match: RegExpExecArray;
        const out = {};
        while ((match = regexp.exec(attributes.bounds)) !== null) {
          out[boundsKeys.shift()] = Number(match[0]);
        }
        attributes.bounds = out as bounds;
      } else if (
        key === 'children' ||
        key === 'count' ||
        key === 'focusItem' ||
        key === 'index' ||
        key === 'opacity' ||
        key === 'loadStatus'
      ) {
        attributes[key] = Number(attributes[key]);
      } else if (attributes[key] === 'true' || attributes[key] === 'false') {
        // any key with a value of true or false can assumed to be a boolean
        attributes[key] = attributes[key] === 'true';
      }
    }
  });
  return { ...defaultAttributes, ...attributes };
}

/** Function to take a more raw response from the Roku and turn it into a more digestible JSON */
export function squashAttributes(responseObject: AppUIResponseObject[]) {
  const elementsArray: SquashedAppUIObject[] = [];
  responseObject.forEach(element => {
    let elementName = Object.keys(element)[0];
    const childElement = element[elementName] as AppUIResponseObject;
    const childAttributes = typeifyAttributes(childElement.attributes);
    childAttributes.tag = elementName;
    if (childAttributes.name) {
      elementName = childAttributes.name;
    }
    elementsArray.push({ [elementName]: childAttributes } as SquashedAppUIObject);
  });
  return elementsArray;
}
