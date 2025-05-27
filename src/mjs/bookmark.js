/**
 * bookmark.js
 */

/* shared */
import { createBookmark, getBookmarkTreeNode, getStorage } from './browser.js';
import { getType, isObjectNotEmpty, isString, logErr } from './common.js';
import { BOOKMARK_FOLDER_MSG, BOOKMARK_LOCATION } from './constant.js';

/* api */
const { i18n } = browser;

/* bookmark folder map */
export const folderMap = new Map();

/**
 * create folder map
 * @param {string} [node] - bookmark tree node
 * @param {boolean} [recurse] - create bookmark folder tree recursively
 * @returns {Promise.<void>} - void
 */
export const createFolderMap = async (node, recurse = false) => {
  if (isObjectNotEmpty(node)) {
    const { children, id, parentId, title, type } = node;
    if (id && type === 'folder') {
      if (!folderMap.has(id)) {
        folderMap.set(id, {
          children: new Set(),
          id,
          parentId,
          title,
          type
        });
      }
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
 * @param {boolean} [recurse] - create bookmark folder tree recursively
 * @returns {Promise.<object>} - folderMap
 */
export const getFolderMap = async (recurse = false) => {
  const [tree] = await getBookmarkTreeNode();
  folderMap.clear();
  await createFolderMap(tree, recurse);
  return folderMap;
};

/**
 * get bookmark location ID from storage
 * @returns {Promise.<?string>} - bookmark location ID
 */
export const getBookmarkLocationId = async () => {
  const folder = await getStorage(BOOKMARK_LOCATION);
  let id;
  if (isObjectNotEmpty(folder) &&
      Object.hasOwn(folder, BOOKMARK_LOCATION)) {
    const { value } = folder[BOOKMARK_LOCATION];
    if (value && isString(value)) {
      try {
        const [tree] = await getBookmarkTreeNode(value);
        if (isObjectNotEmpty(tree) &&
            Object.hasOwn(tree, 'id')) {
          const { id: treeId } = tree;
          id = treeId;
        }
      } catch (e) {
        id = null;
        logErr(e);
      }
    }
  }
  return id || null;
};

/**
 * bookmark tabs
 * @param {Array} nodes - array of node
 * @param {string} [name] - folder name
 * @returns {Promise.<Array>} - results of each handler
 */
export const bookmarkTabs = async (nodes, name = '') => {
  if (!Array.isArray(nodes)) {
    throw new TypeError(`Expected Array but got ${getType(nodes)}.`);
  }
  let folderId = await getBookmarkLocationId();
  if (nodes.length > 1) {
    const msg = i18n.getMessage(BOOKMARK_FOLDER_MSG);
    const folderTitle = window.prompt(msg, name);
    if (folderTitle) {
      const folder = await createBookmark({
        parentId: folderId || undefined,
        title: folderTitle,
        type: 'folder'
      });
      if (isObjectNotEmpty(folder) &&
          Object.hasOwn(folder, 'id')) {
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
