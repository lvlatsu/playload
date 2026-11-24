# PLU 開発記録

この記録は、仕様・実装・検証の経緯と判断理由を残すための追記型ログです。新しい記録を先頭へ追加し、過去の記録は原則として書き換えません。

## 2026-11-24 — 単体テストの CI 実行成功と Pages デプロイ

- run #185（commit `faf9ce6a182fae48f0368143c3dc54c7da067481`）を確認。
- `npm run examples:check`：成功。
- `npm test`：246件中245件成功、失敗0件、スキップ1件。
- `npm run build`：成功。
- GitHub Pages Deploy：成功。deployment status は success。
- 失敗していたテストは、PLU の実際のホームページ内容・アプリのライセンス欄・楕円描画の輪郭規則・Runtime 応答の有効なパレット fixture に合わせて修正した。エンジンの描画実装自体は変更していない。
- Playwright ブラウザテスト、`npm run check`、Android 実機確認は未実施。

---

## 2026-11-24 — コミット済み生成物チェックとデプロイ再確認

- run #173（commit `6d3802fface46d85dd2f0d2d6661011bb6f669e6`）で `npm run examples:check` が成功。コミット済み `src/app/examples.js` が生成スクリプトの正規出力と一致することを確認。
- 続く Build site、Upload Pages artifact、GitHub Pages Deploy もすべて成功。Pages deployment status は success。
- これにより、一時再生成ステップに依存せず、コミット済み生成物のままビルド・デプロイできる状態を確認した。
- Node.js 単体テスト（`npm test`）、Playwright テスト（`npm run test:browser`）、Android 実機確認は未実施。
- この記録更新後の push で新しい workflow run が起動するため、必要に応じて Actions の最新 run を確認する。

---

## 2026-11-24 — サンプル生成物の正規再生成と復旧デプロイ

- run #168 で一時的な復旧ステップ `npm run examples && npm run examples:check` が成功し、その後 Build site と GitHub Pages Deploy も成功。
- workflow ログに出力された `src/app/examples.js` の完全な生成結果を回収し、リポジトリのファイル全体を正規生成物で更新。
- 更新コミット：`12e908f5cbe98bc4b6440131fc57046f7fea0858`。
- この更新により、STAR FLOW の圧縮ペイロードだけでなく GEM SURVIVOR を含むサンプルリンク一覧全体が `data/examples.json` と `examples/*.js` から再生成された。
- 一時的な `npm run examples`・ログ出力ステップを Deploy workflow から除去し、`npm run examples:check` のみを残した。
- この記録更新後の最新 workflow で、コミット済み生成物に対する check と build / deploy の成功を確認する。
- Node.js 単体テスト・Playwright テスト・Android 実機確認は未実施。

---

## 2026-11-24 — 生成サンプル整合性チェックで残存不整合を検出

- Deploy workflow に追加した `npm run examples:check` は run #164 で失敗。
- エラーは `Example links are stale; run npm run examples`。現在の `src/app/examples.js` が `data/examples.json` と `examples/*.js` から生成される正規出力と一致していない。
- 先の `bytes` 重複キー除去でビルドは通るようになったが、生成物全体の一致は回復していなかった。手作業での部分修正では不十分。
- 一時的に CI で `npm run examples` と `npm run examples:check` を実行し、正規生成ファイルをログへ出力する復旧手順を追加した。
- 次にログから正規生成物を回収して `src/app/examples.js` 全体を更新し、その後 workflow を `npm run examples:check` のみへ戻す。
- この時点で run #164 は Check generated examples 失敗、Build site / Deploy はスキップ。run #159 までの Pages デプロイ成功は確認済みだが、現行 main の最新コミットはまだデプロイ成功していない。

---

## 2026-11-24 — run #159 成功と生成物チェックの CI 化

- run #159（commit `37df03071de5c0ba903a51af12279392f51814ab`）で Build site と Deploy が成功。GitHub Pages deployment status も success。
- 環境 URL は `https://lvlatsu.github.io/playload/`。ページ本文の独立したブラウザ確認は未実施。
- STAR FLOW の生成済み `bytes` 重複を修正した後のビルド成功を再確認。
- 生成ファイル `src/app/examples.js` と元データ・生成スクリプトの不整合を検出できるよう、Deploy workflow に `npm run examples:check` を追加。
- 追加した CI チェックの結果は、この記録更新後に起動する最新 workflow で確認する。
- `npm test`、`npm run test:browser`、Android 実機確認は未実施。

---

## 2026-11-24 — GitHub Pages ビルド・デプロイ成功の確認

- run #156（commit `c4e714ea1d5c397058a555e37ac45cae2367bfb1`）を確認。
- Build job：Install dependencies、Build site、Upload Pages artifact がすべて成功。
- Deploy job：成功。GitHub Pages deployment status は success と報告され、環境 URL は `https://lvlatsu.github.io/playload/`。
- これにより、重複キー修正を含む commit `c4e714e` の Pages デプロイ処理成功を確認した。
- ただし、公開ページの内容をブラウザで独立して閲覧確認したわけではない。
- `npm run examples:check`、`npm test`、`npm run test:browser` は未実行。Android 実機確認も未実施。
- この記録更新後の push で新しい workflow run が発生するため、次の担当者は Actions の最新 run を確認する。

---

## 2026-11-24 — 修正後ワークフローの状態更新

run #151 は後続コミットの push によりキャンセルされた。直近で確認した run #153 は pending で、まだジョブ結果を取得できていない。今回の文書更新によってさらに新しい workflow run が発生するため、最終的なビルド・デプロイ結果は GitHub Actions の最新 run で確認すること。

この時点で、修正後ビルド成功・テスト実行・実機確認・デプロイ・公開反映はいずれも未確認。未確認のまま完了扱いにしない。

---

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
