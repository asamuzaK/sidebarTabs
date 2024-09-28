EN | [JA](./README.ja.md) | [فا](./README.fa.md)

[![build](https://github.com/asamuzaK/sidebarTabs/workflows/build/badge.svg)](https://github.com/asamuzaK/sidebarTabs/actions?query=workflow%3Abuild)
[![CodeQL](https://github.com/asamuzaK/sidebarTabs/workflows/CodeQL/badge.svg)](https://github.com/asamuzaK/sidebarTabs/actions?query=workflow%3ACodeQL)
[![Mozilla Add-on](https://img.shields.io/amo/v/sidebarTabs@asamuzak.jp.svg)](https://addons.mozilla.org/firefox/addon/sidebartabs/)

# sidebarTabs

WebExtensions for Firefox.

* Display tabs vertically in the sidebar.
* Tabs can be grouped.

## Download

* [Sidebar Tabs – Add-ons for Firefox](https://addons.mozilla.org/firefox/addon/sidebartabs/ "Sidebar Tabs – Add-ons for Firefox")

## about:config

Enable the experimental feature as follows:

* Visit `about:config`.
* Search for `svg.context-properties.content.enabled` and set the value to `true`.

This can also improve dark theme ([Issue #154](https://github.com/asamuzaK/sidebarTabs/issues/154)). 

## Tab groups

* To group tabs:
  * Select tabs by `Shift` + click or `Ctrl`[^1] + click.
  * Drag one of the selected tabs and `Shift` + drop it on the tab you want to group.
  * Or from the context menu (right click on one of the selected tabs), select "Tab Group" -&gt; "Group Selected Tabs".
* To add group label:
  * From the context menu, select "Tab Group" -&gt; "Show Group Label" and edit.
* To collapse / expand tab group:
  * Click on the colored part will toggle collapsed / expanded state.
  * Or from the context menu, select "Tab Group" -&gt; "Collapse (Expand) Tab Group".
* To cancel tab group:
  * From the context menu, select "Tab Group" -&gt; "Ungroup tabs".

Tab groups will not be saved during private browsing.

## Drag and drop

There are some differences in Firefox's native tabs and Sidebar Tabs.

|Drag item|On drag start|Drop target|On drop|Result|Note|
|----|----|----|----|----|----|
|Tab(s) of Sidebar Tabs|`Mouse Down`[^3]|Sidebar Tabs|`Mouse Up`[^4]|Move| |
|Tab(s) of Sidebar Tabs|`Mouse Down`[^3]|Sidebar Tabs|`Ctrl`[^1] + `Mouse Up`[^4]|Copy| |
|Tab Group|`Shift` + `Ctrl`[^1] + `Mouse Down`|Sidebar Tabs|`Mouse Up`[^4]|Move| |
|Tab Group|`Shift` + `Ctrl`[^1] + `Mouse Down`|Sidebar Tabs|`Ctrl`[^1] + `Mouse Up`[^4]|Copy| |
|URL|`Mouse Down`|Sidebar Tabs|`Mouse Up`|Open URL| |
|Text|`Mouse Down`|Sidebar Tabs|`Mouse Up`|Search text| |
|Tab(s) of Sidebar Tabs|`Mouse Down`|Bookmark Toolbar|`Mouse Up`|None|Native tab creates bookmark|
|Tab(s) of Sidebar Tabs|`Alt`[^2] + `Mouse Down`[^3]|Bookmark Toolbar|`Mouse Up`|Creates bookmark| |
|Tab(s) of Sidebar Tabs|`Mouse Down`|Desktop|`Mouse Up`|None|Native tab creates new window|
|Tab(s) of Sidebar Tabs|`Alt`[^2] + `Mouse Down`[^3]|Desktop|`Mouse Up`|**Creates internet shortcut (Caveat)**| |

## Known Issues

* The extension can't hide the browser native tab bars because there is no API for that in WebExtensions. But you can hide them manually.
  [Issue #5](https://github.com/asamuzaK/sidebarTabs/issues/5 "Add ability to \"hide native tab bars\" · Issue #5 · asamuzaK/sidebarTabs")
* The context menu item of the original tab "Send tab to device" is not implemented because there is no API for that in WebExtensions.
  [Issue #7](https://github.com/asamuzaK/sidebarTabs/issues/7 "Add \"Send tab to device\" functionalty · Issue #7 · asamuzaK/sidebarTabs")

[^1]: `Cmd` on Mac
[^2]: `Opt` on Mac
[^3]: `Shift` + `Mouse Down` / `Ctrl` (`Cmd` on Mac) + `Mouse Down` selects multiple tabs.
[^4]: `Shift` + `Mouse Up` will group dragged tab(s) and drop target.
