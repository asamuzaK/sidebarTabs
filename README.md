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

## Browser settings

To match icon colors to your theme, enable the experimental feature as follows:

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

|Command|Drag item|Drop target|Note|
|----|----|----|----|
|Move Tab|Drag[^3] Tab|Drop[^4] to Sidebar|Also between windows[^5]|
|Copy Tab|Drag[^3] Tab|`Ctrl`[^1] + Drop[^4] to Sidebar|Also between windows[^5]|
|Move Tab Group|`Shift` + `Ctrl`[^1] + Drag Tab Group|Drop[^4] to Sidebar|Also between windows[^5]|
|Copy Tab Group|`Shift` + `Ctrl`[^1] + Drag Tab Group|`Ctrl`[^1] + Drop[^4] to Sidebar|Also between windows[^5]|
|Open URL|Drag URL|Drop to Sidebar| |
|Search Text|Drag Text|Drop to Sidebar |
|(No Effect)|Drag Tab|Drop to Bookmark Toolbar|Native tab creates bookmark|
|Create Bookmark|`Alt`[^2] + Drag[^3] Tab|Drop to Bookmark Toolbar| |
|(No Effect)|Drag Tab|Drop to Desktop|Native tab creates new window|
|**Creates Internet Shortcut (Caveat)**|`Alt`[^2] + Drag[^3] Tab|Drop to Desktop| |

## Known Issues

* The extension can't hide the browser native tab bars because there is no API for that in WebExtensions. But you can hide them manually.
  [Issue #5](https://github.com/asamuzaK/sidebarTabs/issues/5 "Add ability to \"hide native tab bars\" · Issue #5 · asamuzaK/sidebarTabs")
* The context menu item of the original tab "Send tab to device" is not implemented because there is no API for that in WebExtensions.
  [Issue #7](https://github.com/asamuzaK/sidebarTabs/issues/7 "Add \"Send tab to device\" functionalty · Issue #7 · asamuzaK/sidebarTabs")

[^1]: `Cmd` on Mac
[^2]: `Opt` on Mac
[^3]: `Shift` + Drag / `Ctrl` (`Cmd` on Mac) + Drag selects multiple tabs.
[^4]: `Shift` + Drop will group dragged tab(s) and drop target.
[^5]: Grouping will be canceled, `Shift` has no effect.
