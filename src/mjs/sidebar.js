/**
 * sidebar.js
 */

/* shared */
import { throwErr } from './common.js';
import { addPort } from './port.js';
import { requestSaveSession } from './util.js';
import {
  emulateTabs, getLastClosedTab, handleActivatedTab, handleAttachedTab,
  handleClickedMenu, handleContextmenuEvt, handleCreatedTab, handleDetachedTab,
  handleEvt, handleHighlightedTab, handleMovedTab, handleMsg, handleRemovedTab,
  handleUpdatedTab, requestSidebarStateUpdate, restoreHighlightedTabs,
  restoreTabGroups, setContextualIds, setMain, setSidebar, setVars
} from './main.js';
import {
  expandActivatedCollapsedTab, restoreTabContainers, toggleTabGrouping
} from './tab-group.js';
import { localizeHtml } from './localize.js';
import { setSidebarTheme } from './theme.js';

/* api */
const { contextualIdentities, menus, runtime, storage, tabs, theme } = browser;

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
runtime.onMessage.addListener((msg, sender) =>
  handleMsg(msg, sender).catch(throwErr)
);
storage.onChanged.addListener(data => setVars(data).catch(throwErr));
tabs.onActivated.addListener(info =>
  handleActivatedTab(info).then(expandActivatedCollapsedTab)
    .then(requestSaveSession).catch(throwErr)
);
tabs.onAttached.addListener((tabId, info) =>
  handleAttachedTab(tabId, info).then(restoreTabContainers)
    .then(restoreHighlightedTabs).then(requestSaveSession).catch(throwErr)
);
tabs.onCreated.addListener(tabsTab =>
  handleCreatedTab(tabsTab).then(restoreTabContainers)
    .then(requestSaveSession).then(getLastClosedTab).catch(throwErr)
);
tabs.onDetached.addListener((tabId, info) =>
  handleDetachedTab(tabId, info).then(restoreTabContainers)
    .then(expandActivatedCollapsedTab).then(requestSaveSession)
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
    .then(expandActivatedCollapsedTab).then(requestSaveSession)
    .then(getLastClosedTab).catch(throwErr)
);
tabs.onUpdated.addListener(
  (tabId, info, tabsTab) =>
    handleUpdatedTab(tabId, info, tabsTab).catch(throwErr),
  {
    // FIXME: add 'url' when Firefox 91 is released, issue #131
    properties: [
      'audible', 'discarded', 'favIconUrl', 'hidden', 'mutedInfo', 'pinned',
      'status', 'title'
    ]
  }
);
theme.onUpdated.addListener(info =>
  // FIXME
  console.log(info)
  // setSidebarTheme(info).then(initCustomTheme).catch(throwErr)
);

window.addEventListener('keydown', handleEvt, true);
window.addEventListener('mousedown', handleEvt, true);
window.addEventListener('contextmenu', handleContextmenuEvt);

/* start up */
document.addEventListener('DOMContentLoaded', () => Promise.all([
  localizeHtml(),
  setContextualIds(),
  addPort().then(setSidebar).then(setMain).then(requestSidebarStateUpdate),
  setSidebarTheme()
]).then(emulateTabs).then(restoreTabGroups).then(restoreTabContainers)
  .then(toggleTabGrouping).then(restoreHighlightedTabs).then(requestSaveSession)
  .then(getLastClosedTab).catch(throwErr)
);
