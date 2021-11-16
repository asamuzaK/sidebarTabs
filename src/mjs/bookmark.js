/**
 * bookmark.js
 */

/* shared */
import { getType, isObjectNotEmpty, isString } from './common.js';
import { createBookmark, getBookmarkTreeNode, getStorage } from './browser.js';
import { BOOKMARK_FOLDER_MSG, BOOKMARK_LOCATION } from './constant.js';

/* api */
const { i18n } = browser;

/* bookmark folder map */
export const folderMap = new Map();

/**
 * create folder map
 *
 * @param {string} node - bookmark tree node
 * @param {boolean} recurse - create bookmark folder tree recursively
 * @returns {void}
 */
export const createFolderMap = async (node, recurse = false) => {
  if (isObjectNotEmpty(node)) {
    const { children, id, parentId, title, type } = node;
    if (id && type === 'folder') {
      !folderMap.has(id) && folderMap.set(id, {
        children: new Set(),
        id,
        parentId,
        title,
        type
      });
      if (parentId && folderMap.has(parentId)) {
        const parent = folderMap.get(parentId);
        parent.children.add(id);
      }
      if ((!parentId || recurse) && Array.isArray(children)) {
        const func = [];
        for (const child of children) {
          func.push(createFolderMap(child, recurse));
        }
        await Promise.all(func);
      }
    }
  }
};

/**
 * get folder map
 *
 * @param {boolean} recurse - create bookmark folder tree recursively
 * @returns {object} - folderMap
 */
export const getFolderMap = async (recurse = false) => {
  const [tree] = await getBookmarkTreeNode();
  folderMap.clear();
  await createFolderMap(tree, recurse);
  return folderMap;
};

/**
 * get bookmark location ID from storage
 *
 * @returns {?string} - bookmark location ID
 */
export const getBookmarkLocationId = async () => {
  const folder = await getStorage(BOOKMARK_LOCATION);
  let id;
  if (isObjectNotEmpty(folder) &&
      Object.prototype.hasOwnProperty.call(folder, BOOKMARK_LOCATION)) {
    const { value } = folder[BOOKMARK_LOCATION];
    if (value && isString(value)) {
      try {
        const [tree] = await getBookmarkTreeNode(value);
        if (isObjectNotEmpty(tree) &&
            Object.prototype.hasOwnProperty.call(tree, 'id')) {
          const { id: treeId } = tree;
          id = treeId;
        }
      } catch (e) {
        // fail through
      }
    }
  }
  return id || null;
};

/**
 * bookmark tabs
 *
 * @param {Array} nodes - array of node
 * @param {string} name - default folder name
 * @returns {Promise.<Array>} - results of each handler
 */
export const bookmarkTabs = async (nodes, name = '') => {
  if (!Array.isArray(nodes)) {
    throw new TypeError(`Expected Array but got ${getType(nodes)}.`);
  }
  let folderId = await getBookmarkLocationId();
  if (nodes.length > 1) {
    const promptMsg = i18n.getMessage(BOOKMARK_FOLDER_MSG);
    const folderTitle = window.prompt(promptMsg, name);
    if (folderTitle) {
      const folder = await createBookmark({
        parentId: folderId || undefined,
        title: folderTitle,
        type: 'folder'
      });
      if (isObjectNotEmpty(folder) &&
          Object.prototype.hasOwnProperty.call(folder, 'id')) {
        const { id } = folder;
        folderId = id;
      }
    }
  }
  const func = [];
  for (const item of nodes) {
    if (item.nodeType === Node.ELEMENT_NODE) {
      const { dataset } = item;
      const itemTab = dataset.tab && JSON.parse(dataset.tab);
      if (itemTab) {
        const { title, url } = itemTab;
        func.push(createBookmark({
          parentId: folderId || undefined,
          title,
          url
        }));
      }
    }
  }
  return Promise.all(func);
};
