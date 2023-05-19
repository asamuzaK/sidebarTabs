[EN](./README.md) | JA | [فا](./README.fa.md)

[![build](https://github.com/asamuzaK/sidebarTabs/workflows/build/badge.svg)](https://github.com/asamuzaK/sidebarTabs/actions?query=workflow%3Abuild)
[![CodeQL](https://github.com/asamuzaK/sidebarTabs/workflows/CodeQL/badge.svg)](https://github.com/asamuzaK/sidebarTabs/actions?query=workflow%3ACodeQL)
[![Mozilla Add-on](https://img.shields.io/amo/v/sidebarTabs@asamuzak.jp.svg)](https://addons.mozilla.org/firefox/addon/sidebartabs/)

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

これにより、暗いテーマも改善できます（[Issue #154](https://github.com/asamuzaK/sidebarTabs/issues/154)）。

## タブグループ

* 「Shift + 左クリック」または「Ctrl + 左クリック」（Macでは「Cmd + 左クリック」）でグループ化したいタブを選択状態にします。
* 選択されたタブのどれかを「Shift + 左クリック」でドラッグして、親としてグループ化したいタブの上にドロップします。
* コンテキストメニューから「タブグループ」を開き「選択したタブのグループ化」を選んでもグループ化することができます。
* タブグループは、グループごとに色分け表示されます。
* タブグループの折りたたみ・展開は色のついた部分をクリックするか、コンテキストメニューから実行できます。
* タブグループの中にあるタブから開いた新規タブはそのグループのタブとして表示されます。
* タブのグループ化を解除するには、コンテキストメニューから実行してください。
* DnD (ドラッグ アンド ドロップ) でタブグループを移動するには「Shift + Ctrl + DnD」（Macでは「Shift + Cmd + DnD」）。
* プライベートブラウジング中のタブグループに関するデータは保存されません。

## 既知の問題

* WebExtensionsにAPIがないため、ブラウザの本来のタブバーを非表示にすることはできません。ただし、手動で非表示にすることはできます。
  [Issue #5](https://github.com/asamuzaK/sidebarTabs/issues/5 "Add ability to \"hide native tab bars\" · Issue #5 · asamuzaK/sidebarTabs")
* 本来のタブのコンテキストメニューにある「タブを端末に送る」の項目は、WebExtensionsにAPIがないため実装していません。
  [Issue #7](https://github.com/asamuzaK/sidebarTabs/issues/7 "Add \"Send tab to device\" functionalty · Issue #7 · asamuzaK/sidebarTabs")
