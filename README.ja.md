[EN](./README.md) | JA

# sidebarTabs

Firefox用の拡張機能。
サイドバーにタブをエミュレートした上で、
* タブを縦に並べて表示します。
* タブをグループ化して、折りたたみ・展開することが可能です。

## ダウンロード

* [サイドバータブ – Firefox 向けアドオン](https://addons.mozilla.org/firefox/addon/sidebartabs/ "サイドバータブ – Firefox 向けアドオン")

## about:config

試験的な機能を使っているので以下の設定を有効化する必要があります。

* `svg.context-properties.content.enabled`を`true`にセットする。
* コンテナタブを有効化している場合は、`privacy.userContext.enabled`を`true`にセットする。

## タブグループ

* タブを「Shift + 左クリック」でドラッグして、グループ化したいタブの上にドロップします。
* タブグループは、グループごとに色分け表示されます。
* タブグループの折りたたみ・展開は色のついた部分をクリックするか、コンテキストメニューから実行できます。
* タブグループの中にあるタブから開いた新規タブはそのグループのタブとして表示されます。
* タブのグループ化を解除するには、コンテキストメニューから実行してください。
* プライベートブラウジング中のタブグループに関するデータは保存されません。

## 既知の問題

* 本来のタブのコンテキストメニューにある「タブを端末に送る」の項目は、WebExtensionsにAPIがないため実装していません。
  [Issue #7](https://github.com/asamuzaK/sidebarTabs/issues/7 "Add \"Send tab to device\" functionalty · Issue #7 · asamuzaK/sidebarTabs")
