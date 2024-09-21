/**
 * tab-dnd.js
 */

/* shared */
import {
  isURISync, sanitizeURL, sanitizeURLSync
} from '../lib/url/url-sanitizer-wo-dompurify.min.js';
import {
  createTab, duplicateTab, moveTab, searchWithSearchEngine, updateTab
} from './browser.js';
import {
  createTabsInOrder, highlightTabs, moveTabsInOrder
} from './browser-tabs.js';
import { isObjectNotEmpty, isString, throwErr } from './common.js';
import { requestSaveSession } from './session.js';
import { restoreTabContainers } from './tab-group.js';
import {
  activateTab, getSidebarTab, getSidebarTabId, getSidebarTabIndex, getTemplate
} from './util.js';
import {
  CLASS_HEADING, CLASS_TAB_CONTAINER_TMPL, CLASS_TAB_GROUP,
  DROP_TARGET, DROP_TARGET_AFTER, DROP_TARGET_BEFORE, HIGHLIGHTED,
  MIME_JSON, MIME_MOZ_URL, MIME_PLAIN, MIME_URI, PINNED, SIDEBAR_MAIN, TAB_QUERY
} from './constant.js';

/* api */
const { windows } = browser;

/* constants */
const { WINDOW_ID_NONE } = windows;
const HALF = 0.5;
const ONE_THIRD = 1 / 3;

/**
 * move dropped tabs
 * @param {object} dropTarget - drop target
 * @param {object} [opt] - options
 * @returns {Promise.<Array>} - result of each handler
 */
