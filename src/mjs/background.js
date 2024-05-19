/**
 * background.js
 */

/* shared */
import {
  handleCmd, handleConnectedPort, handleMsg, removeSidebarState,
  setSidebarState, toggleSidebar
} from './background-main.js';
import { throwErr } from './common.js';
import {
  createContextualIdentitiesMenu, removeContextualIdentitiesMenu,
  restoreContextMenu, updateContextualIdentitiesMenu
} from './menu.js';

/* api */
const {
  browserAction, commands, contextualIdentities, runtime, windows
} = browser;

/* listeners */
browserAction.onClicked.addListener(() =>
  toggleSidebar().then(setSidebarState).catch(throwErr)
);
commands.onCommand.addListener((cmd, tab) =>
  handleCmd(cmd, tab).catch(throwErr)
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
runtime.onConnect.addListener(port =>
  handleConnectedPort(port).catch(throwErr)
);
runtime.onInstalled.addListener(() => restoreContextMenu().catch(throwErr));
runtime.onMessage.addListener((msg, sender) =>
  handleMsg(msg, sender).catch(throwErr)
);
runtime.onStartup.addListener(() => restoreContextMenu().catch(throwErr));
windows.onFocusChanged.addListener(windowId =>
  setSidebarState(windowId).catch(throwErr)
);
windows.onRemoved.addListener(windowId =>
  removeSidebarState(windowId).catch(throwErr)
);
