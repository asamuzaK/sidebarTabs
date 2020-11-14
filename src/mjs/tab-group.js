/**
 * tab-group.js
 */

import {
  addElementContentEditable, getType, isObjectNotEmpty,
  removeElementContentEditable, throwErr
} from './common.js';
import {
  getStorage, getTab, queryTabs
} from './browser.js';
import {
  moveTabsInOrder
} from './browser-tabs.js';
import {
  activateTab, createUrlMatchString, getSidebarTab, getSidebarTabContainer,
  getSidebarTabId, getSidebarTabIndex, getTemplate, setSessionTabList
} from './util.js';

/* constants */
import {
  ACTIVE, CLASS_HEADING, CLASS_HEADING_LABEL, CLASS_HEADING_LABEL_EDIT,
  CLASS_TAB_COLLAPSED, CLASS_TAB_CONTAINER_TMPL, CLASS_TAB_CONTEXT,
  CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, CLASS_UNGROUP,
  HIGHLIGHTED, NEW_TAB, PINNED, TAB_GROUP_COLLAPSE, TAB_GROUP_ENABLE,
  TAB_GROUP_EXPAND, TAB_QUERY
} from './constant.js';

/* api */
const { i18n, windows } = browser;

/**
 * restore sidebar tab containers
 *
 * @returns {void}
 */
export const restoreTabContainers = async () => {
  const items =
    document.querySelectorAll(`.${CLASS_TAB_CONTAINER}:not(#${NEW_TAB})`);
  for (const item of items) {
    const { classList, id, parentNode } = item;
    const tabLength = item.querySelectorAll(TAB_QUERY).length;
    switch (tabLength) {
      case 0:
        id !== PINNED && parentNode.removeChild(item);
        break;
      case 1:
        classList.remove(CLASS_TAB_GROUP);
        break;
      default:
        classList.add(CLASS_TAB_GROUP);
    }
  }
};

/**
 * collapse tab group
 *
 * @param {object} elm - element
 * @param {boolean} activate - activate element
 * @returns {void}
 */
export const collapseTabGroup = async (elm, activate) => {
  const body = document.querySelector('body');
  if (elm && elm.nodeType === Node.ELEMENT_NODE &&
      elm.classList.contains(CLASS_TAB_GROUP) &&
      !body.classList.contains(CLASS_UNGROUP)) {
    const heading = elm.querySelector(`.${CLASS_HEADING}:not([hidden])`);
    const controller = heading || elm.querySelector(TAB_QUERY);
    const { firstElementChild: context } = controller;
    const { firstElementChild: toggleIcon } = context;
    elm.classList.add(CLASS_TAB_COLLAPSED);
    if (heading) {
      if (activate) {
        heading.classList.add(ACTIVE);
      } else {
        heading.classList.remove(ACTIVE);
      }
    }
    context.title = i18n.getMessage(`${TAB_GROUP_EXPAND}_tooltip`);
    toggleIcon.alt = i18n.getMessage(TAB_GROUP_EXPAND);
  }
};

/**
 * expand tab group
 *
 * @param {object} elm - element
 * @returns {void}
 */
export const expandTabGroup = async elm => {
  if (elm && elm.nodeType === Node.ELEMENT_NODE &&
      elm.classList.contains(CLASS_TAB_GROUP)) {
    const heading = elm.querySelector(`.${CLASS_HEADING}:not([hidden])`);
    const controller = heading || elm.querySelector(TAB_QUERY);
    const { firstElementChild: context } = controller;
    const { firstElementChild: toggleIcon } = context;
    elm.classList.remove(CLASS_TAB_COLLAPSED);
    heading && heading.classList.remove(ACTIVE);
    context.title = i18n.getMessage(`${TAB_GROUP_COLLAPSE}_tooltip`);
    toggleIcon.alt = i18n.getMessage(TAB_GROUP_COLLAPSE);
  }
};

/**
 * toggle enable / disable tab grouping
 *
 * @returns {void}
 */
export const toggleTabGrouping = async () => {
  const body = document.querySelector('body');
  const store = await getStorage([TAB_GROUP_ENABLE]);
  let enable;
  if (isObjectNotEmpty(store)) {
    const { enableTabGroup } = store;
    enable = !!enableTabGroup.checked;
  } else {
    enable = true;
  }
  if (enable) {
    body.classList.remove(CLASS_UNGROUP);
  } else {
    const items =
      document.querySelectorAll(`.${CLASS_TAB_CONTAINER}:not(#${NEW_TAB})`);
    const func = [];
    for (const item of items) {
      func.push(expandTabGroup(item));
    }
    await Promise.all(func);
    body.classList.add(CLASS_UNGROUP);
  }
};

