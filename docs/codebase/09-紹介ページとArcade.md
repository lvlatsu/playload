# PLU コードベース仕様書 — 紹介ページと Arcade

> 章単位の分割ファイルです。全体の目次・優先度一覧は [`../PLU_CODEBASE_SPEC.md`](../PLU_CODEBASE_SPEC.md) を参照してください。

## 9. 紹介ページと Arcade

**優先度：P3 — 周辺サイト機能。**

- 紹介ページは `src/site/` と `src/site/index.md` を元にビルドする。
- Arcade は `data/arcade.json` の掲載情報とローカル画像を元に生成する。
- Arcade の各作品リンクはアプリの共有 URL を指す。
- ビルド時に作品 URL、作者 URL、画像パス、日付形式などを検証する。
- `src/site/main.js` は言語選択と共有ゲーム URL のアプリへの転送等を扱う。
