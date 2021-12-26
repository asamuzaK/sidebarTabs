/*
 * util.js
 */

/* shared */
import { getType, isObjectNotEmpty, isString } from './common.js';
import {
  getActiveTabId, getCloseTabsByDoubleClickValue, getCurrentWindow,
  getSessionWindowValue, getWindow, setSessionWindowValue, setStorage, updateTab
} from './browser.js';
import { ports } from './port.js';
import {
  CLASS_HEADING, CLASS_HEADING_LABEL, CLASS_TAB_COLLAPSED,
  CLASS_TAB_CONTAINER, CLASS_TAB_CONTAINER_TMPL, CLASS_TAB_GROUP,
  NEW_TAB, PINNED, SESSION_SAVE, SIDEBAR, TAB_LIST, TAB_QUERY
} from './constant.js';
import { parse as parseTld } from '../lib/tldts/tldts.js';

/**
 * get template
 *
 * @param {string} id - template ID
 * @returns {object} - document fragment
 */
export const getTemplate = id => {
  if (!isString(id)) {
    throw new TypeError(`Expected String but got ${getType(id)}.`);
  }
  const tmpl = document.getElementById(id);
  let frag;
  if (tmpl) {
    const { content: { firstElementChild } } = tmpl;
    frag = document.importNode(firstElementChild, true);
  }
  return frag || null;
};

/**
 * get sidebar tab container from parent node
 *
 * @param {object} node - node
 * @returns {object} - sidebar tab container
 */
export const getSidebarTabContainer = node => {
  let container;
  while (node && node.parentNode) {
    const { classList, parentNode } = node;
    if (classList.contains(CLASS_TAB_CONTAINER)) {
      container = node;
      break;
    }
    node = parentNode;
  }
  return container || null;
};

/**
 * restore sidebar tab container
 *
 * @param {object} container - tab container
 * @returns {void}
 */
export const restoreTabContainer = container => {
  if (container && container.nodeType === Node.ELEMENT_NODE) {
    const { childElementCount, classList, parentNode } = container;
    switch (childElementCount) {
      case 0:
        parentNode.removeChild(container);
        break;
      case 1:
        classList.remove(CLASS_TAB_GROUP);
        break;
      default:
    }
  }
};

/**
 * create sidebar tab
 *
 * @param {object} node - node
 * @param {object} [target] - target element to insert before
 * @returns {object} - sidebar tab
 */
export const createSidebarTab = (node, target) => {
  let tab;
  if (node && node.nodeType === Node.ELEMENT_NODE) {
    const container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
    tab = node;
    container.appendChild(tab);
    container.removeAttribute('hidden');
    if (!target || target.nodeType !== Node.ELEMENT_NODE ||
        !target.classList.contains(CLASS_TAB_CONTAINER)) {
      target = document.getElementById(NEW_TAB);
    }
    target.parentNode.insertBefore(container, target);
  }
  return tab || null;
};

/**
 * get sidebar tab from parent node
 *
 * @param {object} node - node
 * @returns {object} - sidebar tab
 */
export const getSidebarTab = node => {
  let tab;
  while (node && node.parentNode) {
    const { dataset, parentNode } = node;
    if (dataset.tabId) {
      tab = node;
      break;
    }
    node = parentNode;
  }
  return tab || null;
};

/**
 * get sidebar tab ID
 *
 * @param {object} node - node
 * @returns {?number} - tab ID
 */
export const getSidebarTabId = node => {
  let tabId;
  while (node && node.parentNode) {
    const { dataset, parentNode } = node;
    if (dataset.tabId) {
      tabId = dataset.tabId * 1;
      break;
    }
    node = parentNode;
  }
  return tabId || null;
};

/**
 * get sidebar tab IDs
 *
 * @param {Array} nodes - array of node
 * @returns {Array} - array of tab IDs
 */
export const getSidebarTabIds = nodes => {
  if (!Array.isArray(nodes)) {
    throw new TypeError(`Expected Array but got ${getType(nodes)}.`);
  }
  const arr = [];
  for (const item of nodes) {
    const tabId = getSidebarTabId(item);
    if (Number.isInteger(tabId)) {
      arr.push(tabId);
    }
  }
  return arr;
};

/**
 * get sidebar tab index
 *
 * @param {object} node - node
 * @returns {?number} - index
 */
export const getSidebarTabIndex = node => {
  const tab = getSidebarTab(node);
  let index;
  if (tab) {
    const items = document.querySelectorAll(TAB_QUERY);
    const l = items.length;
    let i = 0;
    while (i < l && !Number.isInteger(index)) {
      if (items[i] === tab) {
        index = i;
        break;
      }
      i++;
    }
  }
  return Number.isInteger(index) ? index : null;
};

/**
 * get tabs in range
 *
 * @param {object} tabA - tab A
 * @param {object} tabB - tab B
 * @returns {Array} - array of tabs
 */
