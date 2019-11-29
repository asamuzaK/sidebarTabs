/**
 * menu-items.test.js
 */
/* eslint-disable max-nested-callbacks */

import {assert} from "chai";
import {afterEach, beforeEach, describe, it} from "mocha";
import {browser} from "./mocha/setup.js";
import menuItems from "../src/mjs/menu-items.js";
import {
  NEW_TAB_OPEN_CONTAINER, TAB_ALL_BOOKMARK, TAB_ALL_RELOAD, TAB_ALL_SELECT,
  TAB_BOOKMARK, TAB_CLOSE, TAB_CLOSE_END, TAB_CLOSE_OTHER, TAB_CLOSE_UNDO,
  TAB_DUPE,
  TAB_GROUP, TAB_GROUP_COLLAPSE, TAB_GROUP_DETACH, TAB_GROUP_DETACH_TABS,
  TAB_GROUP_DOMAIN, TAB_GROUP_SELECTED, TAB_GROUP_UNGROUP,
  TAB_MOVE, TAB_MOVE_END, TAB_MOVE_START, TAB_MOVE_WIN, TAB_MUTE, TAB_PIN,
  TAB_RELOAD, TAB_REOPEN_CONTAINER,
  TABS_BOOKMARK, TABS_CLOSE, TABS_CLOSE_OTHER, TABS_DUPE, TABS_MOVE,
  TABS_MOVE_END, TABS_MOVE_START, TABS_MOVE_WIN, TABS_MUTE, TABS_PIN,
  TABS_RELOAD, TABS_REOPEN_CONTAINER,
} from "../src/mjs/constant.js";

describe("menu items", () => {
  beforeEach(() => {
    global.browser = browser;
  });
  afterEach(() => {
    delete global.browser;
  });

  it("should get browser object", () => {
    assert.isObject(browser, "browser");
  });

  describe("should get string and object", () => {
    const itemKeys = [
      NEW_TAB_OPEN_CONTAINER, "sep-0",
      TAB_RELOAD, TABS_RELOAD, TAB_MUTE, TABS_MUTE, "sep-1",
      TAB_PIN, TABS_PIN, TAB_BOOKMARK, TABS_BOOKMARK, TAB_DUPE, TABS_DUPE,
      TAB_REOPEN_CONTAINER, TABS_REOPEN_CONTAINER, TAB_MOVE, TABS_MOVE, "sep-2",
      TAB_ALL_RELOAD, TAB_ALL_SELECT, TAB_ALL_BOOKMARK, "sep-3",
      TAB_GROUP, "sep-4",
      TAB_CLOSE_END, TAB_CLOSE_OTHER, TABS_CLOSE_OTHER,
      TAB_CLOSE_UNDO, TAB_CLOSE, TABS_CLOSE,
    ];
    const items = Object.entries(menuItems);

    it("should get equal length", () => {
      assert.isTrue(items.length === itemKeys.length, "length");
    });

    it("should get string and object", () => {
      for (const [key, value] of items) {
        assert.isTrue(itemKeys.includes(key), "item");
        assert.isString(key, "key");
        assert.isObject(value, "value");
      }
    });
  });

  describe("sub items", () => {
    const parentItemKeys = [TAB_MOVE, TABS_MOVE, TAB_GROUP];
    const subItemKeys = [
      TAB_MOVE_START, TAB_MOVE_END, TAB_MOVE_WIN,
      TABS_MOVE_START, TABS_MOVE_END, TABS_MOVE_WIN,
      TAB_GROUP_COLLAPSE, "sepTabGroup-1", TAB_GROUP_SELECTED, TAB_GROUP_DOMAIN,
      TAB_GROUP_DETACH, TAB_GROUP_DETACH_TABS, TAB_GROUP_UNGROUP,
    ];

    it("should get string and object of sub items", () => {
      parentItemKeys.forEach(itemKey => {
        const items = Object.entries(menuItems[itemKey].subItems);
        for (const [key, value] of items) {
          assert.isTrue(subItemKeys.includes(key), "item");
          assert.isString(key, "key");
          assert.isObject(value, "value");
        }
      });
    });
  });
});
