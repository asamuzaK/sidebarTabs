/**
 * tab-content.js
 */

import {
  getType, isObjectNotEmpty, isString, logErr, setElementDataset, throwErr,
} from "./common.js";
import {
  getTab, updateTab,
} from "./browser.js";
import {
  closeTabs, muteTabs,
} from "./browser-tabs.js";
import {
  getSidebarTab, getSidebarTabId,
} from "./util.js";

/* api */
const {i18n} = browser;

/* constants */
import {
  CLASS_TAB_AUDIO, CLASS_TAB_CLOSE, CLASS_TAB_CONTENT, CLASS_TAB_ICON,
  CLASS_TAB_TITLE, HIGHLIGHTED, IDENTIFIED, TAB_CLOSE, TAB_MUTE,
  TAB_MUTE_UNMUTE, TABS_CLOSE, TABS_MUTE, TABS_MUTE_UNMUTE, URL_AUDIO_MUTED,
  URL_AUDIO_PLAYING, URL_FAVICON_DEFAULT, URL_LOADING_THROBBER,
} from "./constant.js";

/* favicon */
export const favicon = new Map([
  [
    "https://abs.twimg.com/favicons/favicon.ico",
    "../img/twitter-logo-blue.svg",
  ],
  [
    "https://abs.twimg.com/icons/apple-touch-icon-192x192.png",
    "../img/twitter-logo-blue.svg",
  ],
  [
    "chrome://browser/skin/customize.svg",
    "../img/customize-favicon.svg",
  ],
  [
    "chrome://browser/skin/settings.svg",
    "../img/options-favicon.svg",
  ],
  [
    "chrome://mozapps/skin/extensions/extensionGeneric-16.svg",
    "../img/addons-favicon.svg",
  ],
  [
    "chrome://mozapps/skin/extensions/extension.svg",
    "../img/addons-favicon.svg",
  ],
]);

/* contextual identities icon name */
export const contextualIdentitiesIconName = new Set([
  "briefcase", "cart", "chill", "dollar", "fingerprint", "food", "fruit",
  "gift", "pet", "tree", "vacation",
]);

/* contextual identities icon color */
export const contextualIdentitiesIconColor = new Set([
  "blue", "purple", "pink", "red", "orange", "yellow", "green",
  "turquoise",
]);

/**
 * tab icon fallback
 * @param {Object} evt - event
 * @returns {boolean} - false
 */
export const tabIconFallback = evt => {
  if (isObjectNotEmpty(evt)) {
    const {target, type} = evt;
    if (type === "error" && target && isString(target.src)) {
      target.src = URL_FAVICON_DEFAULT;
    }
  }
  return false;
};

/**
 * add tab icon error listener
 * @param {Object} elm - img element
 * @returns {void}
 */
