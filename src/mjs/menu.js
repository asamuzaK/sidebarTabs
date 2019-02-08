/**
 * menu.js
 */

import {getType, isObjectNotEmpty, isString, throwErr} from "./common.js";
import {getAllContextualIdentities} from "./browser.js";
import {getSidebarTab, getSidebarTabId} from "./util.js";
import menuItems from "./menu-items.js";

/* api */
const {contextualIdentities, menus, tabs} = browser;

/* constants */
import {TAB_REOPEN_CONTAINER} from "./constant.js";
const {TAB_ID_NONE} = tabs;
const ICON_SIZE_16 = 16;

/**
 * create context menu item
 * @param {Object} data - context data
 * @returns {?string|number} - menu item ID
 */
export const createMenuItem = async data => {
  let menuItemId;
  if (isObjectNotEmpty(data)) {
    const {
      contexts, enabled, icons, id, parentId, title, type, viewTypes, visible,
    } = data;
    if (isString(id)) {
      menuItemId = await menus.create({
        contexts, enabled, icons, id, parentId, title, type, viewTypes, visible,
      });
    }
  }
  return menuItemId || null;
};

/**
 * create contextual identities menu
* @returns {Promise.<array>} - results of each handler
 */
export const createContextualIdentitiesMenu = async () => {
  const items = await getAllContextualIdentities();
  const func = [];
  if (items) {
    for (const item of items) {
      const {color, cookieStoreId, icon, name} = item;
      const opt = {
        contexts: ["tab"],
        enabled: true,
        icons: {
          [ICON_SIZE_16]: `img/${icon}.svg#${color}`,
        },
        id: cookieStoreId,
        parentId: TAB_REOPEN_CONTAINER,
        title: name,
        type: "normal",
        viewTypes: ["sidebar"],
        visible: true,
      };
      func.push(createMenuItem(opt));
    }
  }
  return Promise.all(func);
};

/**
 * create context menu
 * @param {Object} menu - menu
 * @param {string} parentId - parent menu item ID
 * @returns {Promise.<Array>} - results of each handler
 */
export const createContextMenu = async (menu = menuItems, parentId = null) => {
  const items = Object.keys(menu);
  const func = [];
  for (const item of items) {
    const {
      contexts, enabled, id, subItems, title, type, viewTypes, visible,
    } = menu[item];
    const opt = {
      contexts, enabled, id, parentId, title, type, viewTypes, visible,
    };
    func.push(createMenuItem(opt));
    if (id === TAB_REOPEN_CONTAINER) {
      func.push(createContextualIdentitiesMenu());
    } else if (subItems) {
      func.push(createContextMenu(subItems, id));
    }
  }
  return Promise.all(func);
};

/**
 * update contextual identities menu
 * @param {Object} info - contextual identities info
 * @returns {void}
 */
export const updateContextualIdentitiesMenu = async info => {
  if (isObjectNotEmpty(info)) {
    const {color, cookieStoreId, icon, name} = info;
    if (!isString(color)) {
      throw new TypeError(`Expected String but got ${getType(color)}.`);
    }
    if (!isString(cookieStoreId)) {
      throw new TypeError(`Expected String but got ${getType(cookieStoreId)}.`);
    }
    if (!isString(icon)) {
      throw new TypeError(`Expected String but got ${getType(icon)}.`);
    }
    if (!isString(name)) {
      throw new TypeError(`Expected String but got ${getType(name)}.`);
    }
    const data = {
      contexts: ["tab"],
      enabled: true,
      icons: {
        [ICON_SIZE_16]: `img/${icon}.svg#${color}`,
      },
      parentId: TAB_REOPEN_CONTAINER,
      title: name,
      type: "normal",
      viewTypes: ["sidebar"],
      visible: true,
    };
    await menus.update(cookieStoreId, data);
  }
};

/**
 * update context menu
 * @param {string} menuItemId - menu item ID
 * @param {Object} data - update items data
 * @returns {void}
 */
export const updateContextMenu = async (menuItemId, data) => {
  if (isString(menuItemId) && isObjectNotEmpty(data) &&
      (data.hasOwnProperty("contexts") || data.hasOwnProperty("enabled") ||
       data.hasOwnProperty("icons") || data.hasOwnProperty("parentId") ||
       data.hasOwnProperty("title") || data.hasOwnProperty("viewTypes") ||
       data.hasOwnProperty("visible"))) {
    await menus.update(menuItemId, data);
  }
};

/**
 * remove contextual identities menu
 * @param {Object} info - contextual identities info
 * @returns {void}
 */
export const removeContextualIdentitiesMenu = async info => {
  if (isObjectNotEmpty(info)) {
    const {cookieStoreId} = info;
    if (isString(cookieStoreId)) {
      await menus.remove(cookieStoreId);
    }
  }
};

/**
 * override context menu
 * @param {!Object} evt - event
 * @returns {AsyncFunction} - menus.overrideContext()
 */
export const overrideContextMenu = async evt => {
  const {target} = evt;
  const tab = getSidebarTab(target);
  const opt = {};
  if (tab) {
    const tabId = getSidebarTabId(tab);
    if (Number.isInteger(tabId) && tabId !== TAB_ID_NONE) {
      opt.tabId = tabId;
      opt.context = "tab";
    }
  }
  return menus.overrideContext(opt);
};

/**
 * handle contextmenu click
 * @param {Object} evt - Event
 * @returns {AsyncFunction} - overrideContextMenu
 */
export const contextmenuOnClick = evt =>
  overrideContextMenu(evt).catch(throwErr);

/* browser event handlers */
/**
 * handle contextualIdentities.onCreated
 * @param {Object} info - info
 * @returns {AsyncFunction} - createContextualIdentitiesMenu()
 */
export const contextualIdentitiesOnCreated = info =>
  createContextualIdentitiesMenu(info).catch(throwErr);

/**
 * handle contextualIdentities.onRemoved
 * @param {Object} info - info
 * @returns {AsyncFunction} - removeContextualIdentitiesMenu()
 */
export const contextualIdentitiesOnRemoved = info =>
  removeContextualIdentitiesMenu(info).catch(throwErr);

/**
 * handle contextualIdentities.onUpdated
 * @param {Object} info - info
 * @returns {AsyncFunction} - updateContextualIdentitiesMenu()
 */
export const contextualIdentitiesOnUpdated = info =>
  updateContextualIdentitiesMenu(info).catch(throwErr);

/* listeners */
contextualIdentities.onCreated.addListener(contextualIdentitiesOnCreated);
contextualIdentities.onRemoved.addListener(contextualIdentitiesOnRemoved);
contextualIdentities.onUpdated.addListener(contextualIdentitiesOnUpdated);

window.addEventListener("contextmenu", contextmenuOnClick);
