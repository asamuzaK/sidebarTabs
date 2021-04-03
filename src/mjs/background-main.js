/**
 * background-main.js
 */

/* shared */
import { getType, isString, logErr, throwErr } from './common.js';
import { getCurrentWindow, getWindow } from './browser.js';
import { ports, removePort } from './port.js';
import { saveSessionTabList } from './util.js';
import {
  SESSION_SAVE, SIDEBAR, SIDEBAR_STATE_UPDATE, TOGGLE_STATE
} from './constant.js';

/* api */
const { sidebarAction, windows } = browser;

/* constants */
const { WINDOW_ID_CURRENT, WINDOW_ID_NONE } = windows;
const REG_PORT = new RegExp(`${SIDEBAR}_(-?\\d+)`);

/* sidebar */
export const sidebar = new Map();

/**
 * set sidebar state
 *
 * @param {number} windowId - window ID
 * @returns {void}
 */
export const setSidebarState = async windowId => {
  let win;
  if (!Number.isInteger(windowId) || windowId === WINDOW_ID_CURRENT) {
    win = await getCurrentWindow();
    windowId = win.id;
  } else if (windowId !== WINDOW_ID_NONE) {
    win = await getWindow(windowId);
  }
  if (win) {
    const { incognito, sessionId, type } = win;
    if (type === 'normal') {
      const isOpen = await sidebarAction.isOpen({ windowId });
      let value;
      if (sidebar.has(windowId)) {
        value = sidebar.get(windowId);
        value.incognito = incognito;
        value.isOpen = isOpen;
        value.sessionId = sessionId;
        value.windowId = windowId;
      } else {
        value = {
          incognito,
          isOpen,
          sessionId,
          windowId,
          remove: false,
          sessionValue: null
        };
      }
      sidebar.set(windowId, value);
    }
  }
};

/**
 * remove sidebar state
 *
 * @param {number} windowId - window ID
 * @returns {boolean} - result
 */
export const removeSidebarState = async windowId => {
  const res = sidebar.delete(windowId);
  return res;
};

/**
 * toggle sidebar
 *
 * @returns {Function} - sidebarAction.toggle()
 */
export const toggleSidebar = async () => sidebarAction.toggle();

/**
 * handle save session request
 *
 * @param {string} domString - DOM string
 * @param {number} windowId - window ID
 * @returns {boolean} - result
 */
export const handleSaveSessionRequest = async (domString, windowId) => {
  if (!isString(domString)) {
    throw new TypeError(`Expected String but got ${getType(domString)}.`);
  }
  if (!Number.isInteger(windowId)) {
    throw new TypeError(`Expected Number but got ${getType(windowId)}.`);
  }
  let res;
  const portId = `${SIDEBAR}_${windowId}`;
  if (ports.has(portId) && sidebar.has(windowId)) {
    const value = sidebar.get(windowId);
    const { incognito } = value;
    if (!incognito) {
      value.sessionValue = domString;
      sidebar.set(windowId, value);
      res = await saveSessionTabList(domString, windowId);
      if (res) {
        const currentValue = sidebar.get(windowId);
        const { remove, sessionValue } = currentValue;
        if (sessionValue !== domString) {
          res = await handleSaveSessionRequest(sessionValue, windowId);
        }
        res && remove && await removeSidebarState(windowId);
      }
    }
  }
  return !!res;
};

/**
 * handle runtime message
 *
 * @param {!object} msg - message
 * @returns {Promise.<Array>} - results of each handler
 */
export const handleMsg = async msg => {
  const items = Object.entries(msg);
  const func = [];
  for (const [key, value] of items) {
    switch (key) {
      case SESSION_SAVE: {
        const { domString, windowId } = value;
        isString(domString) && Number.isInteger(windowId) &&
          func.push(handleSaveSessionRequest(domString, windowId));
        break;
      }
      case SIDEBAR_STATE_UPDATE: {
        const { windowId } = value;
        func.push(setSidebarState(windowId));
        break;
      }
      default:
    }
  }
  return Promise.all(func);
};

/**
 * port on message
 *
 * @param {object} msg - message
 * @returns {Function} - promise chain
 */
export const portOnMessage = msg => msg && handleMsg(msg).catch(throwErr);

/**
 * handle disconnected port
 *
 * @param {object} port - port
 * @returns {void}
 */
export const handleDisconnectedPort = async (port = {}) => {
  const { error, name: portId } = port;
  error && logErr(error);
  if (isString(portId) && REG_PORT.test(portId)) {
    const [, winId] = REG_PORT.exec(portId);
    const windowId = winId * 1;
    if (sidebar.has(windowId)) {
      const value = sidebar.get(windowId);
      const { incognito, sessionValue } = value;
      if (!incognito && isString(sessionValue)) {
        value.remove = true;
        sidebar.set(windowId, value);
        await handleSaveSessionRequest(sessionValue, windowId);
      } else {
        await removeSidebarState(windowId);
      }
    }
  }
  ports.has(portId) && await removePort(portId);
};

/**
 * port on disconnect
 *
 * @param {object} port - port
 * @returns {Function} - promise chain
 */
export const portOnDisconnect = port =>
  port && handleDisconnectedPort(port).catch(throwErr);

/**
 * handle connected port
 *
 * @param {object} port - port
 * @returns {void}
 */
export const handleConnectedPort = async (port = {}) => {
  const { name: portId } = port;
  if (isString(portId) && REG_PORT.test(portId)) {
    const [, winId] = REG_PORT.exec(portId);
    const windowId = winId * 1;
    if (windowId !== WINDOW_ID_NONE) {
      port.onDisconnect.addListener(portOnDisconnect);
      port.onMessage.addListener(portOnMessage);
      ports.set(portId, port);
      await setSidebarState(windowId);
    }
  }
};

/**
 * handle command
 *
 * @param {!string} cmd - command
 * @returns {?Function} - promise chain
 */
export const handleCmd = async cmd => {
  if (!isString(cmd)) {
    throw new TypeError(`Expected String but got ${getType(cmd)}.`);
  }
  let func;
  switch (cmd) {
    case TOGGLE_STATE:
      func = toggleSidebar().then(setSidebarState);
      break;
    default:
  }
  return func || null;
};

// For test
export { ports };
