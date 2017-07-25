/* sidebar.js */
"use strict";
{
  /* api */
  const {
    bookmarks, contextualIdentities, i18n, management, sessions, storage, tabs,
    windows,
  } = browser;

  /* constants */
  const ACTIVE = "active";
  const ATTR_MENU = "menu";
  const ATTR_TAB = "tab";
  const ATTR_TAB_AUDIO = "tab-audio";
  const ATTR_TAB_AUDIO_ICON = "tab-audio-icon";
  const ATTR_TAB_CLOSE = "tab-close";
  const ATTR_TAB_CLOSE_ICON = "tab-close-icon";
  const ATTR_TAB_COLLAPSED = "tab-collapsed";
  const ATTR_TAB_CONTAINER = "tab-container";
  const ATTR_TAB_CONTAINER_TMPL = "tab-container-template";
  const ATTR_TAB_CONTENT = "tab-content";
  const ATTR_TAB_CONTEXT = "tab-context";
  const ATTR_TAB_GROUP = "tab-group";
  const ATTR_TAB_ICON = "tab-icon";
  const ATTR_TAB_TITLE = "tab-title";
  const ATTR_TAB_TMPL = "tab-template";
  const ATTR_TAB_TOGGLE_ICON = "tab-toggle-icon";
  const ATTR_THEME_DARK = "dark-theme";
  const ATTR_THEME_LIGHT = "light-theme";
  const AUDIBLE = "audible";
  const AUDIO_MUTE = "muteAudio";
  const AUDIO_MUTE_UNMUTE = "unmuteAudio";
  const CONNECTING = "connecting";
  const MENU = "sidebar-tabs-menu";
  const MENU_SIDEBAR_INIT = "sidebar-tabs-menu-sidebar-init";
  const MENU_TAB = "sidebar-tabs-menu-tab";
  const MENU_TABS_BOOKMARK_ALL = "sidebar-tabs-menu-tabs-bookmark-all";
  const MENU_TABS_RELOAD_ALL = "sidebar-tabs-menu-tabs-reload-all";
  const MENU_TAB_AUDIO = "sidebar-tabs-menu-tab-audio";
  const MENU_TAB_CLOSE = "sidebar-tabs-menu-tab-close";
  const MENU_TAB_CLOSE_UNDO = "sidebar-tabs-menu-tab-close-undo";
  const MENU_TAB_GROUP = "sidebar-tabs-menu-tab-group";
  const MENU_TAB_GROUP_COLLAPSE = "sidebar-tabs-menu-tab-group-collapse";
  const MENU_TAB_GROUP_RELOAD = "sidebar-tabs-menu-tab-group-reload";
  const MENU_TAB_GROUP_UNGROUP = "sidebar-tabs-menu-tab-group-ungroup";
  const MENU_TAB_NEW_WIN_MOVE = "sidebar-tabs-menu-tab-new-win-move";
  const MENU_TAB_PIN = "sidebar-tabs-menu-tab-pin";
  const MENU_TAB_RELOAD = "sidebar-tabs-menu-tab-reload";
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
  const TAB_GROUP = "groupTabs";
  const TAB_GROUP_COLLAPSE = "collapseTabs";
  const TAB_GROUP_EXPAND = "expandTabs";
  const TAB_GROUP_RELOAD = "reloadGroupTabs";
  const TAB_GROUP_UNGROUP = "ungroupTabs";
  const TAB_PIN = "pinTab";
  const TAB_PIN_UNPIN = "unpinTab";
  const TAB_RELOAD = "reloadTab";
  const THEME = "theme";
  const THEME_DARK = "darkTheme";
  const THEME_DARK_ID = "firefox-compact-dark@mozilla.org@personas.mozilla.org";
  const THEME_DEFAULT = "defaultTheme";
  const THEME_LIGHT = "lightTheme";
  const THEME_LIGHT_ID =
    "firefox-compact-light@mozilla.org@personas.mozilla.org";
  const THEME_SELECT = "selectTheme";
  const TYPE_FROM = 8;
  const TYPE_TO = -1;
  const URL_AUDIO_MUTED = "../shared/tab-audio-muted.svg";
  const URL_AUDIO_PLAYING = "../shared/tab-audio-playing.svg";
  const URL_CONNECTING_SPINNER = "../img/spinner.svg#connecting";
  const URL_DEFAULT_FAVICON = "../shared/defaultFavicon.svg";
  const URL_LOADING_SPINNER = "../img/spinner.svg";
  const TAB_QUERY = `.${ATTR_TAB}:not(.${ATTR_MENU}):not(.${NEW_TAB})`;

  /**
   * log error
   * @param {!Object} e - Error
   * @returns {boolean} - false
   */
  const logError = e => {
    console.error(e);
    return false;
  };

  /**
   * log warn
   * @param {*} msg - message
   * @returns {boolean} - false
   */
  const logWarn = msg => {
    console.warn(msg);
    return false;
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
    const win = await windows.getCurrent({
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
    } else if (management) {
      const items = await management.getAll().then(arr => arr.filter(info =>
        info.type && info.type === "theme" && info.enabled && info
      ));
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
          classList.remove(ATTR_THEME_LIGHT);
          classList.add(ATTR_THEME_DARK);
          break;
        case THEME_DEFAULT:
          classList.remove(ATTR_THEME_DARK);
          classList.remove(ATTR_THEME_LIGHT);
          break;
        case THEME_LIGHT:
          classList.remove(ATTR_THEME_DARK);
          classList.add(ATTR_THEME_LIGHT);
          break;
        default:
      }
    }
    await storage.local.set({
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

  /* handle real tabs */
  /**
   * create tab
   * @param {Object} opt - options
   * @returns {AsyncFunction} - tabs.create()
   */
  const createTab = async (opt = {}) => {
    opt = isObjectNotEmpty(opt) && opt || null;
    return tabs.create(opt);
  };

  /**
   * update tab
   * @param {number} tabId - tab ID
   * @param {Object} opt - options
   * @returns {AsyncFunction} - tabs.update()
   */
  const updateTab = async (tabId, opt = {}) => {
    if (!Number.isInteger(tabId)) {
      throw new TypeError(`Expected Number but got ${getType(tabId)}.`);
    }
    opt = isObjectNotEmpty(opt) && opt || null;
    return tabs.update(tabId, opt);
  };

  /**
   * move tab
   * @param {number} tabId - tab ID
   * @param {Object} opt - options
   * @returns {AsyncFunction} - tabs.move();
   */
  const moveTab = async (tabId, opt = {}) => {
    if (!Number.isInteger(tabId)) {
      throw new TypeError(`Expected Number but got ${getType(tabId)}.`);
    }
    opt = isObjectNotEmpty(opt) && opt || null;
    return tabs.move(tabId, opt);
  };

  /**
   * reload tab
   * @param {number} tabId - tab ID
   * @param {Object} opt - options
   * @returns {AsyncFunction} - tabs.reload()
   */
  const reloadTab = async (tabId, opt = {}) => {
    if (!Number.isInteger(tabId)) {
      throw new TypeError(`Expected Number but got ${getType(tabId)}.`);
    }
    opt = isObjectNotEmpty(opt) && opt || null;
    return tabs.reload(tabId, opt);
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
  const bookmarkTab = async (opt = {}) => {
    opt = isObjectNotEmpty(opt) && opt || null;
    return bookmarks.create(opt);
  };

  /**
   * create new window
   * @param {Object} opt - options
   * @returns {AsyncFunction} - windows.create();
   */
  const createNewWindow = async (opt = {}) => {
    opt = isObjectNotEmpty(opt) && opt || null;
    return windows.create(opt);
  };

  /**
   * get last closed tab
   * @returns {Object} - tabs.Tab
   */
  const getLastClosedTab = async () => {
    const session = await sessions.getRecentlyClosed();
    let tab;
    if (Array.isArray(session) && session.length) {
      const {windowId} = sidebar;
      for (const item of session) {
        const {tab: itemTab} = item;
        if (itemTab) {
          const {windowId: itemWindowId} = itemTab;
          if (itemWindowId === windowId) {
            tab = itemTab;
            sidebar.lastClosedTab = tab;
            break;
          }
        }
      }
    }
    return tab || null;
  };

  /**
   * restore tab
   * @param {string} sessionId - session ID
   * @returns {AsyncFunction} - sessions.restore()
   */
  const restoreClosedTab = async sessionId => {
    if (!isString(sessionId)) {
      throw new TypeError(`Expected String but got ${getType(sessionId)}.`);
    }
    return sessions.restore(sessionId);
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
  const createNewTab = async () => createTab({windowId: sidebar.windowId});

  /**
   * add new tab click listener
   * @returns {void}
   */
  const addNewTabClickListener = async () => {
    const newTab = document.getElementById(NEW_TAB);
    newTab.addEventListener("click", evt => createNewTab(evt).catch(logError));
  };

  /**
   * get sidebar tab container from parent node
   * @param {Object} node - node
   * @returns {Object} - sidebar tab container
   */
  const getSidebarTabContainer = node => {
    const root = document.documentElement;
    let tab;
    while (node && node.parentNode && node.parentNode !== root) {
      const {classList, parentNode} = node;
      if (classList.contains(ATTR_TAB_CONTAINER)) {
        tab = node;
        break;
      }
      node = parentNode;
    }
    return tab || null;
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
   * activate tab
   * @param {!Object} evt - event
   * @returns {?AsyncFunction} - tabs.update()
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
      elm.addEventListener("click", evt => activateTab(evt).catch(logError));
    }
  };

  /* sidebar tab content */
  /**
   * tab icon fallback
   * @param {!Object} evt - event
   * @returns {Function} - logError()
   */
  const tabIconFallback = evt => {
    const {target} = evt;
    target.hasOwnProperty("src") && (target.src = URL_DEFAULT_FAVICON);
    return logError(evt);
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
   * set tab icon
   * @param {Object} elm - img element;
   * @param {Object} info - tab info
   * @returns {void}
   */
  const setTabIcon = async (elm, info) => {
    if (elm && elm.nodeType === Node.ELEMENT_NODE) {
      const {status, title, favIconUrl} = info;
      const connectText = i18n.getMessage(CONNECTING);
      if (status === "loading") {
        if (title === connectText) {
          elm.src = URL_CONNECTING_SPINNER;
        } else {
          elm.src = URL_LOADING_SPINNER;
        }
      } else if (status === "complete") {
        if (favIconUrl) {
          elm.src = favIconUrl;
        } else {
          elm.src = URL_DEFAULT_FAVICON;
        }
      } else {
        elm.src = URL_DEFAULT_FAVICON;
      }
    }
  };

  /* sidebar tab audio */
  /**
   * toggle audio state
   * @param {!Object} evt - event
   * @returns {?AsyncFunction} - tabs.update()
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
      elm.addEventListener("click", evt => toggleAudio(evt).catch(logError));
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
      elm.addEventListener("click", evt => closeTab(evt).catch(logError));
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
    if (container) {
      const {firstElementChild: tab} = container;
      const {firstElementChild: tabContext} = tab;
      const {firstElementChild: toggleIcon} = tabContext;
      if (container.classList.contains(ATTR_TAB_GROUP) &&
          tab && tab.style.display !== "none") {
        container.classList.toggle(ATTR_TAB_COLLAPSED);
        if (container.classList.contains(ATTR_TAB_COLLAPSED)) {
          tabContext.title = i18n.getMessage(`${TAB_GROUP_EXPAND}_tooltip`);
          toggleIcon.alt = i18n.getMessage(`${TAB_GROUP_EXPAND}`);
        } else {
          tabContext.title = i18n.getMessage(`${TAB_GROUP_COLLAPSE}_tooltip`);
          toggleIcon.alt = i18n.getMessage(`${TAB_GROUP_COLLAPSE}`);
        }
        func = activateTab({target: tab});
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
      elm.addEventListener("click", evt => toggleTabCollapsed(evt));
    }
  };

  /**
   * ungroup tabs
   * @param {Object} node - tab group container
   * @returns {void}
   */
  const ungroupTabs = async (node = {}) => {
    const {id, children, classList, nodeType, parentNode} = node;
    if (nodeType === Node.ELEMENT_NODE && id !== PINNED &&
        classList.contains(ATTR_TAB_GROUP) &&
        children instanceof HTMLCollection) {
      for (const child of children) {
        const container = getTemplate(ATTR_TAB_CONTAINER_TMPL);
        container.appendChild(child);
        parentNode.insertBefore(container, node);
      }
    }
  };

  /* DnD */
  /**
   * handle drop
   * @param {!Object} evt - event
   * @returns {?AsyncFunction} - 
   */
  const handleDrop = evt => {
    const {dataTransfer, ctrlKey, target} = evt;
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
          if (dataset) {
            const {tabId} = dataset;
            if (tabId) {
              dropTarget = node;
              break;
            }
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
          const index = getSidebarTabIndex(dropTarget);
          if (dropParentNextElement === tabParent && dropParentChild === 1 &&
              ctrlKey) {
            dropParent.appendChild(tab);
            dropParent.classList.add(ATTR_TAB_GROUP);
            switch (tabParent.childElementCount) {
              case 0:
                tabParent.parentNode.removeChild(tabParent);
                break;
              case 1:
                tabParent.classList.remove(ATTR_TAB_GROUP);
                break;
              default:
            }
          } else if (Number.isInteger(index)) {
            tab.dataset.group = !!ctrlKey;
            moveTab(id * 1, {
              index: index + 1,
              windowId: sidebar.windowId,
            });
          }
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
    const items =
      document.querySelectorAll(`.${ATTR_TAB_CONTAINER}:not(#${NEW_TAB})`);
    for (const item of items) {
      const {childElementCount, classList, id, parentNode} = item;
      switch (childElementCount) {
        case 0:
          id !== PINNED && parentNode.removeChild(item);
          break;
        case 1:
          classList.remove(ATTR_TAB_GROUP);
          break;
        default:
          classList.add(ATTR_TAB_GROUP);
      }
      id !== PINNED && func.push(addDropEventListener(item));
    }
    return Promise.all(func);
  };

  /* context menus */
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
        const items = document.querySelectorAll(
          `${TAB_QUERY}:not(.${PINNED})`
        );
        if (items && items.length > 1) {
          for (const item of items) {
            const itemTab = item.dataset && item.dataset.tab &&
                            JSON.parse(item.dataset.tab);
            const {title, url} = itemTab;
            func.push(bookmarkTab({title, url}));
          }
        }
        break;
      }
      case MENU_TABS_RELOAD_ALL: {
        const items = document.querySelectorAll(TAB_QUERY);
        if (items && items.length) {
          for (const item of items) {
            const itemId = item && item.dataset && item.dataset.tabId * 1;
            Number.isInteger(itemId) && func.push(reloadTab(itemId));
          }
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
      case MENU_TAB_GROUP_COLLAPSE:
        tab && tab.parentNode.classList.contains(ATTR_TAB_GROUP) &&
          func.push(toggleTabCollapsed({target: tab}));
        break;
      case MENU_TAB_GROUP_RELOAD: {
        if (tab) {
          const {parentNode} = tab;
          if (parentNode.classList.contains(ATTR_TAB_GROUP)) {
            const items = parentNode.querySelectorAll(TAB_QUERY);
            if (items && items.length) {
              for (const item of items) {
                const itemId = item && item.dataset && item.dataset.tabId * 1;
                Number.isInteger(itemId) && func.push(reloadTab(itemId));
              }
            }
          }
        }
        break;
      }
      case MENU_TAB_GROUP_UNGROUP: {
        if (tab && tabsTab) {
          const {parentNode} = tab;
          !tabsTab.pinned && parentNode.classList.contains(ATTR_TAB_GROUP) &&
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
      case MENU_TAB_TABS_CLOSE_END: {
        if (Number.isInteger(tabId)) {
          const index = tabsTab && tabsTab.index && tabsTab.index * 1;
          const items = document.querySelectorAll(
            `${TAB_QUERY}:not([data-tab-id="${tabId}"])`
          );
          const arr = [];
          if (items && items.length && Number.isInteger(index)) {
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
        const items = Number.isInteger(tabId) && document.querySelectorAll(
          `${TAB_QUERY}:not([data-tab-id="${tabId}"])`
        );
        const arr = [];
        if (items && items.length) {
          for (const item of items) {
            const {dataset} = item;
            const itemId = dataset && dataset.tabId && dataset.tabId * 1;
            Number.isInteger(itemId) && arr.push(itemId);
          }
        }
        arr.length && func.push(removeTab(arr));
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
      default: {
        const msg = `No handler found for ${id}.`;
        func.push(logWarn(msg));
      }
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
          contexts: [ATTR_TAB, ATTR_TAB_GROUP],
          type: "normal",
          enabled: false,
          subItems: {
            [TAB_RELOAD]: {
              id: MENU_TAB_RELOAD,
              title: i18n.getMessage(TAB_RELOAD),
              contexts: [ATTR_TAB, ATTR_TAB_GROUP],
              type: "normal",
              enabled: false,
              onclick: true,
            },
            [AUDIO_MUTE]: {
              id: MENU_TAB_AUDIO,
              title: i18n.getMessage(AUDIO_MUTE),
              contexts: [ATTR_TAB, ATTR_TAB_GROUP],
              type: "normal",
              enabled: false,
              onclick: true,
              toggleTitle: i18n.getMessage(AUDIO_MUTE_UNMUTE),
            },
            [TAB_PIN]: {
              id: MENU_TAB_PIN,
              title: i18n.getMessage(TAB_PIN),
              contexts: [ATTR_TAB, ATTR_TAB_GROUP],
              type: "normal",
              enabled: false,
              onclick: true,
              toggleTitle: i18n.getMessage(TAB_PIN_UNPIN),
            },
            [NEW_WIN_MOVE]: {
              id: MENU_TAB_NEW_WIN_MOVE,
              title: i18n.getMessage(NEW_WIN_MOVE),
              contexts: [ATTR_TAB, ATTR_TAB_GROUP],
              type: "normal",
              enabled: false,
              onclick: true,
            },
            [TABS_CLOSE_END]: {
              id: MENU_TAB_TABS_CLOSE_END,
              title: i18n.getMessage(TABS_CLOSE_END),
              contexts: [ATTR_TAB, ATTR_TAB_GROUP],
              type: "normal",
              enabled: false,
              onclick: true,
            },
            [TABS_CLOSE_OTHER]: {
              id: MENU_TAB_TABS_CLOSE_OTHER,
              title: i18n.getMessage(TABS_CLOSE_OTHER),
              contexts: [ATTR_TAB, ATTR_TAB_GROUP],
              type: "normal",
              enabled: false,
              onclick: true,
            },
            [TAB_CLOSE]: {
              id: MENU_TAB_CLOSE,
              title: i18n.getMessage(TAB_CLOSE),
              contexts: [ATTR_TAB, ATTR_TAB_GROUP],
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
          contexts: [ATTR_TAB_GROUP],
          type: "normal",
          enabled: false,
          subItems: {
            [TAB_GROUP_RELOAD]: {
              id: MENU_TAB_GROUP_RELOAD,
              title: i18n.getMessage(TAB_GROUP_RELOAD),
              contexts: [ATTR_TAB_GROUP],
              type: "normal",
              enabled: false,
              onclick: true,
            },
            [TAB_GROUP_COLLAPSE]: {
              id: MENU_TAB_GROUP_COLLAPSE,
              title: i18n.getMessage(TAB_GROUP_COLLAPSE),
              contexts: [ATTR_TAB_GROUP],
              type: "normal",
              enabled: false,
              onclick: true,
              toggleTitle: i18n.getMessage(TAB_GROUP_EXPAND),
            },
            [TAB_GROUP_UNGROUP]: {
              id: MENU_TAB_GROUP_UNGROUP,
              title: i18n.getMessage(TAB_GROUP_UNGROUP),
              contexts: [ATTR_TAB_GROUP],
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
        handleClickedContextMenu(evt).catch(logError)
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
        TAB_RELOAD, AUDIO_MUTE, TAB_PIN, NEW_WIN_MOVE, TAB_CLOSE,
        TABS_CLOSE_END, TABS_CLOSE_OTHER,
      ];
      const tabGroupMenu = menuItems.sidebarTabs.subItems[TAB_GROUP];
      const tabGroupKeys = [
        TAB_GROUP_RELOAD,
        TAB_GROUP_COLLAPSE,
        TAB_GROUP_UNGROUP,
      ];
      const allTabsKeys = [TABS_BOOKMARK_ALL, TAB_CLOSE_UNDO];
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
          toggleContextMenuClass(ATTR_TAB, true),
        );
        for (const itemKey of tabKeys) {
          const item = tabMenu.subItems[itemKey];
          const {id, title, toggleTitle} = item;
          const data = {};
          switch (itemKey) {
            case AUDIO_MUTE: {
              const obj = tab.querySelector(`.${ATTR_TAB_AUDIO_ICON}`);
              data.enabled = true;
              if (obj && obj.alt) {
                data.title = obj.alt;
              } else {
                data.title = title;
              }
              break;
            }
            case TABS_CLOSE_END: {
              if (tabsTab.pinned) {
                data.enabled = false;
              } else {
                const index = getSidebarTabIndex(tab);
                const obj = document.querySelectorAll(TAB_QUERY);
                if (obj && obj.length - 1 > index) {
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
        if (parentClass.contains(ATTR_TAB_GROUP)) {
          func.push(
            updateContextMenu(tabGroupMenu.id, {
              enabled: true,
              title: tabGroupMenu.title,
            }),
            toggleContextMenuClass(ATTR_TAB_GROUP, true),
          );
        } else {
          func.push(
            updateContextMenu(tabGroupMenu.id, {
              enabled: false,
              title: tabGroupMenu.title,
            }),
            toggleContextMenuClass(ATTR_TAB_GROUP, false),
          );
        }
        for (const itemKey of tabGroupKeys) {
          const item = tabGroupMenu.subItems[itemKey];
          const {id, title} = item;
          const data = {};
          switch (itemKey) {
            case TAB_GROUP_COLLAPSE: {
              const obj = tab.querySelector(`.${ATTR_TAB_TOGGLE_ICON}`);
              if (parentClass.contains(ATTR_TAB_GROUP) && obj && obj.alt) {
                data.enabled = true;
                data.title = obj.alt;
              } else {
                data.enabled = false;
                data.title = title;
              }
              break;
            }
            case TAB_GROUP_UNGROUP:
              if (!tabsTab.pinned && parentClass.contains(ATTR_TAB_GROUP)) {
                data.enabled = true;
              } else {
                data.enabled = false;
              }
              data.title = title;
              break;
            default:
              if (parentClass.contains(ATTR_TAB_GROUP)) {
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
          toggleContextMenuClass(ATTR_TAB, false),
          toggleContextMenuClass(ATTR_TAB_GROUP, false),
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
            if (items && items.length > 1) {
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

  /* tabs event handlers */
  /**
   * handle activated tab
   * @param {!Object} info - activated info
   * @returns {void}
   */
  const handleActivatedTab = async info => {
    const {tabId, windowId} = info;
    if (windowId === sidebar.windowId && tabId !== tabs.TAB_ID_NONE) {
      const newActiveTab = document.querySelector(`[data-tab-id="${tabId}"]`);
      const oldActiveTab = document.querySelector(`.${ATTR_TAB}.${ACTIVE}`);
      if (newActiveTab && oldActiveTab && newActiveTab !== oldActiveTab) {
        const {
          classList: newClassList, parentNode: {classList: newParentClassList},
        } = newActiveTab;
        const {
          classList: oldClassList, parentNode: {classList: oldParentClassList},
        } = oldActiveTab;
        oldClassList.remove(ACTIVE);
        oldParentClassList.remove(ACTIVE);
        newParentClassList.add(ACTIVE);
        newClassList.add(ACTIVE);
      }
    }
  };

  /**
   * handle created tab
   * @param {Object} tabsTab - tabs.Tab
   * @returns {Promise.<Array>} - results of each handler
   */
  const handleCreatedTab = async tabsTab => {
    /*
     * {
     *   active, audible, autoDiscardable, cookieStoreId, discarded, favIconUrl,
     *   highlighted, height, id, incognito, index, mutedInfo, openerTabId,
     *   pinned, selected, sessionId, status, title, url, width, windowId
     * } = tabsTab
     */
    const {
      active, audible, cookieStoreId, favIconUrl, id, index, mutedInfo, pinned,
      status, title, windowId,
    } = tabsTab;
    const {muted} = mutedInfo;
    const func = [];
    if (windowId === sidebar.windowId && id !== tabs.TAB_ID_NONE) {
      const tab = await getTemplate(ATTR_TAB_TMPL);
      const tabItems = [
        `.${TAB}`, `.${ATTR_TAB_CONTEXT}`, `.${ATTR_TAB_TOGGLE_ICON}`,
        `.${ATTR_TAB_CONTENT}`, `.${ATTR_TAB_ICON}`, `.${ATTR_TAB_TITLE}`,
        `.${ATTR_TAB_AUDIO}`, `.${ATTR_TAB_AUDIO_ICON}`,
        `.${ATTR_TAB_CLOSE}`, `.${ATTR_TAB_CLOSE_ICON}`,
      ];
      const items = tab.querySelectorAll(tabItems.join(","));
      for (const item of items) {
        const {classList} = item;
        if (classList.contains(ATTR_TAB_CONTEXT)) {
          item.title = i18n.getMessage(`${TAB_GROUP_COLLAPSE}_tooltip`);
          func.push(addTabContextClickListener(item));
        } else if (classList.contains(ATTR_TAB_TOGGLE_ICON)) {
          item.alt = i18n.getMessage(`${TAB_GROUP_COLLAPSE}`);
        } else if (classList.contains(ATTR_TAB_CONTENT)) {
          item.title = title;
        } else if (classList.contains(ATTR_TAB_ICON)) {
          item.alt = title;
          func.push(
            setTabIcon(item, {status, title, favIconUrl}),
            addTabIconErrorListener(item),
          );
        } else if (classList.contains(ATTR_TAB_TITLE)) {
          item.textContent = title;
        } else if (classList.contains(ATTR_TAB_AUDIO)) {
          if (audible || muted) {
            classList.add(AUDIBLE);
          } else {
            classList.remove(AUDIBLE);
          }
          func.push(
            setTabAudio(item, {audible, muted}),
            addTabAudioClickListener(item),
          );
        } else if (classList.contains(ATTR_TAB_AUDIO_ICON)) {
          func.push(setTabAudioIcon(item, {audible, muted}));
        } else if (classList.contains(ATTR_TAB_CLOSE)) {
          item.title = i18n.getMessage(`${TAB_CLOSE}_tooltip`);
          func.push(addTabCloseClickListener(item));
        } else if (classList.contains(ATTR_TAB_CLOSE_ICON)) {
          item.alt = i18n.getMessage(`${TAB_CLOSE}`);
        }
        func.push(addTabClickListener(item));
      }
      tab.dataset.tabId = id;
      tab.dataset.tab = JSON.stringify(tabsTab);
      active && tab.classList.add(ACTIVE);
      if (pinned) {
        const container = document.getElementById(PINNED);
        tab.classList.add(PINNED);
        tab.removeAttribute("draggable");
        if (container.children[index]) {
          container.insertBefore(tab, container.children[index]);
        } else {
          container.appendChild(tab);
        }
        if (container.childElementCount > 1) {
          container.classList.add(ATTR_TAB_GROUP);
          for (const child of container.children) {
            child.classList.add(ATTR_TAB_GROUP);
          }
        }
      } else {
        const container = await getTemplate(ATTR_TAB_CONTAINER_TMPL);
        const list = document.querySelectorAll(TAB_QUERY);
        let target;
        if (list.length !== index && list[index] && list[index].parentNode) {
          target = list[index].parentNode;
        } else {
          target = document.getElementById(NEW_TAB);
        }
        if (cookieStoreId) {
          const ident = await contextualIdentities.get(cookieStoreId);
          if (ident) {
            const {color} = ident;
            tab.style.borderColor = color;
          }
        }
        await addDragEventListener(tab);
        container.appendChild(tab);
        target.parentNode.insertBefore(container, target);
      }
    }
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
    if (newWindowId === sidebar.windowId && tabId !== tabs.TAB_ID_NONE) {
      const tabsTab = await tabs.get(tabId);
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
    if (windowId === sidebar.windowId && tabId !== tabs.TAB_ID_NONE) {
      const tab = document.querySelector(`[data-tab-id="${tabId}"]`);
      if (tab) {
        if (info.hasOwnProperty("favIconUrl") ||
            info.hasOwnProperty("status") ||
            info.hasOwnProperty("title") ||
            info.hasOwnProperty("url")) {
          const tabContent = tab.querySelector(`.${ATTR_TAB_CONTENT}`);
          const tabIcon = tab.querySelector(`.${ATTR_TAB_ICON}`);
          const tabTitle = tab.querySelector(`.${ATTR_TAB_TITLE}`);
          const {favIconUrl, status, title} = tabsTab;
          tabContent && (tabContent.title = title);
          tabTitle && (tabTitle.textContent = title);
          tabIcon && func.push(setTabIcon(tabIcon, {
            favIconUrl, status, title,
          }));
        }
        if (info.hasOwnProperty("audible") ||
            info.hasOwnProperty("mutedInfo")) {
          const tabAudio = tab.querySelector(`.${ATTR_TAB_AUDIO}`);
          const tabAudioIcon = tab.querySelector(`.${ATTR_TAB_AUDIO_ICON}`);
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
            const container = await getTemplate(ATTR_TAB_CONTAINER_TMPL);
            tab.classList.remove(PINNED);
            tab.setAttribute("draggable", "true");
            func.push(addDragEventListener(tab));
            container.appendChild(tab);
            pinnedParentNode.insertBefore(container, pinnedNextElement);
            func.push(restoreTabContainers());
          }
        }
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
    if (windowId === sidebar.windowId && tabId !== tabs.TAB_ID_NONE) {
      const tab = document.querySelector(`[data-tab-id="${tabId}"]`);
      const items = document.querySelectorAll(TAB_QUERY);
      if (toIndex === 0) {
        const tabsTab = await tabs.get(tabId);
        const {pinned} = tabsTab;
        if (pinned) {
          const container = document.getElementById(PINNED);
          const {firstElementChild} = container;
          container.insertBefore(tab, firstElementChild);
        } else {
          const container = await getTemplate(ATTR_TAB_CONTAINER_TMPL);
          const [target] = items;
          container.appendChild(tab);
          target.parentNode.insertBefore(container, target);
        }
      } else {
        const target = items[toIndex - 1];
        const {nextElementSibling, parentNode} = target;
        const unPinned =
          toIndex > fromIndex &&
          items[fromIndex].parentNode.classList.contains(PINNED) &&
          items[toIndex].parentNode.classList.contains(PINNED) &&
          items[toIndex] === items[toIndex].parentNode.lastElementChild;
        let {dataset: {group}} = tab;
        group = group === "true" && true || false;
        if (!group && parentNode.childElementCount === 1 || unPinned) {
          const {
            nextElementSibling: parentNextElementSibling,
            parentNode: parentParentNode,
          } = parentNode;
          const frag = await getTemplate(ATTR_TAB_CONTAINER_TMPL);
          if (frag) {
            frag.appendChild(tab);
            if (parentNextElementSibling) {
              parentParentNode.insertBefore(frag, parentNextElementSibling);
            } else {
              const newtab = document.getElementById(NEW_TAB);
              parentParentNode.insertBefore(frag, newtab);
            }
          }
        } else if (nextElementSibling) {
          parentNode.insertBefore(tab, nextElementSibling);
        } else {
          parentNode.appendChild(tab);
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
    if (oldWindowId === sidebar.windowId && tabId !== tabs.TAB_ID_NONE) {
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
        tabId !== tabs.TAB_ID_NONE) {
      const tab = document.querySelector(`[data-tab-id="${tabId}"]`);
      tab && tab.parentNode.removeChild(tab);
    }
  };

  /**
   * emulate tabs to sidebar
   * @returns {Promise.<Array>} - results of each handler
   */
  const emulateTabs = async () => {
    const items = await tabs.query({windowId: windows.WINDOW_ID_CURRENT});
    const func = [];
    for (const item of items) {
      func.push(handleCreatedTab(item));
    }
    return Promise.all(func);
  };

  /* listeners */
  tabs.onActivated.addListener(info =>
    handleActivatedTab(info).catch(logError)
  );
  tabs.onAttached.addListener((tabId, info) =>
    handleAttachedTab(tabId, info).then(restoreTabContainers).catch(logError)
  );
  tabs.onCreated.addListener(tabsTab =>
    handleCreatedTab(tabsTab).then(restoreTabContainers).catch(logError)
  );
  tabs.onDetached.addListener((tabId, info) =>
    handleDetachedTab(tabId, info).then(restoreTabContainers).catch(logError)
  );
  tabs.onMoved.addListener((tabId, info) =>
    handleMovedTab(tabId, info).then(restoreTabContainers).catch(logError)
  );
  tabs.onRemoved.addListener((tabId, info) =>
    handleRemovedTab(tabId, info).then(restoreTabContainers)
      .then(getLastClosedTab).catch(logError)
  );
  tabs.onUpdated.addListener((tabId, info, tabsTab) =>
    handleUpdatedTab(tabId, info, tabsTab).catch(logError)
  );

  /* start up */
  document.addEventListener("DOMContentLoaded", () => Promise.all([
    addNewTabClickListener(),
    createContextMenu(),
    getTheme().then(setTheme),
    setSidebar(),
  ]).then(emulateTabs).catch(logError));
  window.addEventListener("keydown", evt => setContext(evt).catch(logError),
                          true);
  window.addEventListener("mousedown", evt => setContext(evt).catch(logError),
                          true);
}
