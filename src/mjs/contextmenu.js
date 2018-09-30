/**
 * contextmenu.js
 */

import {isString} from "./common.js";
import {
  TAB, TAB_BOOKMARK, TAB_BOOKMARK_ALL, TAB_CLOSE, TAB_CLOSE_END,
  TAB_CLOSE_OTHER, TAB_CLOSE_UNDO, TAB_DUPE,
  TAB_GROUP, TAB_GROUP_BOOKMARK, TAB_GROUP_CLOSE, TAB_GROUP_COLLAPSE,
  TAB_GROUP_DETACH, TAB_GROUP_DUPE, TAB_GROUP_EXPAND, TAB_GROUP_PIN,
  TAB_GROUP_RELOAD, TAB_GROUP_SELECTED, TAB_GROUP_SYNC, TAB_GROUP_UNGROUP,
  TAB_MOVE_WIN_NEW, TAB_MUTE, TAB_MUTE_UNMUTE, TAB_PIN, TAB_PIN_UNPIN,
  TAB_RELOAD, TAB_RELOAD_ALL, TAB_SYNC,
} from "./constant.js";

/* api */
const {i18n, menus} = browser;

/* context menu items */
export const menuItems = {
  /* tab */
  [TAB]: {
    id: TAB,
    title: i18n.getMessage(`${TAB}_title`, "(&T)"),
    type: "normal",
    enabled: false,
    subItems: {
      [TAB_RELOAD]: {
        id: TAB_RELOAD,
        title: i18n.getMessage(`${TAB_RELOAD}_title`, "(&R)"),
        type: "normal",
        enabled: false,
      },
      [TAB_SYNC]: {
        id: TAB_SYNC,
        title: i18n.getMessage(`${TAB_SYNC}_title`, "(&S)"),
        type: "normal",
        enabled: false,
      },
      [TAB_MUTE]: {
        id: TAB_MUTE,
        title: i18n.getMessage(`${TAB_MUTE}_title`, "(&M)"),
        toggleTitle: i18n.getMessage(`${TAB_MUTE_UNMUTE}_title`, "(&M)"),
        type: "normal",
        enabled: false,
      },
      "sepTab-1": {
        id: "sepTab-1",
        type: "separator",
      },
      [TAB_PIN]: {
        id: TAB_PIN,
        title: i18n.getMessage(`${TAB_PIN}_title`, "(&P)"),
        toggleTitle: i18n.getMessage(`${TAB_PIN_UNPIN}_title`, "(&P)"),
        type: "normal",
        enabled: false,
      },
      [TAB_DUPE]: {
        id: TAB_DUPE,
        title: i18n.getMessage(`${TAB_DUPE}_title`, "(&D)"),
        type: "normal",
        enabled: false,
      },
      // TODO:
      /*
      [TAB_REOPEN_CONTAINER]: {
        id: TAB_REOPEN_CONTAINER,
        title: i18n.getMessage(`${TAB_REOPEN_CONTAINER}_title`, "(&E)"),
        type: "normal",
        enabled: false,
      },
      */
      [TAB_MOVE_WIN_NEW]: {
        id: TAB_MOVE_WIN_NEW,
        title: i18n.getMessage(`${TAB_MOVE_WIN_NEW}_title`, "(&N)"),
        type: "normal",
        enabled: false,
      },
      [TAB_BOOKMARK]: {
        id: TAB_BOOKMARK,
        title: i18n.getMessage(`${TAB_BOOKMARK}_title`, "(&B)"),
        type: "normal",
        enabled: false,
      },
      "sepTab-2": {
        id: "sepTab-2",
        type: "separator",
      },
      /*
      [TAB_SEND]: {
        id: TAB_SEND,
        title: i18n.getMessage(`${TAB_SEND}_title`, "(&N)"),
        type: "normal",
        enabled: false,
      },
      "sepTab-3": {
        id: "sepTab-3",
        type: "separator",
      },
      */
      [TAB_CLOSE_END]: {
        id: TAB_CLOSE_END,
        title: i18n.getMessage(`${TAB_CLOSE_END}_title`, "(&E)"),
        type: "normal",
        enabled: false,
      },
      [TAB_CLOSE_OTHER]: {
        id: TAB_CLOSE_OTHER,
        title: i18n.getMessage(`${TAB_CLOSE_OTHER}_title`, "(&O)"),
        type: "normal",
        enabled: false,
      },
      [TAB_CLOSE]: {
        id: TAB_CLOSE,
        title: i18n.getMessage(`${TAB_CLOSE}_title`, "(&C)"),
        type: "normal",
        enabled: false,
      },
    },
  },
  "sep-1": {
    id: "sep-1",
    type: "separator",
  },
  /* tab group */
  [TAB_GROUP]: {
    id: TAB_GROUP,
    title: i18n.getMessage(`${TAB_GROUP}_title`, "(&G)"),
    type: "normal",
    enabled: false,
    subItems: {
      [TAB_GROUP_COLLAPSE]: {
        id: TAB_GROUP_COLLAPSE,
        title: i18n.getMessage(`${TAB_GROUP_COLLAPSE}_title`, "(&E)"),
        toggleTitle: i18n.getMessage(`${TAB_GROUP_EXPAND}_title`, "(&E)"),
        type: "normal",
        enabled: false,
      },
      "sepTabGroup-1": {
        id: "sepTabGroup-1",
        type: "separator",
      },
      [TAB_GROUP_RELOAD]: {
        id: TAB_GROUP_RELOAD,
        title: i18n.getMessage(`${TAB_GROUP_RELOAD}_title`, "(&R)"),
        type: "normal",
        enabled: false,
      },
      [TAB_GROUP_SYNC]: {
        id: TAB_GROUP_SYNC,
        title: i18n.getMessage(`${TAB_GROUP_SYNC}_title`, "(&S)"),
        type: "normal",
        enabled: false,
      },
      "sepTabGroup-2": {
        id: "sepTabGroup-2",
        type: "separator",
      },
      [TAB_GROUP_PIN]: {
        id: TAB_GROUP_PIN,
        title: i18n.getMessage(`${TAB_GROUP_PIN}_title`, "(&P)"),
        type: "normal",
        enabled: false,
      },
      [TAB_GROUP_DUPE]: {
        id: TAB_GROUP_DUPE,
        title: i18n.getMessage(`${TAB_GROUP_DUPE}_title`, "(&D)"),
        type: "normal",
        enabled: false,
      },
      [TAB_GROUP_BOOKMARK]: {
        id: TAB_GROUP_BOOKMARK,
        title: i18n.getMessage(`${TAB_GROUP_BOOKMARK}_title`, "(&B)"),
        type: "normal",
        enabled: false,
      },
      "sepTabGroup-3": {
        id: "sepTabGroup-3",
        type: "separator",
      },
      [TAB_GROUP_SELECTED]: {
        id: TAB_GROUP_SELECTED,
        title: i18n.getMessage(`${TAB_GROUP_SELECTED}_title`, "(&G)"),
        type: "normal",
        enabled: false,
      },
      [TAB_GROUP_DETACH]: {
        id: TAB_GROUP_DETACH,
        title: i18n.getMessage(`${TAB_GROUP_DETACH}_title`, "(&T)"),
        type: "normal",
        enabled: false,
      },
      "sepTabGroup-4": {
        id: "sepTabGroup-4",
        type: "separator",
      },
      [TAB_GROUP_UNGROUP]: {
        id: TAB_GROUP_UNGROUP,
        title: i18n.getMessage(`${TAB_GROUP_UNGROUP}_title`, "(&U)"),
        type: "normal",
        enabled: false,
      },
      "sepTabGroup-5": {
        id: "sepTabGroup-5",
        type: "separator",
      },
      [TAB_GROUP_CLOSE]: {
        id: TAB_GROUP_CLOSE,
        title: i18n.getMessage(`${TAB_GROUP_CLOSE}_title`, "(&C)"),
        type: "normal",
        enabled: false,
      },
    },
  },
  "sep-2": {
    id: "sep-2",
    type: "separator",
  },
  /* selected tabs */
  /*
  [TAB_SELECTED]: {
  },
  "sep-3": {
    id: "sep-3",
    type: "separator",
  },
  */
  /* all tabs */
  [TAB_RELOAD_ALL]: {
    id: TAB_RELOAD_ALL,
    title: i18n.getMessage(`${TAB_RELOAD_ALL}_title`, "(&R)"),
    type: "normal",
    enabled: true,
  },
  [TAB_BOOKMARK_ALL]: {
    id: TAB_BOOKMARK_ALL,
    title: i18n.getMessage(`${TAB_BOOKMARK_ALL}_title`, "(&B)"),
    type: "normal",
    enabled: false,
  },
  /*
  [TAB_SELECT_ALL]: {
    id: TAB_SELECT_ALL,
    title: i18n.getMessage(`${TAB_SELECT_ALL}_title`, "(&B)"),
    type: "normal",
    enabled: false,
  },
  */
  "sep-3": {
    id: "sep-3",
    type: "separator",
  },
  [TAB_CLOSE_UNDO]: {
    id: TAB_CLOSE_UNDO,
    title: i18n.getMessage(`${TAB_CLOSE_UNDO}_title`, "(&U)"),
    type: "normal",
    enabled: false,
  },
};

/**
 * create context menu item
 * @param {Object} data - context data
 * @returns {?AsyncFunction} - menus.create()
 */
export const createMenuItem = async (data = {}) => {
  const {enabled, id, parentId, title, type} = data;
  let func;
  if (isString(id)) {
    func = await menus.create({enabled, id, parentId, title, type});
  }
  return func || null;
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
    const {enabled, id, subItems, title, type} = menu[item];
    const itemData = {enabled, id, parentId, title, type};
    func.push(createMenuItem(itemData));
    if (subItems) {
      func.push(createContextMenu(subItems, id));
    }
  }
  return Promise.all(func);
};

/**
 * update context menu
 * @param {string} menuItemId - menu item ID
 * @param {Object} data - update items data
 * @returns {?AsyncFunction} - menus.update()
 */
export const updateContextMenu = async (menuItemId, data = {}) => {
  let func;
  if (isString(menuItemId)) {
    const {enabled, title} = data;
    func = await menus.update(menuItemId, {enabled, title});
  }
  return func || null;
};

window.addEventListener("contextmenu", () => menus.overrideContext({}));
