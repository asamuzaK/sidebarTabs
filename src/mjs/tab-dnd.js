/**
 * tab-dnd.js
 */

/* shared */
import { isObjectNotEmpty, isString, throwErr } from './common.js';
import {
  createTab, duplicateTab, moveTab, searchWithSearchEngine, updateTab
} from './browser.js';
import {
  createTabsInOrder, highlightTabs, moveTabsInOrder
} from './browser-tabs.js';
import {
  activateTab, getSidebarTab, getSidebarTabId, getSidebarTabIndex, getTemplate,
  requestSaveSession
} from './util.js';
import { restoreTabContainers } from './tab-group.js';
import {
  CLASS_TAB_CONTAINER_TMPL, CLASS_TAB_GROUP,
  DROP_TARGET, DROP_TARGET_AFTER, DROP_TARGET_BEFORE,
  HIGHLIGHTED, MIME_PLAIN, MIME_URI, PINNED, SIDEBAR_MAIN, TAB_QUERY
} from './constant.js';

/* api */
const { windows } = browser;

/* constants */
const { WINDOW_ID_NONE } = windows;
const HALF = 0.5;
const ONE_THIRD = 1 / 3;

/**
 * move dropped tabs
 *
 * @param {object} dropTarget - drop target
 * @param {Array} draggedIds - Array of dragged tab ID
 * @param {object} opt - options
 * @returns {Promise.<Array>} - result of each handler
 */
export const moveDroppedTabs = async (dropTarget, draggedIds, opt) => {
  const func = [];
  const target = getSidebarTab(dropTarget);
  if (target && Array.isArray(draggedIds) && isObjectNotEmpty(opt)) {
    const { dropAfter, dropBefore, isGrouped, isPinned, windowId } = opt;
    const targetParent = target.parentNode;
    const moveArr = (dropAfter && draggedIds.reverse()) || draggedIds;
    const arr = [];
    const l = moveArr.length;
    let i = 0;
    while (i < l) {
      const itemId = moveArr[i];
      const item = document.querySelector(`[data-tab-id="${itemId}"]`);
      if (item) {
        if (isPinned) {
          if (targetParent.classList.contains(PINNED) &&
              item.classList.contains(PINNED)) {
            if (dropBefore) {
              targetParent.insertBefore(item, target);
            } else {
              targetParent.insertBefore(item, target.nextElementSibling);
            }
            arr.push({
              index: getSidebarTabIndex(item),
              tabId: itemId
            });
          }
        } else if (isGrouped) {
          if (dropBefore) {
            targetParent.insertBefore(item, target);
          } else {
            targetParent.insertBefore(item, target.nextElementSibling);
          }
          arr.push({
            index: getSidebarTabIndex(item),
            tabId: itemId
          });
        } else {
          const container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
          container.appendChild(item);
          container.removeAttribute('hidden');
          if (dropBefore) {
            targetParent.parentNode.insertBefore(container, targetParent);
          } else {
            targetParent.parentNode
              .insertBefore(container, targetParent.nextElementSibling);
          }
          arr.push({
            index: getSidebarTabIndex(item),
            tabId: itemId
          });
        }
        if (i === l - 1) {
          const targetId = getSidebarTabId(target);
          item.dataset.restore = targetId;
        }
      }
      i++;
    }
    if (arr.length) {
      func.push(moveTabsInOrder(arr, windowId));
    }
  }
  return Promise.all(func);
};

/**
 * get target for dragged tabs
 *
 * @param {object} dropTarget - drop target
 * @param {object} opt - options
 * @returns {number} - index;
 */
export const getTargetForDraggedTabs = (dropTarget, opt) => {
  let target;
  if (dropTarget && dropTarget.nodeType === Node.ELEMENT_NODE &&
      dropTarget.classList.contains(DROP_TARGET) && isObjectNotEmpty(opt)) {
    const { isPinnedTabIds } = opt;
    const dropParent = dropTarget.parentNode;
    const pinnedContainer = document.getElementById(PINNED);
    const {
      lastElementChild: lastPinnedTab,
      nextElementSibling: firstUnpinnedContainer
    } = pinnedContainer;
    const firstUnpinnedTab = firstUnpinnedContainer.querySelector(TAB_QUERY);
    if (isPinnedTabIds) {
      if (dropParent.classList.contains(PINNED)) {
        target = dropTarget;
      } else {
        target = lastPinnedTab;
      }
    } else if (dropParent.classList.contains(PINNED)) {
      target = firstUnpinnedTab;
    } else {
      target = dropTarget;
    }
  }
  return target || null;
};

