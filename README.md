EN | [JA](./README.ja.md)

# sidebarTabs

Web Extension for Firefox.
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
  visibility: collapse !important;
}
```
