/**
 * contextmenu.js
 */

import {dispatchKeyboardEvt, isString} from "./common.js";
import {
  CLASS_DISABLED, CLASS_MENU, MENU, MOUSE_BUTTON_RIGHT,
} from "./constant.js";

/* constants */
const CLASS_MENU_SEP = "menu-separator";
const CLASS_SUBMENU_CONTAINER = "submenu-container";
const CLASS_SHOW = "show";
const CLASS_VISIBLE = "visible";
const MENU_CONTAINER = "sidebar-tabs-header";
const SCALE = 2;

/**
 * focus element
 * @param {!Object} evt - Event
 * @returns {Object} - element
 */
const focusElement = evt => {
  const {target} = evt;
  if (target) {
    target.focus();
  }
  return target || null;
};

/**
 * remove style
 * @param {Object} elm - element
 * @returns {void}
 */
const removeStyle = elm => {
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    const {classList, style} = elm;
    classList.contains(CLASS_SHOW) && classList.remove(CLASS_SHOW);
    classList.contains(CLASS_VISIBLE) && classList.remove(CLASS_VISIBLE);
    style.top && (style.top = null);
    style.right && (style.right = null);
    style.bottom && (style.bottom = null);
    style.left && (style.left = null);
  }
};

/**
 * get offsets
 * @param {Object} elm - element
 * @returns {Object} - offsets
 */
const getOffsets = elm => {
  const offset = {
    offsetBottom: 0,
    offsetHeight: 0,
    offsetLeft: 0,
    offsetRight: 0,
    offsetTop: 0,
    offsetWidth: 0,
  };
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    const {
      borderLeftWidth: borderLeft, borderBottomWidth: borderBottom,
      borderRightWidth: borderRight, borderTopWidth: borderTop,
      marginLeft, marginBottom, marginRight, marginTop,
    } = window.getComputedStyle(elm);
    const offsetTop =
      marginTop.replace("px", "") * 1 + borderTop.replace("px", "") * 1;
    const offsetRight =
      marginRight.replace("px", "") * 1 + borderRight.replace("px", "") * 1;
    const offsetBottom =
      marginBottom.replace("px", "") * 1 + borderBottom.replace("px", "") * 1;
    const offsetLeft =
      marginLeft.replace("px", "") * 1 + borderLeft.replace("px", "") * 1;
    const offsetWidth = offsetLeft + offsetRight;
    const offsetHeight = offsetTop + offsetBottom;
    offset.offsetBottom = offsetBottom;
    offset.offsetHeight = offsetHeight;
    offset.offsetLeft = offsetLeft;
    offset.offsetRight = offsetRight;
    offset.offsetTop = offsetTop;
    offset.offsetWidth = offsetWidth;
  }
  return offset;
};

/**
 * given element is a context menu item
 * @param {Object} elm - element
 * @returns {boolean} - result
 */
const isContextMenuItem = elm => {
  let bool;
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    let node = elm;
    while (node && node.parentNode) {
      bool = node.classList.contains(CLASS_MENU);
      if (bool) {
        break;
      }
      node = node.parentNode;
    }
  }
  return !!bool;
};

/**
 * get target menu item
 * @param {Object} elm - element
 * @returns {Object} - menu item element
 */
const getTargetMenuItem = elm => {
  let targetElm;
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    let node = elm;
    while (node && node.parentNode) {
      const {parentNode} = node;
      const {classList: parentClassList} = parentNode;
      if (parentClassList.contains(CLASS_MENU)) {
        targetElm = node;
        break;
      }
      node = node.parentNode;
    }
  }
  return targetElm || null;
};

/**
 * get target menu item from next sibling
 * @param {Object} elm - element
 * @returns {Object} - menu item element
 */
const getNextSiblingMenuItem = elm => {
  let targetElm;
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    const {
      nextElementSibling,
      parentNode: {
        firstElementChild: parentFirstChild,
        lastElementChild: parentLastChild,
      },
    } = elm;
    let node = nextElementSibling;
    while (node &&
           (node.nextElementSibling || node === parentLastChild)) {
      const {classList, nextElementSibling: nodeNextSibling} = node;
      if (classList.contains(CLASS_MENU_SEP) ||
          classList.contains(CLASS_DISABLED)) {
        if (nodeNextSibling) {
          node = nodeNextSibling;
        } else if (node === parentLastChild) {
          node = parentFirstChild;
        } else {
          break;
        }
      } else {
        targetElm = node;
        break;
      }
    }
  }
  return targetElm || null;
};

