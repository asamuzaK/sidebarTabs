/**
 * sidebar.js
 */

import {
  throwErr,
} from "./common.js";
import {
  makeConnection,
} from "./browser.js";
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
  setSidebarTheme,
} from "./theme.js";
import {
  createContextMenu,
} from "./menu.js";
import {
  emulateTabs, getLastClosedTab, handleActivatedTab, handleAttachedTab,
  handleClickedMenu, handleCreatedTab, handleDetachedTab, handleEvt,
  handleHighlightedTab, handleMovedTab, handleMsg, handleRemovedTab,
  handleUpdatedTab, restoreHighlightedTabs, restoreTabGroups,
  setContextualIds, setMain, setSidebar, setVars,
} from "./main.js";

/* api */
const {
  contextualIdentities, menus, runtime, storage, tabs, windows,
} = browser;

/* constants */
import {
  TAB,
} from "./constant.js";
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

window.addEventListener("keydown", evt => handleEvt(evt).catch(throwErr), true);
window.addEventListener("mousedown",
                        evt => handleEvt(evt).catch(throwErr), true);

/* start up */
document.addEventListener("DOMContentLoaded", () => Promise.all([
  menus.removeAll().then(createContextMenu),
  localizeHtml(),
  makeConnection({name: TAB}),
  setContextualIds(),
  setSidebar().then(setMain),
  setSidebarTheme(),
]).then(emulateTabs).then(restoreTabGroups).then(restoreTabContainers)
  .then(restoreHighlightedTabs).then(setSessionTabList).then(getLastClosedTab)
  .catch(throwErr)
);
