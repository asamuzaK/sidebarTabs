EN | [JA](./README.ja.md)

# sidebarTabs

Web extension for Firefox.
Emulate tabs in sidebar and display tabs vertically. Furthermore, group tabs and collapse / expand them.

Note:
Experimental. It is not suitable for general use.

[Download](https://github.com/asamuzaK/sidebarTabs/tree/master/dist "sidebarTabs/dist at master · asamuzaK/sidebarTabs")

## about:config

* set `svg.context-properties.content.enabled` to `true`.
* If you have enabled Container Tab, set `privacy.userContext.enabled` to `true`.

## Hide default tab bar

Create `chrome/` folder in your profile and save `userChrome.css`.
```
@namespace url("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul");
/* tabs toolbar */
#TabsToolbar {
  visibility: collapse;
}
```

## Grouping tabs

Drag the tab with "Ctrl + left click" and drop it on the tab you want to group.

## Known Issues

* A loading icon sometime remains even if the site loading ends.
  In that case, open the context menu and select "Tab" -> "Sync Tab".
  [Issue #3](https://github.com/asamuzaK/sidebarTabs/issues/3 "Spinner icon not replaced even after complete in twitter.com · Issue #3 · asamuzaK/sidebarTabs")
* If you open a new tab from an ungrouped tab, a new tab will not be automatically grouped.
  It is waiting for implementation of the WebExtensions API.
  [Issue #6](https://github.com/asamuzaK/sidebarTabs/issues/6 "Automatically group tabs · Issue #6 · asamuzaK/sidebarTabs")
  If you open a new tab from pre-grouped tabs, it will be grouped in the same group.
