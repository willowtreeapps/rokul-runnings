async function text(text) {
  return [{ using: "text", value: text }];
}

async function attr(attr, value) {
  return [{ using: "attr", attribute: attr, value: value }];
}

async function tag(tag) {
  return [{ using: "tag", value: tag }];
}

module.exports = {
  attr,
  tag,
  text
};