export const moveDroppedTabs = async (dropTarget, opt = {}) => {
  const func = [];
  const {
    beGrouped, dropAfter, dropBefore, pinned, tabGroup, tabIds, windowId
  } = opt;
  const target = getSidebarTab(dropTarget);
  if (target && Array.isArray(tabIds)) {
    const targetParent = target.parentNode;
    let groupContainer;
    if (tabGroup && !pinned && !beGrouped) {
      const [tabId] = tabIds;
      const item = document.querySelector(`[data-tab-id="${tabId}"]`);
      if (item) {
        groupContainer = item.parentNode;
        if (dropBefore) {
          targetParent.parentNode.insertBefore(groupContainer, targetParent);
        } else {
          targetParent.parentNode
            .insertBefore(groupContainer, targetParent.nextElementSibling);
        }
      }
    }
    const arr = [];
    const moveArr = dropAfter ? tabIds.toReversed() : tabIds;
    const l = moveArr.length;
    let i = 0;
    while (i < l) {
      const itemId = moveArr[i];
      const item = document.querySelector(`[data-tab-id="${itemId}"]`);
      if (item) {
        if (groupContainer) {
          arr.push({
            index: getSidebarTabIndex(item),
            tabId: itemId
          });
        } else if (pinned) {
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
        } else if (beGrouped) {
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
      if (groupContainer) {
        const { index: itemIndex, tabId: itemId } = arr.pop();
        await moveTab(itemId, {
          windowId,
          index: itemIndex
        });
      }
      func.push(moveTabsInOrder(arr, windowId));
    }
  }
  return Promise.all(func);
};

/**
 * get target for dragged tabs
 * @param {object} [dropTarget] - drop target
 * @param {object} [opt] - options
 * @returns {object} - element
 */
export const getTargetForDraggedTabs = (dropTarget, opt) => {
  let target;
  if (dropTarget?.nodeType === Node.ELEMENT_NODE &&
      dropTarget?.classList.contains(DROP_TARGET) && isObjectNotEmpty(opt)) {
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
 * @param {object} [dropTarget] - drop target
 * @param {object} [opt] - options
 * @returns {number} - index;
 */
export const getDropIndexForDraggedTabs = (dropTarget, opt) => {
  let index;
  if (dropTarget?.nodeType === Node.ELEMENT_NODE &&
      dropTarget?.classList.contains(DROP_TARGET) && isObjectNotEmpty(opt)) {
    const { copy, isPinnedTabIds } = opt;
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
      if (copy) {
        index = dropTargetIndex + 1;
      } else {
        index = -1;
      }
    } else {
      index = dropTargetIndex + 1;
    }
  }
  return index;
};

/**
 * extract dropped tabs data
 * @param {object} [dropTarget] - target element
 * @param {object} [data] - dragged data
 * @returns {Promise.<Array>} - results of each handler
 */
export const extractDroppedTabs = async (dropTarget, data) => {
  const func = [];
  if (dropTarget?.nodeType === Node.ELEMENT_NODE &&
      dropTarget?.classList.contains(DROP_TARGET) && isObjectNotEmpty(data)) {
    const {
      beGrouped, dragTabId, dragWindowId, dropEffect, dropWindowId,
      pinnedTabIds, tabGroup, tabIds
    } = data;
    if (Number.isInteger(dragWindowId) && dragWindowId !== WINDOW_ID_NONE) {
      if (dropEffect === 'move') {
        if (dragWindowId === dropWindowId) {
          if (Array.isArray(pinnedTabIds) && pinnedTabIds.length) {
            const target = getTargetForDraggedTabs(dropTarget, {
              isPinnedTabIds: true
            });
            const opt = {
              dropAfter: true,
              dropBefore: false,
              pinned: true,
              tabIds: pinnedTabIds,
              windowId: dropWindowId
            };
            if (target === dropTarget &&
                dropTarget.classList.contains(DROP_TARGET_BEFORE)) {
              opt.dropAfter = false;
              opt.dropBefore = true;
            }
            func.push(moveDroppedTabs(target, opt));
          }
          if (Array.isArray(tabIds) && tabIds.length) {
            const target = getTargetForDraggedTabs(dropTarget, {
              isPinnedTabIds: false
            });
            const opt = {
              beGrouped,
              tabGroup,
              tabIds,
              dropAfter: false,
              dropBefore: true,
              windowId: dropWindowId
            };
            if (target === dropTarget &&
                dropTarget.classList.contains(DROP_TARGET_AFTER)) {
              opt.dropAfter = true;
              opt.dropBefore = false;
            }
            func.push(moveDroppedTabs(target, opt));
          }
        // dragged from other window
        } else {
          if (Array.isArray(pinnedTabIds) && pinnedTabIds.length) {
            const index = getDropIndexForDraggedTabs(dropTarget, {
              isPinnedTabIds: true
            });
            if (Number.isInteger(index)) {
              func.push(moveTab(pinnedTabIds, {
                index,
                windowId: dropWindowId
              }));
            }
          }
          if (Array.isArray(tabIds) && tabIds.length) {
            const index = getDropIndexForDraggedTabs(dropTarget, {
              isPinnedTabIds: false
            });
            // TODO: add tabGroup case and beGrouped case handlers
            if (Number.isInteger(index)) {
              func.push(moveTab(tabIds, {
                index,
                windowId: dropWindowId
              }));
            }
          }
        }
      } else if (dropEffect === 'copy') {
        const index = getDropIndexForDraggedTabs(dropTarget, {
          copy: true,
          isPinnedTabIds: false
        });
        if (Number.isInteger(index)) {
          if (dragWindowId === dropWindowId) {
            func.push(duplicateTab(dragTabId, {
              index,
              active: false
            }));
            if (Array.isArray(pinnedTabIds) && pinnedTabIds.length) {
              const dupeArr = pinnedTabIds.toReversed();
              for (const tabId of dupeArr) {
                if (tabId !== dragTabId) {
                  func.push(duplicateTab(tabId, {
                    index,
                    active: false
                  }));
                }
              }
            }
            if (Array.isArray(tabIds) && tabIds.length) {
              const dupeArr = tabIds.toReversed();
              for (const tabId of dupeArr) {
                if (tabId !== dragTabId) {
                  func.push(duplicateTab(tabId, {
                    index,
                    active: false
                  }));
                }
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
                if (tabId !== dragTabId) {
                  arr.push(duplicateTab(tabId, {
                    active: false
                  }));
                }
              }
            }
            if (Array.isArray(tabIds) && tabIds.length) {
              for (const tabId of tabIds) {
                if (tabId !== dragTabId) {
                  arr.push(duplicateTab(tabId, {
                    active: false
                  }));
                }
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
 * @param {object} [dropTarget] - target element
 * @param {Array} [data] - uri list
 * @returns {Promise.<Array>} - results of each handler
 */
export const openUriList = async (dropTarget, data = []) => {
  const func = [];
  if (dropTarget?.nodeType === Node.ELEMENT_NODE &&
      Array.isArray(data) && data.length) {
    const isMain = dropTarget === document.getElementById(SIDEBAR_MAIN);
    if (dropTarget.classList.contains(DROP_TARGET)) {
      if (data.length === 1 &&
          !dropTarget.classList.contains(DROP_TARGET_BEFORE) &&
          !dropTarget.classList.contains(DROP_TARGET_AFTER)) {
        const [value] = data;
        const url = await sanitizeURL(value, {
          allow: ['blob', 'data', 'file']
        });
        if (url) {
          const dropTargetId = getSidebarTabId(dropTarget);
          func.push(updateTab(dropTargetId, {
            url,
            active: true
          }));
        }
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
        for (const value of data) {
          const url = sanitizeURLSync(value, {
            allow: ['data', 'file']
          });
          if (url) {
            const opt = {
              url,
              windowId
            };
            if (Number.isInteger(index)) {
              opt.index = index;
            }
            opts.push(opt);
          }
        }
        func.push(createTabsInOrder(opts).then(restoreTabContainers)
          .then(requestSaveSession));
      }
    } else if (isMain) {
      const opts = [];
      for (const value of data) {
        const url = sanitizeURLSync(value, {
          allow: ['data', 'file']
        });
        if (url) {
          const opt = {
            url
          };
          opts.push(opt);
        }
      }
      func.push(createTabsInOrder(opts).then(restoreTabContainers)
        .then(requestSaveSession));
    }
  }
  return Promise.all(func);
};

/**
 * search dropped query
 * @param {object} [dropTarget] - target element
 * @param {string} [data] - seach query
 * @returns {Promise.<Array>} - results of each handler
 */
export const searchQuery = async (dropTarget, data = '') => {
  const func = [];
  if (dropTarget?.nodeType === Node.ELEMENT_NODE &&
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
 * @param {!object} evt - event
 * @returns {?Promise|undefined} - promise chain
 */
export const handleDrop = evt => {
  const { currentTarget, dataTransfer, shiftKey, type } = evt;
  if (type !== 'drop') {
    return;
  }
  const { dropEffect, types: dataTypes } = dataTransfer;
  let func;
  if (dropEffect === 'copy' || dropEffect === 'move') {
    const dropTarget = getSidebarTab(currentTarget);
    const isMain = currentTarget === document.getElementById(SIDEBAR_MAIN);
    if (dropTarget?.classList.contains(DROP_TARGET)) {
      evt.preventDefault();
      evt.stopPropagation();
      // dropped tab
      if (dataTypes.includes(MIME_JSON)) {
        const data = JSON.parse(dataTransfer.getData(MIME_JSON));
        if (data && isObjectNotEmpty(data)) {
          const { pinned, windowId } = JSON.parse(dropTarget.dataset.tab);
          data.dropEffect = dropEffect;
          data.dropWindowId = windowId;
          let beGrouped;
          if (!pinned) {
            if (shiftKey) {
              beGrouped = true;
            } else {
              const container = dropTarget.parentNode;
              if (container?.classList.contains(CLASS_TAB_GROUP)) {
                const heading = container.querySelector(`.${CLASS_HEADING}`);
                const childTabs = container.querySelectorAll(TAB_QUERY);
                // if drop target is the first tab
                if (dropTarget === childTabs[0]) {
                  if (!heading.hidden ||
                      dropTarget.classList.contains(DROP_TARGET_AFTER)) {
                    beGrouped = true;
                  }
                // if drop target is the last tab
                } else if (dropTarget === childTabs[childTabs.length - 1]) {
                  if (dropTarget.classList.contains(DROP_TARGET_BEFORE)) {
                    beGrouped = true;
                  }
                } else {
                  beGrouped = true;
                }
              }
            }
          }
          data.beGrouped = !!beGrouped;
          func = extractDroppedTabs(dropTarget, data)
            .then(restoreTabContainers).then(requestSaveSession)
            .catch(throwErr);
        }
      // uri list
      } else if (dataTypes.includes(MIME_URI)) {
        const data = dataTransfer.getData(MIME_URI).split('\n')
          .filter(i => i && !i.startsWith('#')).reverse();
        if (data.length) {
          func = openUriList(dropTarget, data).catch(throwErr);
        }
      // string
      } else {
        const data = dataTransfer.getData(MIME_PLAIN);
        if (data) {
          if (isURISync(data)) {
            func = openUriList(dropTarget, [data]).catch(throwErr);
          } else {
            func = searchQuery(dropTarget, data).catch(throwErr);
          }
        }
      }
    } else if (isMain && !dataTypes.includes(MIME_JSON)) {
      evt.preventDefault();
      evt.stopPropagation();
      // uri list
      if (dataTypes.includes(MIME_URI)) {
        const data = dataTransfer.getData(MIME_URI).split('\n')
          .filter(i => i && !i.startsWith('#')).reverse();
        if (data.length) {
          func = openUriList(currentTarget, data).catch(throwErr);
        }
      // string
      } else {
        const data = dataTransfer.getData(MIME_PLAIN);
        if (data) {
          if (isURISync(data)) {
            func = openUriList(currentTarget, [data]).catch(throwErr);
          } else {
            func = searchQuery(currentTarget, data).catch(throwErr);
          }
        }
      }
    }
  }
  return func || null;
};

/**
 * handle dragend
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
 * @param {!object} evt - event
 * @returns {void}
 */
export const handleDragLeave = evt => {
  const { currentTarget, type } = evt;
  if (type !== 'dragleave') {
    return;
  }
  const dropTarget = getSidebarTab(currentTarget);
  if (dropTarget) {
    dropTarget.classList.remove(
      DROP_TARGET, DROP_TARGET_AFTER, DROP_TARGET_BEFORE
    );
  }
};

/**
 * handle dragover
 * @param {!object} evt - event
 * @param {object} [opt] - options
 * @param {boolean} [opt.isMac] - is Mac
 * @returns {void}
 */
export const handleDragOver = (evt, opt = {}) => {
  const { altKey, clientY, ctrlKey, currentTarget, dataTransfer, type } = evt;
  if (type !== 'dragover') {
    return;
  }
  const { types: dataTypes } = dataTransfer;
  const hasDataTypes = dataTypes.some(
    mime => mime === MIME_JSON || mime === MIME_URI || mime === MIME_PLAIN
  );
  if (hasDataTypes) {
    const dropTarget = getSidebarTab(currentTarget);
    if (dropTarget) {
      evt.preventDefault();
      evt.stopPropagation();
      const { bottom, top } = dropTarget.getBoundingClientRect();
      if (dataTypes.includes(MIME_JSON)) {
        const isPinned = dropTarget.classList.contains(PINNED);
        const data = dataTransfer.getData(MIME_JSON);
        const { pinned } = JSON.parse(data);
        if ((isPinned && pinned) || !(isPinned || pinned)) {
          const { isMac } = opt;
          if ((isMac && altKey) || (!isMac && ctrlKey)) {
            dataTransfer.dropEffect = 'copy';
          } else {
            dataTransfer.dropEffect = 'move';
          }
        } else {
          dataTransfer.dropEffect = 'none';
        }
        if (dataTransfer.dropEffect === 'copy' ||
            dataTransfer.dropEffect === 'move') {
          if (clientY > (bottom - top) * HALF + top) {
            dropTarget.classList.add(DROP_TARGET, DROP_TARGET_AFTER);
            dropTarget.classList.remove(DROP_TARGET_BEFORE);
          } else {
            dropTarget.classList.add(DROP_TARGET, DROP_TARGET_BEFORE);
            dropTarget.classList.remove(DROP_TARGET_AFTER);
          }
        } else {
          dropTarget.classList.remove(DROP_TARGET, DROP_TARGET_AFTER,
            DROP_TARGET_BEFORE);
        }
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
    } else {
      const isMain = currentTarget === document.getElementById(SIDEBAR_MAIN);
      if (isMain) {
        evt.preventDefault();
        evt.stopPropagation();
      }
    }
  }
};

/**
 * handle dragenter
 * @param {!object} evt - event
 * @returns {void}
 */
export const handleDragEnter = evt => {
  const { currentTarget, dataTransfer, type } = evt;
  if (type !== 'dragenter') {
    return;
  }
  const { types: dataTypes } = dataTransfer;
  const dropTarget = getSidebarTab(currentTarget);
  const hasDataTypes = dataTypes.some(
    mime => mime === MIME_JSON || mime === MIME_URI || mime === MIME_PLAIN
  );
  if (hasDataTypes && dropTarget) {
    const data = dataTransfer.getData(MIME_JSON);
    if (data) {
      const { pinned } = JSON.parse(data);
      const isPinned = dropTarget.classList.contains(PINNED);
      if ((isPinned && pinned) || !(isPinned || pinned)) {
        dropTarget.classList.add(DROP_TARGET);
      }
    } else if (dataTransfer.getData(MIME_URI) ||
               dataTransfer.getData(MIME_PLAIN)) {
      dropTarget.classList.add(DROP_TARGET);
    }
  }
};

/**
 * handle dragstart
 * @param {!object} evt - event
 * @param {object} [opt] - options
 * @param {boolean} [opt.isMac] - is Mac
 * @returns {Promise.<Array>|undefined} - result of each handler
 */
export const handleDragStart = (evt, opt = {}) => {
  const {
    altKey, ctrlKey, currentTarget, dataTransfer, metaKey, shiftKey, type
  } = evt;
  if (type !== 'dragstart') {
    return;
  }
  const tab = getSidebarTab(currentTarget);
  const func = [];
  if (tab) {
    const { isMac, windowId } = opt;
    const dragTabId = getSidebarTabId(tab);
    const container = tab.parentNode;
    const pinned = tab.classList.contains(PINNED);
    const highlightedTabs =
      document.querySelectorAll(`${TAB_QUERY}.${HIGHLIGHTED}`);
    const data = {
      dragTabId,
      pinned,
      dragWindowId: windowId || windows.WINDOW_ID_CURRENT,
      beGrouped: false,
      tabGroup: false,
      pinnedTabIds: [],
      tabIds: []
    };
    const items = [];
    if (shiftKey) {
      if (container.classList.contains(CLASS_TAB_GROUP) &&
          ((isMac && metaKey) || (!isMac && ctrlKey))) {
        items.push(...container.querySelectorAll(TAB_QUERY));
        data.tabGroup = true;
      } else if (tab.classList.contains(HIGHLIGHTED)) {
        items.push(...highlightedTabs);
      } else {
        items.push(tab, ...highlightedTabs);
      }
    } else if ((isMac && metaKey) || (!isMac && ctrlKey)) {
      if (tab.classList.contains(HIGHLIGHTED)) {
        items.push(...highlightedTabs);
      } else {
        items.push(tab, ...highlightedTabs);
      }
    } else {
      items.push(tab);
    }
    const mozUrlList = [];
    const uriList = [];
    for (const item of items) {
      const itemTabId = getSidebarTabId(item);
      const itemTabsTab = JSON.parse(item.dataset.tab);
      const { title: itemTabTitle, url: itemTabURL } = itemTabsTab;
      if (item.parentNode.classList.contains(PINNED)) {
        data.pinnedTabIds.push(itemTabId);
      } else {
        data.tabIds.push(itemTabId);
      }
      mozUrlList.push(`${itemTabURL}\n${itemTabTitle}`);
      uriList.push(itemTabURL);
    }
    dataTransfer.effectAllowed = 'copyMove';
    dataTransfer.setData(MIME_JSON, JSON.stringify(data));
    if (altKey) {
      dataTransfer.setData(MIME_MOZ_URL, mozUrlList.join('\n'));
      dataTransfer.setData(MIME_PLAIN, uriList.join('\n'));
    }
    func.push(highlightTabs(items, {
      tabId: dragTabId,
      windowId
    }));
  }
  return Promise.all(func).catch(throwErr);
};

// For test
export { ports } from './session.js';
