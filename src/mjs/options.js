/**
 * options.js
 */

/* shared */
import { throwErr } from './common.js';
import { localizeHtml } from './localize.js';
import {
  addCustomThemeListener, addInitCustomThemeListener, addInitExtensionListener,
  addInputChangeListener, handleMsg, requestCustomTheme, setValuesFromStorage
} from './options-main.js';

/* api */
const { runtime } = browser;

runtime.onMessage.addListener((msg, sender) =>
  handleMsg(msg, sender).catch(throwErr)
);

/* startup */
document.addEventListener('DOMContentLoaded', () => Promise.all([
  addCustomThemeListener(),
  addInitCustomThemeListener(),
  addInitExtensionListener(),
  addInputChangeListener(),
  localizeHtml(),
  requestCustomTheme(true),
  setValuesFromStorage()
]).catch(throwErr));
