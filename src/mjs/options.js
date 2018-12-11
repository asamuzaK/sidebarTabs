/**
 * options.js
 */

import {
  throwErr,
} from "./common.js";
import {
  localizeHtml,
} from "./localize.js";
import {
  addInitExtensionListener,
  addInputChangeListener,
  setValuesFromStorage,
} from "./options-main.js";

/* startup */
Promise.all([
  localizeHtml(),
  setValuesFromStorage(),
  addInputChangeListener(),
  addInitExtensionListener(),
]).catch(throwErr);
