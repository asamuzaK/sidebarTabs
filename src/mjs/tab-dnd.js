/**
 * tab-dnd.js
 */

/* shared */
import {
  isURISync, sanitizeURLSync
} from '../lib/url/url-sanitizer-wo-dompurify.min.js';
import {
  createTab, duplicateTab, getTab, getWindow, highlightTab, moveTab,
  searchWithSearchEngine, updateTab
} from './browser.js';
import { highlightTabs } from './browser-tabs.js';
import { isObjectNotEmpty, throwErr } from './common.js';
import { requestSaveSession } from './session.js';
import { restoreTabContainers } from './tab-group.js';
import {
  getSidebarTab, getSidebarTabId, getSidebarTabIndex, getTemplate
} from './util.js';
import {
  CLASS_HEADING, CLASS_TAB_CONTAINER_TMPL, CLASS_TAB_GROUP,
  DROP_TARGET, DROP_TARGET_AFTER, DROP_TARGET_BEFORE, HIGHLIGHTED,
  MIME_JSON, MIME_MOZ_URL, MIME_PLAIN, MIME_URI, PINNED, SIDEBAR_MAIN, TAB_QUERY
} from './constant.js';

/* api */
const { windows } = browser;

/* constants */
const HALF = 0.5;
const ONE_THIRD = 1 / 3;

/**
 * clear drop target
 * @returns {void}
 */
export const clearDropTarget = () => {
  const items = document.querySelectorAll(`.${DROP_TARGET}`);
  for (const item of items) {
    item.classList.remove(DROP_TARGET, DROP_TARGET_AFTER, DROP_TARGET_BEFORE);
  }
};

/**
 * create search tab
 * @param {string} query - query string
 * @param {object} opt - create tab options
 * @returns {object} - tabs.Tab
 */
export const createSearchTab = async (query, opt) => {
  const { id: tabId } = await createTab(opt);
  await searchWithSearchEngine(query, {
    tabId
  });
  const tab = await getTab(tabId);
  return tab;
};

/**
 * create dropped text tabs in order
 * @param {Array.<Array>} opts - array of [{ type, value }, opt]
 * @param {boolean} pop - pop item from array
 * @returns {Promise|undefined} - recurse createOrSearchTabsInOrder()
 */
export const createDroppedTextTabsInOrder = async (opts = [], pop = false) => {
  let item;
  if (pop) {
    item = opts.pop();
  } else {
    item = opts.shift();
  }
  if (item) {
    const [{ type, value }, opt = {}] = item;
    if (type === 'url') {
      opt.url = value;
      await createTab(opt);
    } else {
      await createSearchTab(value, opt);
    }
  }
  let func;
  if (opts.length) {
    func = createDroppedTextTabsInOrder(opts, pop);
  }
  return func;
};

/**
 * handle dropped text
 * @param {object} target - drop target
 * @param {object} data - dragged data
 * @returns {?Promise} - results of each handler
 */
