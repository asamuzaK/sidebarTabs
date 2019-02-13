/**
 * menu.js
 */

import {getType, isObjectNotEmpty, isString, throwErr} from "./common.js";
import {getAllContextualIdentities} from "./browser.js";
import {getSidebarTab, getSidebarTabId} from "./util.js";
import menuItems from "./menu-items.js";

/* api */
const {contextualIdentities, menus, runtime, tabs} = browser;

/* constants */
import {NEW_TAB_OPEN_CONTAINER, TAB_REOPEN_CONTAINER} from "./constant.js";
const {TAB_ID_NONE} = tabs;
const ICON_SIZE_16 = 16;

/**
 * update context menu
 * @param {string} menuItemId - menu item ID
 * @param {Object} data - update items data
 * @returns {Promise.<Array>} - results of each handler
 */
export const updateContextMenu = async (menuItemId, data) => {
  const func = [];
  if (isString(menuItemId) && isObjectNotEmpty(data) &&
      (data.hasOwnProperty("contexts") || data.hasOwnProperty("enabled") ||
       data.hasOwnProperty("icons") || data.hasOwnProperty("parentId") ||
       data.hasOwnProperty("title") || data.hasOwnProperty("viewTypes") ||
       data.hasOwnProperty("visible"))) {
    func.push(menus.update(menuItemId, data));
  }
  return Promise.all(func);
};

/**
 * handle create menu item last error
 * @param {string} menuItemId - menu item ID
 * @param {Object} data - update items data
 * @returns {Promise} - promise chain
 */
export const handleCreateMenuItemError = (menuItemId, data) => {
  const func = [];
  if (runtime.lastError) {
    const e = runtime.lastError;
    if (e.message.includes("ID already exists") &&
        e.message.includes(menuItemId)) {
      func.push(updateContextMenu(menuItemId, data));
    } else {
      throw e;
    }
  }
  return Promise.all(func).catch(throwErr);
};

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
      const callback = () => handleCreateMenuItemError(id, {
        contexts, enabled, icons, parentId, title, type, viewTypes, visible,
      });
      menuItemId = await menus.create({
        contexts, enabled, icons, id, parentId, title, type, viewTypes,
        visible,
      }, callback);
    }
  }
  return menuItemId || null;
};

/**
 * create contextual identities menu
 * @param {Object} info - info
 * @returns {Promise.<array>} - results of each handler
 */
export const createContextualIdentitiesMenu = async info => {
  const func = [];
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
    const icons = {
      [ICON_SIZE_16]: `img/${icon}.svg#${color}`,
    };
    const reopenOpt = {
      icons,
      contexts: ["tab"],
      enabled: true,
      id: `${cookieStoreId}Reopen`,
      parentId: TAB_REOPEN_CONTAINER,
      title: name,
      type: "normal",
      viewTypes: ["sidebar"],
      visible: true,
    };
    const newTabOpt = {
      icons,
      contexts: ["page"],
      enabled: true,
      id: `${cookieStoreId}NewTab`,
      parentId: NEW_TAB_OPEN_CONTAINER,
      title: name,
      type: "normal",
      viewTypes: ["sidebar"],
      visible: true,
    };
    func.push(
      createMenuItem(reopenOpt),
      createMenuItem(newTabOpt),
    );
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
    if (subItems) {
      func.push(createContextMenu(subItems, id));
    }
  }
  if (!parentId) {
    const contextualIds = await getAllContextualIdentities();
    if (contextualIds) {
      for (const item of contextualIds) {
        func.push(createContextualIdentitiesMenu(item));
      }
    }
  }
  return Promise.all(func);
};

/**
 * update contextual identities menu
 * @param {Object} info - contextual identities info
 * @returns {Promise.<Array>} - results of each handler
 */
export const updateContextualIdentitiesMenu = async info => {
  const func = [];
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
    const icons = {
      [ICON_SIZE_16]: `img/${icon}.svg#${color}`,
    };
    const reopenOpt = {
      icons,
      contexts: ["tab"],
      enabled: true,
      parentId: TAB_REOPEN_CONTAINER,
      title: name,
      type: "normal",
      viewTypes: ["sidebar"],
      visible: true,
    };
    const newTabOpt = {
      icons,
      contexts: ["tab"],
      enabled: true,
      parentId: NEW_TAB_OPEN_CONTAINER,
      title: name,
      type: "normal",
      viewTypes: ["sidebar"],
      visible: true,
    };
    func.push(
      menus.update(`${cookieStoreId}Reopen`, reopenOpt),
      menus.update(`${cookieStoreId}NewTab`, newTabOpt),
    );
  }
  return Promise.all(func);
};

/**
 * remove contextual identities menu
 * @param {Object} info - contextual identities info
 * @returns {Promise.<Array>} - results of each handler
 */
export const removeContextualIdentitiesMenu = async info => {
  const func = [];
  if (isObjectNotEmpty(info)) {
    const {cookieStoreId} = info;
    if (isString(cookieStoreId)) {
      func.push(
        menus.remove(`${cookieStoreId}Reopen`),
        menus.remove(`${cookieStoreId}NewTab`),
      );
    }
  }
  return Promise.all(func);
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
