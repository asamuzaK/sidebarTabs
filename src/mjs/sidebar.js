/**
 * sidebar.js
 */

import {
  sleep, throwErr,
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
  emulateTabs, getLastClosedTab, handleActivatedTab, handleAttachedTab,
  handleClickedMenu, handleContextmenuEvt, handleCreatedTab, handleDetachedTab,
  handleEvt, handleHighlightedTab, handleMovedTab, handleMsg, handleRemovedTab,
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
const SEC3 = 3000;

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
window.addEventListener("contextmenu",
                        evt => handleContextmenuEvt(evt).catch(throwErr));

/* start up */
document.addEventListener("DOMContentLoaded", async () => {
  await sleep(SEC3);
  const win = await windows.getCurrent();
  const {id} = win;
  console.log(`winId: ${id} startup: ${window.performance.now()}`);
  return Promise.all([
    localizeHtml().then(() => {
      console.log(`winId: ${id} localize: ${window.performance.now()}`);
    }),
    makeConnection({name: TAB}).then(() => {
      console.log(`winId: ${id} connection: ${window.performance.now()}`);
    }),
    setContextualIds().then(() => {
      console.log(`winId: ${id} contextual IDs: ${window.performance.now()}`);
    }),
    setSidebar().then(setMain).then(() => {
      console.log(`winId: ${id} main: ${window.performance.now()}`);
    }),
    setSidebarTheme().then(() => {
      console.log(`winId: ${id} theme: ${window.performance.now()}`);
    }),
  ]).then(emulateTabs).then(() => {
    console.log(`winId: ${id} emulate tabs: ${window.performance.now()}`);
  }).then(restoreTabGroups).then(() => {
    console.log(`winId: ${id} restore tab groups: ${window.performance.now()}`);
  }).then(restoreTabContainers).then(() => {
    console.log(`winId: ${id} restore containers: ${window.performance.now()}`);
  }).then(restoreHighlightedTabs).then(() => {
    console.log(`winId: ${id} restore highlight: ${window.performance.now()}`);
  }).then(setSessionTabList).then(() => {
    console.log(`winId: ${id} set session: ${window.performance.now()}`);
  }).then(getLastClosedTab).then(() => {
    console.log(`winId: ${id} last closed tab: ${window.performance.now()}`);
    console.log(`winId: ${id} startup done: ${window.performance.now()}`);
  }).catch(e => {
    console.log(`winId: ${id} error occured: ${window.performance.now()}`);
    throw e;
  });
});
