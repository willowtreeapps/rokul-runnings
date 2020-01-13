import { Library } from './src/modules/library';
import * as server from './src/utils/server';
import * as elementData from './src/utils/elementData';
export default Library;
export { Plugin } from './src/modules/plugin';
export const Server = { start: server.start, stop: server.stop };
export const ElementData = { text: elementData.text, attr: elementData.attr, tag: elementData.tag };