/**
 * toggle tab group collapsed state
 *
 * @param {object} elm - element
 * @param {boolean} activate - activate tab
 * @returns {Promise.<Array>} - results of each handler
 */
export const toggleTabGroupCollapsedState = async (elm, activate) => {
  const func = [];
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    const container = getSidebarTabContainer(elm);
    if (container && container.classList.contains(CLASS_TAB_GROUP)) {
      const firstTab = container.querySelector(TAB_QUERY);
      if (container.classList.contains(CLASS_TAB_COLLAPSED)) {
        func.push(expandTabGroup(container));
        if (activate) {
          const tab = getSidebarTab(elm);
          if (tab) {
            func.push(activateTab(tab));
          } else {
            func.push(activateTab(firstTab));
          }
        }
      } else {
        func.push(collapseTabGroup(container, activate));
        activate && func.push(activateTab(firstTab));
      }
    }
  }
  return Promise.all(func);
};

/**
 * toggle multiple tab groups collapsed state
 *
 * @param {object} elm - element
 * @returns {Promise.<Array>} - results of each handler
 */
export const toggleTabGroupsCollapsedState = async elm => {
  const func = [];
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    const container = getSidebarTabContainer(elm);
    if (container && container.classList.contains(CLASS_TAB_GROUP)) {
      const items =
        document.querySelectorAll(`.${CLASS_TAB_CONTAINER}.${CLASS_TAB_GROUP}`);
      for (const item of items) {
        if (item === container) {
          func.push(toggleTabGroupCollapsedState(item, true));
        } else {
          !item.classList.contains(CLASS_TAB_COLLAPSED) &&
            func.push(toggleTabGroupCollapsedState(item, false));
        }
      }
    }
  }
  return Promise.all(func);
};

/**
 * collapse multiple tab groups
 *
 * @param {object} elm - element
 * @returns {Promise.<Array>} - results of each handler
 */
export const collapseTabGroups = async elm => {
  const func = [];
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    const container = getSidebarTabContainer(elm);
    if (container && container.classList.contains(CLASS_TAB_GROUP)) {
      const items =
        document.querySelectorAll(`.${CLASS_TAB_CONTAINER}.${CLASS_TAB_GROUP}`);
      for (const item of items) {
        item !== container && !item.classList.contains(CLASS_TAB_COLLAPSED) &&
          func.push(toggleTabGroupCollapsedState(item, false));
      }
    }
  }
  return Promise.all(func);
};

/**
 * get tab group heading
 *
 * @param {object} node - node
 * @returns {object} - heading element
 */
export const getTabGroupHeading = node => {
  let heading;
  const container = getSidebarTabContainer(node);
  if (container) {
    heading = container.querySelector(`.${CLASS_HEADING}`);
  }
  return heading || null;
};

/**
 * handle individual tab group collapsed state
 *
 * @param {!object} evt - Event
 * @returns {?(Function|Error)} - promise chain
 */
export const handleTabGroupCollapsedState = evt => {
  const { target } = evt;
  const heading = getTabGroupHeading(target);
  const tab = getSidebarTab(target);
  let func;
  if (heading && !heading.hidden) {
    func =
      toggleTabGroupCollapsedState(heading, true).then(setSessionTabList)
        .catch(throwErr);
  } else if (tab) {
    func = toggleTabGroupCollapsedState(tab, true).then(setSessionTabList)
      .catch(throwErr);
  }
  return func || null;
};

/**
 * handle multiple tab groups collapsed state
 *
 * @param {!object} evt - Event
 * @returns {?(Function|Error)} - promise chain
 */
export const handleTabGroupsCollapsedState = evt => {
  const { target } = evt;
  const container = getSidebarTabContainer(target);
  let func;
  if (container) {
    func = toggleTabGroupsCollapsedState(container).then(setSessionTabList)
      .catch(throwErr);
  }
  return func || null;
};

/**
 * add tab context click listener
 *
 * @param {object} elm - element
 * @param {boolean} multi - handle multiple tab groups
 * @returns {void}
 */
