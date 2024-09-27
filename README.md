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
* To cancel the grouping of tabs, do it from the context menu.
* Tab groups will not be saved during private browsing.

## Drag and Drop

There are some differences in the behavior of Firefox's native tabs and Sidebar Tabs.

|Drag item|On drag start|Drop target|On drop|Result|Note|
|------|------|------|------|------|------|
|Tab(s) of Sidebar Tabs|`Mouse Down`[^1]|Sidebar Tabs|`Mouse Up`[^2]|Move| |
|Tab(s) of Sidebar Tabs|`Mouse Down`[^1]|Sidebar Tabs|`Ctrl`[^3] + `Mouse Up`[^2]|Copy| |
|Tab Group|`Shift` + `Ctrl`[^3] + `Mouse Down`|Sidebar Tabs|`Mouse Up`[^2]|Move| |
|Tab Group|`Shift` + `Ctrl`[^3] + `Mouse Down`|Sidebar Tabs|`Ctrl`[^3] + `Mouse Up`[^2]|Copy| |
|URL|`Mouse Down`|Sidebar Tabs|`Mouse Up`|Open URL| |
|Text|`Mouse Down`|Sidebar Tabs|`Mouse Up`|Search text| |
|Tab(s) of Sidebar Tabs|`Mouse Down`|Bookmark Toolbar|`Mouse Up`|None|Native tab creates bookmark|
|Tab(s) of Sidebar Tabs|`Alt`[^4] + `Mouse Down`[^1]|Bookmark Toolbar|`Mouse Up`|Creates bookmark| |
|Tab(s) of Sidebar Tabs|`Mouse Down`|Desktop|`Mouse Up`|None|Native tab creates new window|
|Tab(s) of Sidebar Tabs|`Alt`[^4] + `Mouse Down`[^1]|Desktop|`Mouse Up`|**Creates internet shortcut (Caveat)**| |

[^1]: `Shift` + `Mouse Down` / `Ctrl` (`Cmd` on Mac) + `Mouse Down` selects multiple tabs.
[^2]: `Shift` + `Mouse Up` will group dragged tab(s) and drop target.
[^3]: `Cmd` on Mac
[^4]: `Opt` on Mac

## Known Issues

* The extension can't hide the browser native tab bars because there is no API for that in WebExtensions. But you can hide them manually.
  [Issue #5](https://github.com/asamuzaK/sidebarTabs/issues/5 "Add ability to \"hide native tab bars\" · Issue #5 · asamuzaK/sidebarTabs")
* The context menu item of the original tab "Send tab to device" is not implemented because there is no API for that in WebExtensions.
  [Issue #7](https://github.com/asamuzaK/sidebarTabs/issues/7 "Add \"Send tab to device\" functionalty · Issue #7 · asamuzaK/sidebarTabs")
