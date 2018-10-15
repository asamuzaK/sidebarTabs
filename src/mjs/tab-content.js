/**
 * tab-content.js
 */

import {
  escapeMatchingChars, getType, isObjectNotEmpty, isString, sleep, throwErr,
} from "./common.js";
import {removeTab, getTab, updateTab} from "./browser.js";
import {
  closeTabs, getSidebarTab, getSidebarTabId, muteTabs, setSessionTabList,
} from "./tab-util.js";
import {
  CLASS_TAB_CONTENT, CLASS_TAB_ICON, CLASS_TAB_TITLE, HIGHLIGHTED, IDENTIFIED,
  TAB_CLOSE, TAB_MUTE, TAB_MUTE_UNMUTE, TABS_CLOSE, TABS_MUTE, TABS_MUTE_UNMUTE,
  URL_AUDIO_MUTED, URL_AUDIO_PLAYING, URL_FAVICON_DEFAULT, URL_LOADING_THROBBER,
} from "./constant.js";

/* api */
const {i18n} = browser;

/* constants */
const TIME_3SEC = 3000;

/* favicon */
const favicon = new Map();

favicon.set("https://abs.twimg.com/favicons/favicon.ico",
            "../img/twitter-logo-blue.svg");
favicon.set("https://abs.twimg.com/icons/apple-touch-icon-192x192.png",
            "../img/twitter-logo-blue.svg");
favicon.set("chrome://browser/skin/customize.svg",
            "../img/customize-favicon.svg");
favicon.set("chrome://browser/skin/settings.svg",
            "../img/options-favicon.svg");
favicon.set("chrome://mozapps/skin/extensions/extensionGeneric-16.svg",
            "../img/addons-favicon.svg");

/**
 * tab icon fallback
 * @param {!Object} evt - event
 * @returns {boolean} - false
 */
export const tabIconFallback = evt => {
  const {target} = evt;
  if (target.hasOwnProperty("src")) {
    target.src = URL_FAVICON_DEFAULT;
  }
  return false;
};

/**
 * add tab icon error listener
 * @param {Object} elm - img element
 * @returns {void}
 */
export const addTabIconErrorListener = async elm => {
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    elm.addEventListener("error", tabIconFallback);
  }
};

/**
 * get favicon
 * @param {Object} elm - img element
 * @param {string} favIconUrl - favicon url
 * @returns {string} - favicon url
 */
export const getFavicon = async (elm, favIconUrl) => {
  let src;
  if (elm && elm.nodeType === Node.ELEMENT_NODE && elm.localName === "img") {
    if (isString(favIconUrl)) {
      const {protocol} = new URL(favIconUrl);
      if (/(?:f(?:tp|ile)|https?):/.test(protocol)) {
        const opt = {
          cache: "force-cache",
          credentials: "include",
          method: "GET",
          mode: "cors",
        };
        src = await fetch(favIconUrl, opt).then(res => {
          const {ok, url} = res;
          return ok && url || null;
        }).catch(() => favicon.get(favIconUrl));
        if (!src) {
          src = favicon.get(favIconUrl) || URL_FAVICON_DEFAULT;
        }
      } else {
        src = favicon.get(favIconUrl) || URL_FAVICON_DEFAULT;
      }
    } else {
      src = URL_FAVICON_DEFAULT;
    }
  }
  return src || URL_FAVICON_DEFAULT;
};

/**
 * set tab icon
 * @param {Object} elm - img element
 * @param {Object} info - tab info
 * @returns {void}
 */
export const setTabIcon = async (elm, info) => {
  if (elm && elm.nodeType === Node.ELEMENT_NODE && elm.localName === "img" &&
      isObjectNotEmpty(info)) {
    const {favIconUrl, status, title, url} = info;
    if (status === "loading") {
      const str = await escapeMatchingChars(title, /([/.?-])/g);
      const reg = new RegExp(`^(?:f(?:ile|tp)|https?)://(?:www\\.)?${str}$`);
      const isUrl = reg.test(url);
      if (elm.dataset.connecting && !isUrl) {
        const {stroke} = window.getComputedStyle(elm);
        elm.style.fill = stroke;
        elm.dataset.connecting = "";
      } else if (isUrl) {
        elm.dataset.connecting = url;
      }
      elm.src = URL_LOADING_THROBBER;
    } else {
      elm.dataset.connecting = "";
      if (favIconUrl) {
        const {protocol} = new URL(favIconUrl);
        if (protocol === "data:") {
          elm.src = favIconUrl;
        } else {
          elm.src = await getFavicon(elm, favIconUrl);
        }
      } else {
        elm.src = URL_FAVICON_DEFAULT;
      }
      elm.style.fill = null;
    }
  }
};

/* tab content */
/**
 * set tab content
 * @param {Object} tab - tab element
 * @param {Object} tabsTab - tabs.Tab
 * @returns {void}
 */
export const setTabContent = async (tab, tabsTab) => {
  if (tab && tab.nodeType === Node.ELEMENT_NODE && tabsTab) {
    const {favIconUrl, status, title, url} = tabsTab;
    const tabContent = tab.querySelector(`.${CLASS_TAB_CONTENT}`);
    const tabTitle = tab.querySelector(`.${CLASS_TAB_TITLE}`);
    const tabIcon = tab.querySelector(`.${CLASS_TAB_ICON}`);
    if (tabContent) {
      tabContent.title = title;
    }
    if (tabTitle) {
      tabTitle.textContent = title;
    }
    if (tabIcon) {
      await setTabIcon(tabIcon, {favIconUrl, status, title, url});
    }
    tab.dataset.tab = JSON.stringify(tabsTab);
  }
};

