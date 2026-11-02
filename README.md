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

候補URL `https://muryo-shimekiri-radar.pages.dev` は公開確認前です。サイトを作成後、実URLを `data/site.json` に反映して `urlVerified` を更新してください。

## 正本

- `data/campaigns.json`: 公式確認情報。時刻不明は `endDate` に日付だけを保存。
- `src/core.mjs`: JST、期限切れ、48時間の鮮度、検索、重複、観測処理。
- `scripts/refresh.mjs`: 終了と再確認待ちへの移行。外部HTTPアクセスなし。
- `docs/OPERATIONS.md`: 更新手順、権限、復旧、広告導入。
- `docs/QA.md`: 実測結果と未確認項目。

Adsterraは未申請・配信無効です。別サイトのコードを流用しません。