/**
 * get drop target index for dragged tabs
 *
 * @param {object} dropTarget - drop target
 * @param {object} opt - options
 * @returns {number} - index;
 */
export const getDropIndexForDraggedTabs = (dropTarget, opt) => {
  let index;
  if (dropTarget && dropTarget.nodeType === Node.ELEMENT_NODE &&
      dropTarget.classList.contains(DROP_TARGET) && isObjectNotEmpty(opt)) {
    const { isPinnedTabIds } = opt;
    const dropTargetIndex = getSidebarTabIndex(dropTarget);
    const dropParent = dropTarget.parentNode;
    const pinnedContainer = document.getElementById(PINNED);
    const { nextElementSibling: firstUnpinnedContainer } = pinnedContainer;
    const firstUnpinnedTab = firstUnpinnedContainer.querySelector(TAB_QUERY);
    const firstUnpinnedTabIndex = getSidebarTabIndex(firstUnpinnedTab);
    const lastTabIndex = document.querySelectorAll(TAB_QUERY).length - 1;
    if (isPinnedTabIds) {
      if (dropParent.classList.contains(PINNED)) {
        if (dropTarget.classList.contains(DROP_TARGET_BEFORE)) {
          index = dropTargetIndex;
        } else {
          index = dropTargetIndex + 1;
        }
      } else {
        index = firstUnpinnedTabIndex;
      }
    } else if (dropParent.classList.contains(PINNED)) {
      index = firstUnpinnedTabIndex;
    } else if (dropTarget.classList.contains(DROP_TARGET_BEFORE)) {
      index = dropTargetIndex;
    } else if (dropTargetIndex === lastTabIndex) {
      index = -1;
    } else {
      index = dropTargetIndex + 1;
    }
  }
  return index;
};

/**
 * extract dropped tabs data
 *
 * @param {object} dropTarget - target element
 * @param {object} data - dragged data
 * @param {object} keyOpt - key options
 * @returns {Promise.<Array>} - results of each handler
 */
