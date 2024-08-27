/**
 * tab-content.js
 */

/* shared */
import { sanitizeURL } from '../lib/url/url-sanitizer-wo-dompurify.min.js';
import { getTab, updateTab } from './browser.js';
import { closeTabs, muteTabs } from './browser-tabs.js';
import {
  getType, isObjectNotEmpty, isString, setElementDataset, throwErr
} from './common.js';
import { getSidebarTab, getSidebarTabId } from './util.js';
import {
  CLASS_MULTI, CLASS_TAB_AUDIO, CLASS_TAB_CLOSE, CLASS_TAB_CONTENT,
  CLASS_TAB_ICON, CLASS_TAB_TITLE, HIGHLIGHTED, IDENTIFIED, TAB_CLOSE, TAB_MUTE,
  TAB_MUTE_UNMUTE, TABS_CLOSE, TABS_MUTE, TABS_MUTE_UNMUTE, URL_AUDIO_MUTED,
  URL_AUDIO_PLAYING, URL_FAVICON_DEFAULT, URL_LOADING_THROBBER, URL_SPACER
} from './constant.js';

/* api */
const { i18n } = browser;

/* favicon */
export const favicon = new Map([
  [
    'https://abs.twimg.com/favicons/favicon.ico',
    '../img/twitter-logo-blue.svg'
  ],
  [
    'https://abs.twimg.com/icons/apple-touch-icon-192x192.png',
    '../img/twitter-logo-blue.svg'
  ],
  [
    'chrome://browser/skin/customize.svg',
    '../img/customize-favicon.svg'
  ],
  [
    'chrome://browser/skin/settings.svg',
    '../img/options-favicon.svg'
  ],
  [
    'chrome://mozapps/skin/extensions/extensionGeneric-16.svg',
    '../img/addons-favicon.svg'
  ],
  [
    'chrome://mozapps/skin/extensions/extension.svg',
    '../img/addons-favicon.svg'
  ]
]);

/* contextual identities icon name */
export const contextualIdentitiesIconName = new Set([
  'briefcase', 'cart', 'chill', 'dollar', 'fence', 'fingerprint', 'food',
  'fruit', 'gift', 'pet', 'tree', 'vacation'
]);

/* contextual identities icon color */
export const contextualIdentitiesIconColor = new Set([
  'blue', 'green', 'orange', 'pink', 'purple', 'red', 'turquoise', 'yellow'
]);

/**
 * tab icon fallback
 * @param {object} [evt] - event
 * @returns {boolean} - false
 */
export const tabIconFallback = evt => {
  if (isObjectNotEmpty(evt)) {
    const { target, type } = evt;
    if (target && type === 'error' && isString(target.src)) {
      target.src = URL_FAVICON_DEFAULT;
    }
  }
  return false;
};

/**
 * add tab icon error listener
 * @param {object} [elm] - img element
 * @returns {Promise.<void>} - void
 */
export const addTabIconErrorListener = async elm => {
  if (elm?.nodeType === Node.ELEMENT_NODE && elm?.localName === 'img') {
    elm.addEventListener('error', tabIconFallback);
  }
};

/**
 * set tab icon
 * @param {object} [elm] - img element
 * @param {object} [info] - tab info
 * @returns {Promise.<void>} - void
 */
export const setTabIcon = async (elm, info) => {
  if (elm?.nodeType === Node.ELEMENT_NODE && elm?.localName === 'img' &&
      isObjectNotEmpty(info)) {
    const { favIconUrl, status, title, url: infoUrl } = info;
    if (status === 'loading') {
      if (isString(infoUrl)) {
        const url = await sanitizeURL(infoUrl, {
          allow: ['blob', 'data', 'file']
        });
        if (url && isString(title)) {
          const { hostname } = new URL(url);
          const connecting = title === `${hostname}/`;
          if (connecting) {
            elm.dataset.connecting = url;
          } else if (elm.dataset.connecting) {
            const { stroke } = window.getComputedStyle(elm);
            elm.style.fill = stroke;
            elm.dataset.connecting = '';
          }
        } else {
          elm.dataset.connecting = '';
        }
      } else {
        elm.dataset.connecting = '';
      }
      elm.src = URL_LOADING_THROBBER;
    } else {
      elm.dataset.connecting = '';
      elm.style.fill = '';
      if (favIconUrl) {
        elm.src = favicon.get(favIconUrl) || favIconUrl;
      } else {
        elm.src = URL_FAVICON_DEFAULT;
      }
    }
  }
};

