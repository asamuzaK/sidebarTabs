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
    console.log(evt.type);
    const {target} = evt;
    const {parentNode} = target;
    const reg = /js-n(?:av|ew-tweets-bar)/;
    const func = (reg.test(target) || reg.test(parentNode)) && sendMsg({
      [TAB_OBSERVE]: true,
    }).catch(throwErr);
    return func || null;
  });

  window.addEventListener("load", () => {
    const func = [
      sendMsg({
        [TAB_OBSERVE]: true,
      }),
      setTimeout(() => sendMsg({
        [TAB_OBSERVE]: true,
      }).catch(throwErr), TIME_3SEC)
    ];
    return Promise.all(func).catch(throwErr);
  });
}
