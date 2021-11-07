/**
 * bookmark.js
 */

/* shared */
import { getType, isObjectNotEmpty, isString } from './common.js';
import {
  createBookmark, createNewWindow, createTab, getActiveTab, getBookmarkTreeNode,
  getNewTabPositionValue, getTab, highlightTab, isPermissionGranted, moveTab,
  reloadTab, removeTab, updateTab
} from './browser.js';
import {
  getSidebarTab, getSidebarTabId, getSidebarTabIds, getSidebarTabIndex,
  getTemplate
} from './util.js';
import {
  CLASS_TAB_CONTAINER_TMPL, CLASS_TAB_GROUP, NEW_TAB, PINNED, TAB_QUERY
} from './constant.js';

/* api */
const { bookmarks } = browser;

/**
 * bookmark tabs
 *
 * @param {Array} nodes - array of node
 * @returns {Promise.<Array>} - results of each handler
 */
export const bookmarkTabs = async nodes => {
  if (!Array.isArray(nodes)) {
    throw new TypeError(`Expected Array but got ${getType(nodes)}.`);
  }
  const func = [];
  let parentId;
  if (nodes.length > 1) {
    const folderTitle = window.prompt('Input folder name');
    const folder = await createBookmark({
      title: folderTitle
    });
    if (folder) {
      const { id } = folder;
      parentId = id;
    }
  }
  for (const item of nodes) {
    if (item.nodeType === Node.ELEMENT_NODE) {
      const { dataset } = item;
      const itemTab = dataset.tab && JSON.parse(dataset.tab);
      if (itemTab) {
        const { title, url } = itemTab;
        func.push(createBookmark({ parentId, title, url }));
      }
    }
  }
  return Promise.all(func);
};
