/**
 * background.js
 */
"use strict";
{
  /* api */
  const {browserAction, sidebarAction, runtime, windows} = browser;

  /* constants */
  const {WINDOW_ID_CURRENT, WINDOW_ID_NONE} = windows;

  /**
   * throw error
   * @param {!Object} e - Error
   * @throws - Error
   */
  const throwErr = e => {
    throw e;
  };

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
    const isOpen = await sidebarAction.isOpen({
      windowId,
    });
    sidebar.isOpen = !!isOpen;
  };

  /**
   * toggle sidebar
   * @returns {AsyncFunction} - sidebarAction.close() / sidebarAction.open()
   */
  const toggleSidebar = () => {
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

  browserAction.onClicked.addListener(() =>
    toggleSidebar().then(setSidebarIsOpenState).catch(throwErr)
  );

  runtime.onConnect.addListener(port =>
    handlePort(port).then(setSidebarIsOpenState).catch(throwErr)
  );

  windows.onFocusChanged.addListener(windowId =>
    setSidebarWindowId(windowId).then(setSidebarIsOpenState).catch(throwErr)
  );

  document.addEventListener("DOMContentLoaded", () =>
    setSidebarIsOpenState().catch(throwErr)
  );
}
