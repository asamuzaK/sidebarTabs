/**
 * bookmark.js
 */

/* shared */
import { getType, isObjectNotEmpty, isString } from './common.js';
import { createBookmark, getBookmarkTreeNode, getStorage } from './browser.js';
import { BOOKMARK_LOCATION } from './constant.js';

/* bookmark folder map */
export const folderMap = new Map();

/**
 * create folder map
 *
 * @param {string} node - bookmark tree node
 * @param {boolean} recurse - create bookmark folder tree recursively
 * @returns {object} - folderMap
 */
export const createFolderMap = (node, recurse = false) => {
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
        for (const child of children) {
          createFolderMap(child, recurse);
        }
      }
    }
  }
  return folderMap;
};

/**
 * get refreshed folder map
 *
 * @param {boolean} recurse - create bookmark folder tree recursively
 * @returns {object} - folderMap
 */
export const getRefreshedFolderMap = async (recurse = false) => {
  const [tree] = await getBookmarkTreeNode();
  folderMap.clear();
  createFolderMap(tree, recurse);
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
      await getRefreshedFolderMap(true);
      if (folderMap.has(value)) {
        id = value;
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
    const folderTitle = window.prompt('Input folder name', name);
    const folder = await createBookmark({
      parentId: folderId || undefined,
      title: folderTitle,
      type: 'folder'
    });
    if (folder) {
      const { id } = folder;
      folderId = id;
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
