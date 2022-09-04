/**
 * sidebar-class.js
 */

/* shared */
import { isObjectNotEmpty } from './common.js';
import {
  clearStorage, getCurrentWindow, getOs, getStorage, setSessionWindowValue
} from './browser.js';
import {
  BROWSER_SETTINGS_READ, NEW_TAB_SEPARATOR_SHOW, SCROLL_DIR_INVERT,
  TAB_CLOSE_DBLCLICK, TAB_CLOSE_MDLCLICK_PREVENT, TAB_GROUP_ENABLE,
  TAB_GROUP_EXPAND_COLLAPSE_OTHER, TAB_GROUP_EXPAND_EXCLUDE_PINNED,
  TAB_GROUP_NEW_TAB_AT_END, TAB_LIST, TAB_SKIP_COLLAPSED, TAB_SWITCH_SCROLL,
  TAB_SWITCH_SCROLL_ALWAYS, USER_CSS_USE
} from './constant.js';

/* sidebar */
export class Sidebar {
  /* private fields */
  #alwaysSwitchTabByScrolling;
  #closeTabsByDoubleClick;
  #closeTabsByMiddleClick;
  #context;
  #contextualIds;
  #enableTabGroup;
  #firstSelectedTab;
  #incognito;
  #invertScrollDirection;
  #isMac;
  #lastClosedTab;
  #pinnedTabsWaitingToMove;
  #readBrowserSettings;
  #showNewTabSeparator;
  #skipCollapsed;
  #switchTabByScrolling;
  #tabGroupOnExpandCollapseOther;
  #tabGroupOnExpandExcludePinned;
  #tabGroupPutNewTabAtTheEnd;
  #tabsWaitingToMove;
  #useUserCSS;
  #windowId;

  /**
   * constructor
   */
  constructor() {
    this.#alwaysSwitchTabByScrolling = false;
    this.#closeTabsByDoubleClick = false;
    this.#closeTabsByMiddleClick = true;
    this.#context = null;
    this.#contextualIds = null;
    this.#enableTabGroup = true;
    this.#firstSelectedTab = null;
    this.#incognito = false;
    this.#invertScrollDirection = false;
    this.#isMac = false;
    this.#lastClosedTab = null;
    this.#pinnedTabsWaitingToMove = null;
    this.#readBrowserSettings = false;
    this.#showNewTabSeparator = false;
    this.#skipCollapsed = false;
    this.#switchTabByScrolling = false;
    this.#tabGroupOnExpandCollapseOther = false;
    this.#tabGroupOnExpandExcludePinned = false;
    this.#tabGroupPutNewTabAtTheEnd = false;
    this.#tabsWaitingToMove = null;
    this.#useUserCSS = false;
    this.#windowId = null;
  }

  /* getter / setter */
  get alwaysSwitchTabByScrolling() {
    return this.#alwaysSwitchTabByScrolling;
  }

  set alwaysSwitchTabByScrolling(bool) {
    this.#alwaysSwitchTabByScrolling = !!bool;
  }

  get closeTabsByDoubleClick() {
    return this.#closeTabsByDoubleClick;
  }

  set closeTabsByDoubleClick(bool) {
    this.#closeTabsByDoubleClick = !!bool;
  }

  get closeTabsByMiddleClick() {
    return this.#closeTabsByMiddleClick;
  }

  set closeTabsByMiddleClick(bool) {
    this.#closeTabsByMiddleClick = !!bool;
  }

  get context() {
    return this.#context;
  }

  set context(elm) {
    this.#context = elm?.nodeType === Node.ELEMENT_NODE ? elm : null;
  }

  get contextualIds() {
    return this.#contextualIds;
  }

  set contextualIds(arr) {
    this.#contextualIds = Array.isArray(arr) && arr.length ? arr : null;
  }

  get enableTabGroup() {
    return this.#enableTabGroup;
  }

  set enableTabGroup(bool) {
    this.#enableTabGroup = !!bool;
  }

  get firstSelectedTab() {
    return this.#firstSelectedTab;
  }

  set firstSelectedTab(elm) {
    this.#firstSelectedTab = elm?.nodeType === Node.ELEMENT_NODE ? elm : null;
  }

  get incognito() {
    return this.#incognito;
  }

  set incognito(bool) {
    this.#incognito = !!bool;
  }

  get invertScrollDirection() {
    return this.#invertScrollDirection;
  }

  set invertScrollDirection(bool) {
    this.#invertScrollDirection = !!bool;
  }

  get isMac() {
    return this.#isMac;
  }

  set isMac(bool) {
    this.#isMac = !!bool;
  }

  get lastClosedTab() {
    return this.#lastClosedTab;
  }

  set lastClosedTab(tab) {
    this.#lastClosedTab =
      isObjectNotEmpty(tab) &&
      Object.prototype.hasOwnProperty.call(tab, 'windowId')
        ? tab
        : null;
  }

  get pinnedTabsWaitingToMove() {
    return this.#pinnedTabsWaitingToMove;
  }

  set pinnedTabsWaitingToMove(arr) {
    this.#pinnedTabsWaitingToMove =
      Array.isArray(arr) && arr.length ? arr : null;
  }

  get readBrowserSettings() {
    return this.#readBrowserSettings;
  }

  set readBrowserSettings(bool) {
    this.#readBrowserSettings = !!bool;
  }

  get showNewTabSeparator() {
    return this.#showNewTabSeparator;
  }

  set showNewTabSeparator(bool) {
    this.#showNewTabSeparator = !!bool;
  }

  get skipCollapsed() {
    return this.#skipCollapsed;
  }

  set skipCollapsed(bool) {
    this.#skipCollapsed = !!bool;
  }

