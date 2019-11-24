/**
 * tab-dnd.js
 */

import {
  isObjectNotEmpty, logErr, throwErr,
} from "./common.js";
import {
  moveTab,
} from "./browser.js";
import {
  createTabsInOrder, moveTabsInOrder,
} from "./browser-tabs.js";
import {
  getSidebarTab, getSidebarTabId, getSidebarTabIndex, getSidebarTabContainer,
  getTemplate,
} from "./util.js";

/* api */
const {
  windows,
} = browser;

/* constants */
import {
  CLASS_TAB_CONTAINER_TMPL, CLASS_TAB_GROUP,
  DROP_TARGET, DROP_TARGET_AFTER, DROP_TARGET_BEFORE,
  HIGHLIGHTED, MIME_PLAIN, MIME_URI, PINNED, TAB_QUERY,
} from "./constant.js";
const {WINDOW_ID_NONE} = windows;

/**
 * move dropped tabs
 * @param {Object} dropTarget - drop target
 * @param {Array} draggedIds - Array of dragged tab ID
 * @param {Object} opt - options
 * @returns {Promise.<Array>} - result of each handler
 */
export const moveDroppedTabs = async (dropTarget, draggedIds, opt) => {
  const func = [];
  const target = getSidebarTab(dropTarget);
  if (target && Array.isArray(draggedIds) && isObjectNotEmpty(opt)) {
    const {
      dropAfter, dropBefore, isGrouped, isPinned, windowId,
    } = opt;
    const targetParent = target.parentNode;
    const moveArr = dropAfter && draggedIds.reverse() || draggedIds;
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
              tabId: itemId,
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
            tabId: itemId,
          });
        } else {
          const container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
          container.appendChild(item);
          container.removeAttribute("hidden");
          if (dropBefore) {
            targetParent.parentNode.insertBefore(container, targetParent);
          } else {
            targetParent.parentNode
              .insertBefore(container, targetParent.nextElementSibling);
          }
          arr.push({
            index: getSidebarTabIndex(item),
            tabId: itemId,
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
 * @param {Object} dropTarget - drop target
 * @param {Object} opt - options
 * @returns {number} - index;
 */
export const getTargetForDraggedTabs = (dropTarget, opt) => {
  let target;
  if (dropTarget && dropTarget.nodeType === Node.ELEMENT_NODE &&
      dropTarget.classList.contains(DROP_TARGET) && isObjectNotEmpty(opt)) {
    const {isPinnedTabIds} = opt;
    const dropParent = dropTarget.parentNode;
    const pinnedContainer = document.getElementById(PINNED);
    const {
      lastElementChild: lastPinnedTab,
      nextElementSibling: firstUnpinnedContainer,
    } = pinnedContainer;
    const {firstElementChild: firstUnpinnedTab} = firstUnpinnedContainer;
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
 * @param {Object} dropTarget - drop target
 * @param {Object} opt - options
 * @returns {number} - index;
 */
export const getDropIndexForDraggedTabs = (dropTarget, opt) => {
  let index;
  if (dropTarget && dropTarget.nodeType === Node.ELEMENT_NODE &&
      dropTarget.classList.contains(DROP_TARGET) && isObjectNotEmpty(opt)) {
    const {isPinnedTabIds} = opt;
    const dropTargetIndex = getSidebarTabIndex(dropTarget);
    const dropParent = dropTarget.parentNode;
    const pinnedContainer = document.getElementById(PINNED);
    const {nextElementSibling: firstUnpinnedContainer} = pinnedContainer;
    const {firstElementChild: firstUnpinnedTab} = firstUnpinnedContainer;
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
 * @param {Object} dropTarget - target element
 * @param {Object} data - dragged data
 * @param {Object} keyOpt - key options
 * @returns {Promise.<Array>} - results of each handler
 */
export const extractDroppedTabs = async (dropTarget, data, keyOpt = {}) => {
  const func = [];
  if (dropTarget && dropTarget.nodeType === Node.ELEMENT_NODE &&
      dropTarget.classList.contains(DROP_TARGET) && isObjectNotEmpty(data)) {
    const {
      dragWindowId, dropWindowId, pinnedTabIds, tabIds,
    } = data;
    if (Number.isInteger(dragWindowId) && dragWindowId !== WINDOW_ID_NONE) {
      if (dragWindowId === dropWindowId) {
        const {shiftKey} = keyOpt;
        if (Array.isArray(pinnedTabIds) && pinnedTabIds.length) {
          const target = getTargetForDraggedTabs(dropTarget, {
            isPinnedTabIds: true,
          });
          const opt = {
            isPinned: true,
            windowId: dropWindowId,
          };
          let dropAfter, dropBefore;
          if (target === dropTarget) {
            dropAfter = dropTarget.classList.contains(DROP_TARGET_AFTER);
            dropBefore = dropTarget.classList.contains(DROP_TARGET_BEFORE);
          } else {
            dropAfter = true;
            dropBefore = false;
          }
          opt.dropAfter = dropAfter;
          opt.dropBefore = dropBefore;
          func.push(moveDroppedTabs(target, pinnedTabIds, opt));
        }
        if (Array.isArray(tabIds) && tabIds.length) {
          const target = getTargetForDraggedTabs(dropTarget, {
            isPinnedTabIds: false,
          });
          const targetParent = target.parentNode;
          const opt = {
            isGrouped: targetParent.classList.contains(CLASS_TAB_GROUP) ||
                       shiftKey,
            windowId: dropWindowId,
          };
          let dropAfter, dropBefore;
          if (target === dropTarget) {
            dropAfter = dropTarget.classList.contains(DROP_TARGET_AFTER);
            dropBefore = dropTarget.classList.contains(DROP_TARGET_BEFORE);
          } else {
            dropAfter = false;
            dropBefore = true;
          }
          opt.dropAfter = dropAfter;
          opt.dropBefore = dropBefore;
          func.push(moveDroppedTabs(target, tabIds, opt));
        }
      // dragged from other window
      } else {
        if (Array.isArray(pinnedTabIds) && pinnedTabIds.length) {
          const index = getDropIndexForDraggedTabs(dropTarget, {
            isPinnedTabIds: true,
          });
          Number.isInteger(index) && func.push(moveTab(pinnedTabIds, {
            index,
            windowId: dropWindowId,
          }));
        }
        if (Array.isArray(tabIds) && tabIds.length) {
          const index = getDropIndexForDraggedTabs(dropTarget, {
            isPinnedTabIds: false,
          });
          Number.isInteger(index) && func.push(moveTab(tabIds, {
            index,
            windowId: dropWindowId,
          }));
        }
      }
    }
  }
  return Promise.all(func);
};

/**
 * handle drop
 * @param {!Object} evt - event
 * @returns {Promise.<Array>} - results of each handler
 */
export const handleDrop = evt => {
  const {currentTarget, dataTransfer, shiftKey, type} = evt;
  const func = [];
  if (type === "drop") {
    const dropTarget = getSidebarTab(currentTarget);
    if (dropTarget && dropTarget.classList.contains(DROP_TARGET)) {
      const {windowId} = JSON.parse(dropTarget.dataset.tab);
      const uris = dataTransfer.getData(MIME_URI);
      const data = dataTransfer.getData(MIME_PLAIN);
      // dropped native tab or something
      if (uris) {
        const dropTargetIndex = getSidebarTabIndex(currentTarget);
        const lastTabIndex = document.querySelectorAll(TAB_QUERY).length - 1;
        const urlArr =
          uris.split("\n").filter(i => i && !i.startsWith("#")).reverse();
        const opts = [];
        let index;
        if (dropTarget.classList.contains(DROP_TARGET_BEFORE)) {
          index = dropTargetIndex;
        } else if (dropTarget.classList.contains(DROP_TARGET_AFTER) &&
                   dropTargetIndex < lastTabIndex) {
          index = dropTargetIndex + 1;
        }
        for (const url of urlArr) {
          const opt = {
            url, windowId,
          };
          if (Number.isInteger(index)) {
            opt.index = index;
          }
          opts.push(opt);
        }
        func.push(createTabsInOrder(opts));
        evt.preventDefault();
      } else if (data) {
        try {
          const item = JSON.parse(data);
          if (isObjectNotEmpty(item)) {
            const keyOpt = {
              shiftKey,
            };
            item.dropWindowId = windowId;
            func.push(extractDroppedTabs(dropTarget, item, keyOpt));
            evt.preventDefault();
          }
        } catch (e) {
          logErr(e);
        }
      }
    }
  }
  return Promise.all(func).catch(throwErr);
};

/**
 * handle dragend
 * @param {!Object} evt - event
 * @returns {void}
 */
export const handleDragEnd = evt => {
  const {type} = evt;
  if (type !== "dragend") {
    return;
  }
  const items = document.querySelectorAll(`.${DROP_TARGET}`);
  for (const item of items) {
    item.classList.remove(DROP_TARGET, DROP_TARGET_AFTER, DROP_TARGET_BEFORE);
  }
};

/**
 * handle dragleave
 * @param {!Object} evt - event
 * @returns {void}
 */
export const handleDragLeave = evt => {
  const {currentTarget, type} = evt;
  if (type !== "dragleave") {
    return;
  }
  const dropTarget = getSidebarTab(currentTarget);
  dropTarget && dropTarget.classList.remove(DROP_TARGET, DROP_TARGET_AFTER,
                                            DROP_TARGET_BEFORE);
};

/**
 * handle dragover
 * @param {!Object} evt - event
 * @returns {void}
 */
export const handleDragOver = evt => {
  const {clientY, currentTarget, dataTransfer, type} = evt;
  if (type !== "dragover") {
    return;
  }
  const data = dataTransfer.getData(MIME_PLAIN);
  const dropTarget = getSidebarTab(currentTarget);
  if (data && dropTarget) {
    let pinned;
    try {
      const item = JSON.parse(data);
      pinned = !!item.pinned;
    } catch (e) {
      pinned = false;
    }
    const isPinned = dropTarget.classList.contains(PINNED);
    if (isPinned && pinned || !(isPinned || pinned)) {
      const {bottom, top} = dropTarget.getBoundingClientRect();
      if (clientY > (bottom - top) / 2 + top) {
        dropTarget.classList.add(DROP_TARGET, DROP_TARGET_AFTER);
        dropTarget.classList.remove(DROP_TARGET_BEFORE);
      } else {
        dropTarget.classList.add(DROP_TARGET, DROP_TARGET_BEFORE);
        dropTarget.classList.remove(DROP_TARGET_AFTER);
      }
      dataTransfer.dropEffect = "move";
    } else {
      dropTarget.classList.remove(DROP_TARGET, DROP_TARGET_AFTER,
                                  DROP_TARGET_BEFORE);
      dataTransfer.dropEffect = "none";
    }
    evt.preventDefault();
  }
};

/**
 * handle dragenter
 * @param {!Object} evt - event
 * @returns {void}
 */
export const handleDragEnter = evt => {
  const {currentTarget, dataTransfer, type} = evt;
  if (type !== "dragenter") {
    return;
  }
  const data = dataTransfer.getData(MIME_PLAIN);
  const dropTarget = getSidebarTab(currentTarget);
  if (data && dropTarget) {
    let pinned;
    try {
      const item = JSON.parse(data);
      pinned = !!item.pinned;
    } catch (e) {
      pinned = false;
    }
    const isPinned = dropTarget.classList.contains(PINNED);
    if (isPinned && pinned || !(isPinned || pinned)) {
      dropTarget.classList.add(DROP_TARGET);
    }
  }
};

/**
 * handle dragstart
 * @param {!Object} evt - event
 * @param {Object} opt - options
 * @returns {void}
 */
export const handleDragStart = (evt, opt = {}) => {
  const {ctrlKey, currentTarget, dataTransfer, metaKey, type} = evt;
  if (type !== "dragstart") {
    return;
  }
  const {classList} = currentTarget;
  const {isMac, windowId} = opt;
  const container = getSidebarTabContainer(currentTarget);
  const data = {
    dragWindowId: windowId || windows.WINDOW_ID_CURRENT,
    pinned: classList.contains(PINNED),
  };
  let items;
  if (classList.contains(HIGHLIGHTED)) {
    items = document.querySelectorAll(`${TAB_QUERY}.${HIGHLIGHTED}`);
  } else if (container && container.classList.contains(CLASS_TAB_GROUP) &&
             (isMac && metaKey || !isMac && ctrlKey)) {
    items = container.querySelectorAll(TAB_QUERY);
    for (const item of items) {
      item.classList.add(HIGHLIGHTED);
    }
  }
  if (items && items.length) {
    const pinnedTabIds = [];
    const tabIds = [];
    for (const item of items) {
      const tabId = getSidebarTabId(item);
      if (item.parentNode.classList.contains(PINNED)) {
        pinnedTabIds.push(tabId);
      } else {
        tabIds.push(tabId);
      }
    }
    data.pinnedTabIds = pinnedTabIds;
    data.tabIds = tabIds;
  } else {
    const tabId = getSidebarTabId(currentTarget);
    if (currentTarget.parentNode.classList.contains(PINNED)) {
      data.pinnedTabIds = [tabId];
    } else {
      data.tabIds = [tabId];
    }
  }
  dataTransfer.effectAllowed = "move";
  dataTransfer.setData(MIME_PLAIN, JSON.stringify(data));
};
