/**
 * sidebar.js
 */

import {
  throwErr,
} from "./common.js";
import {
  setSessionTabList,
} from "./util.js";
import {
  expandActivatedCollapsedTab, restoreTabContainers,
} from "./tab-group.js";
import {
  localizeHtml,
} from "./localize.js";
import {
  initCustomTheme, setSidebarTheme,
} from "./theme.js";
import {
  emulateTabs, getLastClosedTab, handleActivatedTab, handleAttachedTab,
  handleClickedMenu, handleContextmenuEvt, handleCreatedTab, handleDetachedTab,
  handleEvt, handleHighlightedTab, handleMovedTab, handleMsg, handleRemovedTab,
  handleUpdatedTab, requestSidebarStateUpdate, restoreHighlightedTabs,
  restoreTabGroups, setContextualIds, setMain, setSidebar, setVars,
} from "./main.js";

/* api */
const {
  contextualIdentities, menus, runtime, storage, tabs, theme, windows,
} = browser;

/* constants */
const {WINDOW_ID_CURRENT} = windows;

/* listeners */
contextualIdentities.onCreated.addListener(() =>
  setContextualIds().catch(throwErr)
);
contextualIdentities.onRemoved.addListener(() =>
  setContextualIds().catch(throwErr)
);
contextualIdentities.onUpdated.addListener(() =>
  setContextualIds().catch(throwErr)
);
menus.onClicked.addListener(info => handleClickedMenu(info).catch(throwErr));
storage.onChanged.addListener(data => setVars(data).catch(throwErr));
runtime.onMessage.addListener((msg, sender) =>
  handleMsg(msg, sender).catch(throwErr)
);
tabs.onActivated.addListener(info =>
  handleActivatedTab(info).then(expandActivatedCollapsedTab)
    .then(setSessionTabList).catch(throwErr)
);
tabs.onAttached.addListener((tabId, info) =>
  handleAttachedTab(tabId, info).then(restoreTabContainers)
    .then(restoreHighlightedTabs).then(setSessionTabList).catch(throwErr)
);
tabs.onCreated.addListener(tabsTab =>
  handleCreatedTab(tabsTab).then(restoreTabContainers)
    .then(setSessionTabList).then(getLastClosedTab).catch(throwErr)
);
tabs.onDetached.addListener((tabId, info) =>
  handleDetachedTab(tabId, info).then(restoreTabContainers)
    .then(expandActivatedCollapsedTab).then(setSessionTabList)
    .catch(throwErr)
);
tabs.onHighlighted.addListener(info =>
  handleHighlightedTab(info).catch(throwErr)
);
tabs.onMoved.addListener((tabId, info) =>
  handleMovedTab(tabId, info).catch(throwErr)
);
tabs.onRemoved.addListener((tabId, info) =>
  handleRemovedTab(tabId, info).then(restoreTabContainers)
    .then(expandActivatedCollapsedTab).then(setSessionTabList)
    .then(getLastClosedTab).catch(throwErr)
);
tabs.onUpdated.addListener(
  (tabId, info, tabsTab) =>
    handleUpdatedTab(tabId, info, tabsTab).catch(throwErr),
  {
    properties: [
      "audible", "discarded", "favIconUrl", "hidden", "mutedInfo", "pinned",
      "status", "title",
    ],
    windowId: WINDOW_ID_CURRENT,
  }
);
theme.onUpdated.addListener(info =>
  setSidebarTheme(info).then(initCustomTheme).catch(throwErr)
);

window.addEventListener("keydown", evt => handleEvt(evt).catch(throwErr), true);
window.addEventListener("mousedown",
                        evt => handleEvt(evt).catch(throwErr), true);
window.addEventListener("contextmenu",
                        evt => handleContextmenuEvt(evt).catch(throwErr));

/* start up */
document.addEventListener("DOMContentLoaded", () => Promise.all([
  localizeHtml(),
  setContextualIds(),
  setSidebar().then(setMain).then(requestSidebarStateUpdate),
  setSidebarTheme(),
]).then(emulateTabs).then(restoreTabGroups).then(restoreTabContainers)
  .then(restoreHighlightedTabs).then(setSessionTabList).then(getLastClosedTab)
  .catch(throwErr)
);
