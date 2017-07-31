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
  const TIME_3SEC = 3000;

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

  window.addEventListener("click", evt => {
    const {target} = evt;
    const {parentNode} = target;
    const reg = /js-n(?:av|ew-tweets-bar)/;
    let func;
    if (reg.test(target.className) ||
        parentNode && reg.test(parentNode.className)) {
      func = sendMsg({
        [TAB_OBSERVE]: true,
      }).catch(throwErr);
    }
    return func || null;
  });

  window.addEventListener("load", () => Promise.all([
    sendMsg({
      [TAB_OBSERVE]: true,
    }),
    // Note: twitter.com self reloads after loading completes
    setTimeout(() => sendMsg({
      [TAB_OBSERVE]: true,
    }).catch(throwErr), TIME_3SEC),
  ]).catch(throwErr));
}
