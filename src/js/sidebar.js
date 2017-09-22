/**
 * sidebar.js
 */
"use strict";
{
  /* api */
  const {
    bookmarks, contextualIdentities, i18n, management, runtime, sessions,
    storage, tabs, windows,
  } = browser;

  /* constants */
  const {TAB_ID_NONE} = tabs;
  const {WINDOW_ID_CURRENT} = windows;
  const ACTIVE = "active";
  const AUDIBLE = "audible";
  const AUDIO_MUTE = "muteAudio";
  const AUDIO_MUTE_UNMUTE = "unmuteAudio";
  const CLASS_MENU = "menu";
  const CLASS_TAB = "tab";
  const CLASS_TAB_AUDIO = "tab-audio";
  const CLASS_TAB_AUDIO_ICON = "tab-audio-icon";
  const CLASS_TAB_CLOSE = "tab-close";
  const CLASS_TAB_CLOSE_ICON = "tab-close-icon";
  const CLASS_TAB_COLLAPSED = "tab-collapsed";
  const CLASS_TAB_CONTAINER = "tab-container";
  const CLASS_TAB_CONTAINER_TMPL = "tab-container-template";
  const CLASS_TAB_CONTENT = "tab-content";
  const CLASS_TAB_CONTEXT = "tab-context";
  const CLASS_TAB_GROUP = "tab-group";
  const CLASS_TAB_ICON = "tab-icon";
  const CLASS_TAB_TITLE = "tab-title";
  const CLASS_TAB_TMPL = "tab-template";
  const CLASS_TAB_TOGGLE_ICON = "tab-toggle-icon";
  const CLASS_THEME_DARK = "dark-theme";
  const CLASS_THEME_LIGHT = "light-theme";
  const COOKIE_STORE_DEFAULT = "firefox-default";
  const MENU = "sidebar-tabs-menu";
  const MENU_SIDEBAR_INIT = "sidebar-tabs-menu-sidebar-init";
  const MENU_TAB = "sidebar-tabs-menu-tab";
  const MENU_TABS_BOOKMARK_ALL = "sidebar-tabs-menu-tabs-bookmark-all";
  const MENU_TABS_RELOAD_ALL = "sidebar-tabs-menu-tabs-reload-all";
  const MENU_TAB_AUDIO = "sidebar-tabs-menu-tab-audio";
  const MENU_TAB_CLOSE = "sidebar-tabs-menu-tab-close";
  const MENU_TAB_CLOSE_UNDO = "sidebar-tabs-menu-tab-close-undo";
  const MENU_TAB_DUPE = "sidebar-tabs-menu-tab-dupe";
  const MENU_TAB_GROUP = "sidebar-tabs-menu-tab-group";
  const MENU_TAB_GROUP_CLOSE = "sidebar-tabs-menu-tab-group-close";
  const MENU_TAB_GROUP_COLLAPSE = "sidebar-tabs-menu-tab-group-collapse";
  const MENU_TAB_GROUP_DETACH = "sidebar-tabs-menu-tab-group-detach";
  const MENU_TAB_GROUP_RELOAD = "sidebar-tabs-menu-tab-group-reload";
  const MENU_TAB_GROUP_UNGROUP = "sidebar-tabs-menu-tab-group-ungroup";
  const MENU_TAB_NEW_WIN_MOVE = "sidebar-tabs-menu-tab-new-win-move";
  const MENU_TAB_PIN = "sidebar-tabs-menu-tab-pin";
  const MENU_TAB_RELOAD = "sidebar-tabs-menu-tab-reload";
  const MENU_TAB_SYNC = "sidebar-tabs-menu-tab-sync";
  const MENU_TAB_TABS_CLOSE_END = "sidebar-tabs-menu-tab-close-end";
  const MENU_TAB_TABS_CLOSE_OTHER = "sidebar-tabs-menu-tab-close-other";
  const MENU_THEME_DARK = "sidebar-tabs-menu-sidebar-theme-dark";
  const MENU_THEME_DEFAULT = "sidebar-tabs-menu-sidebar-theme-default";
  const MENU_THEME_LIGHT = "sidebar-tabs-menu-sidebar-theme-light";
  const MENU_THEME_SELECT = "sidebar-tabs-menu-sidebar-theme-select";
  const MIME_TYPE = "text/plain";
  const MOUSE_BUTTON_RIGHT = 2;
  const NEW_TAB = "newtab";
  const NEW_WIN_MOVE = "moveToNewWindow";
  const PINNED = "pinned";
  const SIDEBAR_INIT = "initSidebar";
  const TAB = "tab";
  const TABS_BOOKMARK_ALL = "bookmarkAllTabs";
  const TABS_CLOSE_END = "closeTabsToTheEnd";
  const TABS_CLOSE_OTHER = "closeOtherTabs";
  const TABS_RELOAD_ALL = "reloadAllTabs";
  const TAB_CLOSE = "closeTab";
  const TAB_CLOSE_UNDO = "undoCloseTab";
  const TAB_DUPE = "dupeTab";
  const TAB_GROUP = "groupTabs";
  const TAB_GROUP_CLOSE = "closeGroupTabs";
  const TAB_GROUP_COLLAPSE = "collapseTabs";
  const TAB_GROUP_DETACH = "detachTabFromGroup";
  const TAB_GROUP_EXPAND = "expandTabs";
  const TAB_GROUP_RELOAD = "reloadGroupTabs";
  const TAB_GROUP_UNGROUP = "ungroupTabs";
  const TAB_OBSERVE = "observeTab";
  const TAB_PIN = "pinTab";
  const TAB_PIN_UNPIN = "unpinTab";
  const TAB_RELOAD = "reloadTab";
  const TAB_SYNC = "syncTab";
  const THEME = "theme";
  const THEME_DARK = "darkTheme";
  const THEME_DARK_ID = "firefox-compact-dark@mozilla.org@personas.mozilla.org";
  const THEME_DEFAULT = "defaultTheme";
  const THEME_LIGHT = "lightTheme";
  const THEME_LIGHT_ID =
    "firefox-compact-light@mozilla.org@personas.mozilla.org";
  const THEME_SELECT = "selectTheme";
  const TIME_3SEC = 3000;
  const TYPE_FROM = 8;
  const TYPE_TO = -1;
  const URL_AUDIO_MUTED = "../shared/tab-audio-muted.svg";
  const URL_AUDIO_PLAYING = "../shared/tab-audio-playing.svg";
  const URL_CSS = "../css/sidebar.css";
  const URL_DEFAULT_FAVICON = "../shared/defaultFavicon.svg";
  const URL_LOADING_THROBBER = "../img/loading.svg";
  const TAB_QUERY = `.${CLASS_TAB}:not(.${CLASS_MENU}):not(.${NEW_TAB})`;

  /**
   * throw error
   * @param {!Object} e - Error
   * @throws - Error
   */
  const throwErr = e => {
    throw e;
  };

  /**
   * get type
   * @param {*} o - object to check
   * @returns {string} - type of object
   */
  const getType = o =>
    Object.prototype.toString.call(o).slice(TYPE_FROM, TYPE_TO);

  /**
   * is string
   * @param {*} o - object to check
   * @returns {boolean} - result
   */
  const isString = o => typeof o === "string" || o instanceof String;

  /**
   * is object, and not an empty object
   * @param {*} o - object to check;
   * @returns {boolean} - result
   */
  const isObjectNotEmpty = o => {
    const items = /Object/i.test(getType(o)) && Object.keys(o);
    return !!(items && items.length);
  };

  /**
   * escape matching char
   * @param {string} str - argument
   * @param {RegExp} re - RegExp
   * @returns {?string} - string
   */
  const escapeChar = (str, re) =>
    isString(str) && re && re.global &&
    str.replace(re, (m, c) => `\\${c}`) || null;

  /**
   * sleep
   * @param {number} msec - milisec
   * @param {boolean} doReject - reject instead of resolve
   * @returns {?AsyncFunction} - resolve / reject
   */
  const sleep = (msec = 0, doReject = false) => {
    let func;
    if (Number.isInteger(msec) && msec >= 0) {
      func = new Promise((resolve, reject) => {
        if (doReject) {
          setTimeout(reject, msec);
        } else {
          setTimeout(resolve, msec);
        }
      });
    }
    return func || null;
  };

  /**
   * compare url string
   * @param {string} url1 - URL
   * @param {string} url2 - URL
   * @param {boolean} query - compare query string
   * @param {boolean} frag - compare fragment identifier string
   * @returns {boolean} - result
   */
  const isUrlEqual = (url1, url2, query = false, frag = false) => {
    url1 = new URL(url1);
    url2 = new URL(url2);
    return url1.origin === url2.origin && url1.pathname === url2.pathname &&
           (!query || url1.search === url2.search) &&
           (!frag || url1.hash === url2.hash);
  };

  /* webext utils */
  /* tabs */
  /**
   * create tab
   * @param {Object} opt - options
   * @returns {AsyncFunction} - tabs.create()
   */
  const createTab = async opt =>
    tabs.create(isObjectNotEmpty(opt) && opt || null);

  /**
   * update tab
   * @param {number} tabId - tab ID
   * @param {Object} opt - options
   * @returns {AsyncFunction} - tabs.update()
   */
  const updateTab = async (tabId, opt) => {
    if (!Number.isInteger(tabId)) {
      throw new TypeError(`Expected Number but got ${getType(tabId)}.`);
    }
    return tabs.update(tabId, isObjectNotEmpty(opt) && opt || null);
  };

  /**
   * get tab
   * @param {number} tabId - tab ID
   * @returns {AsyncFunction} - tabs.get()
   */
  const getTab = async tabId => {
    if (!Number.isInteger(tabId)) {
      throw new TypeError(`Expected Number but got ${getType(tabId)}.`);
    }
    return tabs.get(tabId);
  };

  /**
   * query tab
   * @param {Object} opt - options
   * @returns {AsyncFunction} tabs.query();
   */
  const queryTab = async opt =>
    tabs.query(isObjectNotEmpty(opt) && opt || null);

  /**
   * move tab
   * @param {number} tabId - tab ID
   * @param {Object} opt - options
   * @returns {AsyncFunction} - tabs.move();
   */
  const moveTab = async (tabId, opt) => {
    if (!Number.isInteger(tabId)) {
      throw new TypeError(`Expected Number but got ${getType(tabId)}.`);
    }
    return tabs.move(tabId, isObjectNotEmpty(opt) && opt || null);
  };

  /**
   * reload tab
   * @param {number} tabId - tab ID
   * @param {Object} opt - options
   * @returns {AsyncFunction} - tabs.reload()
   */
  const reloadTab = async (tabId, opt) => {
    if (!Number.isInteger(tabId)) {
      throw new TypeError(`Expected Number but got ${getType(tabId)}.`);
    }
    return tabs.reload(tabId, isObjectNotEmpty(opt) && opt || null);
  };

  /**
   * remove tab
   * @param {number|Array} arg - tab ID or array of tab ID
   * @returns {AsyncFunction} - tabs.remove()
   */
  const removeTab = async arg => {
    if (Number.isInteger(arg)) {
      arg = [arg];
    }
    if (!Array.isArray(arg)) {
      throw new TypeError(`Expected Array but got ${getType(arg)}.`);
    }
    return tabs.remove(arg);
  };

  /**
   * bookmark tab
   * @param {Object} opt - options
   * @returns {AsyncFunction} - bookmarks.create()
   */
  const bookmarkTab = async opt =>
    bookmarks.create(isObjectNotEmpty(opt) && opt || null);

  /**
   * get recently closed tab
   * @param {number} windowId - window ID
   * @returns {Object} - tabs.Tab
   */
  const getRecentlyClosedTab = async windowId => {
    const items = await sessions.getRecentlyClosed();
    let tab;
    if (Array.isArray(items) && items.length) {
      for (const item of items) {
        const {tab: itemTab} = item;
        if (itemTab) {
          const {windowId: itemWindowId} = itemTab;
          if (itemWindowId === windowId) {
            tab = itemTab;
            break;
          }
        }
      }
    }
    return tab || null;
  };

  /**
   * restore closed tab
   * @param {string} sessionId - session ID
   * @returns {AsyncFunction} - sessions.restore()
   */
  const restoreClosedTab = async sessionId => {
    if (!isString(sessionId)) {
      throw new TypeError(`Expected String but got ${getType(sessionId)}.`);
    }
    return sessions.restore(sessionId);
  };

  /* windows */
  /**
   * create new window
   * @param {Object} opt - options
   * @returns {AsyncFunction} - windows.create();
   */
  const createNewWindow = async opt =>
    windows.create(isObjectNotEmpty(opt) && opt || null);

  /**
   * get current window
   * @param {Object} opt - options
   * @returns {AsyncFunction} - windows.getCurrent()
   */
  const getCurrentWindow = async opt =>
    windows.getCurrent(isObjectNotEmpty(opt) && opt || null);

  /* management */
  /**
   * get enabled theme
   * @returns {Array} - array of management.ExtensionInfo
   */
  const getEnabledTheme = async () => {
    const theme = await management.getAll().then(arr => arr.filter(info =>
      info.type && info.type === "theme" && info.enabled && info
    ));
    return theme;
  };

  /* storage */
  /**
   * store data
   * @param {Object} data - data to store
   * @returns {?AsyncFunction} - storage.local.set()
   */
  const storeData = async data => {
    let func;
    if (isObjectNotEmpty(data)) {
      func = storage.local.set(data);
    }
    return func || null;
  };

  /* sidebar */
  const sidebar = {
    incognito: false,
    windowId: null,
    context: null,
    lastClosedTab: null,
  };

  /**
   * set sidebar
   * @returns {void}
   */
  const setSidebar = async () => {
    const win = await getCurrentWindow({
      populate: true,
      windowTypes: ["normal"],
    });
    if (win) {
      const {focused, id, incognito} = win;
      if (focused) {
        sidebar.incognito = incognito;
        sidebar.windowId = id;
      }
    }
  };

  /**
   * get theme
   * @returns {Array} - theme class list
   */
  const getTheme = async () => {
    const {theme: storedTheme} = await storage.local.get(THEME);
    let theme = [];
    if (Array.isArray(storedTheme) && storedTheme.length) {
      theme = storedTheme;
    } else {
      const items = await getEnabledTheme();
      if (Array.isArray(items) && items.length) {
        for (const item of items) {
          const {id} = item;
          switch (id) {
            case THEME_DARK_ID:
              theme.push(THEME_DARK);
              break;
            case THEME_LIGHT_ID:
              theme.push(THEME_LIGHT);
              break;
            default:
          }
        }
      }
      !theme.length && theme.push(THEME_DEFAULT);
    }
    return theme;
  };

  /**
   * set theme
   * @param {Array} theme - array of theme
   * @returns {void}
   */
  const setTheme = async theme => {
    if (!Array.isArray(theme)) {
      throw new TypeError(`Expected Array but got ${getType(theme)}.`);
    }
    const elm = document.querySelector("body");
    const {classList} = elm;
    for (const item of theme) {
      switch (item) {
        case THEME_DARK:
          classList.remove(CLASS_THEME_LIGHT);
          classList.add(CLASS_THEME_DARK);
          break;
        case THEME_DEFAULT:
          classList.remove(CLASS_THEME_DARK);
          classList.remove(CLASS_THEME_LIGHT);
          break;
        case THEME_LIGHT:
          classList.remove(CLASS_THEME_DARK);
          classList.add(CLASS_THEME_LIGHT);
          break;
        default:
      }
    }
    await storeData({
      [THEME]: theme,
    });
  };

  /**
   * init sidebar
   * @param {boolean} bool - bypass cache
   * @returns {void}
   */
  const initSidebar = async (bool = false) => {
    await storage.local.clear();
    window.location.reload(bool);
  };

  /* sidebar tabs */
  /**
   * get template
   * @param {string} id - template ID
   * @returns {Object} - document fragment
   */
  const getTemplate = id => {
    const tmpl = document.getElementById(id);
    const {content: {firstElementChild}} = tmpl;
    return document.importNode(firstElementChild, true);
  };

  /**
   * create new tab
   * @returns {AsyncFunction} - createTab()
   */
  const createNewTab = async () => createTab({
    active: true,
    windowId: sidebar.windowId,
  });

  /**
   * add new tab click listener
   * @returns {void}
   */
  const addNewTabClickListener = async () => {
    const newTab = document.getElementById(NEW_TAB);
    newTab.addEventListener("click", evt => createNewTab(evt).catch(throwErr));
  };

  /**
   * get sidebar tab container from parent node
   * @param {Object} node - node
   * @returns {Object} - sidebar tab container
   */
  const getSidebarTabContainer = node => {
    const root = document.documentElement;
    let container;
    while (node && node.parentNode && node.parentNode !== root) {
      const {classList, parentNode} = node;
      if (classList.contains(CLASS_TAB_CONTAINER)) {
        container = node;
        break;
      }
      node = parentNode;
    }
    return container || null;
  };

  /**
   * get sidebar tab from parent node
   * @param {Object} node - node
   * @returns {Object} - sidebar tab
   */
  const getSidebarTab = node => {
    const root = document.documentElement;
    let tab;
    while (node && node.parentNode && node.parentNode !== root) {
      const {dataset, parentNode} = node;
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
   * @param {Object} node - node
   * @returns {?number} - tab ID
   */
  const getSidebarTabId = node => {
    const root = document.documentElement;
    let tabId;
    while (node && node.parentNode && node.parentNode !== root) {
      const {dataset, parentNode} = node;
      if (dataset.tabId) {
        tabId = dataset.tabId * 1;
        break;
      }
      node = parentNode;
    }
    return tabId || null;
  };

  /**
   * get sidebar tab index
   * @param {Object} tab - tab
   * @returns {?number} - index
   */
  const getSidebarTabIndex = tab => {
    let index;
    if (tab && tab.nodeType === Node.ELEMENT_NODE) {
      const items = document.querySelectorAll(TAB_QUERY);
      const l = items.length;
      let i = 0;
      while (i < l && !index) {
        if (items[i] === tab) {
          index = i;
          break;
        }
        i++;
      }
    }
    return Number.isInteger(index) ?
      index :
      null;
  };

  /**
   * get last closed tab
   * @returns {Object} - tabs.Tab
   */
  const getLastClosedTab = async () => {
    const {windowId} = sidebar;
    const tab = await getRecentlyClosedTab(windowId);
    if (tab) {
      sidebar.lastClosedTab = tab;
    }
    return tab || null;
  };

  /**
   * activate tab
   * @param {!Object} evt - event
   * @returns {?AsyncFunction} - updateTab()
   */
  const activateTab = async evt => {
    const {target} = evt;
    const tabId = await getSidebarTabId(target);
    let func;
    if (Number.isInteger(tabId)) {
      const active = true;
      func = updateTab(tabId, {active});
    }
    return func || null;
  };

  /**
   * add sidebar tab click listener
   * @param {Object} elm - element
   * @returns {void}
   */
  const addTabClickListener = async elm => {
    if (elm && elm.nodeType === Node.ELEMENT_NODE) {
      elm.addEventListener("click", evt => activateTab(evt).catch(throwErr));
    }
  };

  /**
   * create tab data
   * @returns {Array} - tab data
   */
  const createTabData = async () => {
    const items = document.querySelectorAll(TAB_QUERY);
    const tab = [];
    for (const item of items) {
      const tabsTab = item.dataset && item.dataset.tab &&
                        JSON.parse(item.dataset.tab);
      const {url} = tabsTab;
      tab.push(url);
    }
    return tab;
  };

  /**
   * create tab group data
   * @returns {Array} - tab group data
   */
  const createTabGroupData = async () => {
    const items = document.querySelectorAll(
      `.${CLASS_TAB_CONTAINER}.${CLASS_TAB_GROUP}:not(.${PINNED})`
    );
    const group = [];
    for (const item of items) {
      const {children} = item;
      const arr = [];
      for (const child of children) {
        const index = getSidebarTabIndex(child);
        Number.isInteger(index) && arr.push(index);
      }
      arr.length && group.push(arr);
    }
    return group;
  };

  /**
   * store tab data
   * @returns {?AsyncFunction} - storeData()
   */
  const storeTabData = async () => {
    let func;
    if (!sidebar.incognito) {
      const tab = await createTabData() || [];
      const group = await createTabGroupData() || [];
      func = storeData({
        [TAB]: {
          tab, group,
        },
      });
    }
    return func || null;
  };

  /* sidebar tab content */
  /* favicon fallbacks */
  const favicon = new Map();

  favicon.set("https://abs.twimg.com/favicons/favicon.ico",
              "../shared/Twitter_Logo_Blue.svg");
  favicon.set("https://abs.twimg.com/icons/apple-touch-icon-192x192.png",
              "../shared/Twitter_Logo_Blue.svg");

  /**
   * tab icon fallback
   * @param {!Object} evt - event
   * @returns {boolean} - false
   */
  const tabIconFallback = evt => {
    const {target} = evt;
    target.hasOwnProperty("src") && (target.src = URL_DEFAULT_FAVICON);
    return false;
  };

  /**
   * add tab icon error listener
   * @param {Object} elm - img element
   * @returns {void}
   */
  const addTabIconErrorListener = async elm => {
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
  const getFavicon = async (elm, favIconUrl) => {
    let src;
    if (elm && elm.nodeType === Node.ELEMENT_NODE && elm.localName === "img") {
      if (isString(favIconUrl)) {
        const {protocol} = new URL(favIconUrl);
        if (/(?:f(?:tp|ile)|https?):/.test(protocol)) {
          src = await fetch(favIconUrl).then(res => {
            const {ok, url} = res;
            return ok && url || null;
          }).catch(() => favicon.get(favIconUrl));
          if (!src) {
            src = favicon.get(favIconUrl) || URL_DEFAULT_FAVICON;
          }
        } else {
          src = favicon.get(favIconUrl) || URL_DEFAULT_FAVICON;
        }
      } else {
        src = URL_DEFAULT_FAVICON;
      }
    }
    return src || URL_DEFAULT_FAVICON;
  };

  /**
   * set tab icon
   * @param {Object} elm - img element
   * @param {Object} info - tab info
   * @returns {void}
   */
  const setTabIcon = async (elm, info) => {
    let func;
    if (elm && elm.nodeType === Node.ELEMENT_NODE && elm.localName === "img") {
      const {favIconUrl, status, title, url} = info;
      if (status === "loading") {
        const str = escapeChar(title, /([/.?-])/g);
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
          elm.src = await getFavicon(elm, favIconUrl);
        } else {
          elm.src = URL_DEFAULT_FAVICON;
        }
        elm.style.fill = null;
      }
    }
  };

  /**
   * set tab content
   * @param {Object} tab - tab element
   * @param {Object} tabsTab - tabs.Tab
   * @returns {void}
   */
  const setTabContent = async (tab, tabsTab) => {
    if (tab && tab.nodeType === Node.ELEMENT_NODE && tabsTab) {
      const {favIconUrl, status, title, url} = tabsTab;
      const tabContent = tab.querySelector(`.${CLASS_TAB_CONTENT}`);
      const tabTitle = tab.querySelector(`.${CLASS_TAB_TITLE}`);
      const tabIcon = tab.querySelector(`.${CLASS_TAB_ICON}`);
      tabContent && (tabContent.title = title);
      tabTitle && (tabTitle.textContent = title);
      tabIcon && await setTabIcon(tabIcon, {favIconUrl, status, title, url});
      tab.dataset.tab = JSON.stringify(tabsTab);
    }
  };

  /**
   * observe tab
   * @param {number} tabId - tab ID
   * @returns {Promise.<Array>} - results of each handler
   */
  const observeTab = async tabId => {
    if (!Number.isInteger(tabId)) {
      throw new TypeError(`Expected Number but got ${getType(tabId)}.`);
    }
    await sleep(TIME_3SEC);
    const tabsTab = await getTab(tabId);
    const func = [];
    if (tabsTab) {
      const {status, id} = tabsTab;
      if (status === "complete") {
        await setTabContent(document.querySelector(`[data-tab-id="${id}"]`),
                            tabsTab);
        func.push(storeTabData());
      } else {
        func.push(observeTab(id));
      }
    }
    return Promise.all(func);
  };

  /* sidebar tab audio */
  /**
   * toggle audio state
   * @param {!Object} evt - event
   * @returns {?AsyncFunction} - updateTab()
   */
  const toggleAudio = async evt => {
    const {target} = evt;
    const tabId = await getSidebarTabId(target);
    let func;
    if (Number.isInteger(tabId)) {
      const tab = document.querySelector(`[data-tab-id="${tabId}"]`);
      if (tab) {
        const tabsTab = JSON.parse(tab.dataset.tab);
        const {mutedInfo: {muted}} = tabsTab;
        func = updateTab(tabId, {muted: !muted});
      }
    }
    return func || null;
  };

  /**
   * add tab audio click event listener
   * @param {Object} elm - element
   * @returns {void}
   */
  const addTabAudioClickListener = async elm => {
    if (elm && elm.nodeType === Node.ELEMENT_NODE) {
      elm.addEventListener("click", evt => toggleAudio(evt).catch(throwErr));
    }
  };

  /**
   * set tab audio
   * @param {Object} elm - element
   * @param {Object} info - audio info
   * @returns {void}
   */
  const setTabAudio = async (elm, info) => {
    if (elm && elm.nodeType === Node.ELEMENT_NODE) {
      const {audible, muted} = info;
      if (muted) {
        elm.title = i18n.getMessage(`${AUDIO_MUTE_UNMUTE}_tooltip`);
      } else if (audible) {
        elm.title = i18n.getMessage(`${AUDIO_MUTE}_tooltip`);
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
  const setTabAudioIcon = async (elm, info) => {
    if (elm && elm.nodeType === Node.ELEMENT_NODE) {
      const {audible, muted} = info;
      if (muted) {
        elm.alt = i18n.getMessage(`${AUDIO_MUTE_UNMUTE}`);
        elm.src = URL_AUDIO_MUTED;
      } else if (audible) {
        elm.alt = i18n.getMessage(`${AUDIO_MUTE}`);
        elm.src = URL_AUDIO_PLAYING;
      } else {
        elm.alt = "";
        elm.src = "";
      }
    }
  };

  /* close button */
  /**
   * close tab
   * @param {!Object} evt - event
   * @returns {?AsyncFunction} - removeTab()
   */
  const closeTab = async evt => {
    const {target} = evt;
    const tabId = await getSidebarTabId(target);
    let func;
    if (Number.isInteger(tabId)) {
      func = removeTab(tabId);
    }
    return func || null;
  };

  /**
   * add tab close click listener
   * @param {Object} elm - element
   * @returns {void}
   */
  const addTabCloseClickListener = async elm => {
    if (elm && elm.nodeType === Node.ELEMENT_NODE) {
      elm.addEventListener("click", evt => closeTab(evt).catch(throwErr));
    }
  };

  /* tab group */
  /**
   * toggle tab collapsed
   * @param {!Object} evt - event
   * @returns {?AsyncFunction} - activateTab()
   */
  const toggleTabCollapsed = async evt => {
    const {target} = evt;
    const container = await getSidebarTabContainer(target);
    let func;
    if (container.classList.contains(CLASS_TAB_GROUP)) {
      const {firstElementChild: tab} = container;
      const {firstElementChild: tabContext} = tab;
      const {firstElementChild: toggleIcon} = tabContext;
      container.classList.toggle(CLASS_TAB_COLLAPSED);
      if (container.classList.contains(CLASS_TAB_COLLAPSED)) {
        tabContext.title = i18n.getMessage(`${TAB_GROUP_EXPAND}_tooltip`);
        toggleIcon.alt = i18n.getMessage(`${TAB_GROUP_EXPAND}`);
        func = activateTab({target: tab});
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
  const addTabContextClickListener = async elm => {
    if (elm && elm.nodeType === Node.ELEMENT_NODE) {
      elm.addEventListener("click", evt =>
        toggleTabCollapsed(evt).catch(throwErr)
      );
    }
  };

  /**
   * expand activated collapsed tab when other tab got removed / detatched
   * @returns {?AsyncFunction} - toggleTabCollapsed()
   */
  const expandActivatedCollapsedTab = async () => {
    const tab = document.querySelector(`${TAB_QUERY}.${ACTIVE}`);
    let func;
    if (tab) {
      const {parentNode} = tab;
      if (parentNode.classList.contains(CLASS_TAB_COLLAPSED) &&
          parentNode.lastElementChild === tab) {
        func = toggleTabCollapsed({target: tab});
      }
    }
    return func || null;
  };

  /**
   * close grouped tabs
   * @param {Object} node - tab group container
   * @returns {?AsyncFunction} - removeTab()
   */
  const closeGroupTabs = async node => {
    const {id, classList, nodeType} = node;
    let func;
    if (nodeType === Node.ELEMENT_NODE && id !== PINNED &&
        classList.contains(CLASS_TAB_GROUP)) {
      const items = node.querySelectorAll(TAB_QUERY);
      const arr = [];
      for (const item of items) {
        const {dataset} = item;
        const tabId = dataset && dataset.tabId && dataset.tabId * 1;
        Number.isInteger(tabId) && arr.push(tabId);
      }
      func = arr.length && removeTab(arr);
    }
    return func || null;
  };

  /**
   * detach tab from tab group
   * @param {Object} elm - element
   * @returns {?AsyncFunction} - moveTab()
   */
  const detachTabFromGroup = async elm => {
    let func;
    if (elm && elm.nodeType === Node.ELEMENT_NODE) {
      const {parentNode} = elm;
      if (parentNode.classList.contains(CLASS_TAB_GROUP) &&
          !parentNode.classList.contains(PINNED)) {
        const {lastElementChild, nextElementSibling} = parentNode;
        const items = document.querySelectorAll(TAB_QUERY);
        const tabId = elm.dataset && elm.dataset.tabId && elm.dataset.tabId * 1;
        const opt = {
          windowId: sidebar.windowId,
        };
        if (elm === lastElementChild) {
          const container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
          container.appendChild(elm);
          parentNode.parentNode.insertBefore(container, nextElementSibling);
        } else {
          const {firstElementChild: target} = nextElementSibling;
          if (target.classList.contains(NEW_TAB)) {
            opt.index = items.length - 1;
          } else {
            const tabsTab = target.dataset && target.dataset.tab &&
                              JSON.parse(target.dataset.tab);
            const {index} = tabsTab;
            if (Number.isInteger(index)) {
              opt.index = index - 1;
            } else {
              opt.index = items.length - 1;
            }
          }
          func = moveTab(tabId, opt);
        }
      }
    }
    return func || null;
  };

  /**
   * ungroup tabs
   * @param {Object} node - tab group container
   * @returns {void}
   */
  const ungroupTabs = async (node = {}) => {
    const {id, classList, nodeType, parentNode} = node;
    if (nodeType === Node.ELEMENT_NODE && id !== PINNED &&
        classList.contains(CLASS_TAB_GROUP)) {
      const items = node.querySelectorAll(TAB_QUERY);
      for (const item of items) {
        const container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
        container.appendChild(item);
        parentNode.insertBefore(container, node);
      }
    }
  };

  /* DnD */
  /**
   * handle drop
   * @param {!Object} evt - event
   * @returns {?AsyncFunction} - storeTabData()
   */
  const handleDrop = evt => {
    const {dataTransfer, shiftKey, target} = evt;
    const id = dataTransfer.getData(MIME_TYPE);
    let func;
    if (isString(id)) {
      const tab = document.querySelector(`[data-tab-id="${id}"]`);
      if (tab) {
        const root = document.documentElement;
        let node = target;
        let dropTarget;
        while (node && node.parentNode && node.parentNode !== root) {
          const {dataset} = node;
          if (dataset && dataset.tabId) {
            dropTarget = node;
            break;
          }
          node = node.parentNode;
        }
        if (dropTarget && dropTarget !== tab) {
          const {parentNode: dropParent} = dropTarget;
          const {
            childElementCount: dropParentChild,
            nextElementSibling: dropParentNextElement,
          } = dropParent;
          const {parentNode: tabParent} = tab;
          if (dropParentNextElement === tabParent && dropParentChild === 1 &&
              shiftKey) {
            dropParent.appendChild(tab);
            dropParent.classList.add(CLASS_TAB_GROUP);
            switch (tabParent.childElementCount) {
              case 0:
                tabParent.parentNode.removeChild(tabParent);
                break;
              case 1:
                tabParent.classList.remove(CLASS_TAB_GROUP);
                break;
              default:
            }
          } else {
            const dropIndex = getSidebarTabIndex(dropTarget);
            const tabIndex = getSidebarTabIndex(tab);
            const index = tabIndex >= dropIndex && dropIndex + 1 || dropIndex;
            tab.dataset.group = !!shiftKey;
            moveTab(id * 1, {
              index,
              windowId: sidebar.windowId,
            });
          }
          func = storeTabData().catch(throwErr);
        }
      }
    }
    evt.stopPropagation();
    evt.preventDefault();
    return func || null;
  };

  /**
   * handle dragover
   * @param {!Object} evt - event
   * @returns {void}
   */
  const handleDragOver = evt => {
    const {dataTransfer: {types}} = evt;
    if (Array.isArray(types) && types.includes(MIME_TYPE)) {
      evt.preventDefault();
    }
  };

  /**
   * handle dragenter
   * @param {!Object} evt - event
   * @returns {void}
   */
  const handleDragEnter = evt => {
    const {target, dataTransfer} = evt;
    if (target.nodeType === Node.ELEMENT_NODE) {
      const {types} = dataTransfer;
      if (Array.isArray(types) && types.includes(MIME_TYPE)) {
        dataTransfer.dropEffect = "move";
      }
    }
  };

  /**
   * add DnD drop event listener
   * @param {Object} elm - draggable element
   * @returns {void}
   */
  const addDropEventListener = async elm => {
    if (elm && elm.nodeType === Node.ELEMENT_NODE) {
      elm.addEventListener("dragenter", handleDragEnter);
      elm.addEventListener("dragover", handleDragOver);
      elm.addEventListener("drop", handleDrop);
    }
  };

  /**
   * handle dragstart
   * @param {!Object} evt - event
   * @returns {void}
   */
  const handleDragStart = evt => {
    const {target: {dataset: {tabId}}} = evt;
    if (tabId) {
      evt.dataTransfer.effectAllowed = "move";
      evt.dataTransfer.setData(MIME_TYPE, tabId);
    }
  };

  /**
   * add DnD drag event listener
   * @param {Object} elm - draggable element
   * @returns {void}
   */
  const addDragEventListener = async elm => {
    if (elm && elm.nodeType === Node.ELEMENT_NODE) {
      elm.addEventListener("dragstart", handleDragStart);
    }
  };

  /* sidebar tab containers */
  /**
   * restore sidebar tab containers
   * @returns {Promise.<Array>} - result of each handler
   */
  const restoreTabContainers = async () => {
    const func = [];
    const items = document.querySelectorAll(
      `.${CLASS_TAB_CONTAINER}:not(#${NEW_TAB})`
    );
    for (const item of items) {
      const {childElementCount, classList, id, parentNode} = item;
      switch (childElementCount) {
        case 0:
          id !== PINNED && parentNode.removeChild(item);
          break;
        case 1:
          classList.remove(CLASS_TAB_GROUP);
          break;
        default:
          classList.add(CLASS_TAB_GROUP);
      }
      id !== PINNED && func.push(addDropEventListener(item));
    }
    func.push(storeTabData());
    return Promise.all(func);
  };

  /* tabs event handlers */
  /**
   * handle activated tab
   * @param {!Object} info - activated info
   * @returns {void}
   */
  const handleActivatedTab = async info => {
    const {tabId, windowId} = info;
    if (windowId === sidebar.windowId && tabId !== TAB_ID_NONE) {
      const tab = document.querySelector(`[data-tab-id="${tabId}"]`);
      if (tab) {
        const {classList: newClass, parentNode: newParent} = tab;
        const {classList: newParentClass} = newParent;
        const items = document.querySelectorAll(
          `${TAB_QUERY}:not([data-tab-id="${tabId}"])`
        );
        for (const item of items) {
          const {
            classList: oldClass, parentNode: {classList: oldParentClass},
          } = item;
          oldClass.remove(ACTIVE);
          oldParentClass.remove(ACTIVE);
        }
        newParentClass.add(ACTIVE);
        newClass.add(ACTIVE);
      }
    }
  };

  /**
   * handle created tab
   * @param {Object} tabsTab - tabs.Tab
   * @returns {Promise.<Array>} - results of each handler
   */
  const handleCreatedTab = async tabsTab => {
    const {
      active, audible, cookieStoreId, favIconUrl, id, index, mutedInfo,
      openerTabId, pinned, status, title, url, windowId,
    } = tabsTab;
    const {muted} = mutedInfo;
    const func = [];
    if (windowId === sidebar.windowId && id !== TAB_ID_NONE) {
      const tab = await getTemplate(CLASS_TAB_TMPL);
      const tabItems = [
        `.${TAB}`, `.${CLASS_TAB_CONTEXT}`, `.${CLASS_TAB_TOGGLE_ICON}`,
        `.${CLASS_TAB_CONTENT}`, `.${CLASS_TAB_ICON}`, `.${CLASS_TAB_TITLE}`,
        `.${CLASS_TAB_AUDIO}`, `.${CLASS_TAB_AUDIO_ICON}`,
        `.${CLASS_TAB_CLOSE}`, `.${CLASS_TAB_CLOSE_ICON}`,
      ];
      const items = tab.querySelectorAll(tabItems.join(","));
      const list = document.querySelectorAll(TAB_QUERY);
      const listedTab = list[index];
      const listedTabPrev = index > 0 && list[index - 1];
      let container, openerTab, openerTabsTab;
      for (const item of items) {
        const {classList} = item;
        if (classList.contains(CLASS_TAB_CONTEXT)) {
          item.title = i18n.getMessage(`${TAB_GROUP_COLLAPSE}_tooltip`);
          func.push(addTabContextClickListener(item));
        } else if (classList.contains(CLASS_TAB_TOGGLE_ICON)) {
          item.alt = i18n.getMessage(`${TAB_GROUP_COLLAPSE}`);
        } else if (classList.contains(CLASS_TAB_CONTENT)) {
          item.title = title;
        } else if (classList.contains(CLASS_TAB_ICON)) {
          func.push(
            setTabIcon(item, {favIconUrl, status, title, url}),
            addTabIconErrorListener(item),
          );
        } else if (classList.contains(CLASS_TAB_TITLE)) {
          item.textContent = title;
        } else if (classList.contains(CLASS_TAB_AUDIO)) {
          if (audible || muted) {
            classList.add(AUDIBLE);
          } else {
            classList.remove(AUDIBLE);
          }
          func.push(
            setTabAudio(item, {audible, muted}),
            addTabAudioClickListener(item),
          );
        } else if (classList.contains(CLASS_TAB_AUDIO_ICON)) {
          func.push(setTabAudioIcon(item, {audible, muted}));
        } else if (classList.contains(CLASS_TAB_CLOSE)) {
          item.title = i18n.getMessage(`${TAB_CLOSE}_tooltip`);
          func.push(addTabCloseClickListener(item));
        } else if (classList.contains(CLASS_TAB_CLOSE_ICON)) {
          item.alt = i18n.getMessage(`${TAB_CLOSE}`);
        }
        func.push(addTabClickListener(item));
      }
      tab.dataset.tabId = id;
      tab.dataset.tab = JSON.stringify(tabsTab);
      if (cookieStoreId && cookieStoreId !== COOKIE_STORE_DEFAULT) {
        const ident = await contextualIdentities.get(cookieStoreId);
        if (ident) {
          const {color} = ident;
          if (color) {
            tab.style.borderColor = color;
          }
        }
      }
      if (Number.isInteger(openerTabId)) {
        openerTab = document.querySelector(`[data-tab-id="${openerTabId}"]`);
        if (openerTab && openerTab.dataset && openerTab.dataset.tab) {
          openerTabsTab = JSON.parse(openerTab.dataset.tab);
        }
      }
      if (pinned) {
        container = document.getElementById(PINNED);
        tab.classList.add(PINNED);
        tab.removeAttribute("draggable");
        if (container.children[index]) {
          container.insertBefore(tab, container.children[index]);
        } else {
          container.appendChild(tab);
        }
        container.childElementCount > 1 &&
          container.classList.add(CLASS_TAB_GROUP);
      } else if (openerTab && !openerTab.classList.contains(PINNED) &&
                 openerTabsTab && openerTabsTab.index === index - 1) {
        await addDragEventListener(tab);
        container = openerTab.parentNode;
        container.insertBefore(tab, openerTab.nextElementSibling);
        container.classList.contains(CLASS_TAB_COLLAPSED) &&
          func.push(toggleTabCollapsed({target: tab}));
      } else if (list.length !== index && listedTab && listedTab.parentNode &&
                 listedTab.parentNode.classList.contains(CLASS_TAB_GROUP) &&
                 listedTabPrev && listedTabPrev.parentNode &&
                 listedTabPrev.parentNode.classList.contains(CLASS_TAB_GROUP) &&
                 listedTab.parentNode === listedTabPrev.parentNode) {
        await addDragEventListener(tab);
        container = listedTab.parentNode;
        container.insertBefore(tab, listedTab);
        container.classList.contains(CLASS_TAB_COLLAPSED) &&
          func.push(toggleTabCollapsed({target: tab}));
      } else {
        let target;
        if (list.length !== index && listedTab && listedTab.parentNode) {
          target = listedTab.parentNode;
        } else {
          target = document.getElementById(NEW_TAB);
        }
        await addDragEventListener(tab);
        container = await getTemplate(CLASS_TAB_CONTAINER_TMPL);
        container.appendChild(tab);
        target.parentNode.insertBefore(container, target);
      }
    }
    active && func.push(handleActivatedTab({tabId: id, windowId}));
    return Promise.all(func);
  };

  /**
   * handle attached tab
   * @param {number} tabId - tab ID
   * @param {Object} info - attached tab info
   * @returns {?AsyncFunction} - tabs.Tab
   */
  const handleAttachedTab = async (tabId, info) => {
    const {newPosition, newWindowId} = info;
    let func;
    if (newWindowId === sidebar.windowId && tabId !== TAB_ID_NONE) {
      const tabsTab = await getTab(tabId);
      if (tabsTab) {
        tabsTab.index = newPosition;
        func = handleCreatedTab(tabsTab);
      }
    }
    return func || null;
  };

  /**
   * handle updated tab
   * @param {number} tabId - tab ID
   * @param {Object} info - updated tab info
   * @param {Object} tabsTab - tabs.Tab
   * @returns {Promise.<Array>} - results of each handler
   */
  const handleUpdatedTab = async (tabId, info, tabsTab) => {
    const {windowId} = tabsTab;
    const func = [];
    if (windowId === sidebar.windowId && tabId !== TAB_ID_NONE) {
      const tab = document.querySelector(`[data-tab-id="${tabId}"]`);
      if (tab) {
        await setTabContent(tab, tabsTab);
        if (info.hasOwnProperty("audible") ||
            info.hasOwnProperty("mutedInfo")) {
          const tabAudio = tab.querySelector(`.${CLASS_TAB_AUDIO}`);
          const tabAudioIcon = tab.querySelector(`.${CLASS_TAB_AUDIO_ICON}`);
          const {muted} = tabsTab.mutedInfo;
          const {audible} = tabsTab;
          const opt = {audible, muted};
          if (tabAudio) {
            if (audible || muted) {
              tabAudio.classList.add(AUDIBLE);
            } else {
              tabAudio.classList.remove(audible);
            }
            func.push(setTabAudio(tabAudio, opt));
          }
          tabAudioIcon && func.push(setTabAudioIcon(tabAudioIcon, opt));
        }
        if (info.hasOwnProperty("pinned")) {
          const pinnedContainer = document.getElementById(PINNED);
          if (info.pinned) {
            const container = pinnedContainer;
            tab.classList.add(PINNED);
            tab.removeAttribute("draggable");
            container.appendChild(tab);
            func.push(restoreTabContainers());
          } else {
            const {
              nextElementSibling: pinnedNextElement,
              parentNode: pinnedParentNode,
            } = pinnedContainer;
            const container = await getTemplate(CLASS_TAB_CONTAINER_TMPL);
            tab.classList.remove(PINNED);
            tab.setAttribute("draggable", "true");
            func.push(addDragEventListener(tab));
            container.appendChild(tab);
            pinnedParentNode.insertBefore(container, pinnedNextElement);
            func.push(restoreTabContainers());
          }
        }
        info.hasOwnProperty("status") && func.push(observeTab(tabId));
        info.hasOwnProperty("url") && func.push(storeTabData());
        tab.dataset.tab = JSON.stringify(tabsTab);
      }
    }
    return Promise.all(func);
  };

  /**
   * handle moved tab
   * @param {!number} tabId - tab ID
   * @param {!Object} info - moved info
   * @returns {void}
   */
  const handleMovedTab = async (tabId, info) => {
    const {fromIndex, toIndex, windowId} = info;
    if (windowId === sidebar.windowId && tabId !== TAB_ID_NONE) {
      const tab = document.querySelector(`[data-tab-id="${tabId}"]`);
      const items = document.querySelectorAll(TAB_QUERY);
      if (toIndex === 0) {
        const tabsTab = await getTab(tabId);
        const {pinned} = tabsTab;
        if (pinned) {
          const container = document.getElementById(PINNED);
          const {firstElementChild} = container;
          container.insertBefore(tab, firstElementChild);
        } else {
          const container = await getTemplate(CLASS_TAB_CONTAINER_TMPL);
          const [target] = items;
          container.appendChild(tab);
          target.parentNode.insertBefore(container, target);
        }
      } else {
        const lastTabIndex = items.length - 1;
        const index = toIndex === lastTabIndex || fromIndex >= toIndex ?
          toIndex :
          toIndex + 1;
        const target = items[index];
        const {parentNode} = target;
        const unPinned =
          toIndex > fromIndex &&
          items[fromIndex].parentNode.classList.contains(PINNED) &&
          items[toIndex].parentNode.classList.contains(PINNED) &&
          items[toIndex] === items[toIndex].parentNode.lastElementChild;
        const detached =
          toIndex > fromIndex &&
          items[fromIndex].parentNode.classList.contains(CLASS_TAB_GROUP) &&
          items[toIndex].parentNode.classList.contains(CLASS_TAB_GROUP) &&
          items[toIndex] === items[toIndex].parentNode.lastElementChild;
        let {dataset: {group}} = tab;
        group = group === "true" && true || false;
        if (!group && parentNode.childElementCount === 1 || unPinned ||
            detached) {
          const {parentNode: parentParentNode} = parentNode;
          const frag = await getTemplate(CLASS_TAB_CONTAINER_TMPL);
          if (frag) {
            frag.appendChild(tab);
            if (toIndex === lastTabIndex) {
              const newtab = document.getElementById(NEW_TAB);
              parentParentNode.insertBefore(frag, newtab);
            } else {
              parentParentNode.insertBefore(frag, parentNode);
            }
          }
        } else {
          const groupIndex = toIndex === lastTabIndex || fromIndex < toIndex ?
            toIndex :
            toIndex - 1;
          const groupTarget = items[groupIndex];
          const {parentNode: groupParent, nextElementSibling} = groupTarget;
          if (toIndex === lastTabIndex) {
            groupParent.appendChild(tab);
          } else {
            groupParent.insertBefore(tab, nextElementSibling);
          }
        }
      }
      tab.dataset.group = null;
    }
  };

  /**
   * handle detached tab
   * @param {number} tabId - tab ID
   * @param {Object} info - detached tab info
   * @returns {void}
   */
  const handleDetachedTab = async (tabId, info) => {
    const {oldWindowId} = info;
    if (oldWindowId === sidebar.windowId && tabId !== TAB_ID_NONE) {
      const tab = document.querySelector(`[data-tab-id="${tabId}"]`);
      tab && tab.parentNode.removeChild(tab);
    }
  };

  /**
   * handle removed tab
   * @param {number} tabId - tab ID
   * @param {Object} info - removed tab info
   * @returns {void}
   */
  const handleRemovedTab = async (tabId, info) => {
    const {isWindowClosing, windowId} = info;
    if (windowId === sidebar.windowId && !isWindowClosing &&
        tabId !== TAB_ID_NONE) {
      const tab = document.querySelector(`[data-tab-id="${tabId}"]`);
      tab && tab.parentNode.removeChild(tab);
    }
  };

  /* context menus */
  /**
   * sync tab
   * @param {number} tabId - tab ID
   * @returns {?AsyncFunction} - handleUpdatedTab()
   */
  const syncTab = async tabId => {
    if (!Number.isInteger(tabId)) {
      throw new TypeError(`Expected Number but got ${getType(tabId)}`);
    }
    let func;
    const tabsTab = await getTab(tabId);
    if (tabsTab) {
      const {favIconUrl, status, title} = tabsTab;
      const info = {favIconUrl, status, title};
      func = handleUpdatedTab(tabId, info, tabsTab);
    }
    return func || null;
  };

  /**
   * duplicate tab
   * @param {number} tabId - tab ID
   * @returns {?AsyncFunction} - createTab()
   */
  const dupeTab = async tabId => {
    if (!Number.isInteger(tabId)) {
      throw new TypeError(`Expected Number but got ${getType(tabId)}`);
    }
    let func;
    const tabsTab = await getTab(tabId);
    if (tabsTab) {
      const {index, url} = tabsTab;
      const {windowId} = sidebar;
      const opt = {
        active: true,
        index: index + 1,
        openerTabId: tabId,
        url, windowId,
      };
      func = createTab(opt);
    }
    return func || null;
  };

  /**
   * handle context menu click
   * @param {!Object} evt - event
   * @returns {Promise.<Array>} - results of each handler
   */
  const handleClickedContextMenu = async evt => {
    const {target: {id}} = evt;
    const tab = sidebar.context && sidebar.context.classList &&
                  sidebar.context.classList.contains(TAB) && sidebar.context;
    const tabId = tab && tab.dataset && tab.dataset.tabId &&
                    tab.dataset.tabId * 1;
    const tabsTab = tab && tab.dataset && tab.dataset.tab &&
                      JSON.parse(tab.dataset.tab);
    const func = [];
    switch (id) {
      case MENU_SIDEBAR_INIT:
        func.push(initSidebar(true));
        break;
      case MENU_TABS_BOOKMARK_ALL: {
        const items = document.querySelectorAll(`${TAB_QUERY}:not(.${PINNED})`);
        for (const item of items) {
          const itemTab = item.dataset && item.dataset.tab &&
                            JSON.parse(item.dataset.tab);
          const {title, url} = itemTab;
          func.push(bookmarkTab({title, url}));
        }
        break;
      }
      case MENU_TABS_RELOAD_ALL: {
        const items = document.querySelectorAll(TAB_QUERY);
        for (const item of items) {
          const itemId = item && item.dataset && item.dataset.tabId * 1;
          Number.isInteger(itemId) && func.push(reloadTab(itemId));
        }
        break;
      }
      case MENU_TAB_AUDIO: {
        if (Number.isInteger(tabId) && tabsTab) {
          const {mutedInfo: {muted}} = tabsTab;
          func.push(updateTab(tabId, {muted: !muted}));
        }
        break;
      }
      case MENU_TAB_CLOSE:
        Number.isInteger(tabId) && func.push(removeTab(tabId));
        break;
      case MENU_TAB_CLOSE_UNDO: {
        const {lastClosedTab} = sidebar;
        if (lastClosedTab) {
          const {sessionId} = lastClosedTab;
          isString(sessionId) && func.push(restoreClosedTab(sessionId));
        }
        break;
      }
      case MENU_TAB_DUPE:
        Number.isInteger(tabId) && func.push(dupeTab(tabId));
        break;
      case MENU_TAB_GROUP_CLOSE: {
        if (tab && tabsTab) {
          const {parentNode} = tab;
          !tabsTab.pinned && parentNode.classList.contains(CLASS_TAB_GROUP) &&
            func.push(closeGroupTabs(parentNode).then(restoreTabContainers));
        }
        break;
      }
      case MENU_TAB_GROUP_COLLAPSE:
        tab && tab.parentNode.classList.contains(CLASS_TAB_GROUP) &&
          func.push(toggleTabCollapsed({target: tab}));
        break;
      case MENU_TAB_GROUP_DETACH:
        tab && tab.parentNode.classList.contains(CLASS_TAB_GROUP) &&
        !tab.parentNode.classList.contains(PINNED) &&
          func.push(detachTabFromGroup(tab).then(restoreTabContainers));
        break;
      case MENU_TAB_GROUP_RELOAD: {
        if (tab) {
          const {parentNode} = tab;
          if (parentNode.classList.contains(CLASS_TAB_GROUP)) {
            const items = parentNode.querySelectorAll(TAB_QUERY);
            for (const item of items) {
              const itemId = item && item.dataset && item.dataset.tabId * 1;
              Number.isInteger(itemId) && func.push(reloadTab(itemId));
            }
          }
        }
        break;
      }
      case MENU_TAB_GROUP_UNGROUP: {
        if (tab && tabsTab) {
          const {parentNode} = tab;
          !tabsTab.pinned && parentNode.classList.contains(CLASS_TAB_GROUP) &&
            func.push(ungroupTabs(parentNode).then(restoreTabContainers));
        }
        break;
      }
      case MENU_TAB_NEW_WIN_MOVE:
        Number.isInteger(tabId) && func.push(createNewWindow({
          tabId,
          type: "normal",
        }));
        break;
      case MENU_TAB_PIN: {
        if (tabsTab) {
          const {pinned} = tabsTab;
          func.push(updateTab(tabId, {pinned: !pinned}));
        }
        break;
      }
      case MENU_TAB_RELOAD:
        Number.isInteger(tabId) && func.push(reloadTab(tabId));
        break;
      case MENU_TAB_SYNC:
        Number.isInteger(tabId) && func.push(syncTab(tabId));
        break;
      case MENU_TAB_TABS_CLOSE_END: {
        if (Number.isInteger(tabId)) {
          const index = tabsTab && tabsTab.index && tabsTab.index * 1;
          const arr = [];
          if (Number.isInteger(index)) {
            const items = document.querySelectorAll(
              `${TAB_QUERY}:not([data-tab-id="${tabId}"])`
            );
            for (const item of items) {
              const {dataset} = item;
              const itemId = dataset && dataset.tabId && dataset.tabId * 1;
              const itemTab = dataset && dataset.tab && JSON.parse(dataset.tab);
              const itemIndex = itemTab && itemTab.index && itemTab.index * 1;
              Number.isInteger(itemId) && Number.isInteger(itemIndex) &&
              itemIndex > index && arr.push(itemId);
            }
          }
          arr.length && func.push(removeTab(arr));
        }
        break;
      }
      case MENU_TAB_TABS_CLOSE_OTHER: {
        if (Number.isInteger(tabId)) {
          const items = document.querySelectorAll(
            `${TAB_QUERY}:not([data-tab-id="${tabId}"])`
          );
          const arr = [];
          for (const item of items) {
            const {dataset} = item;
            const itemId = dataset && dataset.tabId && dataset.tabId * 1;
            Number.isInteger(itemId) && arr.push(itemId);
          }
          arr.length && func.push(removeTab(arr));
        }
        break;
      }
      case MENU_THEME_DARK:
        func.push(setTheme([THEME_DARK]));
        break;
      case MENU_THEME_DEFAULT:
        func.push(setTheme([THEME_DEFAULT]));
        break;
      case MENU_THEME_LIGHT:
        func.push(setTheme([THEME_LIGHT]));
        break;
      default:
        throw new Error(`No handler found for ${id}.`);
    }
    return Promise.all(func);
  };

  /* context menu items */
  const menuItems = {
    sidebarTabs: {
      id: MENU,
      title: i18n.getMessage("extensionShortName"),
      contexts: ["page"],
      type: "normal",
      enabled: false,
      subItems: {
        /* tab */
        [TAB]: {
          id: MENU_TAB,
          title: i18n.getMessage(`${TAB}_label`),
          contexts: [CLASS_TAB, CLASS_TAB_GROUP],
          type: "normal",
          enabled: false,
          subItems: {
            [TAB_RELOAD]: {
              id: MENU_TAB_RELOAD,
              title: i18n.getMessage(TAB_RELOAD),
              contexts: [CLASS_TAB, CLASS_TAB_GROUP],
              type: "normal",
              enabled: false,
              onclick: true,
            },
            [AUDIO_MUTE]: {
              id: MENU_TAB_AUDIO,
              title: i18n.getMessage(AUDIO_MUTE),
              contexts: [CLASS_TAB, CLASS_TAB_GROUP],
              type: "normal",
              enabled: false,
              onclick: true,
              toggleTitle: i18n.getMessage(AUDIO_MUTE_UNMUTE),
            },
            [TAB_PIN]: {
              id: MENU_TAB_PIN,
              title: i18n.getMessage(TAB_PIN),
              contexts: [CLASS_TAB, CLASS_TAB_GROUP],
              type: "normal",
              enabled: false,
              onclick: true,
              toggleTitle: i18n.getMessage(TAB_PIN_UNPIN),
            },
            [TAB_DUPE]: {
              id: MENU_TAB_DUPE,
              title: i18n.getMessage(TAB_DUPE),
              contexts: [CLASS_TAB, CLASS_TAB_GROUP],
              type: "normal",
              enabled: false,
              onclick: true,
            },
            [NEW_WIN_MOVE]: {
              id: MENU_TAB_NEW_WIN_MOVE,
              title: i18n.getMessage(NEW_WIN_MOVE),
              contexts: [CLASS_TAB, CLASS_TAB_GROUP],
              type: "normal",
              enabled: false,
              onclick: true,
            },
            [TAB_SYNC]: {
              id: MENU_TAB_SYNC,
              title: i18n.getMessage(TAB_SYNC),
              contexts: [CLASS_TAB, CLASS_TAB_GROUP],
              type: "normal",
              enabled: false,
              onclick: true,
            },
            [TABS_CLOSE_END]: {
              id: MENU_TAB_TABS_CLOSE_END,
              title: i18n.getMessage(TABS_CLOSE_END),
              contexts: [CLASS_TAB, CLASS_TAB_GROUP],
              type: "normal",
              enabled: false,
              onclick: true,
            },
            [TABS_CLOSE_OTHER]: {
              id: MENU_TAB_TABS_CLOSE_OTHER,
              title: i18n.getMessage(TABS_CLOSE_OTHER),
              contexts: [CLASS_TAB, CLASS_TAB_GROUP],
              type: "normal",
              enabled: false,
              onclick: true,
            },
            [TAB_CLOSE]: {
              id: MENU_TAB_CLOSE,
              title: i18n.getMessage(TAB_CLOSE),
              contexts: [CLASS_TAB, CLASS_TAB_GROUP],
              type: "normal",
              enabled: false,
              onclick: true,
            },
          },
        },
        /* tab group */
        [TAB_GROUP]: {
          id: MENU_TAB_GROUP,
          title: i18n.getMessage(`${TAB_GROUP}_label`),
          contexts: [CLASS_TAB_GROUP],
          type: "normal",
          enabled: false,
          subItems: {
            [TAB_GROUP_RELOAD]: {
              id: MENU_TAB_GROUP_RELOAD,
              title: i18n.getMessage(TAB_GROUP_RELOAD),
              contexts: [CLASS_TAB_GROUP],
              type: "normal",
              enabled: false,
              onclick: true,
            },
            [TAB_GROUP_COLLAPSE]: {
              id: MENU_TAB_GROUP_COLLAPSE,
              title: i18n.getMessage(TAB_GROUP_COLLAPSE),
              contexts: [CLASS_TAB_GROUP],
              type: "normal",
              enabled: false,
              onclick: true,
              toggleTitle: i18n.getMessage(TAB_GROUP_EXPAND),
            },
            [TAB_GROUP_CLOSE]: {
              id: MENU_TAB_GROUP_CLOSE,
              title: i18n.getMessage(TAB_GROUP_CLOSE),
              contexts: [CLASS_TAB_GROUP],
              type: "normal",
              enabled: false,
              onclick: true,
            },
            [TAB_GROUP_DETACH]: {
              id: MENU_TAB_GROUP_DETACH,
              title: i18n.getMessage(TAB_GROUP_DETACH),
              contexts: [CLASS_TAB_GROUP],
              type: "normal",
              enabled: false,
              onclick: true,
            },
            [TAB_GROUP_UNGROUP]: {
              id: MENU_TAB_GROUP_UNGROUP,
              title: i18n.getMessage(TAB_GROUP_UNGROUP),
              contexts: [CLASS_TAB_GROUP],
              type: "normal",
              enabled: false,
              onclick: true,
            },
          },
        },
        /* all tabs */
        [TABS_RELOAD_ALL]: {
          id: MENU_TABS_RELOAD_ALL,
          title: i18n.getMessage(TABS_RELOAD_ALL),
          contexts: ["page"],
          type: "normal",
          enabled: true,
          onclick: true,
        },
        [TABS_BOOKMARK_ALL]: {
          id: MENU_TABS_BOOKMARK_ALL,
          title: i18n.getMessage(TABS_BOOKMARK_ALL),
          contexts: ["page"],
          type: "normal",
          enabled: false,
          onclick: true,
        },
        [TAB_CLOSE_UNDO]: {
          id: MENU_TAB_CLOSE_UNDO,
          title: i18n.getMessage(TAB_CLOSE_UNDO),
          contexts: ["page"],
          type: "normal",
          enabled: false,
          onclick: true,
        },
        /* sidebar */
        [THEME_SELECT]: {
          id: MENU_THEME_SELECT,
          title: i18n.getMessage(THEME_SELECT),
          contexts: ["page"],
          type: "normal",
          enabled: true,
          subItems: {
            [THEME_DEFAULT]: {
              id: MENU_THEME_DEFAULT,
              title: i18n.getMessage(THEME_DEFAULT),
              contexts: ["page"],
              type: "normal",
              enabled: true,
              onclick: true,
            },
            [THEME_LIGHT]: {
              id: MENU_THEME_LIGHT,
              title: i18n.getMessage(THEME_LIGHT),
              contexts: ["page"],
              type: "normal",
              enabled: true,
              onclick: true,
            },
            [THEME_DARK]: {
              id: MENU_THEME_DARK,
              title: i18n.getMessage(THEME_DARK),
              contexts: ["page"],
              type: "normal",
              enabled: true,
              onclick: true,
            },
          },
        },
        [SIDEBAR_INIT]: {
          id: MENU_SIDEBAR_INIT,
          title: i18n.getMessage(SIDEBAR_INIT),
          contexts: ["page"],
          type: "normal",
          enabled: true,
          onclick: true,
        },
      },
    },
  };

  /**
   * add menuitem click listener
   * @param {Object} elm - element
   * @returns {void}
   */
  const addContextMenuClickListener = async elm => {
    if (elm && elm.nodeType === Node.ELEMENT_NODE) {
      elm.addEventListener("click", evt =>
        handleClickedContextMenu(evt).catch(throwErr)
      );
    }
  };

  /**
   * create context menu item
   * @param {string} id - menu item ID
   * @param {Object} data - context data
   * @returns {Promise.<Array>} - results of each handler
   */
  const createMenuItem = async (id, data = {}) => {
    const {enabled, onclick, title, type} = data;
    const func = [];
    if (isString(id) && type === "normal") {
      const elm = document.getElementById(id);
      if (elm) {
        elm.label = title;
        if (elm.localName === "menuitem") {
          elm.disabled = !enabled && true || false;
          onclick && func.push(addContextMenuClickListener(elm));
        }
      }
    }
    return Promise.all(func);
  };

  /**
   * create context menu items
   * @param {Object} menu - menu
   * @returns {Promise.<Array>} - results of each handler
   */
  const createContextMenu = async (menu = menuItems) => {
    const func = [];
    const items = Object.keys(menu);
    for (const item of items) {
      const {enabled, id, onclick, subItems, title, type} = menu[item];
      const itemData = {enabled, onclick, title, type};
      func.push(createMenuItem(id, itemData));
      if (subItems) {
        func.push(createContextMenu(subItems));
      }
    }
    return Promise.all(func);
  };

  /**
   * update context menu
   * @param {string} id - menu item ID
   * @param {Object} data - update items data
   * @returns {void}
   */
  const updateContextMenu = async (id, data = {}) => {
    if (isString(id)) {
      const elm = document.getElementById(id);
      if (elm) {
        const {enabled, title} = data;
        title && (elm.label = title);
        if (elm.localName === "menuitem") {
          elm.disabled = !enabled && true || false;
        }
      }
    }
  };

  /**
   * toggle context menu class
   * @param {string} name - class name
   * @param {boolean} bool - add class
   * @returns {void}
   */
  const toggleContextMenuClass = async (name, bool = false) => {
    if (isString(name)) {
      const elm = document.getElementById(MENU);
      if (elm) {
        const {classList} = elm;
        if (bool) {
          classList.add(name);
        } else {
          classList.remove(name);
        }
      }
    }
  };

  /**
   * set context
   * @param {!Object} evt - event
   * @returns {Promise.<Array>} - results of each handler
   */
  const setContext = async evt => {
    const {button, key, shiftKey, target} = evt;
    const func = [];
    if (shiftKey && key === "F10" || key === "ContextMenu" ||
        button === MOUSE_BUTTON_RIGHT) {
      const tab = await getSidebarTab(target);
      const tabMenu = menuItems.sidebarTabs.subItems[TAB];
      const tabKeys = [
        TAB_RELOAD,
        AUDIO_MUTE,
        TAB_PIN,
        NEW_WIN_MOVE,
        TAB_SYNC,
        TAB_DUPE,
        TAB_CLOSE,
        TABS_CLOSE_END,
        TABS_CLOSE_OTHER,
      ];
      const tabGroupMenu = menuItems.sidebarTabs.subItems[TAB_GROUP];
      const tabGroupKeys = [
        TAB_GROUP_RELOAD,
        TAB_GROUP_COLLAPSE,
        TAB_GROUP_CLOSE,
        TAB_GROUP_DETACH,
        TAB_GROUP_UNGROUP,
      ];
      const allTabsKeys = [
        TABS_BOOKMARK_ALL,
        TAB_CLOSE_UNDO,
      ];
      if (tab) {
        const {parentNode} = tab;
        const {classList: parentClass} = parentNode;
        const tabId = tab.dataset && tab.dataset.tabId;
        const tabsTab = tab.dataset && JSON.parse(tab.dataset.tab);
        sidebar.context = tab;
        func.push(
          updateContextMenu(tabMenu.id, {
            enabled: true,
            title: tabMenu.title,
          }),
          toggleContextMenuClass(CLASS_TAB, true),
        );
        for (const itemKey of tabKeys) {
          const item = tabMenu.subItems[itemKey];
          const {id, title, toggleTitle} = item;
          const data = {};
          switch (itemKey) {
            case AUDIO_MUTE: {
              const obj = tab.querySelector(`.${CLASS_TAB_AUDIO_ICON}`);
              data.enabled = true;
              if (obj && obj.alt) {
                data.title = obj.alt;
              } else {
                data.title = title;
              }
              break;
            }
            case TAB_DUPE:
              if (tabsTab.pinned) {
                data.enabled = false;
              } else {
                data.enabled = true;
              }
              data.title = title;
              break;
            case TABS_CLOSE_END: {
              if (tabsTab.pinned) {
                data.enabled = false;
              } else {
                const index = getSidebarTabIndex(tab);
                const obj = document.querySelectorAll(TAB_QUERY);
                if (obj.length - 1 > index) {
                  data.enabled = true;
                } else {
                  data.enabled = false;
                }
              }
              data.title = title;
              break;
            }
            case TABS_CLOSE_OTHER: {
              if (tabsTab.pinned) {
                data.enabled = false;
              } else {
                const obj = tabId && document.querySelectorAll(
                  `${TAB_QUERY}:not([data-tab-id="${tabId}"])`
                );
                if (obj && obj.length) {
                  data.enabled = true;
                } else {
                  data.enabled = false;
                }
              }
              data.title = title;
              break;
            }
            case TAB_PIN:
              data.enabled = true;
              if (parentClass.contains(PINNED)) {
                data.title = toggleTitle;
              } else {
                data.title = title;
              }
              break;
            default:
              data.enabled = true;
              data.title = title;
          }
          func.push(updateContextMenu(id, data));
        }
        if (parentClass.contains(CLASS_TAB_GROUP)) {
          func.push(
            updateContextMenu(tabGroupMenu.id, {
              enabled: true,
              title: tabGroupMenu.title,
            }),
            toggleContextMenuClass(CLASS_TAB_GROUP, true),
          );
        } else {
          func.push(
            updateContextMenu(tabGroupMenu.id, {
              enabled: false,
              title: tabGroupMenu.title,
            }),
            toggleContextMenuClass(CLASS_TAB_GROUP, false),
          );
        }
        for (const itemKey of tabGroupKeys) {
          const item = tabGroupMenu.subItems[itemKey];
          const {id, title} = item;
          const data = {};
          switch (itemKey) {
            case TAB_GROUP_CLOSE:
            case TAB_GROUP_DETACH:
            case TAB_GROUP_UNGROUP:
              if (!tabsTab.pinned && parentClass.contains(CLASS_TAB_GROUP)) {
                data.enabled = true;
              } else {
                data.enabled = false;
              }
              data.title = title;
              break;
            case TAB_GROUP_COLLAPSE: {
              const obj = tab.querySelector(`.${CLASS_TAB_TOGGLE_ICON}`);
              if (parentClass.contains(CLASS_TAB_GROUP) && obj && obj.alt) {
                data.enabled = true;
                data.title = obj.alt;
              } else {
                data.enabled = false;
                data.title = title;
              }
              break;
            }
            default:
              if (parentClass.contains(CLASS_TAB_GROUP)) {
                data.enabled = true;
              } else {
                data.enabled = false;
              }
              data.title = title;
          }
          func.push(updateContextMenu(id, data));
        }
      } else {
        sidebar.context = target;
        func.push(
          updateContextMenu(tabMenu.id, {
            enabled: false,
            title: tabMenu.title,
          }),
          toggleContextMenuClass(CLASS_TAB, false),
          toggleContextMenuClass(CLASS_TAB_GROUP, false),
        );
        for (const itemKey of tabKeys) {
          const item = tabMenu.subItems[itemKey];
          const {id, title} = item;
          const enabled = false;
          func.push(updateContextMenu(id, {enabled, title}));
        }
        func.push(updateContextMenu(tabGroupMenu.id, {
          enabled: false,
          title: tabGroupMenu.title,
        }));
        for (const itemKey of tabGroupKeys) {
          const item = tabGroupMenu.subItems[itemKey];
          const {id, title} = item;
          const enabled = false;
          func.push(updateContextMenu(id, {enabled, title}));
        }
      }
      for (const itemKey of allTabsKeys) {
        const item = menuItems.sidebarTabs.subItems[itemKey];
        const {id, title} = item;
        const data = {};
        switch (itemKey) {
          case TABS_BOOKMARK_ALL: {
            const items = document.querySelectorAll(
              `${TAB_QUERY}:not(.${PINNED})`
            );
            if (items.length > 1) {
              data.enabled = true;
            } else {
              data.enabled = false;
            }
            break;
          }
          case TAB_CLOSE_UNDO: {
            const {lastClosedTab} = sidebar;
            if (lastClosedTab) {
              data.enabled = true;
            } else {
              data.enabled = false;
            }
            break;
          }
          default:
            data.enabled = true;
        }
        data.title = title;
        func.push(updateContextMenu(id, data));
      }
    }
    return Promise.all(func);
  };

  /* runtime */
  /**
   * handle runtime message
   * @param {Object} msg - message
   * @param {Object} sender - sender
   * @returns {Promise.<Array>} - results of each handler
   */
  const handleMsg = async (msg, sender) => {
    const items = Object.keys(msg);
    const func = [];
    for (const item of items) {
      const obj = msg[item];
      switch (item) {
        case TAB_OBSERVE: {
          if (obj) {
            const {tab} = sender;
            const {id} = tab;
            Number.isInteger(id) && func.push(observeTab(id));
          }
          break;
        }
        default:
      }
    }
    return Promise.all(func);
  };

  /* listeners */
  runtime.onMessage.addListener((msg, sender) => {
    handleMsg(msg, sender).catch(throwErr);
  });

  tabs.onActivated.addListener(info =>
    handleActivatedTab(info).catch(throwErr)
  );

  tabs.onAttached.addListener((tabId, info) =>
    handleAttachedTab(tabId, info).then(restoreTabContainers).catch(throwErr)
  );

  tabs.onCreated.addListener(tabsTab =>
    handleCreatedTab(tabsTab).then(restoreTabContainers).then(getLastClosedTab)
      .catch(throwErr)
  );

  tabs.onDetached.addListener((tabId, info) =>
    handleDetachedTab(tabId, info).then(restoreTabContainers)
      .then(expandActivatedCollapsedTab).catch(throwErr)
  );

  tabs.onMoved.addListener((tabId, info) =>
    handleMovedTab(tabId, info).then(restoreTabContainers).catch(throwErr)
  );

  tabs.onRemoved.addListener((tabId, info) =>
    handleRemovedTab(tabId, info).then(restoreTabContainers)
      .then(getLastClosedTab).then(expandActivatedCollapsedTab).catch(throwErr)
  );

  tabs.onUpdated.addListener((tabId, info, tabsTab) =>
    handleUpdatedTab(tabId, info, tabsTab).catch(throwErr)
  );

  /* start up */
  /**
   * set stored tab group data
   * @returns {void}
   */
  const restoreTabGroup = async () => {
    if (!sidebar.incognito) {
      const {tab: storedTab} = await storage.local.get(TAB);
      if (storedTab) {
        const {tab, group: groups} = storedTab;
        const items = document.querySelectorAll(TAB_QUERY);
        if (items.length === tab.length) {
          const l = items.length;
          let i = 0;
          let bool;
          while (i < l) {
            const item = items[i];
            const tabsTab = item.dataset && item.dataset.tab &&
                              JSON.parse(item.dataset.tab);
            const {url} = tabsTab;
            bool = isUrlEqual(url, tab[i]);
            if (!bool) {
              break;
            }
            i++;
          }
          if (bool) {
            for (const group of groups) {
              const [target, ...indexes] = group;
              const container = items[target].parentNode;
              container.classList.add(CLASS_TAB_GROUP);
              for (const index of indexes) {
                container.appendChild(items[index]);
              }
            }
          }
        }
      }
    }
  };

  /**
   * emulate tabs to sidebar
   * @returns {Promise.<Array>} - results of each handler
   */
  const emulateTabs = async () => {
    const items = await queryTab({windowId: WINDOW_ID_CURRENT});
    const func = [];
    for (const item of items) {
      func.push(handleCreatedTab(item));
    }
    return Promise.all(func);
  };

  /**
   * apply CSS
   * @returns {void}
   */
  const applyCss = async () => {
    const head = document.querySelector("head");
    const link = document.createElement("link");
    const items = document.querySelectorAll("section[hidden]");
    link.rel = "stylesheet";
    link.href = URL_CSS;
    head.appendChild(link);
    for (const item of items) {
      item.removeAttribute("hidden");
    }
  };

  document.addEventListener("DOMContentLoaded", () => Promise.all([
    addNewTabClickListener(),
    createContextMenu(),
    getTheme().then(setTheme).then(applyCss),
    setSidebar(),
  ]).then(emulateTabs).then(restoreTabGroup).then(restoreTabContainers)
    .then(getLastClosedTab).catch(throwErr));

  window.addEventListener("keydown", evt => setContext(evt).catch(throwErr),
                          true);

  window.addEventListener("mousedown", evt => setContext(evt).catch(throwErr),
                          true);
}