/**
 * get target menu item from previous sibling
 * @param {!Object} elm - element
 * @returns {Object} - menu item element
 */
const getPreviousSiblingMenuItem = elm => {
  let targetElm;
  if (elm && elm.nodeType === Node.ELEMENT_NODE) {
    const {
      parentNode: {
        firstElementChild: parentFirstChild,
        lastElementChild: parentLastChild,
      },
      previousElementSibling,
    } = elm;
    let node = previousElementSibling;
    while (node &&
           (node.previousElementSibling || node === parentFirstChild)) {
      const {classList, previousElementSibling: nodePreviousSibling} = node;
      if (classList.contains(CLASS_MENU_SEP) ||
          classList.contains(CLASS_DISABLED)) {
        if (nodePreviousSibling) {
          node = nodePreviousSibling;
        } else if (node === parentFirstChild) {
          node = parentLastChild;
        } else {
          break;
        }
      } else {
        targetElm = node;
        break;
      }
    }
  }
  return targetElm || null;
};

/**
 * select menu item with arrow key
 * @param {string} key - arrow key
 * @returns {Object} - menu item element
 */
const selectMenuItemWithArrowKey = key => {
  const elm = document.activeElement;
  const {
    childNodes, classList, firstElementChild, nextElementSibling, parentNode,
    previousElementSibling,
  } = elm;
  const {
    firstElementChild: parentFirstChild,
    lastElementChild: parentLastChild,
  } = parentNode;
  let targetElm;
  switch (key) {
    case "ArrowDown": {
      if (classList.contains(CLASS_MENU)) {
        if (firstElementChild.classList.contains(CLASS_MENU_SEP) ||
            firstElementChild.classList.contains(CLASS_DISABLED)) {
          targetElm = getNextSiblingMenuItem(firstElementChild);
        } else {
          targetElm = firstElementChild;
        }
      } else if (elm === parentLastChild) {
        if (parentFirstChild.classList.contains(CLASS_MENU_SEP) ||
            parentFirstChild.classList.contains(CLASS_DISABLED)) {
          targetElm = getNextSiblingMenuItem(parentFirstChild);
        } else {
          targetElm = parentFirstChild;
        }
      } else if (nextElementSibling) {
        targetElm = getNextSiblingMenuItem(elm);
      }
      break;
    }
    case "ArrowLeft": {
      if (parentNode.classList.contains(CLASS_MENU) &&
          parentNode.parentNode.classList.contains(CLASS_SUBMENU_CONTAINER)) {
        targetElm = parentNode.parentNode;
      }
      break;
    }
    case "ArrowRight": {
      if (classList.contains(CLASS_SUBMENU_CONTAINER)) {
        let subMenu;
        for (const node of childNodes) {
          if (node.nodeType === Node.ELEMENT_NODE &&
              node.classList.contains(CLASS_MENU)) {
            subMenu = node;
            break;
          }
        }
        if (subMenu) {
          if (subMenu.firstElementChild.classList.contains(CLASS_MENU_SEP) ||
              subMenu.firstElementChild.classList.contains(CLASS_DISABLED)) {
            targetElm = getNextSiblingMenuItem(subMenu.firstElementChild);
          } else {
            targetElm = subMenu.firstElementChild;
          }
        }
      }
      break;
    }
    case "ArrowUp": {
      if (elm === parentFirstChild) {
        if (parentLastChild.classList.contains(CLASS_MENU_SEP) ||
            parentLastChild.classList.contains(CLASS_DISABLED)) {
          targetElm = getPreviousSiblingMenuItem(parentLastChild);
        } else {
          targetElm = parentLastChild;
        }
      } else if (previousElementSibling) {
        targetElm = getPreviousSiblingMenuItem(elm);
      }
      break;
    }
    default:
  }
  if (targetElm) {
    targetElm.focus();
  }
  return targetElm || null;
};

/**
 * get target menu item from access key
 * @param {Object} elm - element
 * @param {string} key - access key
 * @param {boolean} sensitive - case sensitive
 * @returns {Object} - menu item element
 */