export const handleDroppedText = async (target, data) => {
  let func;
  if (target?.nodeType === Node.ELEMENT_NODE && isObjectNotEmpty(data)) {
    const {
      dropAfter, dropBefore, dropEffect, dropWindowId, mime, textValue
    } = data;
    if ((dropEffect === 'move' || dropEffect === 'copy') && textValue) {
      const items = textValue.trim().split(/\r?\n/g).flatMap(item => {
        if (mime === MIME_URI || mime === MIME_PLAIN) {
          if (!item || (mime === MIME_URI && item.startsWith('#'))) {
            return [];
          }
          if (mime === MIME_URI || isURISync(item)) {
            const url = sanitizeURLSync(item);
            if (url) {
              return {
                type: 'url',
                value: url
              };
            }
            return [];
          } else {
            return {
              type: 'search',
              value: item
            };
          }
        }
        return [];
      });
      if (items.length) {
        const targetIndex = getSidebarTabIndex(target);
        const pinned = target.classList.contains(PINNED);
        const pinnedContainer = document.getElementById(PINNED);
        const { nextElementSibling: unpinnedContainer } = pinnedContainer;
        const unpinnedTab = unpinnedContainer.querySelector(TAB_QUERY);
        const unpinnedTabIndex = getSidebarTabIndex(unpinnedTab);
        const [firstItem, ...values] = items;
        const { type: firstType, value: firstValue } = firstItem;
        let tab;
        // create tab with firstValue before unpinnedTab, activate
        if (pinned) {
          if (firstType === 'url') {
            tab = await createTab({
              active: true,
              index: unpinnedTabIndex,
              url: firstValue,
              windowId: dropWindowId
            });
          } else if (firstType === 'search') {
            tab = await createSearchTab(firstValue, {
              active: true,
              index: unpinnedTabIndex,
              windowId: dropWindowId
            });
          }
        // create tab with firstValue before/after target, activate
        } else if (dropAfter || dropBefore) {
          if (firstType === 'url') {
            tab = await createTab({
              active: true,
              index: dropBefore ? targetIndex : targetIndex + 1,
              url: firstValue,
              windowId: dropWindowId
            });
          } else if (firstType === 'search') {
            tab = await createSearchTab(firstValue, {
              active: true,
              index: dropBefore ? targetIndex : targetIndex + 1,
              windowId: dropWindowId
            });
          }
        // update target with firstValue
        } else {
          const tabId = getSidebarTabId(target);
          if (firstType === 'url') {
            tab = await updateTab(tabId, {
              active: true,
              url: firstValue
            });
          } else if (firstType === 'search') {
            await searchWithSearchEngine(firstValue, {
              tabId
            });
            tab = await updateTab(tabId, {
              active: true
            });
          }
        }
        // create tabs after first tab in reverse order
        if (tab && values.length) {
          const { index } = tab;
          const opt = {
            index,
            active: false,
            windowId: dropWindowId
          };
          const opts = [];
          for (const value of values) {
            opts.push([value, opt]);
          }
          func = createDroppedTextTabsInOrder(opts, true);
        }
      }
    }
  }
  return func || null;
};

/**
 * handle dropped tabs
 * @param {object} target - drop target
 * @param {object} data - dragged data
 * @returns {?Promise} - moveTab() / highlightTab() / updateTab()
 */
