/**
 * background.js
 */

import {throwErr} from "./common.js";

/* api */
const {browserAction, sidebarAction, runtime, windows} = browser;

/* constants */
const {WINDOW_ID_CURRENT, WINDOW_ID_NONE} = windows;

/* sidebar */
const sidebar = {
  windowId: WINDOW_ID_CURRENT,
  isOpen: false,
};

/**
 * set sidebar window ID
 * @param {number} windowId - window ID
 * @returns {void}
 */
const setSidebarWindowId = async windowId => {
  if (Number.isInteger(windowId) && windowId !== WINDOW_ID_NONE) {
    sidebar.windowId = windowId;
  } else {
    sidebar.windowId = WINDOW_ID_CURRENT;
  }
};

/**
 * set sidebar isOpen state
 * @returns {void}
 */
const setSidebarIsOpenState = async () => {
  const {windowId} = sidebar;
  const isOpen = await sidebarAction.isOpen({windowId});
  sidebar.isOpen = !!isOpen;
};

/**
 * toggle sidebar
 * @returns {AsyncFunction} - sidebarAction.close() / sidebarAction.open()
 */
const toggleSidebar = async () => {
  const {isOpen} = sidebar;
  let func;
  if (isOpen) {
    func = sidebarAction.close();
  } else {
    func = sidebarAction.open();
  }
  return func;
};

/**
 * handle connected port
 * @param {Object} port - runtime.Port
 * @returns {void}
 */
const handlePort = async port => {
  port.onDisconnect.addListener(() =>
    setSidebarIsOpenState().catch(throwErr)
  );
};

/**
 * handle browser action clicked
 * @returns {AsyncFunction} - handler
 */
const handleBrowserActionOnClicked = () =>
  toggleSidebar().then(setSidebarIsOpenState).catch(throwErr);

/**
 * handle connected port
 * @param {Object} port - runtime.Port
 * @returns {AsyncFunction} - handler
 */
const handleConnectedPort = port =>
  handlePort(port).then(setSidebarIsOpenState).catch(throwErr);

/**
 * handle window on focus changed
 * @param {number} windowId - window ID
 * @returns {AsyncFunction} - handler
 */
const handleWindowOnFocusChanged = windowId =>
  setSidebarWindowId(windowId).then(setSidebarIsOpenState).catch(throwErr);

/* listeners */
browserAction.onClicked.addListener(handleBrowserActionOnClicked);
runtime.onConnect.addListener(handleConnectedPort);
windows.onFocusChanged.addListener(handleWindowOnFocusChanged);

/* startup */
setSidebarIsOpenState().catch(throwErr);
