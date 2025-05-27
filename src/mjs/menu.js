/**
 * menu.js
 */

/* shared */
import menuItems from './menu-items.js';
import { getAllContextualIdentities } from './browser.js';
import { getType, isObjectNotEmpty, isString, throwErr } from './common.js';
import { NEW_TAB_OPEN_CONTAINER, TAB_REOPEN_CONTAINER } from './constant.js';

/* api */
const { menus, runtime } = browser;

/* constant */
const ICON_SIZE_16 = 16;

/* menu item map */
export const menuItemMap = new Map();

/**
 * update context menu
 * @param {string} [menuItemId] - menu item ID
 * @param {object} [data] - update items data
 * @returns {Promise.<Array>} - results of each handler
 */
export const updateContextMenu = async (menuItemId, data) => {
  const func = [];
  if (isString(menuItemId) && isObjectNotEmpty(data) &&
      (Object.hasOwn(data, 'contexts') ||
       Object.hasOwn(data, 'enabled') ||
       Object.hasOwn(data, 'icons') ||
       Object.hasOwn(data, 'parentId') ||
       Object.hasOwn(data, 'title') ||
       Object.hasOwn(data, 'viewTypes') ||
       Object.hasOwn(data, 'visible'))) {
    func.push(menus.update(menuItemId, data));
  }
  return Promise.all(func);
};

/**
 * handle create menu item callback
 * @returns {Promise.<Array>} - promise chain
 */
export const createMenuItemCallback = () => {
  const func = [];
  if (runtime.lastError) {
    const e = runtime.lastError;
    if (e.message.includes('ID already exists:')) {
      const [, menuItemId] =
        /ID\s+already\s+exists:\s+([\dA-Za-z]+)$/.exec(e.message);
      const data = menuItemId && menuItemMap.has(menuItemId) &&
                     menuItemMap.get(menuItemId);
      if (data) {
        func.push(updateContextMenu(menuItemId, data));
      } else {
        throw e;
      }
    } else {
      throw e;
    }
  }
  return Promise.all(func).catch(throwErr);
};

/**
 * create context menu item
 * @param {object} [data] - context data
 * @returns {Promise.<?string|number>} - menu item ID
 */
export const createMenuItem = async data => {
  let menuItemId;
  if (isObjectNotEmpty(data)) {
    const {
      contexts, enabled, icons, id, parentId, title, type, viewTypes, visible
    } = data;
    if (isString(id)) {
      await menuItemMap.set(id, {
        contexts, enabled, icons, parentId, title, type, viewTypes, visible
      });
      menuItemId = await menus.create({
        contexts, enabled, icons, id, parentId, title, type, viewTypes, visible
      }, createMenuItemCallback);
    }
  }
  return menuItemId || null;
};

/**
 * create contextual identities menu
 * @param {object} [info] - info
 * @returns {Promise.<Array>} - results of each handler
 */
export const createContextualIdentitiesMenu = async info => {
  const func = [];
  if (isObjectNotEmpty(info)) {
    const { color, cookieStoreId, icon, name } = info;
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
      [ICON_SIZE_16]: `img/${icon}.svg#${color}`
    };
    const reopenOpt = {
      icons,
      contexts: ['tab'],
      enabled: true,
      id: `${cookieStoreId}Reopen`,
      parentId: TAB_REOPEN_CONTAINER,
      title: name,
      type: 'normal',
      viewTypes: ['sidebar'],
      visible: true
    };
    const newTabOpt = {
      icons,
      contexts: ['page'],
      enabled: true,
      id: `${cookieStoreId}NewTab`,
      parentId: NEW_TAB_OPEN_CONTAINER,
      title: name,
      type: 'normal',
      viewTypes: ['sidebar'],
      visible: true
    };
    func.push(
      createMenuItem(reopenOpt),
      createMenuItem(newTabOpt)
    );
  }
  return Promise.all(func);
};

/**
 * create context menu
 * @param {object} [menu] - menu
 * @param {string} [parentId] - parent menu item ID
 * @returns {Promise.<Array>} - results of each handler
 */
export const createContextMenu = async (menu = menuItems, parentId = null) => {
  const items = Object.keys(menu);
  const func = [];
  for (const item of items) {
    const {
      contexts, enabled, id, subItems, title, type, viewTypes, visible
    } = menu[item];
    const opt = {
      contexts, enabled, id, parentId, title, type, viewTypes, visible
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
 * @param {object} [info] - contextual identities info
 * @returns {Promise.<Array>} - results of each handler
 */
export const updateContextualIdentitiesMenu = async (info = {}) => {
  const { contextualIdentity } = info;
  const func = [];
  if (isObjectNotEmpty(contextualIdentity)) {
    const { color, cookieStoreId, icon, name } = contextualIdentity;
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
      [ICON_SIZE_16]: `img/${icon}.svg#${color}`
    };
    const reopenOpt = {
      icons,
      contexts: ['tab'],
      enabled: true,
      parentId: TAB_REOPEN_CONTAINER,
      title: name,
      type: 'normal',
      viewTypes: ['sidebar'],
      visible: true
    };
    const newTabOpt = {
      icons,
      contexts: ['tab'],
      enabled: true,
      parentId: NEW_TAB_OPEN_CONTAINER,
      title: name,
      type: 'normal',
      viewTypes: ['sidebar'],
      visible: true
    };
    func.push(
      menus.update(`${cookieStoreId}Reopen`, reopenOpt),
      menus.update(`${cookieStoreId}NewTab`, newTabOpt)
    );
  }
  return Promise.all(func);
};

/**
 * remove contextual identities menu
 * @param {object} [info] - contextual identities info
 * @returns {Promise.<Array>} - results of each handler
 */
export const removeContextualIdentitiesMenu = async info => {
  const func = [];
  if (isObjectNotEmpty(info)) {
    const { cookieStoreId } = info;
    if (isString(cookieStoreId)) {
      func.push(
        menus.remove(`${cookieStoreId}Reopen`),
        menus.remove(`${cookieStoreId}NewTab`)
      );
    }
  }
  return Promise.all(func);
};

/**
 * restore context menu
 * @returns {Promise} - promise chain
 */
export const restoreContextMenu = async () => {
  await menus.removeAll();
  return createContextMenu(menuItems);
};

/**
 * override context menu
 * @param {object} opt - options
 * @returns {Promise} - menus.overrideContext()
 */
export const overrideContextMenu = async (opt = {}) =>
  menus.overrideContext(opt);