const getAccessKeyMenuItem = (elm, key, sensitive = false) => {
  let targetElm;
  if (elm && elm.nodeType === Node.ELEMENT_NODE &&
      isString(key) && key.length) {
    const {
      nextElementSibling,
      parentNode: {
        firstElementChild: parentFirstChild,
        lastElementChild: parentLastChild,
      },
    } = elm;
    let node;
    if (nextElementSibling) {
      node = nextElementSibling;
    } else if (elm === parentLastChild) {
      node = parentFirstChild;
    }
    while (node && (node.nextElementSibling || node === parentLastChild)) {
      const {accessKey, nextElementSibling: nodeNextSibling} = node;
      if (isString(accessKey) && accessKey.length &&
          (sensitive && accessKey === key ||
           !sensitive && accessKey.toLowerCase() === key.toLowerCase())) {
        targetElm = node;
        break;
      } else if (node === elm) {
        break;
      } else if (nodeNextSibling) {
        node = nodeNextSibling;
      } else if (node === parentLastChild) {
        node = parentFirstChild;
      }
    }
  }
  return targetElm || null;
};

/**
 * has same accesskey
 * @param {Object} nodes - node list
 * @param {string} key - access key
 * @param {boolean} sensitive - case sensitive
 * @returns {boolean} - result
 */
const hasSameAccessKey = (nodes, key, sensitive = false) => {
  const arr = [];
  if ((nodes instanceof NodeList || nodes instanceof HTMLCollection) &&
      isString(key) && key.length) {
    for (const node of nodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const {accessKey} = node;
        if (isString(accessKey) && accessKey.length &&
            (sensitive && accessKey === key ||
             !sensitive && accessKey.toLowerCase() === key.toLowerCase())) {
          arr.push(node);
        }
      }
    }
  }
  return arr.length !== 1;
};

/**
 * select menu item with access key
 * @param {string} key - access key
 * @param {boolean} sensitive - case sensitive
 * @returns {Object} - menu item element
 */
const selectMenuItemWithAccessKey = (key, sensitive = false) => {
  const menuElm = document.getElementById(MENU);
  let targetElm;
  if (menuElm && menuElm.classList.contains(CLASS_SHOW) &&
      isString(key) && key.length) {
    const elm = document.activeElement;
    const {childNodes, classList} = elm;
    if (classList.contains(CLASS_MENU)) {
      for (const child of childNodes) {
        if (child.nodeType === Node.ELEMENT_NODE) {
          const {accessKey} = child;
          if (isString(accessKey) && accessKey.length &&
              (sensitive && accessKey === key ||
               !sensitive && accessKey.toLowerCase() === key.toLowerCase())) {
            targetElm = child;
            break;
          }
        }
      }
    } else if (classList.contains(CLASS_SUBMENU_CONTAINER)) {
      let subMenu;
      for (const child of childNodes) {
        if (child.nodeType === Node.ELEMENT_NODE) {
          const {classList: childClassList} = child;
          if (childClassList.contains(CLASS_MENU)) {
            subMenu = child;
            break;
          }
        }
      }
      if (subMenu) {
        subMenu.focus();
        targetElm = selectMenuItemWithAccessKey(key, sensitive);
        if (!targetElm) {
          elm.focus();
        }
      }
    } else {
      targetElm = getAccessKeyMenuItem(elm, key, sensitive);
    }
  }
  if (targetElm) {
    const {parentNode: targetParent} = targetElm;
    const {childNodes: targetParentChildNodes} = targetParent;
    targetElm.focus();
    if (!hasSameAccessKey(targetParentChildNodes, key)) {
      targetElm.click();
    }
  }
  return targetElm || null;
};

/**
 * hide sub menus
 * @param {!Object} evt - Event
 * @returns {void}
 */
const hideSubMenus = evt => {
  const {target} = evt;
  const {id: targetId, parentNode: {childNodes}} = target;
  if (targetId === MENU) {
    const subMenus = target.querySelectorAll(`.${CLASS_MENU}`);
    for (const elm of subMenus) {
      removeStyle(elm);
    }
  } else {
    const arr = [];
    for (const child of childNodes) {
      if (child.nodeType === Node.ELEMENT_NODE && child !== target) {
        const {classList: childClassList} = child;
        if (childClassList.contains(CLASS_SUBMENU_CONTAINER)) {
          arr.push(child);
        }
      }
    }
    if (arr.length) {
      arr.forEach(elm => {
        const subMenus = elm.querySelectorAll(`.${CLASS_MENU}`);
        for (const item of subMenus) {
          removeStyle(item);
        }
      });
    }
  }
};

