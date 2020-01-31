/**
 * menu-item.js
 */

/* api */
const {i18n} = browser;

/* constants */
import {
  NEW_TAB_OPEN_CONTAINER, TAB_ALL_BOOKMARK, TAB_ALL_RELOAD, TAB_ALL_SELECT,
  TAB_BOOKMARK, TAB_CLOSE, TAB_CLOSE_END, TAB_CLOSE_OTHER, TAB_CLOSE_UNDO,
  TAB_DUPE,
  TAB_GROUP, TAB_GROUP_COLLAPSE, TAB_GROUP_COLLAPSE_OTHER, TAB_GROUP_CONTAINER,
  TAB_GROUP_DETACH, TAB_GROUP_DETACH_TABS, TAB_GROUP_DOMAIN, TAB_GROUP_EXPAND,
  TAB_GROUP_SELECTED, TAB_GROUP_UNGROUP,
  TAB_MOVE, TAB_MOVE_END, TAB_MOVE_START, TAB_MOVE_WIN, TAB_MUTE,
  TAB_MUTE_UNMUTE, TAB_PIN, TAB_PIN_UNPIN, TAB_RELOAD, TAB_REOPEN_CONTAINER,
  TABS_BOOKMARK, TABS_CLOSE, TABS_CLOSE_OTHER, TABS_DUPE, TABS_MOVE,
  TABS_MOVE_END, TABS_MOVE_START, TABS_MOVE_WIN, TABS_MUTE, TABS_MUTE_UNMUTE,
  TABS_PIN, TABS_PIN_UNPIN, TABS_RELOAD, TABS_REOPEN_CONTAINER,
} from "./constant.js";

