/**
 * background.js
 */
"use strict";
{
  /* api */
  const {browserAction, sidebarAction, runtime, windows} = browser;

  /* constants */
  const {WINDOW_ID_CURRENT} = windows;
  const SIDEBAR_LOADED = "sidebarLoaded";
  const SIDEBAR_UNLOADED = "sidebarUnloaded";

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

  /**
   * handle message
   * @param {*} msg - message
   * @returns {Promise.<Array>} - results of each handler
   */
  const handleMsg = async msg => {
    const func = [];
    const items = msg && Object.keys(msg);
    if (items && items.length) {
      for (const item of items) {
        const obj = msg[item];
        switch (item) {
          case SIDEBAR_LOADED:
          // FIXME:
          //case SIDEBAR_UNLOADED:
            if (obj) {
              func.push(setSidebarIsOpenState());
            }
            break;
          default:
        }
      }
    }
    return Promise.all(func);
  };

  browserAction.onClicked.addListener(() =>
    toggleSidebar().then(setSidebarIsOpenState).catch(throwErr)
  );

  runtime.onMessage.addListener(msg => handleMsg(msg).catch(throwErr));

  document.addEventListener("DOMContentLoaded", () =>
    setSidebarIsOpenState().catch(throwErr)
  );
}
