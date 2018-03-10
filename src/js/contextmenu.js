/**
 * contextmenu.js
 */
"use strict";
{
  /* constants */
  const CLASS_DISABLED = "disabled";
  const CLASS_MENU = "context-menu";
  const CLASS_MENU_SEP = "menu-separator";
  const CLASS_SUBMENU_CONTAINER = "submenu-container";
  const CLASS_SHOW = "show";
  const CLASS_VISIBLE = "visible";
  const MENU = "sidebar-tabs-menu";
  const MENU_CONTAINER = "sidebar-tabs-header";
  const MOUSE_BUTTON_RIGHT = 2;

  /**
   * is string
   * @param {*} o - object to check
   * @returns {boolean} - result
   */
  const isString = o => typeof o === "string" || o instanceof String;

  /**
   * dispatch click event
   * @param {Object} elm - Element
   * @returns {void}
   */
  const dispatchClickEvt = elm => {
    if (elm && elm.nodeType === Node.ELEMENT_NODE) {
      const opt = {
        view: window,
        bubbles: true,
        cancelable: true,
      };
      const evt = new MouseEvent("click", opt);
      elm.dispatchEvent(evt);
    }
  };

  /**
   * dispatch keyboard event
   * @param {Object} elm - Element
   * @param {string} type - event type
   * @param {Object} keyCombo - key combo
   * @returns {void}
   */
  const dispatchKeyboardEvt = (elm, type, keyCombo = {}) => {
    if (elm && elm.nodeType === Node.ELEMENT_NODE &&
        isString(type) && /^key(?:down|press|up)$/.test(type)) {
      const {altKey, ctrlKey, key, shiftKey, metaKey} = keyCombo;
      if (isString(key)) {
        const opt = {
          key,
          altKey: !!altKey,
          ctrlKey: !!ctrlKey,
          shiftKey: !!shiftKey,
          metaKey: !!metaKey,
          bubbles: false,
          cancelable: false,
        };
        const evt = new KeyboardEvent(type, opt);
        elm.dispatchEvent(evt);
      }
    }
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
   * @param {Object} elm - Element
   * @returns {Object} - offsets
   */
  const getOffsets = elm => {
    const offset = {
      bottom: 0,
      height: 0,
      left: 0,
      right: 0,
      top: 0,
      width: 0,
    };
    if (elm && elm.nodeType === Node.ELEMENT_NODE) {
      const top =
        window.getComputedStyle(elm).marginTop.replace("px", "") * 1 +
        window.getComputedStyle(elm).borderTopWidth.replace("px", "") * 1;
      const right =
        window.getComputedStyle(elm).marginRight.replace("px", "") * 1 +
        window.getComputedStyle(elm).borderRightWidth.replace("px", "") * 1;
      const bottom =
        window.getComputedStyle(elm).marginBottom.replace("px", "") * 1 +
        window.getComputedStyle(elm).borderBottomWidth.replace("px", "") * 1;
      const left =
        window.getComputedStyle(elm).marginLeft.replace("px", "") * 1 +
        window.getComputedStyle(elm).borderLeftWidth.replace("px", "") * 1;
      const width = left + right;
      const height = top + bottom;
      offset.top = top;
      offset.right = right;
      offset.bottom = bottom;
      offset.left = left;
      offset.width = width;
      offset.height = height;
    }
    return offset;
  };

  /**
   * focus element
   * @param {!Object} evt - Event
   * @returns {Object} - element
   */
  const focusElm = evt => {
    const {target} = evt;
    if (target) {
      target.focus();
    }
    return target || null;
  };

  /**
   * given element is a context menu item
   * @param {Object} elm - Element
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
   * @param {Object} elm - element node
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
   * get next target menu item
   * @param {Object} elm - element node
   * @returns {Object} - menu item element
   */
  const getNextTargetMenuItem = elm => {
    let targetElm;
    if (elm && elm.nodeType === Node.ELEMENT_NODE) {
      const {nextElementSibling, parentNode} = elm;
      let node = nextElementSibling;
      while (node &&
             (node.nextElementSibling ||
              node === parentNode.lastElementChild)) {
        if (node.classList.contains(CLASS_MENU_SEP) ||
          node.classList.contains(CLASS_DISABLED)) {
          if (node.nextElementSibling) {
            node = node.nextElementSibling;
          } else if (node === parentNode.lastElementChild) {
            node = parentNode.firstElementChild;
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
   * get previous target menu item
   * @param {!Object} elm - element node
   * @returns {Object} - menu item element
   */
  const getPreviousTargetMenuItem = elm => {
    let targetElm;
    if (elm && elm.nodeType === Node.ELEMENT_NODE) {
      const {parentNode, previousElementSibling} = elm;
      let node = previousElementSibling;
      while (node &&
             (node.previousElementSibling ||
              node === parentNode.firstElementChild)) {
        if (node.classList.contains(CLASS_MENU_SEP) ||
          node.classList.contains(CLASS_DISABLED)) {
          if (node.previousElementSibling) {
            node = node.previousElementSibling;
          } else if (node === parentNode.firstElementChild) {
            node = parentNode.lastElementChild;
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
      firstElementChild: parentFirstElementChild,
      lastElementChild: parentLastElementChild,
    } = parentNode;
    let targetElm;
    switch (key) {
      case "ArrowDown": {
        if (classList.contains(CLASS_MENU)) {
          if (firstElementChild.classList.contains(CLASS_MENU_SEP) ||
              firstElementChild.classList.contains(CLASS_DISABLED)) {
            targetElm = getNextTargetMenuItem(firstElementChild);
          } else {
            targetElm = firstElementChild;
          }
        } else if (elm === parentLastElementChild) {
          if (parentFirstElementChild.classList.contains(CLASS_MENU_SEP) ||
              parentFirstElementChild.classList.contains(CLASS_DISABLED)) {
            targetElm = getNextTargetMenuItem(parentFirstElementChild);
          } else {
            targetElm = parentFirstElementChild;
          }
        } else if (nextElementSibling) {
          targetElm = getNextTargetMenuItem(elm);
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
              targetElm = getNextTargetMenuItem(subMenu.firstElementChild);
            } else {
              targetElm = subMenu.firstElementChild;
            }
          }
        }
        break;
      }
      case "ArrowUp": {
        if (elm === parentFirstElementChild) {
          if (parentLastElementChild.classList.contains(CLASS_MENU_SEP) ||
              parentLastElementChild.classList.contains(CLASS_DISABLED)) {
            targetElm = getPreviousTargetMenuItem(parentLastElementChild);
          } else {
            targetElm = parentLastElementChild;
          }
        } else if (previousElementSibling) {
          targetElm = getPreviousTargetMenuItem(elm);
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
          bottom: offsetBottom, height: offsetHeight, left: offsetLeft,
          right: offsetRight, top: offsetTop, width: offsetWidth,
        } = getOffsets(elm);
        const elmMarginBoxWidth = elmWidth + offsetWidth;
        const elmMarginBoxHeight = elmHeight + offsetHeight;
        const lapWidth =
          window.getComputedStyle(document.documentElement).fontSize
            .replace("px", "") * 2;
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
      func = dispatchKeyboardEvt(target, "keydown", {key: "Escape"});
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
        const {
          height: offsetHeight, left: offsetLeft, width: offsetWidth,
        } = getOffsets(elm);
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
          item.addEventListener("pointerenter", focusElm);
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
    } else {
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
          func = dispatchClickEvt(target);
          break;
        case "Escape":
          func = hideContextMenu();
          break;
        default:
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
}