export const extractDroppedTabs = async (dropTarget, data, keyOpt = {}) => {
  const func = [];
  if (dropTarget && dropTarget.nodeType === Node.ELEMENT_NODE &&
      dropTarget.classList.contains(DROP_TARGET) && isObjectNotEmpty(data)) {
    const {
      dragTabId, dragWindowId, dropEffect, dropWindowId, pinnedTabIds, tabIds
    } = data;
    if (Number.isInteger(dragWindowId) && dragWindowId !== WINDOW_ID_NONE) {
      if (dropEffect === 'move') {
        if (dragWindowId === dropWindowId) {
          const { shiftKey } = keyOpt;
          if (Array.isArray(pinnedTabIds) && pinnedTabIds.length) {
            const target = getTargetForDraggedTabs(dropTarget, {
              isPinnedTabIds: true
            });
            const opt = {
              dropAfter: true,
              dropBefore: false,
              isPinned: true,
              windowId: dropWindowId
            };
            if (target === dropTarget &&
                dropTarget.classList.contains(DROP_TARGET_BEFORE)) {
              opt.dropAfter = false;
              opt.dropBefore = true;
            }
            func.push(moveDroppedTabs(target, pinnedTabIds, opt));
          }
          if (Array.isArray(tabIds) && tabIds.length) {
            const target = getTargetForDraggedTabs(dropTarget, {
              isPinnedTabIds: false
            });
            const targetParent = target.parentNode;
            const opt = {
              dropAfter: false,
              dropBefore: true,
              isGrouped: targetParent.classList.contains(CLASS_TAB_GROUP) ||
                         shiftKey,
              windowId: dropWindowId
            };
            if (target === dropTarget &&
                dropTarget.classList.contains(DROP_TARGET_AFTER)) {
              opt.dropAfter = true;
              opt.dropBefore = false;
            }
            func.push(moveDroppedTabs(target, tabIds, opt));
          }
        // dragged from other window
        } else {
          if (Array.isArray(pinnedTabIds) && pinnedTabIds.length) {
            const index = getDropIndexForDraggedTabs(dropTarget, {
              isPinnedTabIds: true
            });
            Number.isInteger(index) && func.push(moveTab(pinnedTabIds, {
              index,
              windowId: dropWindowId
            }));
          }
          if (Array.isArray(tabIds) && tabIds.length) {
            const index = getDropIndexForDraggedTabs(dropTarget, {
              isPinnedTabIds: false
            });
            Number.isInteger(index) && func.push(moveTab(tabIds, {
              index,
              windowId: dropWindowId
            }));
          }
        }
      } else if (dropEffect === 'copy') {
        const index = getDropIndexForDraggedTabs(dropTarget, {
          isPinnedTabIds: false
        });
        if (Number.isInteger(index)) {
          if (dragWindowId === dropWindowId) {
            func.push(duplicateTab(dragTabId, {
              index,
              active: false
            }));
            if (Array.isArray(pinnedTabIds) && pinnedTabIds.length) {
              for (const tabId of pinnedTabIds) {
                tabId !== dragTabId && func.push(duplicateTab(tabId, {
                  index,
                  active: false
                }));
              }
            }
            if (Array.isArray(tabIds) && tabIds.length) {
              for (const tabId of tabIds) {
                tabId !== dragTabId && func.push(duplicateTab(tabId, {
                  index,
                  active: false
                }));
              }
            }
          // dragged from other window
          } else {
            const arr = [];
            arr.push(duplicateTab(dragTabId, {
              active: false
            }));
            if (Array.isArray(pinnedTabIds) && pinnedTabIds.length) {
              for (const tabId of pinnedTabIds) {
                tabId !== dragTabId && arr.push(duplicateTab(tabId, {
                  active: false
                }));
              }
            }
            if (Array.isArray(tabIds) && tabIds.length) {
              for (const tabId of tabIds) {
                tabId !== dragTabId && arr.push(duplicateTab(tabId, {
                  active: false
                }));
              }
            }
            const dupedTabs = await Promise.all(arr);
            const dupedTabIds = [];
            for (const dupedTab of dupedTabs) {
              const { id } = dupedTab;
              dupedTabIds.push(id);
            }
            func.push(moveTab(dupedTabIds, {
              index,
              windowId: dropWindowId
            }));
          }
        }
      }
    }
  }
  return Promise.all(func);
};

/**
 * open dropped URI list
 *
 * @param {object} dropTarget - target element
 * @param {Array} data - uri list
 * @returns {Promise.<Array>} - results of each handler
 */
export const openUriList = async (dropTarget, data = []) => {
  const func = [];
  if (dropTarget && dropTarget.nodeType === Node.ELEMENT_NODE &&
      Array.isArray(data) && data.length) {
    const isMain = dropTarget === document.getElementById(SIDEBAR_MAIN);
    if (dropTarget.classList.contains(DROP_TARGET)) {
      if (data.length === 1 &&
          !dropTarget.classList.contains(DROP_TARGET_BEFORE) &&
          !dropTarget.classList.contains(DROP_TARGET_AFTER)) {
        const [url] = data;
        const dropTargetId = getSidebarTabId(dropTarget);
        func.push(updateTab(dropTargetId, {
          url,
          active: true
        }));
      } else {
        const { windowId } = JSON.parse(dropTarget.dataset.tab);
        const dropTargetIndex = getSidebarTabIndex(dropTarget);
        const lastTabIndex = document.querySelectorAll(TAB_QUERY).length - 1;
        const opts = [];
        let index;
        if (dropTarget.classList.contains(DROP_TARGET_BEFORE)) {
          index = dropTargetIndex;
        } else if (dropTarget.classList.contains(DROP_TARGET_AFTER) &&
                   dropTargetIndex < lastTabIndex) {
          index = dropTargetIndex + 1;
        }
        for (const url of data) {
          const opt = {
            url,
            windowId
          };
          if (Number.isInteger(index)) {
            opt.index = index;
          }
          opts.push(opt);
        }
        func.push(createTabsInOrder(opts).then(restoreTabContainers)
          .then(requestSaveSession));
      }
    } else if (isMain) {
      const opts = [];
      for (const url of data) {
        const opt = {
          url
        };
        opts.push(opt);
      }
      func.push(createTabsInOrder(opts).then(restoreTabContainers)
        .then(requestSaveSession));
    }
  }
  return Promise.all(func);
};

