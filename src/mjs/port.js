/**
 * port.js
 */

import { getCurrentWindow, makeConnection } from './browser.js';
import { SIDEBAR } from './constant.js';

/* api */
const { windows } = browser;

/* constants */
const { WINDOW_ID_NONE } = windows;

/* ports */
export const ports = new Map();

/**
 * remove port
 *
 * @param {string} portId - port ID
 * @returns {boolean} - result
 */
export const removePort = async portId => ports.delete(portId);

/**
 * add port
 *
 * @returns {object} - runtime.Port
 */
export const addPort = async () => {
  const win = await getCurrentWindow({
    populate: true
  });
  const { id: windowId } = win;
  let port;
  if (windowId !== WINDOW_ID_NONE) {
    const portId = `${SIDEBAR}_${windowId}`;
    if (ports.has(portId)) {
      port = ports.get(portId);
    } else {
      port = await makeConnection({
        name: portId
      });
      ports.set(portId, port);
    }
  }
  return port || null;
};