/* tab content */
/**
 * set tab content
 * @param {object} [tab] - tab element
 * @param {object} [tabsTab] - tabs.Tab
 * @returns {Promise.<void>} - void
 */
export const setTabContent = async (tab, tabsTab) => {
  if (tab?.nodeType === Node.ELEMENT_NODE && isObjectNotEmpty(tabsTab)) {
    const { favIconUrl, status, title, url } = tabsTab;
    const tabContent = tab.querySelector(`.${CLASS_TAB_CONTENT}`);
    const tabTitle = tab.querySelector(`.${CLASS_TAB_TITLE}`);
    const tabIcon = tab.querySelector(`.${CLASS_TAB_ICON}`);
    tabContent.title = title;
    tabTitle.textContent = title;
    await setTabIcon(tabIcon, { favIconUrl, status, title, url });
    await setElementDataset(tab, 'tab', JSON.stringify(tabsTab));
  }
};

/* audio */
/**
 * handle clicked audio button
 * @param {object} [elm] - element
 * @returns {Promise.<?Promise>} - muteTabs() / updateTab()
 */
export const handleClickedTabAudio = async elm => {
  let func;
  if (elm?.nodeType === Node.ELEMENT_NODE) {
    const tab = getSidebarTab(elm);
    const tabId = getSidebarTabId(tab);
    if (Number.isInteger(tabId)) {
      const tabsTab = await getTab(tabId);
      const { mutedInfo: { muted } } = tabsTab;
      const { classList } = tab;
      if (classList.contains(HIGHLIGHTED)) {
        const selectedTabs = document.querySelectorAll(`.${HIGHLIGHTED}`);
        func = muteTabs([...selectedTabs], !muted);
      } else {
        func = updateTab(tabId, { muted: !muted });
      }
    }
  }
  return func || null;
};

/**
 * handle tab audio onclick
 * @param {!object} evt - Event
 * @returns {?Promise} - promise chain
 */
export const tabAudioOnClick = evt => {
  const { target } = evt;
  const tab = getSidebarTab(target);
  let func;
  if (tab) {
    func = handleClickedTabAudio(tab).catch(throwErr);
    evt.stopPropagation();
    evt.preventDefault();
  }
  return func || null;
};

/**
 * add tab audio click event listener
 * @param {object} [elm] - element
 * @returns {Promise.<void>} - void
 */
export const addTabAudioClickListener = async elm => {
  if (elm?.nodeType === Node.ELEMENT_NODE &&
      elm?.classList.contains(CLASS_TAB_AUDIO)) {
    elm.addEventListener('click', tabAudioOnClick);
  }
};

/**
 * set tab audio
 * @param {object} [elm] - element
 * @param {object} [info] - audio info
 * @param {number} [num] - number of highlighted tabs
 * @returns {Promise.<void>} - void
 */
export const setTabAudio = async (elm, info, num) => {
  if (elm?.nodeType === Node.ELEMENT_NODE && isObjectNotEmpty(info)) {
    const { audible, muted, highlighted } = info;
    if (muted) {
      if (highlighted && Number.isInteger(num) && num > 1) {
        elm.title = i18n.getMessage(`${TABS_MUTE_UNMUTE}_tooltip`, `${num}`);
      } else {
        elm.title = i18n.getMessage(`${TAB_MUTE_UNMUTE}_tooltip`);
      }
    } else if (audible) {
      if (highlighted && Number.isInteger(num) && num > 1) {
        elm.title = i18n.getMessage(`${TABS_MUTE}_tooltip`, `${num}`);
      } else {
        elm.title = i18n.getMessage(`${TAB_MUTE}_tooltip`);
      }
    } else {
      elm.title = '';
    }
  }
};