/**
 * search dropped query
 *
 * @param {object} dropTarget - target element
 * @param {string} data - seach query
 * @returns {Promise.<Array>} - results of each handler
 */
export const searchQuery = async (dropTarget, data = '') => {
  const func = [];
  if (dropTarget && dropTarget.nodeType === Node.ELEMENT_NODE &&
      data && isString(data)) {
    const isMain = dropTarget === document.getElementById(SIDEBAR_MAIN);
    if (dropTarget.classList.contains(DROP_TARGET)) {
      if (!dropTarget.classList.contains(DROP_TARGET_BEFORE) &&
          !dropTarget.classList.contains(DROP_TARGET_AFTER)) {
        const dropTargetId = getSidebarTabId(dropTarget);
        await searchWithSearchEngine(data, {
          tabId: dropTargetId
        });
        func.push(updateTab(dropTargetId, {
          active: true
        }));
      } else {
        const { windowId } = JSON.parse(dropTarget.dataset.tab);
        const dropTargetIndex = getSidebarTabIndex(dropTarget);
        const lastTabIndex = document.querySelectorAll(TAB_QUERY).length - 1;
        let index;
        if (dropTarget.classList.contains(DROP_TARGET_BEFORE)) {
          index = dropTargetIndex;
        } else if (dropTarget.classList.contains(DROP_TARGET_AFTER) &&
                   dropTargetIndex < lastTabIndex) {
          index = dropTargetIndex + 1;
        }
        const tab = await createTab({
          index,
          windowId,
          active: true
        });
        func.push(searchWithSearchEngine(data, {
          tabId: tab.id
        }).then(restoreTabContainers).then(requestSaveSession));
      }
    } else if (isMain) {
      const tab = await createTab({
        active: true
      });
      func.push(searchWithSearchEngine(data, {
        tabId: tab.id
      }).then(restoreTabContainers).then(requestSaveSession));
    }
  }
  return Promise.all(func);
};

/**
 * handle drop
 *
 * @param {!object} evt - event
 * @returns {?(Function|Error)} - promise chain
 */
export const handleDrop = evt => {
  const {
    altKey, ctrlKey, currentTarget, dataTransfer, metaKey, shiftKey, type
  } = evt;
  if (type !== 'drop') {
    return;
  }
  const { dropEffect } = dataTransfer;
  const dropTarget = getSidebarTab(currentTarget);
  const isMain = currentTarget === document.getElementById(SIDEBAR_MAIN);
  const uriList = dataTransfer.getData(MIME_URI).split('\n')
    .filter(i => i && !i.startsWith('#')).reverse();
  const data = dataTransfer.getData(MIME_PLAIN);
  let func;
  if (dropTarget && dropTarget.classList.contains(DROP_TARGET)) {
    if (dropEffect === 'copy' || dropEffect === 'move') {
      // dropped uri list
      if (uriList.length && dropEffect === 'move') {
        func = openUriList(dropTarget, uriList).catch(throwErr);
        evt.preventDefault();
        evt.stopPropagation();
      } else if (data) {
        let item;
        try {
          item = JSON.parse(data);
        } catch (e) {
          item = data;
        }
        // dropped tab
        if (isObjectNotEmpty(item)) {
          const { windowId } = JSON.parse(dropTarget.dataset.tab);
          const keyOpt = {
            altKey,
            ctrlKey,
            metaKey,
            shiftKey
          };
          item.dropEffect = dropEffect;
          item.dropWindowId = windowId;
          func = extractDroppedTabs(dropTarget, item, keyOpt)
            .then(restoreTabContainers).then(requestSaveSession)
            .catch(throwErr);
          evt.preventDefault();
          evt.stopPropagation();
        // dropped search query
        } else if (isString(item) && dropEffect === 'move') {
          func = searchQuery(dropTarget, item).catch(throwErr);
          evt.preventDefault();
          evt.stopPropagation();
        }
      }
    }
    dropTarget.classList.remove(DROP_TARGET, DROP_TARGET_AFTER,
      DROP_TARGET_BEFORE);
  } else if (isMain && dropEffect === 'move') {
    // dropped uri list
    if (uriList.length) {
      func = openUriList(currentTarget, uriList).catch(throwErr);
      evt.preventDefault();
      evt.stopPropagation();
    // dropped search query
    } else if (data) {
      func = searchQuery(currentTarget, data).catch(throwErr);
      evt.preventDefault();
      evt.stopPropagation();
    }
  }
  return func || null;
};