export const addTabContextClickListener = (elm, multi) => {
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    if (elm.classList.contains(CLASS_TAB_CONTEXT)) {
      if (multi) {
        elm.addEventListener('click', handleTabGroupsCollapsedState);
        elm.removeEventListener('click', handleTabGroupCollapsedState);
      } else {
        elm.addEventListener('click', handleTabGroupCollapsedState);
        elm.removeEventListener('click', handleTabGroupsCollapsedState);
      }
    } else if (elm.classList.contains(CLASS_HEADING_LABEL)) {
      if (multi) {
        elm.parentNode.dataset.multi = !!multi;
        elm.addEventListener('click', handleTabGroupsCollapsedState);
        elm.removeEventListener('click', handleTabGroupCollapsedState);
      } else {
        delete elm.parentNode.dataset.multi;
        elm.addEventListener('click', handleTabGroupCollapsedState);
        elm.removeEventListener('click', handleTabGroupsCollapsedState);
      }
    }
  }
};

/**
 * replace tab context click listener
 *
 * @param {boolean} multi - handle multiple tab groups
 * @returns {Promise.<Array>} - result of each handler
 */
export const replaceTabContextClickListener = async multi => {
  const contexts = `:not([hidden]) > .${CLASS_TAB_CONTEXT}`;
  const labels = `:not([hidden]) > .${CLASS_HEADING_LABEL}`;
  const items = document.querySelectorAll(`${contexts}, ${labels}`);
  const func = [];
  for (const item of items) {
    func.push(addTabContextClickListener(item, !!multi));
  }
  return Promise.all(func);
};

/**
 * expand activated collapsed tab
 *
 * @returns {?Function} - toggleTabGroupCollapsedState()
 */
export const expandActivatedCollapsedTab = async () => {
  const tab = document.querySelector(`${TAB_QUERY}.${ACTIVE}`);
  let func;
  if (tab) {
    const { parentNode } = tab;
    const firstTab = parentNode.querySelector(TAB_QUERY);
    if (parentNode.classList.contains(CLASS_TAB_COLLAPSED) &&
        firstTab !== tab) {
      func = toggleTabGroupCollapsedState(tab, true);
    }
  }
  return func || null;
};

/**
 * finish editing group label
 *
 * @param {!object} evt - event
 * @returns {?(Function|Error)} - promise chain
 */
export const finishGroupLabelEdit = evt => {
  const { isComposing, key, target, type } = evt;
  let func;
  if (type === 'blur' ||
      (type === 'keydown' && !isComposing && key === 'Enter')) {
    const heading = getTabGroupHeading(target);
    const label = heading && heading.querySelector(`.${CLASS_HEADING_LABEL}`);
    if (label) {
      removeElementContentEditable(label);
      label.removeEventListener('keydown', finishGroupLabelEdit);
      label.removeEventListener('blur', finishGroupLabelEdit);
      if (heading.dataset.multi) {
        label.addEventListener('click', handleTabGroupsCollapsedState);
        label.removeEventListener('click', handleTabGroupCollapsedState);
      } else {
        label.addEventListener('click', handleTabGroupCollapsedState);
        label.removeEventListener('click', handleTabGroupsCollapsedState);
      }
      func = setSessionTabList().catch(throwErr);
      evt.preventDefault();
    }
  }
  return func || null;
};

/**
 * start editing group label
 *
 * @param {object} node - element
 * @returns {object} - group label element
 */
export const startGroupLabelEdit = async node => {
  const heading = getTabGroupHeading(node);
  const label = heading && !heading.hidden && addElementContentEditable(
    heading.querySelector(`.${CLASS_HEADING_LABEL}`)
  );
  if (label) {
    label.focus();
    label.removeEventListener('click', handleTabGroupsCollapsedState);
    label.removeEventListener('click', handleTabGroupCollapsedState);
    label.addEventListener('keydown', finishGroupLabelEdit);
    label.addEventListener('blur', finishGroupLabelEdit);
  }
  return label || null;
};

/**
 * enable editing group label
 *
 * @param {!object} evt - event
 * @returns {(Function|Error)} - promise chain
 */
export const enableGroupLabelEdit = evt => {
  const { target } = evt;
  return startGroupLabelEdit(target).catch(throwErr);
};

/**
 * add listeners to heading items
 *
 * @param {object} node - node;
 * @param {boolean} multi - handle multiple tab groups
 * @returns {void}
 */
export const addListenersToHeadingItems = async (node, multi) => {
  const heading = getTabGroupHeading(node);
  if (heading && !heading.hidden) {
    const context = heading.querySelector(`.${CLASS_TAB_CONTEXT}`);
    const label = heading.querySelector(`.${CLASS_HEADING_LABEL}`);
    const button = heading.querySelector(`.${CLASS_HEADING_LABEL_EDIT}`);
    if (multi) {
      heading.dataset.multi = !!multi;
    } else {
      delete heading.dataset.multi;
    }
    context && addTabContextClickListener(context, !!multi);
    label && addTabContextClickListener(label, !!multi);
    button && button.addEventListener('click', enableGroupLabelEdit);
  }
};