export const getTabsInRange = (tabA, tabB) => {
  const tabAIndex = getSidebarTabIndex(tabA);
  const tabBIndex = getSidebarTabIndex(tabB);
  const arr = [];
  if (Number.isInteger(tabAIndex) && Number.isInteger(tabBIndex)) {
    const items = document.querySelectorAll(TAB_QUERY);
    let fromIndex, toIndex;
    if (tabAIndex > tabBIndex) {
      fromIndex = tabBIndex;
      toIndex = tabAIndex;
    } else {
      fromIndex = tabAIndex;
      toIndex = tabBIndex;
    }
    for (let i = fromIndex; i <= toIndex; i++) {
      arr.push(items[i]);
    }
  }
  return arr;
};

/**
 * get next tab
 *
 * @param {object} elm - element
 * @param {boolean} skipCollapsed - skip collapsed tab
 * @returns {object} - tab
 */
export const getNextTab = (elm, skipCollapsed = false) => {
  const currentTab = getSidebarTab(elm);
  let tab;
  if (currentTab) {
    const { parentNode, nextElementSibling } = currentTab;
    const { nextElementSibling: nextParent } = parentNode;
    if (nextElementSibling) {
      if (skipCollapsed && parentNode.classList.contains(CLASS_TAB_COLLAPSED)) {
        if (nextParent && nextParent.id !== NEW_TAB) {
          tab = nextParent.querySelector(TAB_QUERY);
        }
      } else {
        tab = nextElementSibling;
      }
    } else if (nextParent && nextParent.id !== NEW_TAB) {
      tab = nextParent.querySelector(TAB_QUERY);
    }
  }
  return tab || null;
};

/**
 * get previous tab
 *
 * @param {object} elm - element
 * @param {boolean} skipCollapsed - skip collapsed tab
 * @returns {object} - tab
 */
export const getPreviousTab = (elm, skipCollapsed = false) => {
  const currentTab = getSidebarTab(elm);
  let tab;
  if (currentTab) {
    const { parentNode, previousElementSibling } = currentTab;
    const { previousElementSibling: previousParent } = parentNode;
    const heading = parentNode.querySelector(`.${CLASS_HEADING}`);
    if (previousElementSibling && previousElementSibling !== heading) {
      tab = previousElementSibling;
    } else if (previousParent) {
      const items = previousParent.querySelectorAll(TAB_QUERY);
      if (skipCollapsed &&
          previousParent.classList.contains(CLASS_TAB_COLLAPSED)) {
        [tab] = items;
      } else {
        tab = items[items.length - 1];
      }
    }
  }
  return tab || null;
};

/**
 * is newtab
 *
 * @param {object} node - node
 * @returns {boolean} - result
 */
export const isNewTab = node => {
  let tab;
  while (node && node.parentNode) {
    const { id, parentNode } = node;
    if (id === NEW_TAB) {
      tab = node;
      break;
    }
    node = parentNode;
  }
  return !!tab;
};

/**
 * get tab list from sessions
 *
 * @param {string} key - key
 * @param {number} windowId - window ID
 * @returns {object} - tab list
 */
export const getSessionTabList = async (key, windowId) => {
  if (!isString(key)) {
    throw new TypeError(`Expected String but got ${getType(key)}.`);
  }
  if (!Number.isInteger(windowId)) {
    const win = await getCurrentWindow();
    windowId = win.id;
  }
  const value = await getSessionWindowValue(key, windowId);
  let tabList;
  if (isString(value)) {
    tabList = JSON.parse(value);
  }
  return tabList || null;
};

/* mutex */
export const mutex = new Set();

/**
 * save tab list to sessions
 *
 * @param {string} domStr - DOM string
 * @param {number} windowId - window ID
 * @returns {boolean} - saved
 */
export const saveSessionTabList = async (domStr, windowId) => {
  if (!isString(domStr)) {
    throw new TypeError(`Expected String but got ${getType(domStr)}.`);
  }
  if (!Number.isInteger(windowId)) {
    throw new TypeError(`Expected Number but got ${getType(windowId)}.`);
  }
  const win = await getWindow(windowId);
  const { incognito } = win;
  let res;
  if (!incognito && !mutex.has(windowId)) {
    mutex.add(windowId);
    try {
      const tabList = {
        recent: {}
      };
      const dom = new DOMParser().parseFromString(domStr, 'text/html');
      const items =
        dom.querySelectorAll(`.${CLASS_TAB_CONTAINER}:not(#${NEW_TAB})`);
      const prevList = await getSessionTabList(TAB_LIST, windowId);
      const l = items.length;
      let i = 0;
      let j = 0;
      while (i < l) {
        const item = items[i];
        const collapsed = item.classList.contains(CLASS_TAB_COLLAPSED);
        const heading = item.querySelector(`.${CLASS_HEADING}`);
        const headingShown = heading && !heading.hidden;
        const headingLabel =
          heading &&
          heading.querySelector(`.${CLASS_HEADING_LABEL}`).textContent;
        const childTabs = item.querySelectorAll(TAB_QUERY);
        for (const tab of childTabs) {
          const tabsTab = tab.dataset.tab;
          const { url } = JSON.parse(tabsTab);
          tabList.recent[j] = {
            collapsed,
            headingLabel,
            headingShown,
            url,
            containerIndex: i
          };
          j++;
        }
        i++;
      }
      if (isObjectNotEmpty(prevList) &&
          Object.prototype.hasOwnProperty.call(prevList, 'recent')) {
        tabList.prev = Object.assign({}, prevList.recent);
      }
      await setSessionWindowValue(TAB_LIST, JSON.stringify(tabList), windowId);
      res = mutex.delete(windowId);
    } catch (e) {
      mutex.delete(windowId);
      throw e;
    }
  }
  return !!res;
};

