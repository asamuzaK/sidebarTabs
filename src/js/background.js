/**
 * background.js
 */
"use strict";
{
  /* api */
  const {browserAction, sidebarAction, windows} = browser;

  /* constants */
  const {WINDOW_ID_CURRENT} = windows;

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
    isOpen: false,
  };

  /**
   * set sidebar isOpen state
   * @returns {void}
   */
  const setSidebarIsOpenState = async () => {
    const isOpen = await sidebarAction.isOpen({
      windowId: WINDOW_ID_CURRENT,
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

  browserAction.onClicked.addListener(() =>
    toggleSidebar().then(setSidebarIsOpenState).catch(throwErr)
  );
}
