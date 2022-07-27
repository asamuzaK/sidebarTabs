EN | [JA](./README.ja.md)

[![build](https://github.com/asamuzaK/sidebarTabs/workflows/build/badge.svg)](https://github.com/asamuzaK/sidebarTabs/actions?query=workflow%3Abuild)
[![CodeQL](https://github.com/asamuzaK/sidebarTabs/workflows/CodeQL/badge.svg)](https://github.com/asamuzaK/sidebarTabs/actions?query=workflow%3ACodeQL)
<!--
[![devDependency Status](https://david-dm.org/asamuzaK/sidebarTabs/dev-status.svg)](https://david-dm.org/asamuzaK/sidebarTabs?type=dev)
-->
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

## Hide the native tabs
For now, extensions can't hide the native browser tabs due to lack of an API. See: https://github.com/asamuzaK/sidebarTabs/issues/5

**Enable Custom CSS**

1. Visit `about:config` and click `Accept the risk and Continue`.
2. Search for `toolkit.legacyUserProfileCustomizations.stylesheets`.
3. Toggle it, making the value "true".

**Create userChrome.css**

1. Visit `about:support`.
2. To the right of `Profile Directory`, press the button `Open Directory`.
3. Create a new folder named `chrome`.
4. Open the `chrome` folder and create a new file named `userChrome.css`.
5. The contents of `userChrome.css` should be the following:

```css
/* Hides the native tabs */
#TabsToolbar {
  visibility: collapse;
}
```

Restart the browser to see the changes.

More details: https://superuser.com/questions/1424478/can-i-hide-native-tabs-at-the-top-of-firefox

## Tab groups

* Select tabs by "Shift + left click" or "Ctrl + left click" ("Cmd + left click" on Mac) on each tab.
* Drag one of the selected tabs with "Shift + left click" and drop it on the tab you want to group.
* You can also group tabs by selecting "Tab Group" from the context menu and selecting "Group Selected Tabs".
* Tab groups are color-coded for each.
* Collapse / expand tab groups can be done by clicking on the colored part, or from the context menu.
* The new tab opened from the tab in the tab group will be displayed as the tab of that group.
* To cancel the grouping of tabs, you can do it from the context menu.
* Tab groups will not be saved during private browsing.

## Known Issues

* The context menu item of the original tab "Send tab to device" is not implemented because there is no API for that in WebExtensions.
  [Issue #7](https://github.com/asamuzaK/sidebarTabs/issues/7 "Add \"Send tab to device\" functionalty · Issue #7 · asamuzaK/sidebarTabs")
