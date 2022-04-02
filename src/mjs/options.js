/**
 * options.js
 */

/* shared */
import { throwErr } from './common.js';
import { localizeHtml } from './localize.js';
import {
  addBookmarkLocations, addCustomThemeListener, addInitCustomThemeListener,
  addInitExtensionListener, addInputChangeListener, addUserCssListener,
  handleMsg, requestCustomTheme, setValuesFromStorage
} from './options-main.js';

/* api */
const { runtime } = browser;

runtime.onMessage.addListener((msg, sender) =>
  handleMsg(msg, sender).catch(throwErr)
);

/* startup */
document.addEventListener('DOMContentLoaded', () => Promise.all([
  addBookmarkLocations().then(setValuesFromStorage),
  addCustomThemeListener(),
  addInitCustomThemeListener(),
  addInitExtensionListener(),
  addInputChangeListener(),
  addUserCssListener(),
  localizeHtml(),
  requestCustomTheme(true)
]).catch(throwErr));
