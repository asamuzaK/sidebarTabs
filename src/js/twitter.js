/**
 * twitter.js
 * workaround for twitter.com
 */
"use strict";
{
  /* api */
  const {runtime} = browser;

  /* constant */
  const TAB_OBSERVE = "observeTab";

  /**
   * send message when new tweets bar is clicked
   * @param {!Object} evt - Event
   * @returns {void}
   */
  const sendObserveTabMsg = evt => {
    const {target} = evt;
    target.classList.contains("js-new-tweets-bar") && runtime.sendMessage({
      [TAB_OBSERVE]: true,
    });
  };

  window.addEventListener("click", sendObserveTabMsg);
}
