/**
 * background.js
 */

import {getType, throwErr} from "./common.js";

/* api */
const {browserAction, sidebarAction, runtime, windows} = browser;

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
  if (typeof sidebarAction.isOpen === "function") {
    const {windowId} = sidebar;
    const isOpen = await sidebarAction.isOpen({windowId});
    sidebar.isOpen = !!isOpen;
  }
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
  return func || null;
};

/**
 * handle port.onDisconnect
 * @returns {?AsyncFunction} - setSidebarIsOpenState()
 */
export const portOnDisconnect = () => setSidebarIsOpenState().catch(throwErr);

/**
 * handle connected port
 * @param {Object} port - runtime.Port
 * @returns {void}
 */
export const handlePort = async port => {
  port.onDisconnect.addListener(portOnDisconnect);
};

/* browser event handlers */
/**
 * handle browserAction.onClicked
 * @returns {AsyncFunction} - promise chain
 */
export const browserActionOnClicked = () =>
  toggleSidebar().then(setSidebarIsOpenState).catch(throwErr);

/**
 * handle runtime.onConnect
 * @param {Object} port - runtime.Port
 * @returns {AsyncFunction} - promise chain
 */
export const runtimeOnConnect = port =>
  handlePort(port).then(setSidebarIsOpenState).catch(throwErr);

/**
 * handle windows.onFocusChanged
 * @param {number} windowId - window ID
 * @returns {AsyncFunction} - promise chain
 */
export const windowsOnFocusChanged = windowId =>
  setSidebarWindowId(windowId).then(setSidebarIsOpenState).catch(throwErr);

/* listeners */
browserAction.onClicked.addListener(browserActionOnClicked);
runtime.onConnect.addListener(runtimeOnConnect);
windows.onFocusChanged.addListener(windowsOnFocusChanged);

/* startup */
setSidebarIsOpenState().catch(throwErr);
