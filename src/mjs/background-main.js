/**
 * background-main.js
 */

/* shared */
import { getType, isString } from './common.js';
import { getCurrentWindow, getWindow } from './browser.js';
import { SIDEBAR_STATE_UPDATE, TOGGLE_STATE } from './constant.js';

/* api */
const { sidebarAction, windows } = browser;

/* constant */
const { WINDOW_ID_CURRENT, WINDOW_ID_NONE } = windows;

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
    const { sessionId, type } = win;
    if (type === 'normal') {
      const isOpen = await sidebarAction.isOpen({ windowId });
      let value;
      if (sidebar.has(windowId)) {
        value = sidebar.get(windowId);
        value.isOpen = isOpen;
        value.sessionId = sessionId;
        value.windowId = windowId;
      } else {
        value = {
          isOpen, sessionId, windowId
        };
      }
      sidebar.set(windowId, value);
    }
  }
};

/**
 * toggle sidebar
 *
 * @returns {?Function} - sidebarAction.toggle()
 */
export const toggleSidebar = async () => sidebarAction.toggle();

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