/**
 * handle dragend
 *
 * @param {!object} evt - event
 * @returns {void}
 */
export const handleDragEnd = evt => {
  const { type } = evt;
  if (type !== 'dragend') {
    return;
  }
  const items = document.querySelectorAll(`.${DROP_TARGET}`);
  for (const item of items) {
    item.classList.remove(DROP_TARGET, DROP_TARGET_AFTER, DROP_TARGET_BEFORE);
  }
};

/**
 * handle dragleave
 *
 * @param {!object} evt - event
 * @returns {void}
 */
export const handleDragLeave = evt => {
  const { currentTarget, type } = evt;
  if (type !== 'dragleave') {
    return;
  }
  const dropTarget = getSidebarTab(currentTarget);
  dropTarget && dropTarget.classList.remove(DROP_TARGET, DROP_TARGET_AFTER,
    DROP_TARGET_BEFORE);
};

/**
 * handle dragover
 *
 * @param {!object} evt - event
 * @param {object} opt - options
 * @returns {void}
 */
export const handleDragOver = (evt, opt = {}) => {
  const {
    altKey, clientY, ctrlKey, currentTarget, dataTransfer, shiftKey, type
  } = evt;
  if (type !== 'dragover') {
    return;
  }
  const { isMac } = opt;
  const dropTarget = getSidebarTab(currentTarget);
  const data = dataTransfer.getData(MIME_PLAIN);
  const isMain = currentTarget === document.getElementById(SIDEBAR_MAIN);
  if (dropTarget) {
    const { bottom, top } = dropTarget.getBoundingClientRect();
    const isPinned = dropTarget.classList.contains(PINNED);
    if (data) {
      let pinned;
      try {
        const item = JSON.parse(data);
        pinned = !!item.pinned;
      } catch (e) {
        pinned = false;
      }
      const { bottom, top } = dropTarget.getBoundingClientRect();
      if (!shiftKey && ((isMac && altKey) || (!isMac && ctrlKey))) {
        if (clientY > (bottom - top) * HALF + top) {
          dropTarget.classList.add(DROP_TARGET, DROP_TARGET_AFTER);
          dropTarget.classList.remove(DROP_TARGET_BEFORE);
        } else {
          dropTarget.classList.add(DROP_TARGET, DROP_TARGET_BEFORE);
          dropTarget.classList.remove(DROP_TARGET_AFTER);
        }
        dataTransfer.dropEffect = 'copy';
      } else if ((isPinned && pinned) || !(isPinned || pinned)) {
        if (clientY > (bottom - top) * HALF + top) {
          dropTarget.classList.add(DROP_TARGET, DROP_TARGET_AFTER);
          dropTarget.classList.remove(DROP_TARGET_BEFORE);
        } else {
          dropTarget.classList.add(DROP_TARGET, DROP_TARGET_BEFORE);
          dropTarget.classList.remove(DROP_TARGET_AFTER);
        }
        dataTransfer.dropEffect = 'move';
      } else {
        dropTarget.classList.remove(DROP_TARGET, DROP_TARGET_AFTER,
          DROP_TARGET_BEFORE);
        dataTransfer.dropEffect = 'none';
      }
    } else {
      if (isPinned) {
        dropTarget.classList.add(DROP_TARGET);
        dropTarget.classList.remove(DROP_TARGET_BEFORE, DROP_TARGET_AFTER);
      } else if (clientY < (bottom - top) * ONE_THIRD + top) {
        dropTarget.classList.add(DROP_TARGET, DROP_TARGET_BEFORE);
        dropTarget.classList.remove(DROP_TARGET_AFTER);
      } else if (clientY > bottom - (bottom - top) * ONE_THIRD) {
        dropTarget.classList.add(DROP_TARGET, DROP_TARGET_AFTER);
        dropTarget.classList.remove(DROP_TARGET_BEFORE);
      } else {
        dropTarget.classList.add(DROP_TARGET);
        dropTarget.classList.remove(DROP_TARGET_BEFORE, DROP_TARGET_AFTER);
      }
    }
    evt.preventDefault();
    evt.stopPropagation();
  } else if (isMain && !data) {
    dataTransfer.dropEffect = 'move';
    evt.preventDefault();
    evt.stopPropagation();
  }
};