/**
 * request save session
 *
 * @param {number} windowId - window ID
 * @returns {?Function} - port.postMessage()
 */
export const requestSaveSession = async windowId => {
  let func, win;
  if (Number.isInteger(windowId)) {
    win = await getWindow(windowId);
  } else {
    win = await getCurrentWindow();
    windowId = win.id;
  }
  const port = ports.get(`${SIDEBAR}_${windowId}`);
  if (port && win && !win.incognito) {
    const cloneBody = document.body.cloneNode(true);
    const items =
      cloneBody.querySelectorAll(`.${CLASS_TAB_CONTAINER}:not(#${NEW_TAB})`);
    if (items.length) {
      const frag = document.createDocumentFragment();
      frag.append(...items);
      func = port.postMessage({
        [SESSION_SAVE]: {
          windowId,
          domString: new XMLSerializer().serializeToString(frag)
        }
      });
    }
  }
  return func || null;
};

/**
 * activate tab
 *
 * @param {object} elm - element
 * @returns {?Function} - updateTab()
 */
export const activateTab = async elm => {
  const tabId = getSidebarTabId(elm);
  let func;
  if (Number.isInteger(tabId)) {
    func = updateTab(tabId, {
      active: true
    });
  }
  return func || null;
};

/**
 * scroll tab into view
 *
 * @param {object} elm - Element
 * @returns {void}
 */
export const scrollTabIntoView = async elm => {
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    const tabsTab = elm.dataset.tab;
    if (tabsTab) {
      const { active, openerTabId } = JSON.parse(tabsTab);
      if (active || Number.isInteger(openerTabId)) {
        const pinned = document.getElementById(PINNED);
        const newTab = document.getElementById(NEW_TAB);
        const { bottom: pinnedBottom } = pinned.getBoundingClientRect();
        const { top: newTabTop } = newTab.getBoundingClientRect();
        const { bottom: tabBottom, top: tabTop } = elm.getBoundingClientRect();
        const viewTop = Number.isInteger(openerTabId) && tabTop < pinnedBottom;
        const behavior = viewTop ? 'auto' : 'smooth';
        if (viewTop || tabBottom > newTabTop) {
          elm.scrollIntoView({
            behavior,
            block: 'center'
          });
        }
      }
    }
  }
};

/**
 *
 * switch tab
 *
 * @param {object} opt - options
 * @returns {?Function} - activateTab()
 */
export const switchTab = async opt => {
  let func;
  if (isObjectNotEmpty(opt)) {
    const { deltaY, skipCollapsed, windowId } = opt;
    const activeTabId = await getActiveTabId(windowId);
    const activeTab = document.querySelector(`[data-tab-id="${activeTabId}"]`);
    if (activeTab && Number.isFinite(deltaY)) {
      let targetTab;
      if (deltaY > 0) {
        targetTab = getNextTab(activeTab, skipCollapsed);
      } else if (deltaY < 0) {
        targetTab = getPreviousTab(activeTab, skipCollapsed);
      }
      if (targetTab) {
        func = activateTab(targetTab);
      }
    }
  }
  return func || null;
};

/**
 * create URL match string
 *
 * @param {string} url - url
 * @returns {string} - match string
 */
export const createUrlMatchString = url => {
  if (!isString(url)) {
    throw new TypeError(`Expected String but got ${getType(url)}.`);
  }
  const { hostname, protocol } = new URL(url);
  const { domain } = parseTld(hostname);
  const isHttp = /^https?:$/.test(protocol);
  let str;
  if (/^file:$/.test(protocol)) {
    str = 'file:///*';
  } else if (isHttp) {
    if (domain) {
      str = `*://*.${domain}/*`;
    } else {
      str = `*://${hostname}/*`;
    }
  } else if (domain) {
    str = `${protocol}//*.${domain}/*`;
  } else {
    str = `${protocol}//${hostname}/*`;
  }
  return str;
};

/**
 * store closeTabsByDoubleClick user value
 *
 * @param {boolean} bool - browserSettings enabled
 * @returns {void}
 */
export const storeCloseTabsByDoubleClickValue = async bool => {
  const store = {
    id: 'closeTabsByDoubleClick',
    checked: false,
    value: ''
  };
  if (bool) {
    const {
      levelOfControl, value: userValue
    } = await getCloseTabsByDoubleClickValue();
    store.checked = !!userValue;
    store.value = levelOfControl;
  }
  return setStorage({
    closeTabsByDoubleClick: store
  });
};

// For test
export { ports };
