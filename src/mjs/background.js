/**
 * background.js
 */

import {
  throwErr,
} from "./common.js";
import {
  handleMsg, setSidebarIsOpenState, setSidebarWindowId, toggleSidebar,
} from "./background-main.js";
import {
  createContextMenu, createContextualIdentitiesMenu,
  removeContextualIdentitiesMenu, updateContextualIdentitiesMenu,
} from "./menu.js";

/* api */
const {browserAction, contextualIdentities, menus, runtime, windows} = browser;

/* listeners */
browserAction.onClicked.addListener(() =>
  toggleSidebar().then(setSidebarIsOpenState).catch(throwErr)
);
contextualIdentities.onCreated.addListener(info =>
  createContextualIdentitiesMenu(info).catch(throwErr)
);
contextualIdentities.onRemoved.addListener(info =>
  removeContextualIdentitiesMenu(info).catch(throwErr)
);
contextualIdentities.onUpdated.addListener(info =>
  updateContextualIdentitiesMenu(info).catch(throwErr)
);
runtime.onMessage.addListener((msg, sender, sendResponse) =>
  handleMsg(msg, sender, sendResponse).catch(throwErr)
);
windows.onFocusChanged.addListener(windowId =>
  setSidebarWindowId(windowId).then(setSidebarIsOpenState).catch(throwErr)
);

/* startup */
document.addEventListener("DOMContentLoaded", () =>
  menus.removeAll().then(createContextMenu).catch(throwErr)
);
