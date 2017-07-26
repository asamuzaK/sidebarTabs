[EN](./README.md) | JA

# sidebarTabs

Firefox用の拡張機能。
サイドバーにタブをエミュレートし、タブを縦に並べて表示します。さらに、タブをグループ化して折りたたみ・展開することが可能です。

注意：
実験的な拡張機能です。一般の利用には適していません。

[ダウンロード](https://github.com/asamuzaK/sidebarTabs/tree/master/dist "sidebarTabs/dist at master · asamuzaK/sidebarTabs")

## about:config

* `svg.context-properties.content.enabled`を`true`にセットする必要があります。
* コンテナタブを有効化している場合は、`privacy.userContext.enabled`を`true`にセットしてください。

## デフォルトのタブバーを隠す

プロファイルに`chrome/`フォルダを作成し、`userChrome.css`を保存します。
```
@namespace url("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul");
/* tabs toolbar */
#TabsToolbar {
  visibility: collapse !important;
}
```
