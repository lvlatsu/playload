# 数学 API

## 目的

JavaScript の `Math` にある頻出関数を、短い PLU 独自 API として直接呼び出せるようにする。既存の JavaScript `Math` は引き続き使用できる。

## 実装 API

| API | 内容 |
| --- | --- |
| `urnd()` | 0以上1未満の乱数（浮動小数点） |
| `usin(n)` | サイン。ラジアン |
| `ucos(n)` | コサイン。ラジアン |
| `utan(n)` | タンジェント。ラジアン |
| `usqr(n)` | 平方根 |
| `uabs(n)` | 絶対値 |
| `uflr(n)` | 小数点以下切り捨て（負数はより小さい整数方向） |
| `ucei(n)` | 小数点以下切り上げ |
| `umin(...n)` | 最小値 |
| `umax(...n)` | 最大値 |
| `upow(base, exponent)` | べき乗 |
| `uatan2(y, x)` | 2引数の逆正接。ラジアン |

## 使用例

```js
const x = urnd() * 160;
const wave = usin(time) * 10;
const distance = usqr(dx * dx + dy * dy);
const speed = umin(5, umax(1, value));
```

## 仕様・注意

- 引数の型や数値範囲の扱いは JavaScript の対応する `Math` 関数に準拠する。
- 角度はラジアンを使用する。
- `urnd()` はエンジン生成時に取得した乱数関数を使用する。ゲームコードが `Math.random` を変更しても影響を受けない。
- 既存の `Math` を削除・置換しない。
- 範囲指定乱数、整数乱数、乱数シード制御は初期実装に含めない。
