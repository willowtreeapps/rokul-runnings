import { elementDataObject } from "../types/webdriver";

export function text(text: string): elementDataObject {
  return { using: "text", value: text };
}

export function attr(attr: string, value: string): elementDataObject {
  return { using: "attr", attribute: attr, value: value };
}

export function tag(tag: string): elementDataObject {
  return { using: "tag", value: tag };
}