/**
 * set tab audio icon
 * @param {object} [elm] - element
 * @param {object} [info] - audio info
 * @returns {Promise.<void>} - void
 */
export const setTabAudioIcon = async (elm, info) => {
  if (elm?.nodeType === Node.ELEMENT_NODE && elm?.localName === 'img' &&
      isObjectNotEmpty(info)) {
    const { audible, muted } = info;
    if (muted) {
      elm.alt = i18n.getMessage(`${TAB_MUTE_UNMUTE}`);
      elm.src = URL_AUDIO_MUTED;
    } else if (audible) {
      elm.alt = i18n.getMessage(`${TAB_MUTE}`);
      elm.src = URL_AUDIO_PLAYING;
    } else {
      elm.alt = '';
      elm.src = URL_SPACER;
    }
  }
};

/* close button */
/**
 * set close tab button tooltip
 * @param {object} [elm] - element
 * @param {boolean} [highlighted] - highlighted
 * @param {number} [num] - number of highlighted tabs
 * @returns {Promise.<void>} - void
 */
export const setCloseTab = async (elm, highlighted, num) => {
  if (elm?.nodeType === Node.ELEMENT_NODE &&
      elm?.classList.contains(CLASS_TAB_CLOSE)) {
    if (highlighted && Number.isInteger(num) && num > 1) {
      elm.title = i18n.getMessage(`${TABS_CLOSE}_tooltip`, `${num}`);
    } else {
      elm.title = i18n.getMessage(`${TAB_CLOSE}_tooltip`);
    }
  }
};

/**
 * handle tab close button click
 * @param {!object} evt - Event
 * @returns {?Promise} - promise chain
 */
export const tabCloseOnClick = evt => {
  const { target } = evt;
  const tab = getSidebarTab(target);
  let func;
  if (tab) {
    const { classList } = tab;
    if (classList.contains(HIGHLIGHTED)) {
      const selectedTabs = document.querySelectorAll(`.${HIGHLIGHTED}`);
      func = closeTabs([...selectedTabs]).catch(throwErr);
    } else {
      func = closeTabs([tab]).catch(throwErr);
    }
    evt.stopPropagation();
    evt.preventDefault();
  }
  return func || null;
};

/**
 * prevent default event behavior
 * @param {!object} evt - Event
 * @returns {void}
 */
export const preventDefaultEvent = evt => {
  evt.preventDefault();
};

/**
 * add tab close click listener
 * @param {object} [elm] - element
 * @returns {Promise.<void>} - void
 */
export const addTabCloseClickListener = async elm => {
  if (elm?.nodeType === Node.ELEMENT_NODE &&
      elm?.classList.contains(CLASS_TAB_CLOSE)) {
    elm.addEventListener('mousedown', preventDefaultEvent);
    elm.addEventListener('click', tabCloseOnClick);
  }
};

/* contextual identities */
/**
 * set contextual identities icon
 * @param {object} [elm] - element
 * @param {object} [info] - contextual identities info
 * @returns {Promise.<void>} - void
 */
