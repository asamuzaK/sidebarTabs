/**
 * tab-content.js
 */

import {
  getType, isObjectNotEmpty, isString, logErr, sleep, throwErr,
} from "./common.js";
import {
  highlightTab, removeTab, getActiveTab, getTab, updateTab,
} from "./browser.js";
import {
  closeTabs, muteTabs,
} from "./browser-tabs.js";
import {
  activateTab, getSidebarTab, getSidebarTabContainer, getSidebarTabId,
  getSidebarTabIndex, getTemplate, setSessionTabList,
} from "./util.js";

/* api */
const {i18n, windows} = browser;

/* constants */
import {
  ACTIVE, CLASS_TAB_AUDIO, CLASS_TAB_CLOSE, CLASS_TAB_COLLAPSED,
  CLASS_TAB_CONTAINER_TMPL, CLASS_TAB_CONTENT, CLASS_TAB_GROUP,
  CLASS_TAB_ICON, CLASS_TAB_TITLE, HIGHLIGHTED, IDENTIFIED, PINNED, TAB_CLOSE,
  TAB_GROUP_COLLAPSE, TAB_GROUP_EXPAND, TAB_MUTE, TAB_MUTE_UNMUTE, TAB_QUERY,
  TABS_CLOSE, TABS_MUTE, TABS_MUTE_UNMUTE, URL_AUDIO_MUTED, URL_AUDIO_PLAYING,
  URL_FAVICON_DEFAULT, URL_LOADING_THROBBER,
} from "./constant.js";
const TIME_500MSEC = 500;

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
          if (elm.dataset.connecting && !connecting) {
            const {stroke} = window.getComputedStyle(elm);
            elm.style.fill = stroke;
            elm.dataset.connecting = "";
          } else if (connecting) {
            elm.dataset.connecting = url;
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
      const {mutedInfo: {muted}} = tabsTab;
      const {classList} = tab;
      if (classList.contains(HIGHLIGHTED)) {
        const selectedTabs = document.querySelectorAll(`.${HIGHLIGHTED}`);
        func = muteTabs(selectedTabs, !muted);
      } else {
        func = updateTab(tabId, {muted: !muted});
      }
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
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
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
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    elm.addEventListener("click", tabCloseOnClick);
  }
};

/* contextual identities */
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
        contextualIdentitiesIconName.has(icon) && isString(name)) {
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
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    const tabId = getSidebarTabId(elm);
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
 * @param {Array} arr - array of tab ID
 * @returns {Promise.<Array>} - results of each handler
 */
export const addHighlightToTabs = async arr => {
  const func = [];
  if (Array.isArray(arr)) {
    arr.forEach(id => {
      const item = document.querySelector(`[data-tab-id="${id}"]`);
      if (item) {
        func.push(addHighlight(item));
      }
    });
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
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    const tabId = getSidebarTabId(elm);
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

/**
 * highlight all tabs
 * @param {Object} elm - first selected tab
 * @param {number} windowId - window ID
 * @returns {?AsyncFunction} - highlightTab()
 */
export const highlightAllTabs = async (elm, windowId) => {
  const items = document.querySelectorAll(TAB_QUERY);
  let func;
  if (items) {
    const arr = [];
    let firstIndex;
    if (!Number.isInteger(windowId)) {
      windowId = windows.WINDOW_ID_CURRENT;
    }
    if (elm && elm.nodeType === Node.ELEMENT_NODE) {
      const index = getSidebarTabIndex(elm);
      if (Number.isInteger(index)) {
        firstIndex = index;
        arr.push(index);
      }
    } else {
      const tab = await getActiveTab(windowId);
      if (tab) {
        const {id, index} = tab;
        const item = document.querySelector(`[data-tab-id="${id}"]`);
        if (item) {
          firstIndex = index;
          arr.push(index);
        }
      }
    }
    for (const item of items) {
      const itemIndex = getSidebarTabIndex(item);
      if (Number.isInteger(itemIndex)) {
        if (Number.isInteger(firstIndex)) {
          if (itemIndex !== firstIndex) {
            arr.push(itemIndex);
          }
        } else {
          arr.push(itemIndex);
        }
      }
    }
    func = highlightTab(arr, windowId);
  }
  return func || null;
};

/* tab group */
/**
 * toggle tab group collapsed state
 * @param {!Object} evt - event
 * @returns {?AsyncFunction} - activateTab()
 */
export const toggleTabGroupCollapsedState = async evt => {
  const {target} = evt;
  const container = getSidebarTabContainer(target);
  let func;
  if (container && container.classList.contains(CLASS_TAB_GROUP)) {
    const {firstElementChild: tab} = container;
    const {firstElementChild: tabContext} = tab;
    const {firstElementChild: toggleIcon} = tabContext;
    container.classList.toggle(CLASS_TAB_COLLAPSED);
    if (container.classList.contains(CLASS_TAB_COLLAPSED)) {
      tabContext.title = i18n.getMessage(`${TAB_GROUP_EXPAND}_tooltip`);
      toggleIcon.alt = i18n.getMessage(`${TAB_GROUP_EXPAND}`);
      func = activateTab(tab);
    } else {
      tabContext.title = i18n.getMessage(`${TAB_GROUP_COLLAPSE}_tooltip`);
      toggleIcon.alt = i18n.getMessage(`${TAB_GROUP_COLLAPSE}`);
    }
  }
  return func || null;
};

/**
 * add tab context click listener
 * @param {Object} elm - element
 * @returns {void}
 */
export const addTabContextClickListener = async elm => {
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    elm.addEventListener("click", evt =>
      toggleTabGroupCollapsedState(evt).then(setSessionTabList).catch(throwErr)
    );
  }
};

/**
 * expand activated collapsed tab
 * @returns {?AsyncFunction} - toggleTabGroupCollapsedState()
 */
export const expandActivatedCollapsedTab = async () => {
  const tab = document.querySelector(`${TAB_QUERY}.${ACTIVE}`);
  let func;
  if (tab) {
    const {parentNode} = tab;
    if (parentNode.classList.contains(CLASS_TAB_COLLAPSED) &&
        parentNode.firstElementChild !== tab) {
      func = toggleTabGroupCollapsedState({target: tab});
    }
  }
  return func || null;
};

/**
 * ungroup tabs
 * @param {Object} node - tab group container
 * @returns {void}
 */
export const ungroupTabs = async node => {
  if (node && node.nodeType === Node.ELEMENT_NODE) {
    const {id, classList, parentNode} = node;
    if (id !== PINNED && classList.contains(CLASS_TAB_GROUP)) {
      const items = node.querySelectorAll(TAB_QUERY);
      for (const item of items) {
        const container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
        container.appendChild(item);
        container.removeAttribute("hidden");
        parentNode.insertBefore(container, node);
      }
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
  await sleep(TIME_500MSEC);
  const tabsTab = await getTab(tabId);
  const {status} = tabsTab;
  let func;
  if (status === "complete") {
    await setTabContent(document.querySelector(`[data-tab-id="${tabId}"]`),
                        tabsTab);
    func = setSessionTabList();
  } else {
    func = observeTab(tabId);
  }
  return func;
};