export const handleDroppedTabs = async (target, data) => {
  let func;
  if (target?.nodeType === Node.ELEMENT_NODE && isObjectNotEmpty(data)) {
    const {
      beGrouped, dragTabId, dragWindowId, dropBefore, dropEffect, dropWindowId,
      pinnedTabIds, tabGroup, tabIds
    } = data;
    const { tabs: draggedWindowTabs } = await getWindow(dragWindowId, {
      populate: true
    });
    let isTabData;
    for (const tab of draggedWindowTabs) {
      isTabData = tab.id === dragTabId;
      if (isTabData) {
        break;
      }
    }
    if (isTabData) {
      const targetIndex = getSidebarTabIndex(target);
      const targetNext = target.nextElementSibling ?? null;
      const targetContainer = target.parentNode;
      const targetContainerNext = targetContainer.nextElementSibling ?? null;
      const pinned = target.classList.contains(PINNED);
      const pinnedContainer = document.getElementById(PINNED);
      const { nextElementSibling: unpinnedContainer } = pinnedContainer;
      const unpinnedTab = unpinnedContainer.querySelector(TAB_QUERY);
      const unpinnedTabIndex = getSidebarTabIndex(unpinnedTab);
      const mainContainer = document.getElementById(SIDEBAR_MAIN);
      if (dragWindowId === dropWindowId) {
        // drop target is pinned
        if (pinned) {
          // move to pinned area
          if (dropEffect === 'move' && pinnedTabIds.length) {
            let offset = 0;
            for (const tabId of pinnedTabIds) {
              const item = document.querySelector(`[data-tab-id="${tabId}"]`);
              const itemIndex = getSidebarTabIndex(item);
              if (itemIndex < targetIndex) {
                offset = -1;
              }
              if (dropBefore) {
                pinnedContainer.insertBefore(item, target);
              } else {
                pinnedContainer.insertBefore(item, targetNext);
              }
            }
            func = moveTab(pinnedTabIds, {
              index: (dropBefore ? targetIndex : targetIndex + 1) + offset,
              windowId: dropWindowId
            });
          // copy as first unpinned tabs
          } else if (dropEffect === 'copy') {
            const dupeArr = [];
            if (tabIds.length) {
              const items = tabIds.toReversed();
              for (const tabId of items) {
                dupeArr.push(duplicateTab(tabId, {
                  active: false,
                  index: unpinnedTabIndex
                }));
              }
            }
            if (pinnedTabIds.length) {
              const items = pinnedTabIds.toReversed();
              for (const tabId of items) {
                dupeArr.push(duplicateTab(tabId, {
                  active: false,
                  index: unpinnedTabIndex
                }).then(tab => updateTab(tab.id, {
                  pinned: false
                })));
              }
            }
            const dupedTabs = await Promise.all(dupeArr.toReversed());
            if ((beGrouped && dupeArr.length > 1) || tabGroup) {
              const container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
              for (const tab of dupedTabs) {
                const { id: tabId } = tab;
                const item = document.querySelector(`[data-tab-id="${tabId}"]`);
                container.appendChild(item);
              }
              container.classList.add(CLASS_TAB_GROUP);
              mainContainer.insertBefore(container, unpinnedContainer);
              container.removeAttribute('hidden');
            } else {
              for (const tab of dupedTabs) {
                const { id: tabId } = tab;
                const item = document.querySelector(`[data-tab-id="${tabId}"]`);
                const container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
                container.appendChild(item);
                mainContainer.insertBefore(container, unpinnedContainer);
                container.removeAttribute('hidden');
              }
            }
          }
        // drop target is not pinned
        // move to unpinned area
        } else if (dropEffect === 'move' && tabIds.length) {
          let offset = 0;
          if (beGrouped) {
            for (const tabId of tabIds) {
              const item = document.querySelector(`[data-tab-id="${tabId}"]`);
              const itemIndex = getSidebarTabIndex(item);
              if (itemIndex < targetIndex) {
                offset = -1;
              }
              if (dropBefore) {
                targetContainer.insertBefore(item, target);
              } else {
                targetContainer.insertBefore(item, targetNext);
              }
            }
            targetContainer.classList.add(CLASS_TAB_GROUP);
          } else if (tabGroup) {
            const container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
            for (const tabId of tabIds) {
              const item = document.querySelector(`[data-tab-id="${tabId}"]`);
              const itemIndex = getSidebarTabIndex(item);
              if (itemIndex < targetIndex) {
                offset = -1;
              }
              container.appendChild(item);
            }
            if (dropBefore) {
              mainContainer.insertBefore(container, targetContainer);
            } else {
              mainContainer.insertBefore(container, targetContainerNext);
            }
            container.classList.add(CLASS_TAB_GROUP);
            container.removeAttribute('hidden');
          } else {
            for (const tabId of tabIds) {
              const item = document.querySelector(`[data-tab-id="${tabId}"]`);
              const itemIndex = getSidebarTabIndex(item);
              if (itemIndex < targetIndex) {
                offset = -1;
              }
              const container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
              container.appendChild(item);
              if (dropBefore) {
                mainContainer.insertBefore(container, targetContainer);
              } else {
                mainContainer.insertBefore(container, targetContainerNext);
              }
              container.removeAttribute('hidden');
            }
          }
          func = moveTab(tabIds, {
            index: (dropBefore ? targetIndex : targetIndex + 1) + offset,
            windowId: dropWindowId
          });
        // drop target is not pinned
        } else if (dropEffect === 'copy') {
          const dupeArr = [];
          if (tabIds.length) {
            const items = tabIds.toReversed();
            for (const tabId of items) {
              dupeArr.push(duplicateTab(tabId, {
                active: false,
                index: dropBefore ? targetIndex : targetIndex + 1
              }));
            }
          }
          if (pinnedTabIds.length) {
            const items = pinnedTabIds.toReversed();
            for (const tabId of items) {
              dupeArr.push(duplicateTab(tabId, {
                active: false,
                index: dropBefore ? targetIndex : targetIndex + 1
              }).then(tab => updateTab(tab.id, {
                pinned: false
              })));
            }
          }
          if (dupeArr.length) {
            const dupedTabs = await Promise.all(dupeArr.toReversed());
            if (beGrouped) {
              for (const tab of dupedTabs) {
                const { id: tabId } = tab;
                const item = document.querySelector(`[data-tab-id="${tabId}"]`);
                if (dropBefore) {
                  targetContainer.insertBefore(item, target);
                } else {
                  targetContainer.insertBefore(item, targetNext);
                }
              }
              targetContainer.classList.add(CLASS_TAB_GROUP);
            } else if (tabGroup) {
              const container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
              for (const tab of dupedTabs) {
                const { id: tabId } = tab;
                const item = document.querySelector(`[data-tab-id="${tabId}"]`);
                container.appendChild(item);
              }
              if (dropBefore) {
                mainContainer.insertBefore(container, targetContainer);
              } else {
                mainContainer.insertBefore(container, targetContainerNext);
              }
              container.classList.add(CLASS_TAB_GROUP);
              container.removeAttribute('hidden');
            } else {
              for (const tab of dupedTabs) {
                const { id: tabId } = tab;
                const item = document.querySelector(`[data-tab-id="${tabId}"]`);
                const container = getTemplate(CLASS_TAB_CONTAINER_TMPL);
                container.appendChild(item);
                if (dropBefore) {
                  mainContainer.insertBefore(container, targetContainer);
                } else {
                  mainContainer.insertBefore(container, targetContainerNext);
                }
                container.removeAttribute('hidden');
              }
            }
          }
        }
      // tabs are dragged from other window
      } else {
        // drop target is pinned
        if (pinned) {
          // move to pinned, highlight, dragged active tab is activated,
          // groupings are cancelled
          if (dropEffect === 'move') {
            const moveArr = [...pinnedTabIds, ...tabIds];
            if (moveArr.length) {
              const movedTabs = await moveTab(moveArr, {
                index: dropBefore ? targetIndex : targetIndex + 1,
                windowId: dropWindowId
              });
              const highlightArr = [];
              for (const tab of movedTabs) {
                const { active, index } = tab;
                if (active) {
                  highlightArr.unshift(index);
                } else {
                  highlightArr.push(index);
                }
              }
              func = highlightTab(highlightArr, dropWindowId);
            }
          // copy as first unpinned tabs, first tab is activated,
          // groupings are cancelled
          } else if (dropEffect === 'copy') {
            const dupeArr = [];
            if (tabIds.length) {
              const items = tabIds.toReversed();
              for (const tabId of items) {
                dupeArr.push(duplicateTab(tabId, {
                  active: false
                }));
              }
            }
            if (pinnedTabIds.length) {
              const items = pinnedTabIds.toReversed();
              for (const tabId of items) {
                dupeArr.push(duplicateTab(tabId, {
                  active: false
                }));
              }
            }
            if (dupeArr.length) {
              const dupedTabs = await Promise.all(dupeArr.toReversed());
              const moveArr = [];
              for (const tab of dupedTabs) {
                const { id: tabId } = tab;
                moveArr.push(tabId);
              }
              await moveTab(moveArr, {
                index: unpinnedTabIndex,
                windowId: dropWindowId
              });
              const [activateTabId] = moveArr;
              func = updateTab(activateTabId, {
                active: true
              });
            }
          }
        // drop target is not pinned
        // move to unpinned, highlight, dragged active tab is activated,
        // groupings are cancelled
        } else if (dropEffect === 'move') {
          const moveArr = [...pinnedTabIds, ...tabIds];
          if (moveArr.length) {
            const movedTabs = await moveTab(moveArr, {
              index: dropBefore ? targetIndex : targetIndex + 1,
              windowId: dropWindowId
            });
            const highlightArr = [];
            for (const tab of movedTabs) {
              const { active, index } = tab;
              if (active) {
                highlightArr.unshift(index);
              } else {
                highlightArr.push(index);
              }
            }
            func = highlightTab(highlightArr, dropWindowId);
          }
        // drop target is not pinned
        // copy to unpinned, first tab is activated, groupings are cancelled
        } else if (dropEffect === 'copy') {
          const dupeArr = [];
          if (tabIds.length) {
            const items = tabIds.toReversed();
            for (const tabId of items) {
              dupeArr.push(duplicateTab(tabId, {
                active: false
              }));
            }
          }
          if (pinnedTabIds.length) {
            const items = pinnedTabIds.toReversed();
            for (const tabId of items) {
              dupeArr.push(duplicateTab(tabId, {
                active: false
              }));
            }
          }
          if (dupeArr.length) {
            const dupedTabs = await Promise.all(dupeArr.toReversed());
            const moveArr = [];
            for (const tab of dupedTabs) {
              const { id: tabId } = tab;
              moveArr.push(tabId);
            }
            await moveTab(moveArr, {
              index: dropBefore ? targetIndex : targetIndex + 1,
              windowId: dropWindowId
            });
            const [activateTabId] = moveArr;
            func = updateTab(activateTabId, {
              active: true
            });
          }
        }
      }
    }
  }
  return func || null;
};

