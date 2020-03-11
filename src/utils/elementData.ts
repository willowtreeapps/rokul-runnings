import { ElementDataObject } from '../types/webdriver';

/** Returns an elementDataObject for a search by text */
export function text(text: string): ElementDataObject {
  return { using: 'text', value: text };
}

/** Returns an elementDataObject for a search by attr */
export function attr(attr: string, value: string): ElementDataObject {
  return { using: 'attr', attribute: attr, value: value };
}

/** Returns an elementDataObject for a search by tag, aka XMLName */
export function tag(tag: string): ElementDataObject {
  return { using: 'tag', value: tag };
}
