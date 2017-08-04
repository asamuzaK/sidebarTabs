/**
 * twitter.js
 * workaround for twitter.com
 */
"use strict";
{
  /* api */
  const {runtime} = browser;

  /* constant */
  const CLASS_NEW_TWEETS = "js-new-tweets-bar";
  const GLOBAL_NAV_QUERY = ".js-nav.js-tooltip.js-dynamic-tooltip";
  const TAB_OBSERVE = "observeTab";

  /**
   * throw error
   * @param {!Object} e - Error
   * @throws - Error
   */
  const throwErr = e => {
    throw e;
  };

  /**
   * send message
   * @param {*} msg - message
   * @returns {?AsyncFunction} - runtime.sendMessage()
   */
  const sendMsg = async msg => {
    const func = msg && runtime.sendMessage(msg);
    return func || null;
  };

  /**
   * create observe message
   * @param {!Object} evt - Event
   * @returns {Object} - message
   */
  const createObserveMsg = async evt => {
    const {type} = evt;
    const msg = {
      [TAB_OBSERVE]: type,
    };
    return msg || null;
  };

  /**
   * add listeners to global navigation
   * @returns {void}
   */
  const globalNavAddListener = async () => {
    const items = document.querySelectorAll(GLOBAL_NAV_QUERY);
    for (const item of items) {
      item.addEventListener("keydown", evt => {
        const {code} = evt;
        let func;
        if (code === "Enter") {
          func = createObserveMsg(evt).then(sendMsg).catch(throwErr);
        }
        return func || null;
      });
      item.addEventListener("mousedown", evt => {
        const {button} = evt;
        let func;
        if (button === 0) {
          func = createObserveMsg(evt).then(sendMsg).catch(throwErr);
        }
        return func || null;
      });
    }
  };

  window.addEventListener("keydown", evt => {
    const {code, target} = evt;
    let func;
    if (code === "Enter") {
      const {parentNode} = target;
      if (target.classList.contains(CLASS_NEW_TWEETS) ||
          parentNode && parentNode.classList.contains(CLASS_NEW_TWEETS)) {
        func = createObserveMsg(evt).then(sendMsg).catch(throwErr);
      }
    }
    return func || null;
  });

  window.addEventListener("mousedown", evt => {
    const {button, target} = evt;
    let func;
    if (button === 0) {
      const {parentNode} = target;
      if (target.classList.contains(CLASS_NEW_TWEETS) ||
          parentNode && parentNode.classList.contains(CLASS_NEW_TWEETS)) {
        func = createObserveMsg(evt).then(sendMsg).catch(throwErr);
      }
    }
    return func || null;
  });

  window.addEventListener("load", evt => Promise.all([
    globalNavAddListener(),
    createObserveMsg(evt).then(sendMsg),
  ]).catch(throwErr));
}