/**
 * show sub menu
 * @param {!Object} evt - Event
 * @returns {Object} - sub menu element
 */
const showSubMenu = evt => {
  const {target} = evt;
  const {childNodes} = target;
  let elm;
  for (const item of childNodes) {
    if (item.nodeType === Node.ELEMENT_NODE &&
        item.classList.contains(CLASS_MENU)) {
      elm = item;
      break;
    }
  }
  if (elm) {
    const {classList: elmClassList, style: elmStyle} = elm;
    elmClassList.contains(CLASS_MENU) && elmClassList.add(CLASS_SHOW);
    if (elmClassList.contains(CLASS_SHOW)) {
      const {innerHeight, innerWidth} = window;
      const {
        bottom: targetBottom, left: targetLeft, height: targetHeight,
        right: targetRight, top: targetTop, width: targetWidth,
      } = target.getBoundingClientRect();
      const {
        height: elmHeight, width: elmWidth,
      } = elm.getBoundingClientRect();
      const {
        offsetBottom, offsetHeight, offsetLeft, offsetRight, offsetTop,
        offsetWidth,
      } = getOffsets(elm);
      const elmMarginBoxWidth = elmWidth + offsetWidth;
      const elmMarginBoxHeight = elmHeight + offsetHeight;
      const lapWidth =
        window.getComputedStyle(document.documentElement).fontSize
          .replace("px", "") * SCALE;
      if (innerWidth > targetRight + elmMarginBoxWidth) {
        // show right
        elmStyle.left = `${targetWidth - offsetRight}px`;
        if (innerHeight > targetTop + elmMarginBoxHeight) {
          // show downward
          elmStyle.top = `-${offsetTop}px`;
        } else {
          // show upward
          elmStyle.top = `${targetHeight - elmHeight}px`;
        }
      } else if (targetLeft > elmMarginBoxWidth) {
        // show left
        elmStyle.left = `-${elmWidth}px`;
        if (innerHeight > targetTop + elmMarginBoxHeight) {
          // show downward
          elmStyle.top = `-${offsetTop}px`;
        } else {
          // show upward
          elmStyle.top = `${targetHeight - elmHeight}px`;
        }
      } else if (innerWidth - targetRight > targetLeft) {
        if (elmMarginBoxWidth > innerWidth - targetRight + lapWidth) {
          // fit right edge of the page
          elmStyle.left =
            `${innerWidth - targetRight + targetWidth - elmMarginBoxWidth}px`;
        } else {
          // offset right
          elmStyle.left = `${targetRight - lapWidth - offsetLeft}px`;
        }
        if (innerHeight > targetBottom + elmHeight + offsetBottom) {
          // offset below
          elmStyle.top = `${targetHeight - offsetBottom}px`;
        } else {
          // offset above
          elmStyle.top = `-${elmHeight}px`;
        }
      } else {
        if (elmMarginBoxWidth > targetLeft + lapWidth) {
          // fit left edge of the page
          elmStyle.left = `${offsetLeft - targetLeft}px`;
        } else {
          // offset left
          elmStyle.left = `${lapWidth + offsetRight - elmWidth}px`;
        }
        if (innerHeight > targetBottom + elmHeight + offsetBottom) {
          // offset below
          elmStyle.top = `${targetHeight - offsetBottom}px`;
        } else {
          // offset above
          elmStyle.top = `-${elmHeight}px`;
        }
      }
      elmClassList.add(CLASS_VISIBLE);
    }
  }
  return elm || null;
};

/**
 * hide context menu container
 * @returns {Object} - context menu container element
 */
const hideContextMenuContainer = () => {
  const container = document.getElementById(MENU_CONTAINER);
  if (container) {
    container.classList.remove(CLASS_SHOW);
  }
  return container || null;
};

/**
 * show context menu container
 * @returns {Object} - context menu container element
 */
const showContextMenuContainer = () => {
  const container = document.getElementById(MENU_CONTAINER);
  if (container) {
    container.classList.add(CLASS_SHOW);
  }
  return container || null;
};

/**
 * hide context menu
 * @returns {Object} - context menu element
 */
const hideContextMenu = () => {
  const elm = document.getElementById(MENU);
  if (elm) {
    const subMenus = elm.querySelectorAll(`.${CLASS_MENU}`);
    for (const item of subMenus) {
      removeStyle(item);
    }
    removeStyle(elm);
  }
  hideContextMenuContainer();
  return elm || null;
};

