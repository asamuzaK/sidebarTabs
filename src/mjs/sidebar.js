/**
 * sidebar.js
 */

/* shared */
import { throwErr } from './common.js';
import {
  getLastClosedTab, handleActivatedTab, handleAttachedTab, handleClickedMenu,
  handleContextmenuEvt, handleCreatedTab, handleDetachedTab, handleEvt,
  handleHighlightedTab, handleMovedTab, handleMsg, handleRemovedTab,
  handleStorage, handleUpdatedTab, handleUpdatedTheme, restoreHighlightedTabs,
  setContextualIds, startup
} from './main.js';
import { requestSaveSession } from './session.js';
import {
  expandActivatedCollapsedTab, restoreTabContainers
} from './tab-group.js';
import { COLOR_SCHEME_DARK } from './constant.js';

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
storage.onChanged.addListener((data, area) =>
  handleStorage(data, area, true).catch(throwErr)
);
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
    properties: [
      'audible', 'discarded', 'favIconUrl', 'hidden', 'mutedInfo', 'pinned',
      'status', 'title', 'url'
    ]
  }
);
theme.onUpdated.addListener(info => handleUpdatedTheme(info).catch(throwErr));

window.addEventListener('keydown', handleEvt, true);
window.addEventListener('mousedown', handleEvt, true);
window.addEventListener('contextmenu', handleContextmenuEvt);
window.matchMedia(COLOR_SCHEME_DARK).addEventListener('change', () =>
  handleUpdatedTheme().catch(throwErr)
);
document.addEventListener('DOMContentLoaded', () => startup().catch(throwErr));
