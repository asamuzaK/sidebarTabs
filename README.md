EN | [JA](./README.ja.md)

# sidebarTabs

Web extension for Firefox.
Emulate tabs in sidebar and display tabs vertically. Furthermore, group tabs and collapse / expand them.

Note:
Experimental. It is not suitable for general use.

[Download](https://github.com/asamuzaK/sidebarTabs/tree/master/dist "sidebarTabs/dist at master · asamuzaK/sidebarTabs")

## about:config

Experimental features are used, so you need to activate the following settings.

* set `svg.context-properties.content.enabled` to `true`.
* If you have enabled Container Tab, set `privacy.userContext.enabled` to `true`.

## Tab group

* Drag the tab with "Ctrl + left click" and drop it on the tab you want to group.
* Tab groups are color-coded for each group.
* Collapse / expand tab groups can be done by clicking on the colored part, or from the context menu.
* The new tab opened from the tab in the tab group will be displayed as the tab of that group.
* To cancel the grouping of tabs, you can do it from the context menu.
* Tab groups will not be saved during private browsing.

## Known Issues

* The context menu item of the original tab "Send tab to device" is not implemented because there is no API for that in WebExtensions.
* A loading icon sometime remains even if the site loading ends.
  In that case, open the context menu and select "Tab" -> "Sync Tab".
  [Issue #3](https://github.com/asamuzaK/sidebarTabs/issues/3 "Spinner icon not replaced even after complete in twitter.com · Issue #3 · asamuzaK/sidebarTabs")
* If you open a new tab from an ungrouped tab, a new tab will not be automatically grouped.
  It is waiting for implementation of the WebExtensions API.
  If you open a new tab from pre-grouped tabs, it will be grouped in the same group.
  [Issue #6](https://github.com/asamuzaK/sidebarTabs/issues/6 "Automatically group tabs · Issue #6 · asamuzaK/sidebarTabs")
