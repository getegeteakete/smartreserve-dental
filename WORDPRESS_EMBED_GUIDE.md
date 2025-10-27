# WordPress埋め込みコード

## 今週の診療カレンダーをWordPressに埋め込む方法

### 方法1: 埋め込みコード（推奨）

WordPressのブロックエディタで「カスタムHTML」ブロックを追加し、以下のコードを貼り付けます：

```html
<div style="width: 100%; margin: 20px auto;">
  <iframe 
    src="https://your-app-url.vercel.app/calendar-embed" 
    width="100%" 
    height="250" 
    frameborder="0" 
    style="border: 1px solid #e0e0e0; border-radius: 8px;"
    scrolling="no">
  </iframe>
</div>
```

### 方法2: 簡易テキスト版

もしiframeがサポートされていない場合は、以下のテキスト形式でも表示できます：

```
[今週の診療カレンダー]
📅 https://your-app-url.vercel.app/calendar-embed

※上記URLは予約システムの埋め込みカレンダーです
```

### 設定方法

1. **VercelのURLを取得**
   - VercelダッシュボードからデプロイされたURLをコピー
   - 例: `https://smartreserve-dental.vercel.app`

2. **WordPressで埋め込み**
   - ブロックエディタで「カスタムHTML」を追加
   - 上記のコードにあなたのURLを貼り付け
   - 「公開」ボタンをクリック

### サイズ調整

高さを調整したい場合は、`height="250"`の値を変更してください：
- 小さいサイズ: `height="200"`
- 大きいサイズ: `height="350"`

### レスポンシブ対応

モバイル表示でも自動的にサイズ調整されます。追加のCSS不要です。

---

## 注意事項

- VercelのURLは本番環境にデプロイ後にお知らせします
- 埋め込み後は約1分で反映されます
- 診療時間は週ごとに自動更新されます

