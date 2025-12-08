# TOPページ背景動画の配置方法

## 📁 動画ファイルの配置場所

動画ファイルは以下のフォルダに配置してください：

```
public/
└── videos/
    └── top-background.mp4
```

## 🎬 推奨フォルダ構造

以下のような構造を推奨します：

```
public/
├── images/              # 既存の画像フォルダ
│   ├── favicon.png
│   ├── logo.png
│   ├── first-time-bg.jpg
│   └── ...
└── videos/              # 新しく作成する動画フォルダ
    ├── top-background.mp4      # TOPページの背景動画
    ├── top-background.webm     # WebM形式（オプション：より軽量）
    └── top-background-thumb.jpg # サムネイル画像（オプション）
```

## 📝 手順

### 1. フォルダの作成

`public`フォルダ内に`videos`フォルダを作成してください。

**Windowsの場合:**
- `public`フォルダを右クリック
- 「新しいフォルダー」を選択
- フォルダ名を`videos`に変更

### 2. 動画ファイルの配置

作成した`videos`フォルダに動画ファイルを配置してください。

## 🎥 推奨される動画形式

### 主要フォーマット

1. **MP4 (H.264)**
   - 最も広くサポートされている形式
   - ファイル名例: `top-background.mp4`

2. **WebM (VP9)**
   - より軽量で、モダンブラウザでサポート
   - ファイル名例: `top-background.webm`

### 推奨設定

- **解像度**: 1920x1080 (Full HD) または 1280x720 (HD)
- **フレームレート**: 30fps
- **ビットレート**: 2-5Mbps（ファイルサイズと画質のバランス）
- **ファイルサイズ**: 5MB以下を推奨（読み込み速度のため）

## 💻 コードでの使用方法

動画ファイルを配置後、以下のように参照できます：

```tsx
// パス例: /videos/top-background.mp4
<video 
  src="/videos/top-background.mp4"
  autoPlay
  loop
  muted
  playsInline
/>
```

## 📍 ファイルパスの例

`public/videos/top-background.mp4`に配置した場合：
- コード内での参照: `/videos/top-background.mp4`
- 実際のURL: `http://localhost:5173/videos/top-background.mp4`

## ⚠️ 注意事項

1. **ファイルサイズ**: 動画ファイルは大きくなりがちなので、可能な限り圧縮してください
2. **自動再生**: モバイルブラウザでは、`muted`属性がないと自動再生できない場合があります
3. **パフォーマンス**: 大きな動画ファイルはページの読み込み速度に影響します

## 🔄 複数の動画形式を用意する場合

より広範囲のブラウザサポートと最適化のため、複数の形式を用意することもできます：

```tsx
<video autoPlay loop muted playsInline>
  <source src="/videos/top-background.webm" type="video/webm" />
  <source src="/videos/top-background.mp4" type="video/mp4" />
  お使いのブラウザは動画をサポートしていません。
</video>
```