export const addTabIconErrorListener = async elm => {
  if (elm && elm.nodeType === Node.ELEMENT_NODE && elm.localName === "img") {
    elm.addEventListener("error", tabIconFallback);
  }
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
      try {
        if (isString(title) && isString(url)) {
          const {hostname} = new URL(url);
          const connecting =
            title.endsWith("/") && hostname.endsWith(title.replace(/\/$/, ""));
          if (connecting) {
            elm.dataset.connecting = url;
          } else if (elm.dataset.connecting) {
            const {stroke} = window.getComputedStyle(elm);
            elm.style.fill = stroke;
            elm.dataset.connecting = "";
          }
        } else {
          elm.dataset.connecting = url;
        }
      } catch (e) {
        logErr(e);
        elm.dataset.connecting = url;
      }
      elm.src = URL_LOADING_THROBBER;
    } else {
      elm.dataset.connecting = "";
      if (favIconUrl) {
        elm.src = favicon.get(favIconUrl) || favIconUrl;
      } else {
        elm.src = URL_FAVICON_DEFAULT;
      }
      elm.style.fill = "";
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
  if (tab && tab.nodeType === Node.ELEMENT_NODE && isObjectNotEmpty(tabsTab)) {
    const {favIconUrl, status, title, url} = tabsTab;
    const tabContent = tab.querySelector(`.${CLASS_TAB_CONTENT}`);
    const tabTitle = tab.querySelector(`.${CLASS_TAB_TITLE}`);
    const tabIcon = tab.querySelector(`.${CLASS_TAB_ICON}`);
    tabContent.title = title;
    tabTitle.textContent = title;
    await setTabIcon(tabIcon, {favIconUrl, status, title, url});
    await setElementDataset(tab, "tab", JSON.stringify(tabsTab));
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
  const tabId = getSidebarTabId(tab);
  let func;
  if (Number.isInteger(tabId)) {
    const tabsTab = await getTab(tabId);
    const {mutedInfo: {muted}} = tabsTab;
    const {classList} = tab;
    if (classList.contains(HIGHLIGHTED)) {
      const selectedTabs = document.querySelectorAll(`.${HIGHLIGHTED}`);
      func = muteTabs(Array.from(selectedTabs), !muted);
    } else {
      func = updateTab(tabId, {muted: !muted});
    }
  }
  return func;
};

/**
 * handle tab audio onclick
 * @param {!Object} evt - Event
 * @returns {AsyncFunction} - handleClickedTabAudio()
 */
export const tabAudioOnClick = evt =>
  handleClickedTabAudio(evt).catch(throwErr);

/**
 * add tab audio click event listener
 * @param {Object} elm - element
 * @returns {void}
 */
export const addTabAudioClickListener = async elm => {
  if (elm && elm.nodeType === Node.ELEMENT_NODE &&
      elm.classList.contains(CLASS_TAB_AUDIO)) {
    elm.addEventListener("click", tabAudioOnClick);
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
  if (elm && elm.nodeType === Node.ELEMENT_NODE &&
      elm.classList.contains(CLASS_TAB_CLOSE)) {
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
 * @returns {?AsyncFunction} - closeTabs()
 */
export const handleClickedCloseButton = async evt => {
  const {target} = evt;
  const tab = getSidebarTab(target);
  let func;
  if (tab) {
    const {classList} = tab;
    if (classList.contains(HIGHLIGHTED)) {
      const selectedTabs = document.querySelectorAll(`.${HIGHLIGHTED}`);
      func = closeTabs(Array.from(selectedTabs));
    } else {
      func = closeTabs([tab]);
    }
  }
  return func || null;
};

/**
 * handle tab close button click
 * @param {!Object} evt - Event
 * @returns {AsyncFunction} - handleClickedCloseButton()
 */
export const tabCloseOnClick = evt =>
  handleClickedCloseButton(evt).catch(throwErr);

/**
 * add tab close click listener
 * @param {Object} elm - element
 * @returns {void}
 */
export const addTabCloseClickListener = async elm => {
  if (elm && elm.nodeType === Node.ELEMENT_NODE &&
      elm.classList.contains(CLASS_TAB_CLOSE)) {
    elm.addEventListener("click", tabCloseOnClick);
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
    if (contextualIdentitiesIconColor.has(color) &&
        contextualIdentitiesIconName.has(icon) &&
        isString(name)) {
      elm.alt = name;
      elm.src = `../img/${icon}.svg#${color}`;
      elm.parentNode.classList.add(IDENTIFIED);
    }
  }
};

/* highlight */
/**
 * add hightlight class to tab
 * @param {Object} elm - element
 * @returns {Promise.<Array>} - results of each handler
 */
export const addHighlight = async elm => {
  const func = [];
  const tabId = getSidebarTabId(elm);
  if (Number.isInteger(tabId)) {
    const tab = await getTab(tabId);
    const {audible, mutedInfo: {muted}} = tab;
    const closeElm = elm.querySelector(`.${CLASS_TAB_CLOSE}`);
    const muteElm = elm.querySelector(`.${CLASS_TAB_AUDIO}`);
    elm.classList.add(HIGHLIGHTED);
    func.push(
      setCloseTab(closeElm, true),
      setTabAudio(muteElm, {
        audible, muted,
        highlighted: true,
      }),
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
  for (const id of tabIds) {
    const item = document.querySelector(`[data-tab-id="${id}"]`);
    if (item) {
      func.push(addHighlight(item));
    }
  }
  return Promise.all(func);
};

/**
 * remove hightlight class from tab
 * @param {Object} elm - element
 * @returns {Promise.<Array>} - results of each handler
 */
export const removeHighlight = async elm => {
  const func = [];
  const tabId = getSidebarTabId(elm);
  if (Number.isInteger(tabId)) {
    const tab = await getTab(tabId);
    const {audible, mutedInfo: {muted}} = tab;
    const closeElm = elm.querySelector(`.${CLASS_TAB_CLOSE}`);
    const muteElm = elm.querySelector(`.${CLASS_TAB_AUDIO}`);
    elm.classList.remove(HIGHLIGHTED);
    func.push(
      setCloseTab(closeElm, false),
      setTabAudio(muteElm, {
        audible, muted,
        highlighted: false,
      }),
    );
  }
  return Promise.all(func);
};

/**
 * toggle highlight class of tab
 * @param {Object} elm - element
 * @returns {AsyncFunction} - addHighlight() / removeHightlight()
 */
export const toggleHighlight = async elm => {
  let func;
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    if (elm.classList.contains(HIGHLIGHTED)) {
      func = removeHighlight(elm);
    } else {
      func = addHighlight(elm);
    }
  }
  return func;
};
