/**
 * tab-group.js
 */

/* shared */
import { bookmarkTabs } from './bookmark.js';
import { getStorage, getTab, queryTabs } from './browser.js';
import { closeTabs, highlightTabs, moveTabsInOrder } from './browser-tabs.js';
import {
  addElementContentEditable, getType, isObjectNotEmpty,
  removeElementContentEditable, throwErr
} from './common.js';
import { requestSaveSession } from './session.js';
import { handleDragLeave, handleDragOver, handleDrop } from './tab-dnd.js';
import {
  activateTab, createUrlMatchString, getSidebarTab, getSidebarTabContainer,
  getSidebarTabId, getSidebarTabIndex, getTemplate
} from './util.js';
import {
  ACTIVE,
  CLASS_COLLAPSE_AUTO, CLASS_GROUP, CLASS_HEADING, CLASS_HEADING_LABEL,
  CLASS_HEADING_LABEL_EDIT, CLASS_TAB_COLLAPSED, CLASS_TAB_CONTAINER_TMPL,
  CLASS_TAB_CONTEXT, CLASS_TAB_CONTAINER, CLASS_TAB_GROUP, CLASS_UNGROUP,
  HIGHLIGHTED, NEW_TAB, PINNED, TAB_GROUP_COLLAPSE, TAB_GROUP_ENABLE,
  TAB_GROUP_EXPAND, TAB_GROUP_LABEL_EDIT, TAB_QUERY
} from './constant.js';

/* api */
const { i18n, windows } = browser;

/**
 * restore sidebar tab containers
 * @returns {Promise.<void>} - void
 */
export const restoreTabContainers = async () => {
  const body = document.querySelector('body');
  const items =
    document.querySelectorAll(`.${CLASS_TAB_CONTAINER}:not(#${NEW_TAB})`);
  let group;
  for (const item of items) {
    const { classList, id, parentNode } = item;
    const tabLength = item.querySelectorAll(TAB_QUERY).length;
    switch (tabLength) {
      case 0: {
        if (id !== PINNED) {
          parentNode.removeChild(item);
        }
        break;
      }
      case 1: {
        classList.remove(CLASS_TAB_GROUP);
        break;
      }
      default: {
        classList.add(CLASS_TAB_GROUP);
        group = true;
      }
    }
  }
  if (group) {
    body.classList.add(CLASS_GROUP);
  } else {
    body.classList.remove(CLASS_GROUP);
  }
};

/**
 * collapse tab group
 * @param {object} [elm] - element
 * @param {boolean} [activate] - activate element
 * @returns {void}
 */