export const setContextualIdentitiesIcon = async (elm, info) => {
  if (elm?.nodeType === Node.ELEMENT_NODE && elm?.localName === 'img' &&
      isObjectNotEmpty(info)) {
    const { color, colorCode, icon, name } = info;
    if (contextualIdentitiesIconName.has(icon) && isString(name)) {
      let src;
      if (contextualIdentitiesIconColor.has(color)) {
        src = `../img/${icon}.svg#${color}`;
      } else if (colorCode) {
        const { href } = new URL(`../img/${icon}.svg`, import.meta.url);
        const file = await fetch(href);
        const content = await file.text();
        const doc = new DOMParser().parseFromString(content, 'image/svg+xml');
        const current = doc.getElementById('current');
        current.setAttribute('fill', colorCode);
        const domstr = new XMLSerializer().serializeToString(doc);
        const data = btoa(domstr);
        src = `data:image/svg+xml;base64,${data}`;
      } else {
        src = `../img/${icon}.svg#current`;
      }
      elm.src = src;
      elm.alt = name;
      elm.parentNode.classList.add(IDENTIFIED);
    }
  }
};

/* highlight */
/**
 * add hightlight class to tab
 * @param {object} elm - element
 * @param {number} [num] - number of highlighted tabs
 * @returns {Promise.<Array>} - results of each handler
 */
export const addHighlight = async (elm, num) => {
  const func = [];
  const tabId = getSidebarTabId(elm);
  if (Number.isInteger(tabId)) {
    const tab = await getTab(tabId);
    const { audible, mutedInfo: { muted } } = tab;
    const closeElm = elm.querySelector(`.${CLASS_TAB_CLOSE}`);
    const muteElm = elm.querySelector(`.${CLASS_TAB_AUDIO}`);
    elm.classList.add(HIGHLIGHTED);
    if (num > 1) {
      elm.classList.add(CLASS_MULTI);
    } else {
      elm.classList.remove(CLASS_MULTI);
    }
    func.push(
      setCloseTab(closeElm, true, num),
      setTabAudio(muteElm, {
        audible,
        muted,
        highlighted: true
      }, num)
    );
  }
  return Promise.all(func);
};

/**
 * add highlight class to tabs
 * @param {Array} tabIds - array of tab ID
 * @returns {Promise.<Array>} - results of each handler
 */
export const addHighlightToTabs = async tabIds => {
  if (!Array.isArray(tabIds)) {
    throw new TypeError(`Expected Array but got ${getType(tabIds)}.`);
  }
  const func = [];
  const arr = [];
  for (const id of tabIds) {
    const item = document.querySelector(`[data-tab-id="${id}"]`);
    if (item) {
      arr.push(item);
    }
  }
  if (arr.length) {
    const l = arr.length;
    for (const item of arr) {
      func.push(addHighlight(item, l));
    }
  }
  return Promise.all(func);
};

/**
 * remove hightlight class from tab
 * @param {object} elm - element
 * @returns {Promise.<Array>} - results of each handler
 */
export const removeHighlight = async elm => {
  const func = [];
  const tabId = getSidebarTabId(elm);
  if (Number.isInteger(tabId)) {
    const tab = await getTab(tabId);
    const { audible, mutedInfo: { muted } } = tab;
    const closeElm = elm.querySelector(`.${CLASS_TAB_CLOSE}`);
    const muteElm = elm.querySelector(`.${CLASS_TAB_AUDIO}`);
    elm.classList.remove(HIGHLIGHTED, CLASS_MULTI);
    func.push(
      setCloseTab(closeElm, false),
      setTabAudio(muteElm, {
        audible,
        muted,
        highlighted: false
      })
    );
  }
  return Promise.all(func);
};

/**
 * remove highlight class from tabs
 * @param {Array} tabIds - array of tab ID
 * @returns {Promise.<Array>} - results of each handler
 */
export const removeHighlightFromTabs = async tabIds => {
  if (!Array.isArray(tabIds)) {
    throw new TypeError(`Expected Array but got ${getType(tabIds)}.`);
  }
  const func = [];
  const arr = [];
  for (const id of tabIds) {
    const item = document.querySelector(`[data-tab-id="${id}"]`);
    if (item) {
      arr.push(item);
    }
  }
  if (arr.length) {
    for (const item of arr) {
      func.push(removeHighlight(item));
    }
  }
  return Promise.all(func);
};
