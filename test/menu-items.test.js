/**
 * menu-items.test.js
 */
/* eslint-disable import/order */

/* api */
import { assert } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { browser } from './mocha/setup.js';

/* test */
import menuItems from '../src/mjs/menu-items.js';
import {
  NEW_TAB_OPEN_CONTAINER, OPTIONS_OPEN,
  TAB_ALL_BOOKMARK, TAB_ALL_RELOAD, TAB_ALL_SELECT,
  TAB_BOOKMARK, TAB_CLOSE, TAB_CLOSE_DUPE, TAB_CLOSE_UNDO, TAB_DUPE,
  TAB_GROUP, TAB_GROUP_BOOKMARK, TAB_GROUP_CLOSE, TAB_GROUP_COLLAPSE,
  TAB_GROUP_COLLAPSE_OTHER, TAB_GROUP_CONTAINER, TAB_GROUP_DETACH,
  TAB_GROUP_DETACH_TABS, TAB_GROUP_DOMAIN, TAB_GROUP_LABEL_SHOW,
  TAB_GROUP_SELECTED, TAB_GROUP_UNGROUP,
  TAB_MOVE, TAB_MOVE_END, TAB_MOVE_START, TAB_MOVE_WIN, TAB_MUTE, TAB_NEW,
  TAB_PIN, TAB_RELOAD, TAB_REOPEN_CONTAINER,
  TABS_BOOKMARK, TABS_CLOSE, TABS_CLOSE_DUPE, TABS_CLOSE_END, TABS_CLOSE_OTHER,
  TABS_CLOSE_START, TABS_CLOSE_MULTIPLE, TABS_DUPE, TABS_MOVE, TABS_MOVE_END,
  TABS_MOVE_START, TABS_MOVE_WIN, TABS_MUTE, TABS_PIN, TABS_RELOAD,
  TABS_REOPEN_CONTAINER
} from '../src/mjs/constant.js';

describe('menu items', () => {
  beforeEach(() => {
    browser._sandbox.reset();
    browser.i18n.getMessage.callsFake((...args) => args.toString());
    browser.permissions.contains.resolves(true);
    global.browser = browser;
  });
  afterEach(() => {
    delete global.browser;
    browser._sandbox.reset();
  });

  it('should get browser object', () => {
    assert.isObject(browser, 'browser');
  });

  describe('should get string and object', () => {
    const itemKeys = [
      OPTIONS_OPEN,
      NEW_TAB_OPEN_CONTAINER, 'sep-0',
      TAB_NEW, 'sep-1',
      TAB_RELOAD, TABS_RELOAD, TAB_MUTE, TABS_MUTE, 'sep-2',
      TAB_PIN, TABS_PIN, TAB_BOOKMARK, TABS_BOOKMARK, TAB_DUPE, TABS_DUPE,
      TAB_REOPEN_CONTAINER, TABS_REOPEN_CONTAINER, TAB_MOVE, TABS_MOVE, 'sep-3',
      TAB_ALL_RELOAD, TAB_ALL_SELECT, TAB_ALL_BOOKMARK, 'sep-4',
      TAB_GROUP, 'sep-5',
      TAB_CLOSE, TABS_CLOSE, TAB_CLOSE_DUPE, TABS_CLOSE_DUPE,
      TABS_CLOSE_MULTIPLE, TAB_CLOSE_UNDO
    ];
    const items = Object.entries(menuItems);

    it('should get equal length', () => {
      console.log(items.length)
      console.log(itemKeys.length)
      assert.isTrue(items.length === itemKeys.length, 'length');
    });

    it('should get string and object', () => {
      for (const [key, value] of items) {
        assert.isTrue(itemKeys.includes(key), `includes ${key}`);
        assert.isString(key, 'key');
        assert.isObject(value, 'value');
      }
    });
  });

  describe('sub items', () => {
    const parentItemKeys = [
      TAB_MOVE, TABS_MOVE,
      TAB_GROUP,
      TABS_CLOSE_MULTIPLE
    ];
    const subItemKeys = [
      TAB_MOVE_START, TAB_MOVE_END, TAB_MOVE_WIN,
      TABS_MOVE_START, TABS_MOVE_END, TABS_MOVE_WIN,
      TAB_GROUP_COLLAPSE, TAB_GROUP_COLLAPSE_OTHER, 'sepTabGroup-1',
      TAB_GROUP_LABEL_SHOW, 'sepTabGroup-2',
      TAB_GROUP_BOOKMARK, TAB_GROUP_SELECTED, TAB_GROUP_CONTAINER,
      TAB_GROUP_DOMAIN, TAB_GROUP_DETACH, TAB_GROUP_DETACH_TABS,
      TAB_GROUP_UNGROUP, 'sepTabGroup-3', TAB_GROUP_CLOSE,
      TABS_CLOSE_START, TABS_CLOSE_END, TABS_CLOSE_OTHER
    ];

    it('should get string and object of sub items', () => {
      parentItemKeys.forEach(itemKey => {
        const items = Object.entries(menuItems[itemKey].subItems);
        for (const [key, value] of items) {
          assert.isTrue(subItemKeys.includes(key), 'item');
          assert.isString(key, 'key');
          assert.isObject(value, 'value');
        }
      });
    });
  });
});