/**
 * handle click
 * @param {!Object} evt - Event
 * @returns {?Function} - handler function
 */
const handleClick = evt => {
  const {target} = evt;
  const targetMenuItem = getTargetMenuItem(target);
  let func;
  if (targetMenuItem &&
      !targetMenuItem.classList.contains(CLASS_SUBMENU_CONTAINER)) {
    func = dispatchKeyboardEvt(target, "keydown", {
      code: "Escape",
      key: "Escape",
    });
  }
  return func || null;
};

/**
 * show context menu
 * @param {!Object} evt - Event
 * @returns {Object} - context menu element
 */
const showContextMenu = evt => {
  const elm = document.getElementById(MENU);
  const container = showContextMenuContainer();
  if (elm && container && container.classList.contains(CLASS_SHOW)) {
    const {classList: elmClassList, style: elmStyle} = elm;
    evt.stopImmediatePropagation();
    evt.preventDefault();
    hideSubMenus({target: elm});
    elmClassList.contains(CLASS_MENU) && elmClassList.add(CLASS_SHOW);
    if (elmClassList.contains(CLASS_SHOW)) {
      const {clientX, clientY} = evt;
      const {innerHeight, innerWidth} = window;
      const {
        height: elmHeight, width: elmWidth,
      } = elm.getBoundingClientRect();
      const {offsetHeight, offsetLeft, offsetWidth} = getOffsets(elm);
      const elmMarginBoxWidth = elmWidth + offsetWidth;
      const elmMarginBoxHeight = elmHeight + offsetHeight;
      const menuItems = elm.querySelectorAll(`li:not(.${CLASS_MENU_SEP})`);
      if (innerWidth > clientX + elmMarginBoxWidth) {
        // show right
        elmStyle.left = `${clientX}px`;
      } else if (clientX > elmMarginBoxWidth) {
        // show left
        elmStyle.left = `${clientX - elmWidth}px`;
      } else {
        // show left edge of the page
        elmStyle.left = `${offsetLeft}px`;
      }
      if (innerHeight > clientY + elmMarginBoxHeight) {
        // show downward
        elmStyle.top = `${clientY}px`;
      } else {
        // show upward
        elmStyle.top = `${clientY - elmHeight}px`;
      }
      for (const item of menuItems) {
        const {classList: itemClassList} = item;
        item.addEventListener("pointerenter", focusElement);
        item.addEventListener("focus", hideSubMenus);
        if (itemClassList.contains(CLASS_SUBMENU_CONTAINER)) {
          item.addEventListener("focus", showSubMenu);
        }
      }
      elm.addEventListener("pointerleave", hideSubMenus);
      elm.addEventListener("click", handleClick);
      elm.classList.add(CLASS_VISIBLE);
      elm.focus();
    }
  }
  return elm || null;
};

/**
 * handle key down
 * @param {!Object} evt - Event
 * @returns {?Function} - handler function
 */
const handleKeyDown = evt => {
  const {key, shiftKey, target} = evt;
  let func;
  if (key === "ContextMenu" || shiftKey && key === "F10") {
    func = showContextMenuContainer();
  } else if (isContextMenuItem(target)) {
    switch (key) {
      case "ArrowDown":
      case "ArrowLeft":
      case "ArrowRight":
      case "ArrowUp":
        func = selectMenuItemWithArrowKey(key);
        break;
      case "Enter":
      case "Spacebar":
      case " ":
        func = target.click();
        break;
      case "Escape":
        func = hideContextMenu();
        break;
      default:
        func = selectMenuItemWithAccessKey(key);
    }
  }
  return func || null;
};

/**
 * handle pointer down
 * @param {!Object} evt - Event
 * @returns {?Function} - handler function
 */
const handlePointerDown = evt => {
  const {button, target} = evt;
  let func;
  if (button === MOUSE_BUTTON_RIGHT) {
    func = showContextMenuContainer();
  } else {
    const isEsc = !isContextMenuItem(target);
    if (isEsc) {
      func = hideContextMenu();
    }
  }
  return func || null;
};

window.addEventListener("keydown", handleKeyDown, true);
window.addEventListener("pointerdown", handlePointerDown, true);
window.addEventListener("contextmenu", showContextMenu);
