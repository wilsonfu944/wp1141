// 音樂播放器類別
class MusicPlayer {
    constructor() {
        this.audio = document.getElementById('audio-player');
        this.currentSong = null;
        this.isPlaying = false;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // 監聽音頻播放結束事件
        this.audio.addEventListener('ended', () => {
            this.stopCurrentSong();
        });

        // 監聽音頻載入錯誤事件
        this.audio.addEventListener('error', () => {
            console.log('音頻載入失敗，使用 placeholder.mp3');
            this.audio.src = 'placeholder.mp3';
        });
    }

    // 播放指定歌曲
    playSong(songId) {
        const playButton = document.querySelector(`[data-song="${songId}"] .play-btn`);
        
        if (this.currentSong === songId && this.isPlaying) {
            this.pauseSong();
            return;
        }

        // 停止當前播放的歌曲
        this.stopCurrentSong();

        // 設置新歌曲
        this.currentSong = songId;
        
        // 優先使用配置檔案中的音樂連結，如果沒有則使用預設路徑
        const musicConfig = window.MUSIC_CONFIG;
        if (musicConfig && musicConfig[songId]) {
            this.audio.src = musicConfig[songId].src;
        } else {
            this.audio.src = `music/${songId}.mp3`;
        }
        
        // 更新播放按鈕狀態
        playButton.textContent = '⏸';
        playButton.classList.add('playing');

        // 播放音頻
        this.audio.play().then(() => {
            this.isPlaying = true;
        }).catch((error) => {
            console.log('播放失敗，可能是因為沒有音頻檔案:', error);
            // 顯示提示訊息
            this.showPlayMessage(playButton);
        });
    }

    // 暫停歌曲
    pauseSong() {
        this.audio.pause();
        this.isPlaying = false;
        
        const playButton = document.querySelector(`[data-song="${this.currentSong}"] .play-btn`);
        if (playButton) {
            playButton.textContent = '▶';
            playButton.classList.remove('playing');
        }
    }

    // 停止當前歌曲
    stopCurrentSong() {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.isPlaying = false;

        if (this.currentSong) {
            const playButton = document.querySelector(`[data-song="${this.currentSong}"] .play-btn`);
            if (playButton) {
                playButton.textContent = '▶';
                playButton.classList.remove('playing');
            }
        }
        
        this.currentSong = null;
    }

    // 顯示播放提示訊息
    showPlayMessage(button) {
        const originalText = button.textContent;
        button.textContent = '無音頻';
        button.style.background = '#95a5a6';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 2000);
    }
}

// 平滑滾動功能
class SmoothScroll {
    constructor() {
        this.initializeNavigation();
    }

    initializeNavigation() {
        // 導覽列點擊事件
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href')?.substring(1);
                if (targetId) {
                    this.scrollToSection(targetId);
                }
            });
        });

    }

    scrollToSection(sectionId) {
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            const headerHeight = document.querySelector('.header')?.clientHeight || 0;
            const targetPosition = targetSection.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
}

// 頁首滾動效果
class HeaderScrollEffect {
    constructor() {
        this.initializeScrollEffect();
    }

    initializeScrollEffect() {
        const header = document.querySelector('.header');
        if (!header) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
}

// 日期更新功能
class DateUpdater {
    constructor() {
        this.updateLastUpdatedDate();
        this.updateWinterBreakCountdown();
    }

    updateLastUpdatedDate() {
        const lastUpdatedElement = document.getElementById('last-updated');
        if (lastUpdatedElement) {
            const now = new Date();
            const options = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            lastUpdatedElement.textContent = now.toLocaleDateString('zh-TW', options);
        }
    }

    updateWinterBreakCountdown() {
        const countdownElement = document.getElementById('winter-break-countdown');
        if (countdownElement) {
            const winterBreakDate = new Date('2025-12-22');
            const today = new Date();
            
            // 重置時間到當天的開始
            today.setHours(0, 0, 0, 0);
            winterBreakDate.setHours(0, 0, 0, 0);
            
            const timeDifference = winterBreakDate.getTime() - today.getTime();
            const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
            
            if (daysDifference > 0) {
                countdownElement.textContent = daysDifference.toString();
            } else if (daysDifference === 0) {
                countdownElement.textContent = '0 (今天開始！)';
            } else {
                countdownElement.textContent = '0 (已開始)';
            }
        }
    }
}

// 音樂卡片互動效果
class MusicCardInteractions {
    constructor() {
        this.initializeCardEffects();
    }