/**
 * remove listeners from heading items
 *
 * @param {object} node - node;
 * @returns {void}
 */
export const removeListenersFromHeadingItems = async node => {
  const heading = getTabGroupHeading(node);
  if (heading && heading.hidden) {
    const context = heading.querySelector(`.${CLASS_TAB_CONTEXT}`);
    const label = heading.querySelector(`.${CLASS_HEADING_LABEL}`);
    const button = heading.querySelector(`.${CLASS_HEADING_LABEL_EDIT}`);
    delete heading.dataset.multi;
    if (label) {
      removeElementContentEditable(label);
      label.removeEventListener('keydown', finishGroupLabelEdit);
      label.removeEventListener('blur', finishGroupLabelEdit);
    }
    if (context) {
      context.removeEventListener('click', handleTabGroupsCollapsedState);
      context.removeEventListener('click', handleTabGroupCollapsedState);
    }
    button && button.removeEventListener('click', enableGroupLabelEdit);
  }
};

/**
 * toggle tab group heading state
 *
 * @param {object} node - node
 * @param {boolean} multi - handle multiple tab groups
 * @returns {Promise.<Array>} - results of each handler
 */
export const toggleTabGroupHeadingState = async (node, multi) => {
  const func = [];
  const heading = getTabGroupHeading(node);
  if (heading) {
    if (heading.hidden) {
      heading.hidden = false;
      func.push(
        addListenersToHeadingItems(heading, !!multi),
        startGroupLabelEdit(heading)
      );
    } else {
      heading.hidden = true;
      func.push(removeListenersFromHeadingItems(heading));
    }
  }
  return Promise.all(func);
};

/**
 * detach tabs from tab group
 *
 * @param {Array} nodes - array of node
 * @param {number} windowId - window ID
 * @returns {?Function} - moveTabsInOrder()
 */
export const detachTabsFromGroup = async (nodes, windowId) => {
  if (!Array.isArray(nodes)) {
    throw new TypeError(`Expected Array but got ${getType(nodes)}.`);
  }
  let func;
  const revArr = nodes.reverse();
  const arr = [];
  if (!Number.isInteger(windowId)) {
    windowId = windows.WINDOW_ID_CURRENT;
  }
  for (const item of revArr) {
    const itemId = getSidebarTabId(item);
    if (Number.isInteger(itemId)) {
      const { parentNode } = item;
      if (parentNode.classList.contains(CLASS_TAB_GROUP) &&
          !parentNode.classList.contains(PINNED)) {
        const {
          lastElementChild: parentLastChild,
          nextElementSibling: parentNextSibling
        } = parentNode;
        const move = item !== parentLastChild;
        const container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
        const itemIndex = getSidebarTabIndex(item);
        container.appendChild(item);
        container.removeAttribute('hidden');
        parentNode.parentNode.insertBefore(container, parentNextSibling);
        move && arr.push({
          index: itemIndex,
          tabId: itemId
        });
      }
    }
  }
  if (arr.length) {
    func = moveTabsInOrder(arr, windowId);
  }
  return func || null;
};

/**
 * group selected tabs
 *
 * @param {number} windowId - window ID
 * @returns {?Function} - moveTabsInOrder()
 */
export const groupSelectedTabs = async windowId => {
  const selectedTabs =
    document.querySelectorAll(`${TAB_QUERY}.${HIGHLIGHTED}:not(.${PINNED})`);
  let func;
  if (selectedTabs.length > 1) {
    const [tab] = selectedTabs;
    const tabId = getSidebarTabId(tab);
    const arr = [];
    let container;
    if (tab.parentNode.classList.contains(CLASS_TAB_GROUP)) {
      const tabParent = tab.parentNode;
      container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
      container.appendChild(tab);
      container.removeAttribute('hidden');
      tabParent.parentNode.insertBefore(container,
        tabParent.nextElementSibling);
    } else {
      container = tab.parentNode;
    }
    for (const item of selectedTabs) {
      const itemId = getSidebarTabId(item);
      let itemIndex;
      item.dataset.group = tabId;
      if (item === tab) {
        itemIndex = getSidebarTabIndex(item);
      } else {
        container.appendChild(item);
        itemIndex = getSidebarTabIndex(item);
      }
      arr.push({
        index: itemIndex,
        tabId: itemId
      });
    }
    if (!Number.isInteger(windowId)) {
      windowId = windows.WINDOW_ID_CURRENT;
    }
    func = moveTabsInOrder(arr, windowId);
  }
  return func || null;
};

