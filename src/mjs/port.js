/**
 * port.js
 */

import { logErr, throwErr } from './common.js';
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
 * port on disconnect
 *
 * @param {object} port - runtime.Port
 * @returns {Function} - promise chain
 */
export const portOnDisconnect = (port = {}) => {
  const { error, name: portId } = port;
  error && logErr(error);
  return removePort(portId).catch(throwErr);
};

/**
 * add port
 *
 * @param {string} portId - port ID
 * @returns {object} - runtime.Port
 */
export const addPort = async portId => {
  const { id: windowId } = await getCurrentWindow();
  let port;
  if (windowId !== WINDOW_ID_NONE) {
    portId ??= `${SIDEBAR}_${windowId}`;
    if (ports.has(portId)) {
      port = ports.get(portId);
    } else {
      port = await makeConnection({
        name: portId
      });
      port.onDisconnect.addListener(portOnDisconnect);
      ports.set(portId, port);
    }
  }
  return port || null;
};

/**
 * get port
 *
 * @param {string} portId - port ID
 * @param {boolean} add - add port if port does not exist
 * @returns {object} - runtime.Port
 */
export const getPort = async (portId, add = false) => {
  let port;
  if (portId && ports.has(portId)) {
    port = ports.get(portId);
  } else if (add) {
    port = await addPort(portId);
  }
  return port || null;
};
