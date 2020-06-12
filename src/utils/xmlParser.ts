import * as xmljs from 'xml-js';

/** Custom parser turning XML responses from Roku into JSON */
export function xmlParser(response: string) {
  console.log(`XMLParser response passed in is: ${response}`);
  if (!response.startsWith('Request Failed with an error code of:')) {
    return xmljs.xml2js(response, xmlToJsonOptions);
  } else {
    throw Error(response);
  }
}

/** Custom settings for parsing the XML responses to JSON */
const xmlToJsonOptions = {
  compact: true,
  attributesKey: 'attributes',
  textKey: 'text',
  declarationKey: 'declaration',
};
