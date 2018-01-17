/**
 * background.js
 */
"use strict";
{
  /* api */
  const {browserAction, sidebarAction} = browser;

  browserAction.onClicked.addListener(() => {
    sidebarAction.open();
  });
}
