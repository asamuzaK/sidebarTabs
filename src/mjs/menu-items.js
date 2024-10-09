/**
 * menu-item.js
 */

/* shared */
import {
  NEW_TAB_OPEN_CONTAINER, NEW_TAB_OPEN_NO_CONTAINER, OPTIONS_OPEN,
  TAB_ALL_BOOKMARK, TAB_ALL_RELOAD, TAB_ALL_SELECT,
  TAB_BOOKMARK, TAB_CLOSE, TAB_CLOSE_DUPE, TAB_CLOSE_UNDO, TAB_DUPE,
  TAB_GROUP, TAB_GROUP_BOOKMARK, TAB_GROUP_CLOSE, TAB_GROUP_COLLAPSE,
  TAB_GROUP_COLLAPSE_OTHER, TAB_GROUP_CONTAINER, TAB_GROUP_DETACH,
  TAB_GROUP_DETACH_TABS, TAB_GROUP_DOMAIN, TAB_GROUP_EXPAND,
  TAB_GROUP_LABEL_HIDE, TAB_GROUP_LABEL_SHOW, TAB_GROUP_SELECTED,
  TAB_GROUP_UNGROUP,
  TAB_MOVE, TAB_MOVE_END, TAB_MOVE_START, TAB_MOVE_WIN, TAB_MUTE,
  TAB_MUTE_UNMUTE, TAB_NEW, TAB_PIN, TAB_PIN_UNPIN, TAB_RELOAD,
  TAB_REOPEN_CONTAINER, TAB_REOPEN_NO_CONTAINER,
  TABS_BOOKMARK, TABS_CLOSE, TABS_CLOSE_DUPE, TABS_CLOSE_END,
  TABS_CLOSE_MULTIPLE, TABS_CLOSE_OTHER, TABS_CLOSE_START, TABS_DUPE,
  TABS_MOVE, TABS_MOVE_END, TABS_MOVE_START, TABS_MOVE_WIN, TABS_MUTE,
  TABS_MUTE_UNMUTE, TABS_PIN, TABS_PIN_UNPIN, TABS_RELOAD,
  TABS_REOPEN_CONTAINER, TABS_REOPEN_NO_CONTAINER
} from './constant.js';

/* api */
const { i18n } = browser;