/**
 * group same container tabs
 *
 * @param {number} tabId - tab ID
 * @param {number} windowId - window ID
 * @returns {?Function} - moveTabsInOrder()
 */
export const groupSameContainerTabs = async (tabId, windowId) => {
  if (!Number.isInteger(tabId)) {
    throw new TypeError(`Expected Number but got ${getType(tabId)}.`);
  }
  const tabsTab = await getTab(tabId);
  const { cookieStoreId } = tabsTab;
  if (!Number.isInteger(windowId)) {
    windowId = windows.WINDOW_ID_CURRENT;
  }
  const items = await queryTabs({
    cookieStoreId,
    windowId,
    pinned: false
  });
  let func;
  if (Array.isArray(items) && items.length > 1) {
    const tab = document.querySelector(`[data-tab-id="${tabId}"]`);
    const tabParent = tab.parentNode;
    const containerTabs = [];
    const arr = [];
    let container;
    if (tabParent.classList.contains(CLASS_TAB_GROUP)) {
      container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
      container.appendChild(tab);
      container.removeAttribute('hidden');
      tabParent.parentNode.insertBefore(container,
        tabParent.nextElementSibling);
      containerTabs.push([tab, tabId]);
    } else {
      container = tabParent;
    }
    for (const item of items) {
      const { id: itemId } = item;
      if (itemId !== tabId) {
        const itemTab = document.querySelector(`[data-tab-id="${itemId}"]`);
        itemTab.dataset.group = tabId;
        container.appendChild(itemTab);
        containerTabs.push([itemTab, itemId]);
      }
    }
    for (const [itemTab, itemId] of containerTabs) {
      const itemIndex = getSidebarTabIndex(itemTab);
      arr.push({
        index: itemIndex,
        tabId: itemId
      });
    }
    func = moveTabsInOrder(arr, windowId);
  }
  return func || null;
};

/**
 * group same domain tabs
 *
 * @param {number} tabId - tab ID
 * @param {number} windowId - window ID
 * @returns {?Function} - moveTabsInOrder()
 */
export const groupSameDomainTabs = async (tabId, windowId) => {
  if (!Number.isInteger(tabId)) {
    throw new TypeError(`Expected Number but got ${getType(tabId)}.`);
  }
  const tabsTab = await getTab(tabId);
  const { url: tabUrl } = tabsTab;
  const url = createUrlMatchString(tabUrl);
  if (!Number.isInteger(windowId)) {
    windowId = windows.WINDOW_ID_CURRENT;
  }
  const items = await queryTabs({
    url,
    windowId,
    pinned: false
  });
  let func;
  if (Array.isArray(items) && items.length > 1) {
    const tab = document.querySelector(`[data-tab-id="${tabId}"]`);
    const tabParent = tab.parentNode;
    const domainTabs = [];
    const arr = [];
    let container;
    if (tabParent.classList.contains(CLASS_TAB_GROUP)) {
      container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
      container.appendChild(tab);
      container.removeAttribute('hidden');
      tabParent.parentNode.insertBefore(container,
        tabParent.nextElementSibling);
      domainTabs.push([tab, tabId]);
    } else {
      container = tabParent;
    }
    for (const item of items) {
      const { id: itemId } = item;
      if (itemId !== tabId) {
        const itemTab = document.querySelector(`[data-tab-id="${itemId}"]`);
        itemTab.dataset.group = tabId;
        container.appendChild(itemTab);
        domainTabs.push([itemTab, itemId]);
      }
    }
    for (const [itemTab, itemId] of domainTabs) {
      const itemIndex = getSidebarTabIndex(itemTab);
      arr.push({
        index: itemIndex,
        tabId: itemId
      });
    }
    func = moveTabsInOrder(arr, windowId);
  }
  return func || null;
};

/**
 * ungroup tabs
 *
 * @param {object} node - tab group container
 * @returns {void}
 */
export const ungroupTabs = async node => {
  if (node && node.nodeType === Node.ELEMENT_NODE) {
    const { id, classList, parentNode } = node;
    if (id !== PINNED && classList.contains(CLASS_TAB_GROUP)) {
      const items = node.querySelectorAll(TAB_QUERY);
      for (const item of items) {
        const container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
        container.appendChild(item);
        container.removeAttribute('hidden');
        parentNode.insertBefore(container, node);
      }
    }
  }
};
