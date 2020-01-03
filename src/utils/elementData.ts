import { elementDataObject } from "../types/webdriver";

/** Returns an elementDataObject for a search by text */
export function text(text: string): elementDataObject {
  return { using: "text", value: text };
}

/** Returns an elementDataObject for a search by attr */
export function attr(attr: string, value: string): elementDataObject {
  return { using: "attr", attribute: attr, value: value };
}

/** Returns an elementDataObject for a search by tag, aka XMLName */
export function tag(tag: string): elementDataObject {
  return { using: "tag", value: tag };
}