/* context menu items */
export default {
  /* action */
  [OPTIONS_OPEN]: {
    id: OPTIONS_OPEN,
    title: i18n.getMessage(`${OPTIONS_OPEN}_menu`, '(&T)'),
    type: 'normal',
    contexts: ['action']
  },
  /* new tab */
  [NEW_TAB_OPEN_CONTAINER]: {
    id: NEW_TAB_OPEN_CONTAINER,
    title: i18n.getMessage(`${NEW_TAB_OPEN_CONTAINER}_menu`, '(&E)'),
    type: 'normal',
    contexts: ['page'],
    viewTypes: ['sidebar'],
    enabled: false,
    visible: false,
    subItems: {
      [NEW_TAB_OPEN_NO_CONTAINER]: {
        id: NEW_TAB_OPEN_NO_CONTAINER,
        title: i18n.getMessage(`${NEW_TAB_OPEN_NO_CONTAINER}_menu`, '(&N)'),
        type: 'normal',
        contexts: ['page'],
        viewTypes: ['sidebar'],
        enabled: true,
        visible: true
      },
      'sepNewContainer-1': {
        id: 'sepNewContainer-1',
        type: 'separator',
        contexts: ['page'],
        viewTypes: ['sidebar'],
        visible: true
      }
    }
  },
  'sep-0': {
    id: 'sep-0',
    type: 'separator',
    contexts: ['page'],
    viewTypes: ['sidebar']
  },
  /* tab */
  [TAB_NEW]: {
    id: TAB_NEW,
    title: i18n.getMessage(`${TAB_NEW}_menu`, '(&W)'),
    type: 'normal',
    contexts: ['tab'],
    viewTypes: ['sidebar'],
    enabled: true,
    visible: true
  },
  'sep-1': {
    id: 'sep-1',
    type: 'separator',
    contexts: ['tab'],
    viewTypes: ['sidebar']
  },
  [TAB_RELOAD]: {
    id: TAB_RELOAD,
    title: i18n.getMessage(`${TAB_RELOAD}_menu`, '(&R)'),
    type: 'normal',
    contexts: ['tab'],
    viewTypes: ['sidebar'],
    enabled: false,
    visible: true
  },
  [TABS_RELOAD]: {
    id: TABS_RELOAD,
    title: i18n.getMessage(`${TABS_RELOAD}_menu`, '(&R)'),
    type: 'normal',
    contexts: ['tab'],
    viewTypes: ['sidebar'],
    enabled: false,
    visible: false
  },
  [TAB_MUTE]: {
    id: TAB_MUTE,
    title: i18n.getMessage(`${TAB_MUTE}_menu`, '(&M)'),
    toggleTitle: i18n.getMessage(`${TAB_MUTE_UNMUTE}_menu`, '(&M)'),
    type: 'normal',
    contexts: ['tab'],
    viewTypes: ['sidebar'],
    enabled: false,
    visible: true
  },
  [TABS_MUTE]: {
    id: TABS_MUTE,
    title: i18n.getMessage(`${TABS_MUTE}_menu`, '(&M)'),
    toggleTitle: i18n.getMessage(`${TABS_MUTE_UNMUTE}_menu`, '(&M)'),
    type: 'normal',
    contexts: ['tab'],
    viewTypes: ['sidebar'],
    enabled: false,
    visible: false
  },
  [TAB_PIN]: {
    id: TAB_PIN,
    title: i18n.getMessage(`${TAB_PIN}_menu`, '(&P)'),
    toggleTitle: i18n.getMessage(`${TAB_PIN_UNPIN}_menu`, '(&P)'),
    type: 'normal',
    contexts: ['tab'],
    viewTypes: ['sidebar'],
    enabled: false,
    visible: true
  },
  [TABS_PIN]: {
    id: TABS_PIN,
    title: i18n.getMessage(`${TABS_PIN}_menu`, '(&P)'),
    toggleTitle: i18n.getMessage(`${TABS_PIN_UNPIN}_menu`, '(&P)'),
    type: 'normal',
    contexts: ['tab'],
    viewTypes: ['sidebar'],
    enabled: false,
    visible: false
  },
  [TAB_DUPE]: {
    id: TAB_DUPE,
    title: i18n.getMessage(`${TAB_DUPE}_menu`, '(&D)'),
    type: 'normal',
    contexts: ['tab'],
    viewTypes: ['sidebar'],
    enabled: false,
    visible: true
  },
  [TABS_DUPE]: {
    id: TABS_DUPE,
    title: i18n.getMessage(`${TABS_DUPE}_menu`, '(&D)'),
    type: 'normal',
    contexts: ['tab'],
    viewTypes: ['sidebar'],
    enabled: false,
    visible: false
  },
  'sep-2': {
    id: 'sep-2',
    type: 'separator',
    contexts: ['tab'],
    viewTypes: ['sidebar']
  },
  [TAB_BOOKMARK]: {
    id: TAB_BOOKMARK,
    title: i18n.getMessage(`${TAB_BOOKMARK}_menu`, '(&B)'),
    type: 'normal',
    contexts: ['tab'],
    viewTypes: ['sidebar'],
    enabled: false,
    visible: true
  },
  [TABS_BOOKMARK]: {
    id: TABS_BOOKMARK,
    title: i18n.getMessage(`${TABS_BOOKMARK}_menu`, '(&B)'),
    type: 'normal',
    contexts: ['tab'],
    viewTypes: ['sidebar'],
    enabled: false,
    visible: false
  },
  [TAB_MOVE]: {
    id: TAB_MOVE,
    title: i18n.getMessage(`${TAB_MOVE}_menu`, '(&V)'),
    type: 'normal',
    contexts: ['tab'],
    viewTypes: ['sidebar'],
    enabled: false,
    visible: true,
    subItems: {
      [TAB_MOVE_START]: {
        id: TAB_MOVE_START,
        title: i18n.getMessage(`${TAB_MOVE_START}_menu`, '(&S)'),
        type: 'normal',
        contexts: ['tab'],
        viewTypes: ['sidebar'],
        enabled: false,
        visible: true
      },
      [TAB_MOVE_END]: {
        id: TAB_MOVE_END,
        title: i18n.getMessage(`${TAB_MOVE_END}_menu`, '(&E)'),
        type: 'normal',
        contexts: ['tab'],
        viewTypes: ['sidebar'],
        enabled: false,
        visible: true
      },
      [TAB_MOVE_WIN]: {
        id: TAB_MOVE_WIN,
        title: i18n.getMessage(`${TAB_MOVE_WIN}_menu`, '(&W)'),
        type: 'normal',
        contexts: ['tab'],
        viewTypes: ['sidebar'],
        enabled: false,
        visible: true
      }
    }
  },
  [TABS_MOVE]: {
    id: TABS_MOVE,
    title: i18n.getMessage(`${TABS_MOVE}_menu`, '(&V)'),
    type: 'normal',
    contexts: ['tab'],
    viewTypes: ['sidebar'],
    enabled: false,
    visible: false,
    subItems: {
      [TABS_MOVE_START]: {
        id: TABS_MOVE_START,
        title: i18n.getMessage(`${TABS_MOVE_START}_menu`, '(&S)'),
        type: 'normal',
        contexts: ['tab'],
        viewTypes: ['sidebar'],
        enabled: false,
        visible: true
      },
      [TABS_MOVE_END]: {
        id: TABS_MOVE_END,
        title: i18n.getMessage(`${TABS_MOVE_END}_menu`, '(&E)'),
        type: 'normal',
        contexts: ['tab'],
        viewTypes: ['sidebar'],
        enabled: false,
        visible: true
      },
      [TABS_MOVE_WIN]: {
        id: TABS_MOVE_WIN,
        title: i18n.getMessage(`${TABS_MOVE_WIN}_menu`, '(&W)'),
        type: 'normal',
        contexts: ['tab'],
        viewTypes: ['sidebar'],
        enabled: false,
        visible: true
      }
    }
  },
  [TAB_REOPEN_CONTAINER]: {
    id: TAB_REOPEN_CONTAINER,
    title: i18n.getMessage(`${TAB_REOPEN_CONTAINER}_menu`, '(&E)'),
    type: 'normal',
    contexts: ['tab'],
    viewTypes: ['sidebar'],
    enabled: false,
    visible: true,
    subItems: {
      [TAB_REOPEN_NO_CONTAINER]: {
        id: TAB_REOPEN_NO_CONTAINER,
        title: i18n.getMessage(`${TAB_REOPEN_NO_CONTAINER}_menu`, '(&N)'),
        type: 'normal',
        contexts: ['tab'],
        viewTypes: ['sidebar'],
        enabled: true,
        visible: true
      },
      'sepReopenContainer-1': {
        id: 'sepReopenContainer-1',
        type: 'separator',
        contexts: ['tab'],
        viewTypes: ['sidebar'],
        visible: true
      }
    }
  },
  [TABS_REOPEN_CONTAINER]: {
    id: TABS_REOPEN_CONTAINER,
    title: i18n.getMessage(`${TABS_REOPEN_CONTAINER}_menu`, '(&E)'),
    type: 'normal',
    contexts: ['tab'],
    viewTypes: ['sidebar'],
    enabled: false,
    visible: false,
    subItems: {
      [TABS_REOPEN_NO_CONTAINER]: {
        id: TABS_REOPEN_NO_CONTAINER,
        title: i18n.getMessage(`${TABS_REOPEN_NO_CONTAINER}_menu`, '(&N)'),
        type: 'normal',
        contexts: ['tab'],
        viewTypes: ['sidebar'],
        enabled: true,
        visible: true
      },
      'sepReopenContainer-2': {
        id: 'sepReopenContainer-2',
        type: 'separator',
        contexts: ['tab'],
        viewTypes: ['sidebar']
      }
    }
  },
  /* all tabs */
  [TAB_ALL_RELOAD]: {
    id: TAB_ALL_RELOAD,
    title: i18n.getMessage(`${TAB_ALL_RELOAD}_menu`, '(&L)'),
    type: 'normal',
    contexts: ['page', 'tab'],
    viewTypes: ['sidebar'],
    enabled: false,
    visible: true
  },
  [TAB_ALL_BOOKMARK]: {
    id: TAB_ALL_BOOKMARK,
    title: i18n.getMessage(`${TAB_ALL_BOOKMARK}_menu`, '(&B)'),
    type: 'normal',
    contexts: ['page', 'tab'],
    viewTypes: ['sidebar'],
    enabled: false,
    visible: false
  },
  [TAB_ALL_SELECT]: {
    id: TAB_ALL_SELECT,
    title: i18n.getMessage(`${TAB_ALL_SELECT}_menu`, '(&S)'),
    type: 'normal',
    contexts: ['page', 'tab'],
    viewTypes: ['sidebar'],
    enabled: false,
    visible: true
  },
  'sep-3': {
    id: 'sep-3',
    type: 'separator',
    contexts: ['tab'],
    viewTypes: ['sidebar']
  },
  /* tab group */
  [TAB_GROUP]: {
    id: TAB_GROUP,
    title: i18n.getMessage(`${TAB_GROUP}_menu`, '(&G)'),
    type: 'normal',
    contexts: ['tab'],
    viewTypes: ['sidebar'],
    enabled: false,
    visible: true,
    subItems: {
      [TAB_GROUP_COLLAPSE]: {
        id: TAB_GROUP_COLLAPSE,
        title: i18n.getMessage(`${TAB_GROUP_COLLAPSE}_menu`, '(&E)'),
        toggleTitle: i18n.getMessage(`${TAB_GROUP_EXPAND}_menu`, '(&E)'),
        type: 'normal',
        contexts: ['tab'],
        viewTypes: ['sidebar'],
        enabled: false,
        visible: true
      },
      [TAB_GROUP_COLLAPSE_OTHER]: {
        id: TAB_GROUP_COLLAPSE_OTHER,
        title: i18n.getMessage(`${TAB_GROUP_COLLAPSE_OTHER}_menu`, '(&O)'),
        type: 'normal',
        contexts: ['tab'],
        viewTypes: ['sidebar'],
        enabled: false,
        visible: true
      },
      'sepTabGroup-1': {
        id: 'sepTabGroup-1',
        type: 'separator',
        contexts: ['tab'],
        viewTypes: ['sidebar']
      },
      [TAB_GROUP_LABEL_SHOW]: {
        id: TAB_GROUP_LABEL_SHOW,
        title: i18n.getMessage(`${TAB_GROUP_LABEL_SHOW}_menu`, '(&L)'),
        toggleTitle: i18n.getMessage(`${TAB_GROUP_LABEL_HIDE}_menu`, '(&L)'),
        type: 'normal',
        contexts: ['tab'],
        viewTypes: ['sidebar'],
        enabled: false,
        visible: true
      },
      'sepTabGroup-2': {
        id: 'sepTabGroup-2',
        type: 'separator',
        contexts: ['tab'],
        viewTypes: ['sidebar']
      },
      [TAB_GROUP_BOOKMARK]: {
        id: TAB_GROUP_BOOKMARK,
        title: i18n.getMessage(`${TAB_GROUP_BOOKMARK}_menu`, '(&B)'),
        type: 'normal',
        contexts: ['tab'],
        viewTypes: ['sidebar'],
        enabled: false,
        visible: true
      },
      [TAB_GROUP_SELECTED]: {
        id: TAB_GROUP_SELECTED,
        title: i18n.getMessage(`${TAB_GROUP_SELECTED}_menu`, '(&S)'),
        type: 'normal',
        contexts: ['tab'],
        viewTypes: ['sidebar'],
        enabled: false,
        visible: true
      },
      [TAB_GROUP_CONTAINER]: {
        id: TAB_GROUP_CONTAINER,
        title: i18n.getMessage(`${TAB_GROUP_CONTAINER}_menu`, '(&N)'),
        type: 'normal',
        contexts: ['tab'],
        viewTypes: ['sidebar'],
        enabled: false,
        visible: true
      },
      [TAB_GROUP_DOMAIN]: {
        id: TAB_GROUP_DOMAIN,
        title: i18n.getMessage(`${TAB_GROUP_DOMAIN}_menu`, '(&D)'),
        type: 'normal',
        contexts: ['tab'],
        viewTypes: ['sidebar'],
        enabled: false,
        visible: true
      },
      [TAB_GROUP_DETACH]: {
        id: TAB_GROUP_DETACH,
        title: i18n.getMessage(`${TAB_GROUP_DETACH}_menu`, '(&T)'),
        type: 'normal',
        contexts: ['tab'],
        viewTypes: ['sidebar'],
        enabled: false,
        visible: true
      },
      [TAB_GROUP_DETACH_TABS]: {
        id: TAB_GROUP_DETACH_TABS,
        title: i18n.getMessage(`${TAB_GROUP_DETACH_TABS}_menu`, '(&T)'),
        type: 'normal',
        contexts: ['tab'],
        viewTypes: ['sidebar'],
        enabled: false,
        visible: false
      },
      [TAB_GROUP_UNGROUP]: {
        id: TAB_GROUP_UNGROUP,
        title: i18n.getMessage(`${TAB_GROUP_UNGROUP}_menu`, '(&U)'),
        type: 'normal',
        contexts: ['tab'],
        viewTypes: ['sidebar'],
        enabled: false,
        visible: true
      },
      'sepTabGroup-3': {
        id: 'sepTabGroup-3',
        type: 'separator',
        contexts: ['tab'],
        viewTypes: ['sidebar']
      },
      [TAB_GROUP_CLOSE]: {
        id: TAB_GROUP_CLOSE,
        title: i18n.getMessage(`${TAB_GROUP_CLOSE}_menu`, '(&C)'),
        type: 'normal',
        contexts: ['tab'],
        viewTypes: ['sidebar'],
        enabled: false,
        visible: true
      }
    }
  },
  'sep-4': {
    id: 'sep-4',
    type: 'separator',
    contexts: ['page', 'tab'],
    viewTypes: ['sidebar']
  },
  /* close */
  [TAB_CLOSE]: {
    id: TAB_CLOSE,
    title: i18n.getMessage(`${TAB_CLOSE}_menu`, '(&C)'),
    type: 'normal',
    contexts: ['tab'],
    viewTypes: ['sidebar'],
    enabled: false,
    visible: true
  },
  [TABS_CLOSE]: {
    id: TABS_CLOSE,
    // NOTE: title will be replaced in main.js prepareTabMenuItems()
    // i18n.getMessage(`${TABS_CLOSE}_menu`, ['$NUM$', '(&C)'])
    title: null,
    type: 'normal',
    contexts: ['tab'],
    viewTypes: ['sidebar'],
    enabled: false,
    visible: false
  },
  [TAB_CLOSE_DUPE]: {
    id: TAB_CLOSE_DUPE,
    title: i18n.getMessage(`${TAB_CLOSE_DUPE}_menu`, '(&U)'),
    type: 'normal',
    contexts: ['tab'],
    viewTypes: ['sidebar'],
    enabled: false,
    visible: false
  },
  [TABS_CLOSE_DUPE]: {
    id: TABS_CLOSE_DUPE,
    // NOTE: title will be replaced in main.js prepareTabMenuItems()
    // i18n.getMessage(`${TABS_CLOSE_DUPE}_menu`, ['$NUM$', '(&U)'])
    title: null,
    type: 'normal',
    contexts: ['tab'],
    viewTypes: ['sidebar'],
    enabled: false,
    visible: false
  },
  [TABS_CLOSE_MULTIPLE]: {
    id: TABS_CLOSE_MULTIPLE,
    title: i18n.getMessage(`${TABS_CLOSE_MULTIPLE}_menu`, '(&M)'),
    type: 'normal',
    contexts: ['tab'],
    viewTypes: ['sidebar'],
    enabled: true,
    visible: true,
    subItems: {
      [TABS_CLOSE_START]: {
        id: TABS_CLOSE_START,
        title: i18n.getMessage(`${TABS_CLOSE_START}_menu`, '(&L)'),
        type: 'normal',
        contexts: ['tab'],
        viewTypes: ['sidebar'],
        enabled: false,
        visible: true
      },
      [TABS_CLOSE_END]: {
        id: TABS_CLOSE_END,
        title: i18n.getMessage(`${TABS_CLOSE_END}_menu`, '(&I)'),
        type: 'normal',
        contexts: ['tab'],
        viewTypes: ['sidebar'],
        enabled: false,
        visible: true
      },
      [TABS_CLOSE_OTHER]: {
        id: TABS_CLOSE_OTHER,
        title: i18n.getMessage(`${TABS_CLOSE_OTHER}_menu`, '(&O)'),
        type: 'normal',
        contexts: ['tab'],
        viewTypes: ['sidebar'],
        enabled: false,
        visible: false
      }
    }
  },
  [TAB_CLOSE_UNDO]: {
    id: TAB_CLOSE_UNDO,
    title: i18n.getMessage(`${TAB_CLOSE_UNDO}_menu`, '(&O)'),
    type: 'normal',
    contexts: ['page', 'tab'],
    viewTypes: ['sidebar'],
    enabled: false,
    visible: true
  }
};
