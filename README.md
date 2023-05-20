EN | [JA](./README.ja.md) | [فا](./README.fa.md)

[![build](https://github.com/asamuzaK/sidebarTabs/workflows/build/badge.svg)](https://github.com/asamuzaK/sidebarTabs/actions?query=workflow%3Abuild)
[![CodeQL](https://github.com/asamuzaK/sidebarTabs/workflows/CodeQL/badge.svg)](https://github.com/asamuzaK/sidebarTabs/actions?query=workflow%3ACodeQL)
[![Mozilla Add-on](https://img.shields.io/amo/v/sidebarTabs@asamuzak.jp.svg)](https://addons.mozilla.org/firefox/addon/sidebartabs/)

# sidebarTabs

Web extension for Firefox.
Emulate tabs in sidebar and...
* display tabs vertically.
* group tabs and collapse / expand them.

## Download

* [Sidebar Tabs – Add-ons for Firefox](https://addons.mozilla.org/firefox/addon/sidebartabs/ "Sidebar Tabs – Add-ons for Firefox")

## about:config

Experimental features are used, so you need to activate the following.

* set `svg.context-properties.content.enabled` to `true`.

This can also improve dark theme ([Issue #154](https://github.com/asamuzaK/sidebarTabs/issues/154)). 

## Tab groups

* Select tabs by "Shift + left click" or "Ctrl + left click" ("Cmd + left click" on Mac) on each tab.
* Drag one of the selected tabs with "Shift + left click" and drop it on the tab you want to group.
* You can also group tabs by selecting "Tab Group" from the context menu and selecting "Group Selected Tabs".
* Tab groups are color-coded for each.
* Collapse / expand tab groups can be done by clicking on the colored part, or from the context menu.
* The new tab opened from the tab in the tab group will be displayed as the tab of that group.
* To cancel the grouping of tabs, you can do it from the context menu.
* To move the tab group with drag &amp; drop (DnD), "Shift + Ctrl + DnD" ("Shift + Cmd + DnD" on Mac).
* Tab groups will not be saved during private browsing.

## Known Issues

* The extension can't hide the browser native tab bars because there is no API for that in WebExtensions. But you can hide them manually.
  [Issue #5](https://github.com/asamuzaK/sidebarTabs/issues/5 "Add ability to \"hide native tab bars\" · Issue #5 · asamuzaK/sidebarTabs")
* The context menu item of the original tab "Send tab to device" is not implemented because there is no API for that in WebExtensions.
  [Issue #7](https://github.com/asamuzaK/sidebarTabs/issues/7 "Add \"Send tab to device\" functionalty · Issue #7 · asamuzaK/sidebarTabs")
