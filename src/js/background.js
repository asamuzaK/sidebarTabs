/**
 * background.js
 */
"use strict";
{
  /* api */
  const {browserAction, sidebarAction, windows} = browser;
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
   * toggle sidebar state
   * @returns {void}
   */
  const toggleSidebarState = async () => {
    const isOpen = await sidebarAction.isOpen({
      windowId: WINDOW_ID_CURRENT,
    });
    sidebar.isOpen = !!isOpen;
  };

  browserAction.onClicked.addListener(() => {
    const {isOpen} = sidebar;
    const func = [];
    if (isOpen) {
      func.push(sidebarAction.close());
    } else {
      func.push(sidebarAction.open());
    }
    func.push(toggleSidebarState());
    return Promise.all(func).catch(throwErr);
  });
}
