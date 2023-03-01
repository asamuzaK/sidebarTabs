/**
 * session.js
 */

/* shared */
import {
  getCurrentWindow, getSessionWindowValue, getWindow, setSessionWindowValue
} from './browser.js';
import { getType, isObjectNotEmpty, isString } from './common.js';
import { getPort } from './port.js';
import {
  CLASS_HEADING, CLASS_HEADING_LABEL, CLASS_TAB_COLLAPSED, CLASS_TAB_CONTAINER,
  NEW_TAB, SESSION_SAVE, SIDEBAR, TAB_LIST, TAB_QUERY
} from './constant.js';

/**
 * get tab list from sessions
 *
 * @param {string} key - key
 * @param {number} [windowId] - window ID
 * @returns {Promise.<object>} - tab list
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
 * @param {number} [windowId] - window ID
 * @returns {Promise.<boolean>} - saved
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
 * @returns {Promise.<?Function>} - port.postMessage()
 */
export const requestSaveSession = async () => {
  const { id: windowId, incognito } = await getCurrentWindow();
  const port = await getPort(`${SIDEBAR}_${windowId}`, true);
  let func;
  if (port && !incognito) {
    const clonedBody = document.body.cloneNode(true);
    const items =
      clonedBody.querySelectorAll(`.${CLASS_TAB_CONTAINER}:not(#${NEW_TAB})`);
    const frag = document.createDocumentFragment();
    frag.append(...items);
    if (frag.childElementCount) {
      const doctype = new XMLSerializer().serializeToString(document.doctype);
      const dom = new XMLSerializer().serializeToString(frag);
      func = port.postMessage({
        [SESSION_SAVE]: {
          windowId,
          domString: `${doctype}${dom}`
        }
      });
    }
  }
  return func || null;
};

// For test
export { ports } from './port.js';
