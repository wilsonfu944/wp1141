// 音樂配置檔案
const MUSIC_CONFIG = {
    song1: {
        title: "花之塔",
        artist: "Sayuri",
        src: "music/song1.mp3", // 本地檔案路徑
        // 或者使用線上連結：
        // src: "https://example.com/music/song1.mp3"
    },
    song2: {
        title: "Lemon",
        artist: "米津玄師",
        src: "music/song2.mp3",
    },
    song3: {
        title: "紅蓮華",
        artist: "LiSA",
        src: "music/song3.mp3",
    },
    song4: {
        title: "愛ゆえの決断",
        artist: "TK from 凛として時雨",
        src: "music/song4.mp3",
    },
    song5: {
        title: "前前前世",
        artist: "RADWIMPS",
        src: "music/song5.mp3",
    }
};

// 如果使用線上音樂，可以這樣配置：
const ONLINE_MUSIC_CONFIG = {
    song1: {
        title: "花之塔",
        artist: "Sayuri",
        src: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", // 範例連結
    },
    // ... 其他歌曲
};

// 將配置暴露到全域範圍
if (typeof window !== 'undefined') {
    window.MUSIC_CONFIG = MUSIC_CONFIG;
    window.ONLINE_MUSIC_CONFIG = ONLINE_MUSIC_CONFIG;
}