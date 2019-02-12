/**
 * background-main.js
 */

import {
  getType, throwErr,
} from "./common.js";

/* api */
const {sidebarAction, windows} = browser;

/* constant */
const {WINDOW_ID_NONE} = windows;

/* sidebar */
export const sidebar = {
  windowId: windows.WINDOW_ID_CURRENT,
  isOpen: false,
};

/**
 * set sidebar window ID
 * @param {number} windowId - window ID
 * @returns {void}
 */
export const setSidebarWindowId = async windowId => {
  if (!Number.isInteger(windowId)) {
    throw new TypeError(`Expected Number but got ${getType(windowId)}.`);
  }
  if (windowId === WINDOW_ID_NONE) {
    sidebar.windowId = windows.WINDOW_ID_CURRENT;
  } else {
    sidebar.windowId = windowId;
  }
};

/**
 * set sidebar isOpen state
 * @returns {void}
 */
export const setSidebarIsOpenState = async () => {
  const {windowId} = sidebar;
  const isOpen = await sidebarAction.isOpen({windowId});
  sidebar.isOpen = !!isOpen;
};

/**
 * toggle sidebar
 * @returns {?AsyncFunction} - sidebarAction.close() / sidebarAction.open()
 */
export const toggleSidebar = async () => {
  let func;
  const {isOpen} = sidebar;
  if (isOpen) {
    func = sidebarAction.close();
  } else {
    func = sidebarAction.open();
  }
  return func;
};

/**
 * handle port.onDisconnect
 * @returns {AsyncFunction} - setSidebarIsOpenState()
 */
export const portOnDisconnect = () => {
  console.log("port disconnected");
  return setSidebarIsOpenState().catch(throwErr);
};

/**
 * handle connected port
 * @param {Object} port - runtime.Port
 * @returns {void}
 */
export const handlePort = async port => {
  console.log(`port connected: ${port.name}`);
  port.onDisconnect.addListener(portOnDisconnect);
};
