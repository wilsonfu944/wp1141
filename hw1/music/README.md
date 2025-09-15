# 音樂檔案說明

## 檔案命名規則

請將您的音樂檔案按照以下命名規則放入此資料夾：

- `song1.mp3` - 花之塔 (Sayuri)
- `song2.mp3` - Lemon (米津玄師)
- `song3.mp3` - 紅蓮華 (LiSA)
- `song4.mp3` - unravel (TK from 凛として時雨)
- `song5.mp3` - 前前前世 (RADWIMPS)

## 音檔要求

- **格式**：MP3（推薦）
- **品質**：128kbps 或 192kbps
- **長度**：建議 30-60 秒片段
- **檔案大小**：建議每個檔案不超過 5MB

## 如何取得音樂檔案

### 方法一：使用免費音樂
- [Freesound](https://freesound.org/) - 免費音效和音樂
- [YouTube Audio Library](https://www.youtube.com/audiolibrary/music) - YouTube 免費音樂庫
- [Pixabay Music](https://pixabay.com/music/) - 免費音樂下載

### 方法二：使用線上音樂連結
編輯 `music-config.js` 檔案，將 `src` 改為線上連結：

```javascript
song1: {
    title: "花之塔",
    artist: "Sayuri",
    src: "https://example.com/music/song1.mp3", // 線上連結
},
```

### 方法三：轉換現有音樂
如果您有其他格式的音樂檔案，可以使用以下工具轉換：
- [Online Audio Converter](https://online-audio-converter.com/)
- [CloudConvert](https://cloudconvert.com/mp3-converter)

## 注意事項

⚠️ **版權提醒**：請確保您有權使用這些音樂檔案，避免侵犯版權。

✅ **測試建議**：建議先放一個測試音檔，確認播放功能正常後再添加其他音樂。