  get switchTabByScrolling() {
    return this.#switchTabByScrolling;
  }

  set switchTabByScrolling(bool) {
    this.#switchTabByScrolling = !!bool;
  }

  get tabGroupOnExpandCollapseOther() {
    return this.#tabGroupOnExpandCollapseOther;
  }

  set tabGroupOnExpandCollapseOther(bool) {
    this.#tabGroupOnExpandCollapseOther = !!bool;
  }

  get tabGroupOnExpandExcludePinned() {
    return this.#tabGroupOnExpandExcludePinned;
  }

  set tabGroupOnExpandExcludePinned(bool) {
    this.#tabGroupOnExpandExcludePinned = !!bool;
  }

  get tabGroupPutNewTabAtTheEnd() {
    return this.#tabGroupPutNewTabAtTheEnd;
  }

  set tabGroupPutNewTabAtTheEnd(bool) {
    this.#tabGroupPutNewTabAtTheEnd = !!bool;
  }

  get tabsWaitingToMove() {
    return this.#tabsWaitingToMove;
  }

  set tabsWaitingToMove(arr) {
    this.#tabsWaitingToMove = Array.isArray(arr) && arr.length ? arr : null;
  }

  get useUserCSS() {
    return this.#useUserCSS;
  }

  set useUserCSS(bool) {
    this.#useUserCSS = !!bool;
  }

  get windowId() {
    return this.#windowId;
  };

  set windowId(id) {
    this.#windowId = Number.isInteger(id) ? id : null;
  };

  /**
   * setup
   *
   * @returns {void}
   */
  async setup() {
    const win = await getCurrentWindow({
      populate: true
    });
    const { id: windowId, incognito } = win;
    const store = await getStorage([
      BROWSER_SETTINGS_READ,
      NEW_TAB_SEPARATOR_SHOW,
      SCROLL_DIR_INVERT,
      TAB_CLOSE_DBLCLICK,
      TAB_CLOSE_MDLCLICK_PREVENT,
      TAB_GROUP_ENABLE,
      TAB_GROUP_EXPAND_COLLAPSE_OTHER,
      TAB_GROUP_EXPAND_EXCLUDE_PINNED,
      TAB_GROUP_NEW_TAB_AT_END,
      TAB_SKIP_COLLAPSED,
      TAB_SWITCH_SCROLL,
      TAB_SWITCH_SCROLL_ALWAYS,
      USER_CSS_USE
    ]);
    const os = await getOs();
    if (isObjectNotEmpty(store)) {
      const {
        alwaysSwitchTabByScrolling, closeTabsByDoubleClick, enableTabGroup,
        invertScrollDirection, preventCloseTabsByMiddleClick,
        readBrowserSettings, showNewTabSeparator, skipCollapsed,
        switchTabByScrolling, tabGroupOnExpandCollapseOther,
        tabGroupOnExpandExcludePinned, tabGroupPutNewTabAtTheEnd, useUserCSS
      } = store;
      this.#alwaysSwitchTabByScrolling = alwaysSwitchTabByScrolling
        ? !!alwaysSwitchTabByScrolling.checked
        : false;
      this.#closeTabsByDoubleClick = closeTabsByDoubleClick
        ? !!closeTabsByDoubleClick.checked
        : false;
      this.#closeTabsByMiddleClick = preventCloseTabsByMiddleClick
        ? !preventCloseTabsByMiddleClick.checked
        : true;
      this.#enableTabGroup = enableTabGroup
        ? !!enableTabGroup.checked
        : true;
      this.#invertScrollDirection = invertScrollDirection
        ? !!invertScrollDirection.checked
        : false;
      this.#readBrowserSettings = readBrowserSettings
        ? !!readBrowserSettings.checked
        : false;
      this.#showNewTabSeparator = showNewTabSeparator
        ? !!showNewTabSeparator.checked
        : false;
      this.#skipCollapsed = skipCollapsed
        ? !!skipCollapsed.checked
        : false;
      this.#switchTabByScrolling = switchTabByScrolling
        ? !!switchTabByScrolling.checked
        : false;
      this.#tabGroupOnExpandCollapseOther = tabGroupOnExpandCollapseOther
        ? !!tabGroupOnExpandCollapseOther.checked
        : false;
      this.#tabGroupOnExpandExcludePinned = tabGroupOnExpandExcludePinned
        ? !!tabGroupOnExpandExcludePinned.checked
        : false;
      this.#tabGroupPutNewTabAtTheEnd = tabGroupPutNewTabAtTheEnd
        ? !!tabGroupPutNewTabAtTheEnd.checked
        : false;
      this.#useUserCSS = useUserCSS
        ? !!useUserCSS.checked
        : false;
    } else {
      this.#alwaysSwitchTabByScrolling = false;
      this.#closeTabsByDoubleClick = false;
      this.#closeTabsByMiddleClick = true;
      this.#enableTabGroup = true;
      this.#invertScrollDirection = false;
      this.#readBrowserSettings = false;
      this.#showNewTabSeparator = false;
      this.#skipCollapsed = false;
      this.#switchTabByScrolling = false;
      this.#tabGroupOnExpandCollapseOther = false;
      this.#tabGroupOnExpandExcludePinned = false;
      this.#tabGroupPutNewTabAtTheEnd = false;
      this.#useUserCSS = false;
    }
    this.#incognito = incognito;
    this.#isMac = os === 'mac';
    this.#windowId = windowId;
  }

  /**
   * init
   *
   * @param {boolean} bool - bypass cache
   * @returns {void}
   */
  async init(bool = false) {
    await setSessionWindowValue(TAB_LIST, null, this.#windowId);
    await clearStorage();
    window.location.reload(bool);
  }
};
