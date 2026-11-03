# 今日の無料・締切レーダー

公式のキャンペーン条件・応募／購入／引換期限を比較する、日本国内向けの静的Webサービス。

## 開発・公開

Node.js 22以上。追加パッケージ、有料API、DBは不要です。

```sh
npm test
npm run check
npm run build
```

Cloudflare Pages（GitHub連携）の設定:
- Repository: `MORRY1992/muryo-shimekiri-radar`
- Production branch: `main`
- Build command: `npm test && npm run check && npm run build`
- Output: `dist`
- Node version: `22`
- Project name: `muryo-shimekiri-radar`
- `SITE_URL`: 実際の公開先が候補と異なる場合のみ設定

公開URL: https://muryo-shimekiri-radar.pages.dev/ （2026年11月2日、公開画面と検索・詳細への遷移を確認）。実URLは `data/site.json` で管理します。GitHub連携の再デプロイ確認結果は `docs/QA.md` を参照。

## 正本

- `data/campaigns.json`: 公式確認情報。時刻不明は `endDate` に日付だけを保存。
- `src/core.mjs`: JST、期限切れ、48時間の鮮度、検索、重複、観測処理。
- `scripts/refresh.mjs`: 終了と再確認待ちへの移行。外部HTTPアクセスなし。
- `docs/OPERATIONS.md`: 更新手順、権限、復旧、広告導入。
- `docs/QA.md`: 実測結果と未確認項目。

Adsterraは未申請・配信無効です。別サイトのコードを流用しません。

2026-11-04の全体改修: 締切カレンダー、検索・状態・条件の表示、詳細の3期限、ジャンル探索、期限ガイド、更新記録、FAQ、フッターを再設計。参照調査は `docs/DESIGN_REFERENCES.md`。通常の `npm run build` に内部リンク・正確なcanonical・既存GSC・全案件sitemap・出力データ保持の検証を含みます。案件件数を固定したテストは使いません。