export const collapseTabGroup = (elm, activate) => {
  const body = document.querySelector('body');
  if (elm?.nodeType === Node.ELEMENT_NODE &&
      elm?.classList.contains(CLASS_TAB_GROUP) &&
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
 * @param {object} [elm] - element
 * @returns {void}
 */
export const expandTabGroup = elm => {
  if (elm?.nodeType === Node.ELEMENT_NODE &&
      elm?.classList.contains(CLASS_TAB_GROUP)) {
    const heading = elm.querySelector(`.${CLASS_HEADING}:not([hidden])`);
    const controller = heading || elm.querySelector(TAB_QUERY);
    const { firstElementChild: context } = controller;
    const { firstElementChild: toggleIcon } = context;
    elm.classList.remove(CLASS_TAB_COLLAPSED);
    heading?.classList.remove(ACTIVE);
    context.title = i18n.getMessage(`${TAB_GROUP_COLLAPSE}_tooltip`);
    toggleIcon.alt = i18n.getMessage(TAB_GROUP_COLLAPSE);
  }
};

/**
 * toggle enable / disable tab grouping
 * @returns {Promise.<Array>} - results of each handler
 */
export const toggleTabGrouping = async () => {
  const body = document.querySelector('body');
  const items =
    document.querySelectorAll(`.${CLASS_TAB_CONTAINER}:not(#${NEW_TAB})`);
  const store = await getStorage([TAB_GROUP_ENABLE]);
  const func = [];
  let enable;
  if (isObjectNotEmpty(store)) {
    const { enableTabGroup } = store;
    enable = !!enableTabGroup.checked;
  } else {
    enable = true;
  }
  if (enable) {
    body.classList.remove(CLASS_UNGROUP);
    for (const item of items) {
      const { classList } = item;
      if (classList.contains(CLASS_TAB_COLLAPSED)) {
        func.push(collapseTabGroup(item));
      } else {
        func.push(expandTabGroup(item));
      }
    }
  } else {
    body.classList.add(CLASS_UNGROUP);
    for (const item of items) {
      func.push(expandTabGroup(item));
    }
  }
  return Promise.all(func);
};

/**
 * toggle tab group collapsed state
 * @param {object} [elm] - element
 * @param {boolean} [activate] - activate tab
 * @returns {Promise.<Array>} - results of each handler
 */
export const toggleTabGroupCollapsedState = async (elm, activate) => {
  const func = [];
  if (elm?.nodeType === Node.ELEMENT_NODE) {
    const container = getSidebarTabContainer(elm);
    if (container?.classList.contains(CLASS_TAB_GROUP)) {
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
        if (activate) {
          func.push(activateTab(firstTab));
        }
      }
    }
  }
  return Promise.all(func);
};

/**
 * toggle multiple tab groups collapsed state
 * @param {object} [elm] - element
 * @returns {Promise.<Array>} - results of each handler
 */
export const toggleTabGroupsCollapsedState = async elm => {
  const func = [];
  if (elm?.nodeType === Node.ELEMENT_NODE) {
    const container = getSidebarTabContainer(elm);
    if (container?.classList.contains(CLASS_TAB_GROUP)) {
      const items =
        document.querySelectorAll(`.${CLASS_TAB_CONTAINER}.${CLASS_TAB_GROUP}`);
      for (const item of items) {
        const { classList } = item;
        if (item === container) {
          func.push(toggleTabGroupCollapsedState(item, true));
        } else if (!classList.contains(CLASS_TAB_COLLAPSED)) {
          if (classList.contains(PINNED)) {
            classList.contains(CLASS_COLLAPSE_AUTO) &&
              func.push(toggleTabGroupCollapsedState(item, false));
          } else {
            func.push(toggleTabGroupCollapsedState(item, false));
          }
        }
      }
    }
  }
  return Promise.all(func);
};

/**
 * collapse multiple tab groups
 * @param {object} [elm] - element
 * @returns {Promise.<Array>} - results of each handler
 */
export const collapseTabGroups = async elm => {
  const func = [];
  if (elm?.nodeType === Node.ELEMENT_NODE) {
    const container = getSidebarTabContainer(elm);
    if (container?.classList.contains(CLASS_TAB_GROUP)) {
      const items =
        document.querySelectorAll(`.${CLASS_TAB_CONTAINER}.${CLASS_TAB_GROUP}`);
      for (const item of items) {
        if (item !== container &&
            !item.classList.contains(CLASS_TAB_COLLAPSED)) {
          func.push(toggleTabGroupCollapsedState(item, false));
        }
      }
    }
  }
  return Promise.all(func);
};

/**
 * get tab group heading
 * @param {object} node - node
 * @returns {object} - heading element
 */
export const getTabGroupHeading = node => {
  const container = getSidebarTabContainer(node);
  let heading;
  if (container) {
    heading = container.querySelector(`.${CLASS_HEADING}`);
  }
  return heading || null;
};

/**
 * handle individual tab group collapsed state
 * @param {!object} evt - Event
 * @returns {Promise} - promise chain
 */
export const handleTabGroupCollapsedState = evt => {
  const { target } = evt;
  const heading = getTabGroupHeading(target);
  const tab = getSidebarTab(target);
  const selectedTabs = document.querySelectorAll(`.${HIGHLIGHTED}`);
  let func;
  if (heading && !heading.hidden) {
    evt.preventDefault();
    evt.stopPropagation();
    let activate;
    for (const selectedTab of selectedTabs) {
      if (selectedTab.parentNode === heading.parentNode) {
        activate = true;
        break;
      }
    }
    func = toggleTabGroupCollapsedState(heading, activate)
      .then(requestSaveSession).catch(throwErr);
  } else if (tab) {
    evt.preventDefault();
    evt.stopPropagation();
    let activate;
    for (const selectedTab of selectedTabs) {
      if (selectedTab.parentNode === tab.parentNode) {
        activate = true;
        break;
      }
    }
    func = toggleTabGroupCollapsedState(tab, activate)
      .then(requestSaveSession).catch(throwErr);
  }
  return func || null;
};

/**
 * handle multiple tab groups collapsed state
 * @param {!object} evt - Event
 * @returns {Promise} - promise chain
 */
export const handleTabGroupsCollapsedState = evt => {
  const { target } = evt;
  const container = getSidebarTabContainer(target);
  let func;
  if (container) {
    evt.preventDefault();
    evt.stopPropagation();
    func = toggleTabGroupsCollapsedState(container)
      .then(requestSaveSession).catch(throwErr);
  }
  return func || null;
};

/**
 * add tab context click listener
 * @param {object} [elm] - element
 * @param {boolean} [multi] - handle multiple tab groups
 * @returns {void}
 */
export const addTabContextClickListener = (elm, multi) => {
  if (elm?.nodeType === Node.ELEMENT_NODE) {
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
 * @param {boolean} [multi] - handle multiple tab groups
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
 * @returns {Promise.<?Promise>} - toggleTabGroupCollapsedState()
 */
export const expandActivatedCollapsedTab = async () => {
  const tab = document.querySelector(`${TAB_QUERY}.${ACTIVE}`);
  let func;
  if (tab) {
    const { parentNode } = tab;
    const firstTab = parentNode.querySelector(TAB_QUERY);
    if (firstTab !== tab &&
        parentNode.classList.contains(CLASS_TAB_COLLAPSED)) {
      func = toggleTabGroupCollapsedState(tab, true);
    }
  }
  return func || null;
};

/**
 * finish editing group label
 * @param {!object} evt - event
 * @returns {Promise} - promise chain
 */
export const finishGroupLabelEdit = evt => {
  const { isComposing, key, target, type } = evt;
  let func;
  if (type === 'blur' ||
      (!isComposing && type === 'keydown' && key === 'Enter')) {
    const heading = getTabGroupHeading(target);
    const label = heading?.querySelector(`.${CLASS_HEADING_LABEL}`);
    if (label) {
      evt.preventDefault();
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
      func = requestSaveSession().catch(throwErr);
    }
  }
  return func || null;
};

/**
 * start editing group label
 * @param {object} node - element
 * @returns {Promise.<object>} - group label element
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
 * @param {!object} evt - event
 * @returns {Promise} - promise chain
 */
export const enableGroupLabelEdit = evt => {
  const { target } = evt;
  return startGroupLabelEdit(target).catch(throwErr);
};

/**
 * trigger DnD handler
 * @param {!object} evt - event
 * @returns {?Function} - handleDragLeave() / handleDragOver() / handleDrop()
 */
export const triggerDndHandler = evt => {
  const { currentTarget, type } = evt;
  const isMac = currentTarget.dataset.ismac === 'true';
  const windowId =
    currentTarget.dataset.windowid && Number(currentTarget.dataset.windowid);
  const opt = {
    isMac,
    windowId
  };
  let func;
  if (type === 'dragleave') {
    func = handleDragLeave(evt);
  } else if (type === 'dragover') {
    func = handleDragOver(evt, opt);
  } else if (type === 'drop') {
    func = handleDrop(evt, opt);
  }
  return func || null;
};

/**
 * add listeners to heading items
 * @param {object} node - node;
 * @param {object} [opt] - options
 * @param {boolean} [opt.isMac] - is mac
 * @param {boolean} [opt.multi] - handle multiple tab groups
 * @param {number} [opt.windowId] - window ID
 * @returns {Promise.<void>} - void
 */
export const addListenersToHeadingItems = async (node, opt = {}) => {
  const { isMac, multi, windowId } = opt;
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
    if (context) {
      addTabContextClickListener(context, !!multi);
    }
    if (label) {
      addTabContextClickListener(label, !!multi);
    }
    if (button) {
      button.addEventListener('click', enableGroupLabelEdit);
    }
    if (isMac) {
      heading.dataset.ismac = isMac;
    } else {
      delete heading.dataset.ismac;
    }
    if (Number.isInteger(windowId)) {
      heading.dataset.windowid = windowId;
    } else {
      delete heading.dataset.windowid;
    }
    heading.addEventListener('dragleave', triggerDndHandler);
    heading.addEventListener('dragover', triggerDndHandler);
    heading.addEventListener('drop', triggerDndHandler);
  }
};

/**
 * remove listeners from heading items
 * @param {object} node - node;
 * @returns {Promise.<void>} - void
 */
export const removeListenersFromHeadingItems = async node => {
  const heading = getTabGroupHeading(node);
  if (heading?.hidden) {
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
    button?.removeEventListener('click', enableGroupLabelEdit);
    heading.removeEventListener('dragleave', triggerDndHandler);
    heading.removeEventListener('dragover', triggerDndHandler);
    heading.removeEventListener('drop', triggerDndHandler);
  }
};

/**
 * toggle tab group heading state
 * @param {object} node - node
 * @param {object} [opt] - options
 * @returns {Promise.<Array>} - results of each handler
 */
export const toggleTabGroupHeadingState = async (node, opt = {}) => {
  const func = [];
  const heading = getTabGroupHeading(node);
  if (heading) {
    const editButton = heading.querySelector(`.${CLASS_HEADING_LABEL_EDIT}`);
    if (editButton) {
      editButton.title = i18n.getMessage(`${TAB_GROUP_LABEL_EDIT}_title`);
    }
    if (heading.hidden) {
      heading.hidden = false;
      func.push(
        addListenersToHeadingItems(heading, opt),
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
 * toggle auto collapse pinned tabs
 * @param {boolean} [auto] - enable auto collapse
 * @returns {Promise.<void>} - void
 */
export const toggleAutoCollapsePinnedTabs = async auto => {
  const pinned = document.querySelector(`.${CLASS_TAB_CONTAINER}.${PINNED}`);
  if (pinned) {
    if (auto) {
      pinned.classList.add(CLASS_COLLAPSE_AUTO);
    } else {
      pinned.classList.remove(CLASS_COLLAPSE_AUTO);
    }
  }
};

/**
 * bookmark tab group
 * @param {object} node - node
 * @returns {Promise.<?Promise>} - bookmarkTabs()
 */
export const bookmarkTabGroup = async node => {
  const container = getSidebarTabContainer(node);
  let func;
  if (container) {
    const label = container.querySelector(`.${CLASS_HEADING_LABEL}`);
    const items = container.querySelectorAll(TAB_QUERY);
    if (label && items.length) {
      func = bookmarkTabs([...items], label.textContent.trim());
    }
  }
  return func || null;
};

/**
 * select tab group
 * @param {object} node - node
 * @returns {Promise.<?Promise>} - highlightTabs()
 */
export const selectTabGroup = async node => {
  const container = getSidebarTabContainer(node);
  let func;
  if (container) {
    const items = container.querySelectorAll(TAB_QUERY);
    if (items.length) {
      const activeTab = document.querySelector(`${TAB_QUERY}.${ACTIVE}`);
      container.classList.remove(CLASS_TAB_COLLAPSED);
      if (activeTab?.parentNode === container) {
        func = highlightTabs([...items]);
      } else {
        const [tab, ...group] = [...items];
        const tabId = getSidebarTabId(tab);
        func = highlightTabs(group, {
          tabId
        });
      }
    }
  }
  return func || null;
};

/**
 * close tab group
 * @param {object} node - node
 * @returns {Promise.<?Promise>} - closeTabs()
 */
export const closeTabGroup = async node => {
  const container = getSidebarTabContainer(node);
  let func;
  if (container) {
    const items = container.querySelectorAll(TAB_QUERY);
    if (items.length) {
      func = closeTabs([...items]);
    }
  }
  return func || null;
};

/**
 * detach tabs from tab group
 * @param {Array} nodes - array of node
 * @param {number} [windowId] - window ID
 * @returns {?Promise} - moveTabsInOrder()
 */
export const detachTabsFromGroup = async (nodes, windowId) => {
  if (Array.isArray(nodes)) {
    nodes.reverse();
  } else {
    throw new TypeError(`Expected Array but got ${getType(nodes)}.`);
  }
  if (!Number.isInteger(windowId)) {
    windowId = windows.WINDOW_ID_CURRENT;
  }
  const arr = [];
  let func;
  for (const item of nodes) {
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
        const itemIndex = getSidebarTabIndex(parentLastChild);
        container.appendChild(item);
        container.removeAttribute('hidden');
        parentNode.parentNode.insertBefore(container, parentNextSibling);
        if (move) {
          arr.push({
            index: itemIndex,
            tabId: itemId
          });
        }
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
 * @param {number} [windowId] - window ID
 * @returns {?Promise} - moveTabsInOrder()
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
 * @param {number} tabId - tab ID
 * @param {number} [windowId] - window ID
 * @returns {?Promise} - moveTabsInOrder()
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
 * @param {number} tabId - tab ID
 * @param {number} [windowId] - window ID
 * @returns {?Promise} - moveTabsInOrder()
 */
export const groupSameDomainTabs = async (tabId, windowId) => {
  if (!Number.isInteger(tabId)) {
    throw new TypeError(`Expected Number but got ${getType(tabId)}.`);
  }
  const tabsTab = await getTab(tabId);
  const { url: tabUrl } = tabsTab;
  const url = createUrlMatchString(tabUrl);
  let func;
  if (url) {
    if (!Number.isInteger(windowId)) {
      windowId = windows.WINDOW_ID_CURRENT;
    }
    const items = await queryTabs({
      url,
      windowId,
      pinned: false
    });
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
  }
  return func || null;
};

/**
 * ungroup tabs
 * @param {object} [node] - tab group container
 * @returns {Promise.<void>} - void
 */
export const ungroupTabs = async node => {
  if (node?.nodeType === Node.ELEMENT_NODE) {
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

// For test
export { ports } from './session.js';