/* audio */
/**
 * handle clicked audio button
 * @param {!Object} evt - event
 * @returns {?AsyncFunction} - muteTabs / updateTab()
 */
export const handleClickedTabAudio = async evt => {
  const {target} = evt;
  const tab = getSidebarTab(target);
  let func;
  if (tab) {
    const tabId = getSidebarTabId(tab);
    if (Number.isInteger(tabId)) {
      const tabsTab = await getTab(tabId);
      if (tabsTab) {
        const {classList} = tab;
        const {mutedInfo: {muted}} = tabsTab;
        if (classList.contains(HIGHLIGHTED)) {
          const selectedTabs = document.querySelectorAll(`.${HIGHLIGHTED}`);
          func = muteTabs(selectedTabs, !muted);
        } else {
          func = updateTab(tabId, {muted: !muted});
        }
      }
    }
  }
  return func || null;
};

/**
 * add tab audio click event listener
 * @param {Object} elm - element
 * @returns {void}
 */
export const addTabAudioClickListener = async elm => {
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    elm.addEventListener("click", evt =>
      handleClickedTabAudio(evt).catch(throwErr)
    );
  }
};

/**
 * set tab audio
 * @param {Object} elm - element
 * @param {Object} info - audio info
 * @returns {void}
 */
export const setTabAudio = async (elm, info) => {
  if (elm && elm.nodeType === Node.ELEMENT_NODE && isObjectNotEmpty(info)) {
    const {audible, muted, highlighted} = info;
    if (muted) {
      if (highlighted) {
        elm.title = i18n.getMessage(`${TABS_MUTE_UNMUTE}_tooltip`);
      } else {
        elm.title = i18n.getMessage(`${TAB_MUTE_UNMUTE}_tooltip`);
      }
    } else if (audible) {
      if (highlighted) {
        elm.title = i18n.getMessage(`${TABS_MUTE}_tooltip`);
      } else {
        elm.title = i18n.getMessage(`${TAB_MUTE}_tooltip`);
      }
    } else {
      elm.title = "";
    }
  }
};

/**
 * set tab audio icon
 * @param {Object} elm - element
 * @param {Object} info - audio info
 * @returns {void}
 */
export const setTabAudioIcon = async (elm, info) => {
  if (elm && elm.nodeType === Node.ELEMENT_NODE && elm.localName === "img" &&
      isObjectNotEmpty(info)) {
    const {audible, muted} = info;
    if (muted) {
      elm.alt = i18n.getMessage(`${TAB_MUTE_UNMUTE}`);
      elm.src = URL_AUDIO_MUTED;
    } else if (audible) {
      elm.alt = i18n.getMessage(`${TAB_MUTE}`);
      elm.src = URL_AUDIO_PLAYING;
    } else {
      elm.alt = "";
      elm.src = "";
    }
  }
};

/* close button */
/**
 * set close tab button tooltip
 * @param {Object} elm - element
 * @param {boolean} highlighted - highlighted
 * @returns {void}
 */
export const setCloseTab = async (elm, highlighted) => {
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    if (highlighted) {
      elm.title = i18n.getMessage(`${TABS_CLOSE}_tooltip`);
    } else {
      elm.title = i18n.getMessage(`${TAB_CLOSE}_tooltip`);
    }
  }
};

/**
 * handle clicked close button
 * @param {Object} evt - event
 * @returns {?AsyncFunction} - closeTabs() / removeTab()
 */
export const handleClickedCloseButton = async evt => {
  const {target} = evt;
  const tab = getSidebarTab(target);
  let func;
  if (tab) {
    const {classList} = tab;
    if (classList.contains(HIGHLIGHTED)) {
      const selectedTabs = document.querySelectorAll(`.${HIGHLIGHTED}`);
      func = closeTabs(selectedTabs);
    } else {
      const tabId = getSidebarTabId(target);
      if (Number.isInteger(tabId)) {
        func = removeTab(tabId);
      }
    }
  }
  return func || null;
};

/**
 * add tab close click listener
 * @param {Object} elm - element
 * @returns {void}
 */
export const addTabCloseClickListener = async elm => {
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    elm.addEventListener("click", evt =>
      handleClickedCloseButton(evt).catch(throwErr)
    );
  }
};

/* contextual identities */
/**
 * set contextual identities icon
 * @param {Object} elm - element
 * @param {Object} info - contextual identities info
 * @returns {void}
 */
export const setContextualIdentitiesIcon = async (elm, info) => {
  if (elm && elm.nodeType === Node.ELEMENT_NODE && elm.localName === "img" &&
      isObjectNotEmpty(info)) {
    const {color, icon, name} = info;
    if (color && icon && name) {
      elm.alt = name;
      elm.src = `../img/${icon}.svg#${color}`;
      elm.parentNode.classList.add(IDENTIFIED);
    }
  }
};

/* observe */
/**
 * observe tab
 * @param {number} tabId - tab ID
 * @returns {?AsyncFunction} - setSessionTabList() / recurse observeTab()
 */
export const observeTab = async tabId => {
  if (!Number.isInteger(tabId)) {
    throw new TypeError(`Expected Number but got ${getType(tabId)}.`);
  }
  await sleep(TIME_3SEC);
  const tabsTab = await getTab(tabId);
  let func;
  if (tabsTab) {
    const {status} = tabsTab;
    if (status === "complete") {
      await setTabContent(document.querySelector(`[data-tab-id="${tabId}"]`),
                          tabsTab);
      func = setSessionTabList();
    } else {
      func = observeTab(tabId);
    }
  }
  return func || null;
};