/**
 * handle drop
 * @param {!object} evt - event
 * @param {object} opt - options
 * @param {boolean} opt.windowId - window ID
 * @returns {?Promise|undefined} - promise chain
 */
export const handleDrop = (evt, opt = {}) => {
  const { currentTarget, dataTransfer, shiftKey, type } = evt;
  if (type !== 'drop') {
    return;
  }
  const { dropEffect, types: dataTypes } = dataTransfer;
  let func;
  if (dropEffect === 'copy' || dropEffect === 'move') {
    const { windowId } = opt;
    const dropTarget = getSidebarTab(currentTarget);
    if (dropTarget?.classList.contains(DROP_TARGET)) {
      evt.preventDefault();
      evt.stopPropagation();
      // dropped tab
      if (dataTypes.includes(MIME_JSON)) {
        const data = JSON.parse(dataTransfer.getData(MIME_JSON));
        if (data && isObjectNotEmpty(data)) {
          data.dropAfter = dropTarget.classList.contains(DROP_TARGET_AFTER);
          data.dropBefore = dropTarget.classList.contains(DROP_TARGET_BEFORE);
          data.dropEffect = dropEffect;
          data.dropWindowId = windowId;
          let beGrouped;
          if (!dropTarget.classList.contains(PINNED)) {
            if (shiftKey) {
              beGrouped = true;
            } else {
              const container = dropTarget.parentNode;
              if (container.classList.contains(CLASS_TAB_GROUP)) {
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
          func = handleDroppedTabs(dropTarget, data).then(clearDropTarget)
            .then(restoreTabContainers).then(requestSaveSession)
            .catch(throwErr);
        }
      // uri list
      } else if (dataTypes.includes(MIME_URI)) {
        const textValue = dataTransfer.getData(MIME_URI);
        if (textValue) {
          const data = {
            dropEffect,
            textValue,
            dropAfter: dropTarget.classList.contains(DROP_TARGET_AFTER),
            dropBefore: dropTarget.classList.contains(DROP_TARGET_BEFORE),
            dropWindowId: windowId,
            mime: MIME_URI
          };
          func = handleDroppedText(dropTarget, data).then(clearDropTarget)
            .then(restoreTabContainers).then(requestSaveSession)
            .catch(throwErr);
        }
      // plain text
      } else {
        const textValue = dataTransfer.getData(MIME_PLAIN);
        if (textValue) {
          const data = {
            dropEffect,
            textValue,
            dropAfter: dropTarget.classList.contains(DROP_TARGET_AFTER),
            dropBefore: dropTarget.classList.contains(DROP_TARGET_BEFORE),
            dropWindowId: windowId,
            mime: MIME_PLAIN
          };
          func = handleDroppedText(dropTarget, data).then(clearDropTarget)
            .then(restoreTabContainers).then(requestSaveSession)
            .catch(throwErr);
        }
      }
    } else if (currentTarget === document.getElementById(SIDEBAR_MAIN) &&
               !dataTypes.includes(MIME_JSON)) {
      evt.preventDefault();
      evt.stopPropagation();
      const allTabs = document.querySelectorAll(TAB_QUERY);
      const target = allTabs[allTabs.length - 1];
      const data = {
        dropEffect,
        dropAfter: true,
        dropBefore: false,
        dropWindowId: windowId,
        mime: '',
        textValue: ''
      };
      // uri list
      if (dataTypes.includes(MIME_URI)) {
        const textValue = dataTransfer.getData(MIME_URI);
        if (textValue) {
          data.mime = MIME_URI;
          data.textValue = textValue;
          func = handleDroppedText(target, data).then(clearDropTarget)
            .then(restoreTabContainers).then(requestSaveSession)
            .catch(throwErr);
        }
      // plain text
      } else {
        const textValue = dataTransfer.getData(MIME_PLAIN);
        if (textValue) {
          data.mime = MIME_PLAIN;
          data.textValue = textValue;
          func = handleDroppedText(target, data).then(clearDropTarget)
            .then(restoreTabContainers).then(requestSaveSession)
            .catch(throwErr);
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
  clearDropTarget();
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
 * @param {object} opt - options
 * @param {boolean} opt.isMac - is Mac
 * @param {boolean} opt.windowId - window ID
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
        const { isMac, windowId } = opt;
        const isPinned = dropTarget.classList.contains(PINNED);
        const data = dataTransfer.getData(MIME_JSON);
        const { dragWindowId, pinned } = JSON.parse(data);
        if (dragWindowId !== windowId ||
            ((isPinned && pinned) || !(isPinned || pinned))) {
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
    } else if (currentTarget === document.getElementById(SIDEBAR_MAIN)) {
      evt.preventDefault();
      evt.stopPropagation();
    }
  }
};

/**
 * handle dragstart
 * @param {!object} evt - event
 * @param {object} opt - options
 * @param {boolean} opt.isMac - is Mac
 * @param {boolean} opt.windowId - window ID
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