/**
 * handle dragenter
 *
 * @param {!object} evt - event
 * @returns {void}
 */
export const handleDragEnter = evt => {
  const { currentTarget, dataTransfer, type } = evt;
  if (type !== 'dragenter') {
    return;
  }
  const dropTarget = getSidebarTab(currentTarget);
  if (dropTarget) {
    const data = dataTransfer.getData(MIME_PLAIN);
    if (data) {
      const isPinned = dropTarget.classList.contains(PINNED);
      let pinned;
      try {
        const item = JSON.parse(data);
        pinned = !!item.pinned;
      } catch (e) {
        pinned = false;
      }
      if ((isPinned && pinned) || !(isPinned || pinned)) {
        dropTarget.classList.add(DROP_TARGET);
      }
    } else {
      dropTarget.classList.add(DROP_TARGET);
    }
  }
};

/**
 * handle dragstart
 *
 * @param {!object} evt - event
 * @param {object} opt - options
 * @returns {Promise.<Array>} - result of each handler
 */
export const handleDragStart = (evt, opt = {}) => {
  const {
    altKey, ctrlKey, currentTarget, dataTransfer, metaKey, shiftKey, type
  } = evt;
  if (type !== 'dragstart') {
    return;
  }
  const { isMac, windowId } = opt;
  const tab = getSidebarTab(currentTarget);
  const func = [];
  if (tab) {
    const dragTabId = getSidebarTabId(tab);
    const container = tab.parentNode;
    const data = {
      dragTabId,
      dragWindowId: windowId || windows.WINDOW_ID_CURRENT,
      pinned: tab.classList.contains(PINNED),
      pinnedTabIds: [],
      tabIds: []
    };
    const highlightedTabs =
      document.querySelectorAll(`${TAB_QUERY}.${HIGHLIGHTED}`);
    let items;
    if (tab.classList.contains(HIGHLIGHTED)) {
      items = Array.from(highlightedTabs);
    } else if (container && container.classList.contains(CLASS_TAB_GROUP) &&
               shiftKey && ((isMac && metaKey) || (!isMac && ctrlKey))) {
      items = Array.from(container.querySelectorAll(TAB_QUERY));
      func.push(highlightTabs(items, windowId));
    } else if ((isMac && altKey) || (!isMac && ctrlKey)) {
      const tabList = new Set(Array.from(highlightedTabs));
      tabList.add(tab);
      items = Array.from(tabList);
      func.push(highlightTabs(items, windowId));
    } else {
      items = [tab];
      func.push(activateTab(tab));
    }
    for (const item of items) {
      const tabId = getSidebarTabId(item);
      if (item.parentNode.classList.contains(PINNED)) {
        data.pinnedTabIds.push(tabId);
      } else {
        data.tabIds.push(tabId);
      }
    }
    dataTransfer.effectAllowed = 'copyMove';
    dataTransfer.setData(MIME_PLAIN, JSON.stringify(data));
  }
  return Promise.all(func).catch(throwErr);
};

// For test
export { ports } from './util.js';