    initializeCardEffects() {
        const musicCards = document.querySelectorAll('.music-card');
        
        musicCards.forEach(card => {
            const playButton = card.querySelector('.play-btn');
            const songId = card.getAttribute('data-song');
            
            if (playButton && songId) {
                playButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    musicPlayer.playSong(songId);
                });
            }

            // 卡片點擊效果
            card.addEventListener('click', () => {
                if (songId) {
                    musicPlayer.playSong(songId);
                }
            });
        });
    }
}

// 旅行相簿功能
class TravelGallery {
    constructor() {
        this.currentOpenAlbum = null;
        this.initializeGallery();
    }

    initializeGallery() {
        // 綁定 View Album 按鈕事件
        const viewAlbumBtns = document.querySelectorAll('.view-album-btn');
        viewAlbumBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const category = e.target.getAttribute('data-category');
                if (category) {
                    this.openAlbum(category);
                }
            });
        });

        // 綁定 Close Album 按鈕事件
        const closeAlbumBtns = document.querySelectorAll('.close-album-btn');
        closeAlbumBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const category = e.target.getAttribute('data-category');
                if (category) {
                    this.closeAlbum(category);
                }
            });
        });

        // 綁定圖片 hover 效果
        this.initializePhotoHoverEffects();
    }

    openAlbum(category) {
        // 關閉當前開啟的相簿
        if (this.currentOpenAlbum) {
            this.closeAlbum(this.currentOpenAlbum);
        }

        // 顯示對應的相簿
        const album = document.getElementById(`${category}-album`);
        if (album) {
            album.style.display = 'block';
            this.currentOpenAlbum = category;
            
            // 平滑滾動到相簿位置
            setTimeout(() => {
                album.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }, 100);
        }
    }

    closeAlbum(category) {
        const album = document.getElementById(`${category}-album`);
        if (album) {
            album.style.display = 'none';
            this.currentOpenAlbum = null;
        }
    }

    initializePhotoHoverEffects() {
        const photoItems = document.querySelectorAll('.photo-item');
        
        photoItems.forEach(item => {
            const img = item.querySelector('img');
            if (img) {
                // 預載圖片以確保 hover 效果流暢
                img.addEventListener('load', () => {
                    img.style.transition = 'transform 0.3s ease';
                });
            }
        });
    }

    // 公開方法：關閉所有相簿
    closeAllAlbums() {
        if (this.currentOpenAlbum) {
            this.closeAlbum(this.currentOpenAlbum);
        }
    }
}

// 全域變數
let musicPlayer;
let smoothScroll;
let headerScrollEffect;
let dateUpdater;
let musicCardInteractions;
let travelGallery;

// 全域函數（供 HTML 直接調用）
function scrollToSection(sectionId) {
    if (smoothScroll) {
        smoothScroll.scrollToSection(sectionId);
    }
}

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', () => {
    try {
        // 初始化所有功能
        musicPlayer = new MusicPlayer();
        smoothScroll = new SmoothScroll();
        headerScrollEffect = new HeaderScrollEffect();
        dateUpdater = new DateUpdater();
        musicCardInteractions = new MusicCardInteractions();
        travelGallery = new TravelGallery();

        console.log('個人首頁初始化完成！');
    } catch (error) {
        console.error('初始化過程中發生錯誤:', error);
    }
});

// 頁面可見性變化時的處理
document.addEventListener('visibilitychange', () => {
    if (document.hidden && musicPlayer) {
        // 頁面隱藏時暫停音樂
        const audio = document.getElementById('audio-player');
        if (audio && !audio.paused) {
            audio.pause();
        }
    }
});

// 錯誤處理
window.addEventListener('error', (event) => {
    console.error('頁面發生錯誤:', event.error);
});

// 未處理的 Promise 拒絕
window.addEventListener('unhandledrejection', (event) => {
    console.error('未處理的 Promise 拒絕:', event.reason);
});