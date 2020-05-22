import { XMLAttributes, bounds, AppUIResponseObject, SquashedAppUIObject, Apps } from '../types/RokulRunnings';

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

/** Specific formatting for responses from the `/query/apps` and `/query/active-app` calls
 *  Expected to be used in the following way: `jsonFormatterApps(jsonResponseToFormat)`
 */
export function jsonFormatterApps(responseObject: any) {
  const responseArray = responseObject.apps ? responseObject.apps.app : [responseObject['active-app'].app];
  const newResponseObject: Apps = {};
  for (let i = 0; i < responseArray.length; i++) {
    const text = responseArray[i].text;
    const attribute = responseArray[i].attributes;
    newResponseObject[text] = attribute;
  }

  if (responseObject.apps) {
    responseObject.apps = newResponseObject;
  } else {
    responseObject['active-app'] = newResponseObject;
  }

  return newResponseObject;
}

/** Specific formatting for responses from the `/query/media-player` call
 *  Expected to be used in the following way: `jsonFormatterMediaPlayer(jsonResponseToFormat)`
 */
export function jsonFormatterMediaPlayer(responseObject: any) {
  const player = responseObject.player;
  Object.keys(player).forEach(key => {
    if (Object.keys(player[key]).length === 1) {
      player[key] = player[key][Object.keys(player[key])[0]];
    }
  });
  return player;
}

/** Specific formatting for responses from the `device-info` call
 *  Expected to be used in the following way: `jsonFormatterDeviceInfo(jsonResponseToFormat)`
 */
export function jsonFormatterDeviceInfo(responseObject: any) {
  const deviceInfo = responseObject['device-info'];
  const deviceInfoKeys = Object.keys(deviceInfo);
  deviceInfoKeys.forEach(key => {
    // only change the value if the text key exists
    if (deviceInfo[key].text) {
      // remove the text key
      deviceInfo[key] = deviceInfo[key].text;
      // if the key has a boolean value, turn it from a string to a boolean
      if (deviceInfo[key] === 'true' || deviceInfo[key] === 'false') {
        deviceInfo[key] = deviceInfo[key] === 'true';
      }
    }
  });
  responseObject['device-info'] = deviceInfo;
  return responseObject;
}