/* context menu items */
export default {
  /* new tab */
  [NEW_TAB_OPEN_CONTAINER]: {
    id: NEW_TAB_OPEN_CONTAINER,
    title: i18n.getMessage(`${NEW_TAB_OPEN_CONTAINER}_title`, "(&E)"),
    type: "normal",
    contexts: ["page"],
    viewTypes: ["sidebar"],
    enabled: false,
    visible: false,
  },
  "sep-0": {
    id: "sep-0",
    type: "separator",
    contexts: ["page"],
    viewTypes: ["sidebar"],
  },
  /* tab */
  [TAB_RELOAD]: {
    id: TAB_RELOAD,
    title: i18n.getMessage(`${TAB_RELOAD}_title`, "(&R)"),
    type: "normal",
    contexts: ["tab"],
    viewTypes: ["sidebar"],
    enabled: false,
    visible: true,
  },
  [TABS_RELOAD]: {
    id: TABS_RELOAD,
    title: i18n.getMessage(`${TABS_RELOAD}_title`, "(&R)"),
    type: "normal",
    contexts: ["tab"],
    viewTypes: ["sidebar"],
    enabled: false,
    visible: false,
  },
  [TAB_MUTE]: {
    id: TAB_MUTE,
    title: i18n.getMessage(`${TAB_MUTE}_title`, "(&M)"),
    toggleTitle: i18n.getMessage(`${TAB_MUTE_UNMUTE}_title`, "(&M)"),
    type: "normal",
    contexts: ["tab"],
    viewTypes: ["sidebar"],
    enabled: false,
    visible: true,
  },
  [TABS_MUTE]: {
    id: TABS_MUTE,
    title: i18n.getMessage(`${TABS_MUTE}_title`, "(&M)"),
    toggleTitle: i18n.getMessage(`${TABS_MUTE_UNMUTE}_title`, "(&M)"),
    type: "normal",
    contexts: ["tab"],
    viewTypes: ["sidebar"],
    enabled: false,
    visible: false,
  },
  "sep-1": {
    id: "sep-1",
    type: "separator",
    contexts: ["tab"],
    viewTypes: ["sidebar"],
  },
  [TAB_PIN]: {
    id: TAB_PIN,
    title: i18n.getMessage(`${TAB_PIN}_title`, "(&P)"),
    toggleTitle: i18n.getMessage(`${TAB_PIN_UNPIN}_title`, "(&P)"),
    type: "normal",
    contexts: ["tab"],
    viewTypes: ["sidebar"],
    enabled: false,
    visible: true,
  },
  [TABS_PIN]: {
    id: TABS_PIN,
    title: i18n.getMessage(`${TABS_PIN}_title`, "(&P)"),
    toggleTitle: i18n.getMessage(`${TABS_PIN_UNPIN}_title`, "(&P)"),
    type: "normal",
    contexts: ["tab"],
    viewTypes: ["sidebar"],
    enabled: false,
    visible: false,
  },
  [TAB_BOOKMARK]: {
    id: TAB_BOOKMARK,
    title: i18n.getMessage(`${TAB_BOOKMARK}_title`, "(&B)"),
    type: "normal",
    contexts: ["tab"],
    viewTypes: ["sidebar"],
    enabled: false,
    visible: true,
  },
  [TABS_BOOKMARK]: {
    id: TABS_BOOKMARK,
    title: i18n.getMessage(`${TABS_BOOKMARK}_title`, "(&B)"),
    type: "normal",
    contexts: ["tab"],
    viewTypes: ["sidebar"],
    enabled: false,
    visible: false,
  },
  [TAB_DUPE]: {
    id: TAB_DUPE,
    title: i18n.getMessage(`${TAB_DUPE}_title`, "(&D)"),
    type: "normal",
    contexts: ["tab"],
    viewTypes: ["sidebar"],
    enabled: false,
    visible: true,
  },
  [TABS_DUPE]: {
    id: TABS_DUPE,
    title: i18n.getMessage(`${TABS_DUPE}_title`, "(&D)"),
    type: "normal",
    contexts: ["tab"],
    viewTypes: ["sidebar"],
    enabled: false,
    visible: false,
  },
  [TAB_REOPEN_CONTAINER]: {
    id: TAB_REOPEN_CONTAINER,
    title: i18n.getMessage(`${TAB_REOPEN_CONTAINER}_title`, "(&E)"),
    type: "normal",
    contexts: ["tab"],
    viewTypes: ["sidebar"],
    enabled: false,
    visible: true,
  },
  [TABS_REOPEN_CONTAINER]: {
    id: TABS_REOPEN_CONTAINER,
    title: i18n.getMessage(`${TABS_REOPEN_CONTAINER}_title`, "(&E)"),
    type: "normal",
    contexts: ["tab"],
    viewTypes: ["sidebar"],
    enabled: false,
    visible: false,
  },
  [TAB_MOVE]: {
    id: TAB_MOVE,
    title: i18n.getMessage(`${TAB_MOVE}_title`, "(&V)"),
    type: "normal",
    contexts: ["tab"],
    viewTypes: ["sidebar"],
    enabled: false,
    visible: true,
    subItems: {
      [TAB_MOVE_START]: {
        id: TAB_MOVE_START,
        title: i18n.getMessage(`${TAB_MOVE_START}_title`, "(&S)"),
        type: "normal",
        contexts: ["tab"],
        viewTypes: ["sidebar"],
        enabled: false,
        visible: true,
      },
      [TAB_MOVE_END]: {
        id: TAB_MOVE_END,
        title: i18n.getMessage(`${TAB_MOVE_END}_title`, "(&E)"),
        type: "normal",
        contexts: ["tab"],
        viewTypes: ["sidebar"],
        enabled: false,
        visible: true,
      },
      [TAB_MOVE_WIN]: {
        id: TAB_MOVE_WIN,
        title: i18n.getMessage(`${TAB_MOVE_WIN}_title`, "(&W)"),
        type: "normal",
        contexts: ["tab"],
        viewTypes: ["sidebar"],
        enabled: false,
        visible: true,
      },
    },
  },
  [TABS_MOVE]: {
    id: TABS_MOVE,
    title: i18n.getMessage(`${TABS_MOVE}_title`, "(&V)"),
    type: "normal",
    contexts: ["tab"],
    viewTypes: ["sidebar"],
    enabled: false,
    visible: false,
    subItems: {
      [TABS_MOVE_START]: {
        id: TABS_MOVE_START,
        title: i18n.getMessage(`${TAB_MOVE_START}_title`, "(&S)"),
        type: "normal",
        contexts: ["tab"],
        viewTypes: ["sidebar"],
        enabled: false,
        visible: true,
      },
      [TABS_MOVE_END]: {
        id: TABS_MOVE_END,
        title: i18n.getMessage(`${TAB_MOVE_END}_title`, "(&E)"),
        type: "normal",
        contexts: ["tab"],
        viewTypes: ["sidebar"],
        enabled: false,
        visible: true,
      },
      [TABS_MOVE_WIN]: {
        id: TABS_MOVE_WIN,
        title: i18n.getMessage(`${TABS_MOVE_WIN}_title`, "(&W)"),
        type: "normal",
        contexts: ["tab"],
        viewTypes: ["sidebar"],
        enabled: false,
        visible: true,
      },
    },
  },
  // FIXME: issue #7
  /*
  [TAB_SEND]: {
    id: TAB_SEND,
    title: i18n.getMessage(`${TAB_SEND}_title`, "(&N)"),
    type: "normal",
    contexts: ["tab"],
    viewTypes: ["sidebar"],
    enabled: false,
    visible: false,
  },
  [TABS_SEND]: {
    id: TABS_SEND,
    title: i18n.getMessage(`${TABS_SEND}_title`, "(&N)"),
    type: "normal",
    contexts: ["tab"],
    viewTypes: ["sidebar"],
    enabled: false,
    visible: false,
  },
  */
  "sep-2": {
    id: "sep-2",
    type: "separator",
    contexts: ["tab"],
    viewTypes: ["sidebar"],
  },
  /* all tabs */
  [TAB_ALL_RELOAD]: {
    id: TAB_ALL_RELOAD,
    title: i18n.getMessage(`${TAB_ALL_RELOAD}_title`, "(&L)"),
    type: "normal",
    contexts: ["page", "tab"],
    viewTypes: ["sidebar"],
    enabled: false,
    visible: true,
  },
  [TAB_ALL_SELECT]: {
    id: TAB_ALL_SELECT,
    title: i18n.getMessage(`${TAB_ALL_SELECT}_title`, "(&S)"),
    type: "normal",
    contexts: ["page", "tab"],
    viewTypes: ["sidebar"],
    enabled: false,
    visible: true,
  },
  [TAB_ALL_BOOKMARK]: {
    id: TAB_ALL_BOOKMARK,
    title: i18n.getMessage(`${TAB_ALL_BOOKMARK}_title`, "(&B)"),
    type: "normal",
    contexts: ["page", "tab"],
    viewTypes: ["sidebar"],
    enabled: false,
    visible: false,
  },
  "sep-3": {
    id: "sep-3",
    type: "separator",
    contexts: ["tab"],
    viewTypes: ["sidebar"],
  },
  /* tab group */
  [TAB_GROUP]: {
    id: TAB_GROUP,
    title: i18n.getMessage(`${TAB_GROUP}_title`, "(&G)"),
    type: "normal",
    contexts: ["tab"],
    viewTypes: ["sidebar"],
    enabled: false,
    visible: true,
    subItems: {
      [TAB_GROUP_COLLAPSE]: {
        id: TAB_GROUP_COLLAPSE,
        title: i18n.getMessage(`${TAB_GROUP_COLLAPSE}_title`, "(&E)"),
        toggleTitle: i18n.getMessage(`${TAB_GROUP_EXPAND}_title`, "(&E)"),
        type: "normal",
        contexts: ["tab"],
        viewTypes: ["sidebar"],
        enabled: false,
        visible: true,
      },
      [TAB_GROUP_COLLAPSE_OTHER]: {
        id: TAB_GROUP_COLLAPSE_OTHER,
        title: i18n.getMessage(`${TAB_GROUP_COLLAPSE_OTHER}_title`, "(&O)"),
        type: "normal",
        contexts: ["tab"],
        viewTypes: ["sidebar"],
        enabled: false,
        visible: true,
      },
      "sepTabGroup-1": {
        id: "sepTabGroup-1",
        type: "separator",
        contexts: ["tab"],
        viewTypes: ["sidebar"],
      },
      [TAB_GROUP_SELECTED]: {
        id: TAB_GROUP_SELECTED,
        title: i18n.getMessage(`${TAB_GROUP_SELECTED}_title`, "(&S)"),
        type: "normal",
        contexts: ["tab"],
        viewTypes: ["sidebar"],
        enabled: false,
        visible: true,
      },
      [TAB_GROUP_CONTAINER]: {
        id: TAB_GROUP_CONTAINER,
        title: i18n.getMessage(`${TAB_GROUP_CONTAINER}_title`, "(&C)"),
        type: "normal",
        contexts: ["tab"],
        viewTypes: ["sidebar"],
        enabled: false,
        visible: true,
      },
      [TAB_GROUP_DOMAIN]: {
        id: TAB_GROUP_DOMAIN,
        title: i18n.getMessage(`${TAB_GROUP_DOMAIN}_title`, "(&D)"),
        type: "normal",
        contexts: ["tab"],
        viewTypes: ["sidebar"],
        enabled: false,
        visible: true,
      },
      [TAB_GROUP_DETACH]: {
        id: TAB_GROUP_DETACH,
        title: i18n.getMessage(`${TAB_GROUP_DETACH}_title`, "(&T)"),
        type: "normal",
        contexts: ["tab"],
        viewTypes: ["sidebar"],
        enabled: false,
        visible: true,
      },
      [TAB_GROUP_DETACH_TABS]: {
        id: TAB_GROUP_DETACH_TABS,
        title: i18n.getMessage(`${TAB_GROUP_DETACH_TABS}_title`, "(&T)"),
        type: "normal",
        contexts: ["tab"],
        viewTypes: ["sidebar"],
        enabled: false,
        visible: false,
      },
      [TAB_GROUP_UNGROUP]: {
        id: TAB_GROUP_UNGROUP,
        title: i18n.getMessage(`${TAB_GROUP_UNGROUP}_title`, "(&U)"),
        type: "normal",
        contexts: ["tab"],
        viewTypes: ["sidebar"],
        enabled: false,
        visible: true,
      },
    },
  },
  "sep-4": {
    id: "sep-4",
    type: "separator",
    contexts: ["page", "tab"],
    viewTypes: ["sidebar"],
  },
  [TAB_CLOSE_END]: {
    id: TAB_CLOSE_END,
    title: i18n.getMessage(`${TAB_CLOSE_END}_title`, "(&E)"),
    type: "normal",
    contexts: ["tab"],
    viewTypes: ["sidebar"],
    enabled: false,
    visible: true,
  },
  [TAB_CLOSE_OTHER]: {
    id: TAB_CLOSE_OTHER,
    title: i18n.getMessage(`${TABS_CLOSE_OTHER}_title`, "(&O)"),
    type: "normal",
    contexts: ["tab"],
    viewTypes: ["sidebar"],
    enabled: false,
    visible: true,
  },
  // Not implemented yet in Firefox
  /*
  [TAB_CLOSE_DUPE]: {
    id: TAB_CLOSE_DUPE,
    title: i18n.getMessage(`${TAB_CLOSE_DUPE}_title`, "(&D)"),
    type: "normal",
    contexts: ["tab"],
    viewTypes: ["sidebar"],
    enabled: false,
    visible: true,
  },
  */
  [TABS_CLOSE_OTHER]: {
    id: TABS_CLOSE_OTHER,
    title: i18n.getMessage(`${TABS_CLOSE_OTHER}_title`, "(&O)"),
    type: "normal",
    contexts: ["tab"],
    viewTypes: ["sidebar"],
    enabled: false,
    visible: false,
  },
  [TAB_CLOSE_UNDO]: {
    id: TAB_CLOSE_UNDO,
    title: i18n.getMessage(`${TAB_CLOSE_UNDO}_title`, "(&U)"),
    type: "normal",
    contexts: ["page", "tab"],
    viewTypes: ["sidebar"],
    enabled: false,
    visible: true,
  },
  [TAB_CLOSE]: {
    id: TAB_CLOSE,
    title: i18n.getMessage(`${TAB_CLOSE}_title`, "(&C)"),
    type: "normal",
    contexts: ["tab"],
    viewTypes: ["sidebar"],
    enabled: false,
    visible: true,
  },
  [TABS_CLOSE]: {
    id: TABS_CLOSE,
    title: i18n.getMessage(`${TABS_CLOSE}_title`, "(&U)"),
    type: "normal",
    contexts: ["tab"],
    viewTypes: ["sidebar"],
    enabled: false,
    visible: false,
  },
};
