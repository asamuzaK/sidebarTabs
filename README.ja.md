[EN](./README.md) | JA

# sidebarTabs

Firefox用の拡張機能。
サイドバーにタブをエミュレートし、タブを縦に並べて表示します。
さらに、タブをグループ化して折りたたみ・展開することが可能です。

注意：
実験的な拡張機能です。一般の利用にはまだ適していません。

[ダウンロード](https://github.com/asamuzaK/sidebarTabs/tree/master/dest "sidebarTabs/dest at master · asamuzaK/sidebarTabs")

## about:config

試験的な機能を使っているので以下の設定を有効化する必要があります。

* `svg.context-properties.content.enabled`を`true`にセットする。
* コンテナタブを有効化している場合は、`privacy.userContext.enabled`を`true`にセットする。

## タブグループ

* タブを「Ctrl + 左クリック」でドラッグして、グループ化したいタブの上にドロップします。
* タブグループは、グループごとに色分け表示されます。
* タブグループの折りたたみ・展開は色のついた部分をクリックするか、コンテキストメニューから実行できます。
* タブグループの中にあるタブから開いた新規タブはそのグループのタブとして表示されます。
* タブのグループ化を解除するには、コンテキストメニューから実行してください。
* プライベートブラウジング中のタブグループに関するデータは保存されません。

## 既知の問題

* 本来のタブのコンテキストメニューにある「タブを端末に送る」の項目は、WebExtensionsにAPIがないため実装していません。
  [Issue #7](https://github.com/asamuzaK/sidebarTabs/issues/7 "Add \"Send tab to device\" functionalty · Issue #7 · asamuzaK/sidebarTabs")
* グループ化されていないタブから新規タブを開いても、自動的にはグループ化されません。
  これはWebExtensionsのAPIの実装待ちです。
  なお、あらかじめグループ化されているタブから新規タブを開くと同じグループにまとめられます。
  [Issue #6](https://github.com/asamuzaK/sidebarTabs/issues/6 "Automatically group tabs · Issue #6 · asamuzaK/sidebarTabs")
