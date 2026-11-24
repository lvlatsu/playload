# PLU 開発記録

この記録は、仕様・実装・検証の経緯と判断理由を残すための追記型ログです。新しい記録を先頭へ追加し、過去の記録は原則として書き換えません。

## 2026-11-24 — GitHub Pages ビルド失敗原因の特定と修正

### 原因の特定

run #139 の Build site ログを取得したところ、`src/app/examples.js` の STAR FLOW エントリーに `bytes` プロパティが重複していた。esbuild の `duplicate-object-key` 警告を `scripts/build.js` がエラーとして扱い、ビルドを停止していた。

ログ上の重複値は古い `800` と新しい `811`。`data/examples.json` には `bytes` は定義されておらず、`scripts/generate-examples.js` が各サンプルソースから圧縮サイズと hash を生成する構成である。

### 修正

- `src/app/examples.js` の STAR FLOW エントリーから古い `bytes: 800` を削除し、`bytes: 811` のみを残した。
- 修正コミット：`7dbe764932b132fc84fbd9286f81ec7b580439c2`

このファイルは生成物であるため、次の検証で `npm run examples:check` を実行し、生成スクリプトの期待値と一致することを確認する。今回の環境では Node.js を使ったローカル実行はできていない。

### 検証状態

- run #139 の失敗ログ取得：実施。重複キー警告が原因と確認。
- 重複キー修正：コミット済み。
- 修正後の GitHub Actions run #151：この記録更新時点で pending。成功未確認。
- `npm run examples:check`：未実行。
- `npm run build`：修正後未実行。
- 自動テスト・実機確認・デプロイ・公開反映：未確認。

### 次の作業

run #151 の結果を確認し、ビルド成功後は deploy と公開反映を確認する。並行して Node.js 24 環境で `npm run examples:check` を実行し、生成物が一致することを確認する。

---

## 2026-11-24 — 実装済み描画機能の棚卸しと文書整合性の修正

### 調査対象

- ソース基準コミット：`a7e1f7fc233a0e9980f0f855d054b6ddcf5d9cdb`
- ブランチ：`main`
- 照合した主なファイル：
  - `src/engine/engine.js`
  - `src/app/game-worker.js`
  - `src/app/game-host.js`
  - `src/app/runtime.js`
  - `src/app/game-messages.js`
  - `data/reference.json`
  - `tests/engine.test.js`
  - `tests/runtime.test.js`
  - 関連する `docs/codebase/14〜21章`

### 発見した問題

仕様書の記述が実装状況に追いついておらず、同じ機能について章ごとに矛盾していた。

- 04章・12章・14章・16章では、基本図形 API が未実装または未着手と記録されていた。
- 17章では基本図形 API が実装済みと記録されていた。
- 18章ではレイヤー図形描画が未実装と記録されていた。
- 15章では実行時 RGB パレット `ucpl` が未実装と記録されていた一方、20章では実装済みと記録されていた。
- 13章の命名例には旧案の `ubox` / `ucir` / `ufil` が残っていた。

### ソース・API リファレンス・テストコードから確認した事実

- 基本図形 API は `upix` / `ulin` / `urec` / `uelp`。
- 矩形の塗りつぶしは `urec` の任意引数 `fillCol`、楕円・正円の塗りつぶしは `uelp` の任意引数 `fillCol` で指定する。
- `fillCol` の省略は輪郭のみ、`fillCol=0` は黒塗り。色0は透明ではない。
- 円専用 API は設けず、`uelp` の幅・高さを同じにして正円を描く。
- BG / MG / FG はスプライトだけでなく、4種類の基本図形 API も利用できる。
- 描画順は文字画面、通常描画面、BG、MG、FG。
- 実行時 RGB パレット `ucpl.set` / `setAll` / `get` / `reset` は実装済み。
- 数学 API は `urnd` / `usin` / `ucos` / `utan` / `usqr` / `uabs` / `uflr` / `ucei` / `umin` / `umax` / `upow` / `uatan2`。
- 関連する自動テストコードが `tests/engine.test.js`、`tests/runtime.test.js` 等に存在する。

### 変更した記録

- 04章：現在の描画経路・合成順・実行時パレットを実装に合わせて更新。
- 12章：実装状態とテストコード・テスト実行・実機確認を分離して整理。
- 13章：変更時の手順を強化し、旧 API 候補を現行 API と区別。
- 14章：現行描画 API の棚卸しを更新。
- 15章：`ucpl` を実装済み、`ugpl`・多色スプライト・アニメーションを構想として整理。
- 16章：実装済みの描画基盤と今後の拡張候補を分離。
- 18章：各レイヤーで基本図形 API が利用できることを反映。
- `PLU_CODEBASE_SPEC.md`：引き継ぎ書への入口を追加し、目次の誤記を修正。
- `PLU_HANDOVER.md`：初見の担当者向けに目的・現在地・次の作業・読み順を整理。

### 検証状態

- ソースコードの確認：実施。
- API リファレンスとの照合：実施。
- テストコードの存在確認：実施。
- 自動テストの実行：未実施。
- Android 実機・ブラウザでの最新動作確認：未実施。
- 最新公開の確認：未確認。

GitHub Actions run #139（ソース基準コミット `a7e1f7f`）は Install dependencies 成功後、Build site で失敗。Deploy はスキップされた。失敗原因は未特定。

### 次の作業

1. [run #139 の Build site ログ](https://github.com/lvlatsu/playload/actions/runs/44823001732)を取得して失敗原因を特定する。
2. ビルドを修復し、テストを実行する。
3. GitHub Actions のビルド・デプロイと公開反映を確認する。
4. その後、次の描画機能の設計・実装へ進む。

### 判断理由・再発防止

今回の矛盾は、実装後に関連するすべての仕様書・ロードマップ・棚卸しを同時に更新しなかったことが原因である。今後はソースだけ、または仕様書だけを更新して完了にしない。変更時には関連テスト・公開 API リファレンス・仕様書・ロードマップ・開発記録をまとめて確認し、テスト実行と実機確認は別の状態として残す。

---
