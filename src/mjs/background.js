/**
 * background.js
 */

import {
  throwErr
} from './common.js';
import {
  handleCmd, handleMsg, setSidebarState, toggleSidebar
} from './background-main.js';
import {
  createContextMenu, createContextualIdentitiesMenu,
  removeContextualIdentitiesMenu, updateContextualIdentitiesMenu
} from './menu.js';

/* api */
const {
  browserAction, commands, contextualIdentities, menus, runtime, windows
} = browser;

/* listeners */
browserAction.onClicked.addListener(() =>
  toggleSidebar().then(setSidebarState).catch(throwErr)
);
commands.onCommand.addListener(cmd => handleCmd(cmd).catch(throwErr));
contextualIdentities.onCreated.addListener(info =>
  createContextualIdentitiesMenu(info).catch(throwErr)
);
contextualIdentities.onRemoved.addListener(info =>
  removeContextualIdentitiesMenu(info).catch(throwErr)
);
contextualIdentities.onUpdated.addListener(info =>
  updateContextualIdentitiesMenu(info).catch(throwErr)
);
runtime.onMessage.addListener((msg, sender) =>
  handleMsg(msg, sender).catch(throwErr)
);
windows.onFocusChanged.addListener(windowId =>
  setSidebarState(windowId).catch(throwErr)
);

/* startup */
document.addEventListener('DOMContentLoaded', () =>
  menus.removeAll().then(createContextMenu).catch(throwErr)
);
