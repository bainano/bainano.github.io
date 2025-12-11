class AudioPlayer {
    constructor() {
        this.isPlaying = false;
        this.currentTime = 0;
        this.totalTime = 0; // 将初始化为音频的实际时长
        this.volume = 0.8;
        this.currentSongIndex = 0;
        this.playMode = 'sequence'; // 播放模式: 'sequence'(顺序), 'random'(随机), 'single'(单曲循环)
        
        // 创建Audio对象用于实际播放音频
        this.audio = new Audio();
        
        // 拖拽相关状态
        this.isDraggingProgress = false;
        this.isDraggingVolume = false;
        this.dragDebounceTimer = null; // 防抖定时器
        this.pendingProgressUpdate = false; // 待处理的进度更新标志
        
        // 播放列表数据
        this.playlist = [
            { title: "无人之岛", artist: "任然", src: "music/任然 - 无人之岛_SQ.flac", lyrics: "lyrics/任然 - 无人之岛_SQ.lrc", albumArt: "img/任然 - 无人之岛_SQ.jpg" },
            { title: "我怀念的", artist: "孙燕姿", src: "music/孙燕姿-我怀念的_SQ.flac", lyrics: "lyrics/孙燕姿-我怀念的_SQ.lrc", albumArt: "img/孙燕姿-我怀念的_SQ.jpg" },
            { title: "千万次想象", artist: "张杰", src: "music/张杰 - 千万次想象.flac", lyrics: "lyrics/张杰 - 千万次想象.lrc", albumArt: "img/张杰 - 千万次想象.jpg" },
            { title: "年轮", artist: "张碧晨", src: "music/张碧晨 - 年轮.flac", lyrics: "lyrics/张碧晨 - 年轮.lrc", albumArt: "img/张碧晨 - 年轮.jpg" },
            { title: "不遗憾", artist: "李荣浩", src: "music/李荣浩 - 不遗憾.flac", lyrics: "lyrics/李荣浩 - 不遗憾.lrc", albumArt: "img/李荣浩 - 不遗憾.jpg" },
            { title: "恋人", artist: "李荣浩", src: "music/李荣浩 - 恋人.flac", lyrics: "lyrics/李荣浩 - 恋人.lrc", albumArt: "img/李荣浩 - 恋人.jpg" },
            { title: "推开世界的门", artist: "杨乃文", src: "music/杨乃文 - 推开世界的门.flac", lyrics: "lyrics/杨乃文 - 推开世界的门.lrc", albumArt: "img/杨乃文 - 推开世界的门.jpg" },
            { title: "在你的身边", artist: "盛哲", src: "music/盛哲 - 在你的身边.flac", lyrics: "lyrics/盛哲 - 在你的身边.lrc", albumArt: "img/盛哲 - 在你的身边.jpg" },
            { title: "错位时空", artist: "艾辰", src: "music/艾辰 - 错位时空.mp3", lyrics: "lyrics/艾辰 - 错位时空.lrc", albumArt: "img/艾辰 - 错位时空.png" },
            { title: "爱要坦荡荡", artist: "萧萧", src: "music/萧萧 - 爱要坦荡荡.flac", lyrics: "lyrics/萧萧 - 爱要坦荡荡.lrc", albumArt: "img/萧萧 - 爱要坦荡荡.jpg" },
            { title: "我的未来式", artist: "郭采洁", src: "music/郭采洁 - 我的未来式.flac", lyrics: "lyrics/郭采洁 - 我的未来式.lrc", albumArt: "img/郭采洁 - 我的未来式.jpg" },
            { title: "岁月神偷", artist: "金玟岐", src: "music/金玟岐 - 岁月神偷.flac", lyrics: "lyrics/金玟岐 - 岁月神偷.lrc", albumArt: "img/金玟岐 - 岁月神偷.jpg" },
            { title: "没那么简单", artist: "黄小琥", src: "music/黄小琥 - 没那么简单.flac", lyrics: "lyrics/黄小琥 - 没那么简单.lrc", albumArt: "img/黄小琥 - 没那么简单.jpg" }
        ];
        
        this.lyricsData = [];
        this.wordByWordLyrics = []; // 用于存储逐字歌词
        this.currentLyricIndex = 0;
        
        this.initializeElements();
        this.attachEventListeners();
        this.updateDisplay();
        this.updatePlaylistDisplay();
        this.updateLyricsDisplay();
        this.loadSong(this.currentSongIndex);
        this.updatePlayModeButton();
    }

    // 加载歌曲并读取元数据
    loadSong(index) {
        const song = this.playlist[index];
        
        // 设置音频源
        this.audio.src = song.src;
        
        // 添加错误处理
        this.audio.onerror = (error) => {
            console.error('音频加载错误:', error);
            console.error('错误代码:', this.audio.error);
            console.error('加载失败的音频文件:', song.src);
            
            // 获取文件扩展名
            const fileExtension = song.src.split('.').pop().toLowerCase();
            const baseFileName = song.src.substring(0, song.src.lastIndexOf('.'));
            
            // 定义支持的音频格式优先级列表
            const supportedFormats = ['mp3', 'flac', 'ogg', 'wav', 'm4a', 'aac'];
            
            // 如果当前格式不在支持列表中或加载失败，尝试其他格式
            if (!supportedFormats.includes(fileExtension) || this.audio.error) {
                console.log(`${fileExtension.toUpperCase()}文件加载失败，尝试使用备用格式`);
                
                // 尝试按优先级加载其他格式
                this.tryAlternativeFormats(baseFileName, supportedFormats, index, fileExtension);
            } else {
                // 如果是支持的格式但仍然失败，跳到下一首
                if (this.isPlaying) {
                    this.nextTrack();
                }
            }
        };
        
        // 添加加载成功的事件处理
        this.audio.oncanplay = () => {
            console.log('音频加载成功:', song.src);
            // 更新总时长
            if (this.audio.duration && !isNaN(this.audio.duration)) {
                this.totalTime = this.audio.duration;
                this.updateDisplay();
            }
        };
        
        // 添加加载超时处理
        const loadingTimeout = setTimeout(() => {
            if (this.audio.readyState < 4) { // HAVE_ENOUGH_DATA
                console.warn('音频加载超时，尝试备用方案');
                this.audio.onerror();
            }
        }, 10000); // 10秒超时
        
        // 当音频元数据加载完成时获取时长
        this.audio.addEventListener('loadedmetadata', () => {
            clearTimeout(loadingTimeout);
            if (this.audio.duration && !isNaN(this.audio.duration)) {
                this.totalTime = this.audio.duration;
                this.updateDisplay();
            }
        }, { once: true }); // 只执行一次
        
        // 读取音频文件的元数据
        this.readMetadata(song.src, index);
        
        // 加载歌词
        this.loadLyrics(song.lyrics, index);
    }

    // 读取音乐文件元数据
    readMetadata(filePath, index) {
        // 检查文件扩展名
        const fileExtension = filePath.split('.').pop().toLowerCase();
        
        // 对于FLAC文件，跳过元数据读取或使用默认值
        if (fileExtension === 'flac') {
            console.log('FLAC文件，跳过元数据读取');
            // 即使跳过元数据读取，也要更新歌曲信息显示（使用默认值）
            if (index === this.currentSongIndex) {
                this.updateSongInfo();
            }
            return;
        }
        
        // 使用 try-catch 包装以更好地处理错误
        try {
            jsmediatags.read(filePath, {
                onSuccess: (tag) => {
                    const tags = tag.tags;
                    // 更新歌曲信息
                    this.playlist[index].title = tags.title || this.playlist[index].title;
                    this.playlist[index].artist = tags.artist || this.playlist[index].artist;
                    
                    // 如果有专辑信息，也可以更新
                    if (tags.album) {
                        this.playlist[index].album = tags.album;
                    }
                    
                    // 处理专辑封面
                    if (tag.tags.picture) {
                        const picture = tag.tags.picture;
                        const base64String = this.arrayBufferToBase64(picture.data);
                        this.playlist[index].albumArt = `data:${picture.format};base64,${base64String}`;
                    }
                    
                    // 更新当前歌曲信息显示
                    if (index === this.currentSongIndex) {
                        this.updateSongInfo();
                    }
                },
                onError: (error) => {
                    console.log('Could not load metadata:', error);
                    // 即使无法读取元数据，也更新歌曲信息显示（使用默认值）
                    if (index === this.currentSongIndex) {
                        this.updateSongInfo();
                    }
                }
            });
        } catch (error) {
            console.log('Error reading metadata:', error);
            // 即使出现异常，也更新歌曲信息显示（使用默认值）
            if (index === this.currentSongIndex) {
                this.updateSongInfo();
            }
        }
    }

    // 将ArrayBuffer转换为Base64字符串
    arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    // 尝试加载备用音频格式
    tryAlternativeFormats(baseFileName, formats, currentIndex, failedFormat) {
        let formatIndex = 0;
        
        const tryNextFormat = () => {
            if (formatIndex >= formats.length) {
                console.log('所有格式都尝试失败，跳过此歌曲');
                if (this.isPlaying) {
                    this.nextTrack();
                }
                return;
            }
            
            const currentFormat = formats[formatIndex];
            
            // 跳过已经失败的格式
            if (currentFormat === failedFormat) {
                formatIndex++;
                tryNextFormat();
                return;
            }
            
            const alternativeSrc = `${baseFileName}.${currentFormat}`;
            console.log(`尝试加载${currentFormat.toUpperCase()}文件:`, alternativeSrc);
            
            // 检查文件是否存在
            fetch(alternativeSrc, { method: 'HEAD' })
                .then(response => {
                    if (response.ok) {
                        console.log(`找到${currentFormat.toUpperCase()}文件，使用该格式`);
                        this.audio.src = alternativeSrc;
                        // 更新播放列表中的源文件路径
                        this.playlist[currentIndex].src = alternativeSrc;
                        
                        // 重新设置加载成功事件处理
                        this.audio.oncanplay = () => {
                            console.log(`备用音频格式加载成功: ${alternativeSrc}`);
                            if (this.audio.duration && !isNaN(this.audio.duration)) {
                                this.totalTime = this.audio.duration;
                                this.updateDisplay();
                            }
                        };
                    } else {
                        console.log(`未找到${currentFormat.toUpperCase()}文件`);
                        formatIndex++;
                        tryNextFormat();
                    }
                })
                .catch(error => {
                    console.error(`检查${currentFormat.toUpperCase()}文件时出错:`, error);
                    formatIndex++;
                    tryNextFormat();
                });
        };
        
        tryNextFormat();
    }

    // 加载并解析歌词文件
    loadLyrics(lyricsPath, index) {
        fetch(lyricsPath)
            .then(response => response.text())
            .then(data => {
                this.playlist[index].parsedLyrics = this.parseLyrics(data);
                
                // 更新当前歌词显示
                if (index === this.currentSongIndex) {
                    this.wordByWordLyrics = this.playlist[index].parsedLyrics;
                    this.updateLyricsDisplay();
                }
            })
            .catch(error => {
                console.log('Could not load lyrics:', error);
            });
    }

    // 解析歌词文件
    parseLyrics(lyricsText) {
        const lines = lyricsText.split('\n');
        const lyrics = [];
        
        for (const line of lines) {
            // 匹配时间戳和歌词内容
            const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;
            const matches = line.match(timeRegex);
            
            if (matches) {
                const minutes = parseInt(matches[1]);
                const seconds = parseInt(matches[2]);
                const centiseconds = parseInt(matches[3]); // 百分之一秒或千分之一秒
                const text = matches[4];
                
                // 处理不同的时间精度
                const timeInSeconds = minutes * 60 + seconds + centiseconds / (centiseconds > 99 ? 1000 : 100);
                
                // 处理逐字歌词
                if (text) {
                    const words = [];
                    
                    // 检查是否是逐字歌词格式（包含多个时间戳）
                    const wordTimeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;
                    if (wordTimeRegex.test(line)) {
                        // 重置正则表达式 lastIndex
                        wordTimeRegex.lastIndex = 0;
                        
                        let lastIndex = 0;
                        let match;
                        
                        while ((match = wordTimeRegex.exec(line)) !== null) {
                            const fullMatch = match[0];
                            const min = parseInt(match[1]);
                            const sec = parseInt(match[2]);
                            const cs = parseInt(match[3]);
                            const wordTime = min * 60 + sec + cs / (cs > 99 ? 1000 : 100);
                            
                            // 获取下一个时间戳之前的所有字符作为歌词文本
                            const startIndex = wordTimeRegex.lastIndex;
                            const nextMatch = wordTimeRegex.exec(line);
                            wordTimeRegex.lastIndex = startIndex; // 恢复lastIndex
                            
                            let wordText = '';
                            if (nextMatch) {
                                wordText = line.substring(startIndex, nextMatch.index);
                            } else {
                                wordText = line.substring(startIndex);
                            }
                            
                            // 移除可能存在的额外时间戳
                            wordText = wordText.replace(/\[\d{2}:\d{2}\.\d{2,3}\]/g, '');
                            
                            // 只添加非空文本
                            if (wordText.trim() !== '') {
                                words.push({
                                    time: wordTime,
                                    text: wordText
                                });
                            }
                            
                            lastIndex = wordTimeRegex.lastIndex;
                        }
                    } else {
                        // 如果不是逐字歌词，将整行作为一个项处理
                        words.push({
                            time: timeInSeconds,
                            text: text
                        });
                    }
                    
                    lyrics.push({
                        time: timeInSeconds,
                        words: words
                    });
                }
            }
        }
        
        // 按时间排序
        lyrics.sort((a, b) => a.time - b.time);
        
        return lyrics;
    }
    
    initializeElements() {
        // 进度条元素
        this.progressBar = document.getElementById('progress-bar');
        this.progress = document.getElementById('progress');
        this.progressHandle = document.getElementById('progress-handle');
        
        // 时间显示元素
        this.currentTimeElement = document.getElementById('current-time');
        this.totalTimeElement = document.getElementById('total-time');
        
        // 控制按钮
        this.playBtn = document.getElementById('play-btn');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.playIcon = document.getElementById('play-icon');
        this.pauseIcon = document.getElementById('pause-icon');
        
        // 音量控制
        this.volumeSlider = document.getElementById('volume-slider');
        this.volumeLevel = document.getElementById('volume-level');
        this.volumeHandle = document.getElementById('volume-handle');
        
        // 歌曲信息
        this.songTitle = document.getElementById('song-title');
        this.artist = document.getElementById('artist');
        
        // 专辑图片
        this.albumArt = document.getElementById('album-art');
        
        // 歌词显示
        this.lyricsDisplay = document.getElementById('lyrics-display');
        
        // 播放列表
        this.playlistElement = document.getElementById('playlist');
        
        // 播放模式按钮
        this.playModeBtn = document.getElementById('play-mode-btn');
        
        // 生成播放列表
        this.generatePlaylist();
        
        // 设置初始歌曲信息
        this.updateSongInfo();
        
        // 添加音频事件监听器
        this.audio.addEventListener('ended', () => this.onAudioEnded());
        this.audio.addEventListener('timeupdate', () => {
            // 只有在非拖拽状态下才更新currentTime
            if (this.isPlaying && !this.isDraggingProgress) {
                this.currentTime = this.audio.currentTime;
                this.updateProgress();
                this.updateDisplay();
                this.updateLyricsDisplay();
            }
        });
    }
    
    generatePlaylist() {
        // 清空现有播放列表
        this.playlistElement.innerHTML = '';
        
        // 为每个歌曲创建播放列表项
        this.playlist.forEach((song, index) => {
            const playlistItem = document.createElement('li');
            playlistItem.className = 'playlist-item';
            playlistItem.dataset.index = index;
            
            if (index === this.currentSongIndex) {
                playlistItem.classList.add('active');
            }
            
            playlistItem.innerHTML = `
                <span class="song-title">${song.title}</span>
                <span class="song-artist">${song.artist}</span>
            `;
            
            this.playlistElement.appendChild(playlistItem);
        });
    }
    
    attachEventListeners() {
        // 播放/暂停按钮
        this.playBtn.addEventListener('click', () => this.togglePlay());
        
        // 上一首/下一首按钮
        this.prevBtn.addEventListener('click', () => this.previousTrack());
        this.nextBtn.addEventListener('click', () => this.nextTrack());
        
        // 进度条点击事件
        this.progressBar.addEventListener('click', (e) => this.setProgress(e));
        
        // 进度条拖拽事件
        this.progressHandle.addEventListener('mousedown', (e) => this.startDragProgress(e));
        
        // 音量控制
        this.volumeSlider.addEventListener('click', (e) => this.setVolume(e));
        this.volumeHandle.addEventListener('mousedown', (e) => this.startDragVolume(e));
        
        // 播放列表点击事件
        this.playlistElement.addEventListener('click', (e) => this.handlePlaylistClick(e));
        
        // 播放模式按钮点击事件
        if (this.playModeBtn) {
            this.playModeBtn.addEventListener('click', () => this.togglePlayMode());
        }
        
        // 文档事件监听器（用于拖拽）
        document.addEventListener('mousemove', (e) => this.handleDrag(e));
        document.addEventListener('mouseup', () => this.stopDrag());
    }
    
    togglePlay() {
        this.isPlaying = !this.isPlaying;
        if (this.isPlaying) {
            this.play();
        } else {
            this.pause();
        }
        this.updatePlayButton();
    }
    
    play() {
        this.isPlaying = true;
        this.updatePlayButton();
        this.audio.play();
        this.updatePlayback();
    }
    
    pause() {
        this.isPlaying = false;
        this.updatePlayButton();
        this.audio.pause();
    }
    
    updatePlayButton() {
        if (this.isPlaying) {
            this.playIcon.style.display = 'none';
            this.pauseIcon.style.display = 'block';
        } else {
            this.playIcon.style.display = 'block';
            this.pauseIcon.style.display = 'none';
        }
    }
    
    updatePlayback() {
        if (!this.isPlaying) return;
        
        // 只有在非拖拽状态下才使用实际的音频时间
        if (!this.isDraggingProgress) {
            this.currentTime = this.audio.currentTime;
            this.updateProgress();
            this.updateDisplay();
            this.updateLyricsDisplay(); // 更新歌词显示
        }
        
        // 继续更新播放进度
        if (this.isPlaying) {
            requestAnimationFrame(() => this.updatePlayback());
        }
    }
    
    // 音频播放结束事件处理
    onAudioEnded() {
        // 播放完成，自动播放下一首
        this.nextTrack();
    }
    
    updateProgress() {
        const progressPercent = (this.currentTime / this.totalTime) * 100;
        this.progress.style.width = `${progressPercent}%`;
        this.progressHandle.style.left = `${progressPercent}%`;
    }
    
    updateDisplay() {
        this.currentTimeElement.textContent = this.formatTime(this.currentTime);
        this.totalTimeElement.textContent = this.formatTime(this.totalTime);
    }
    
    updateSongInfo() {
        const song = this.playlist[this.currentSongIndex];
        this.songTitle.textContent = song.title;
        this.artist.textContent = song.artist;
        
        // 如果有专辑信息，也可以显示
        if (song.album) {
            // 这里可以根据需要显示专辑信息
            // 例如，可以添加一个专门显示专辑信息的元素
        }
        
        // 更新专辑封面，使用img目录中的专辑图片
        const albumArt = document.getElementById('album-art');
        if (song.albumArt) {
            // 确保使用img目录中的专辑图片
            albumArt.src = song.albumArt;
        } else {
            // 使用默认封面
            albumArt.src = "https://placehold.co/300";
        }
        
        // 注意：实际播放时应该从音频文件获取总时长
        // 这里为了简化仍然使用playlist中的duration
        this.totalTime = song.duration || this.totalTime;
        this.updateDisplay();
    }
    
    updateLyricsDisplay() {
        // 查找当前时间对应的歌词
        let currentLyric = "";
        let currentIndex = -1;
        
        for (let i = 0; i < this.wordByWordLyrics.length; i++) {
            const lyric = this.wordByWordLyrics[i];
            if (lyric.time <= this.currentTime) {
                currentLyric = lyric;
                currentIndex = i;
            } else {
                break;
            }
        }
        
        // 构建歌词显示文本
        if (currentLyric.words && currentLyric.words.length > 0) {
            // 逐字歌词显示
            let displayText = "";
            for (const word of currentLyric.words) {
                if (word.time <= this.currentTime) {
                    displayText += word.text;
                }
            }
            this.lyricsDisplay.innerHTML = displayText;
        } else if (currentLyric.text) {
            // 普通歌词显示
            this.lyricsDisplay.innerHTML = currentLyric.text;
        } else {
            this.lyricsDisplay.innerHTML = "暂无歌词";
        }
    }
    
    updatePlaylistDisplay() {
        // 更新播放列表高亮显示
        const playlistItems = this.playlistElement.querySelectorAll('.playlist-item');
        playlistItems.forEach((item, index) => {
            if (index === this.currentSongIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    handlePlaylistClick(e) {
        const playlistItem = e.target.closest('.playlist-item');
        if (playlistItem) {
            const index = parseInt(playlistItem.dataset.index);
            this.selectSong(index);
        }
    }
    
    selectSong(index) {
        if (index >= 0 && index < this.playlist.length) {
            // 重置拖拽状态
            this.isDraggingProgress = false;
            this.isDraggingVolume = false;
            this.pendingProgressUpdate = false;
            
            // 清除防抖定时器
            if (this.dragDebounceTimer) {
                clearTimeout(this.dragDebounceTimer);
                this.dragDebounceTimer = null;
            }
            
            // 保存当前播放状态
            const wasPlaying = this.isPlaying;
            
            // 暂停当前播放
            if (this.isPlaying) {
                this.pause();
            }
            
            // 更新歌曲索引
            this.currentSongIndex = index;
            this.currentTime = 0;
            
            // 加载新歌曲
            this.loadSong(index);
            this.updatePlaylistDisplay();
            this.updateProgress();
            this.scrollToCurrentSong();
            
            // 如果之前在播放，则重新开始播放
            if (wasPlaying) {
                // 等待音频加载完成后再播放
                const startPlayback = () => {
                    if (this.audio && this.audio.readyState >= 2) { // HAVE_CURRENT_DATA
                        this.play();
                        this.audio.removeEventListener('loadeddata', startPlayback);
                    }
                };
                
                // 如果音频已经加载完成，直接播放
                if (this.audio && this.audio.readyState >= 2) {
                    this.play();
                } else {
                    // 否则等待加载完成
                    this.audio.addEventListener('loadeddata', startPlayback);
                }
            }
        }
    }

    // 滚动到当前播放的歌曲
    scrollToCurrentSong() {
        const activeItem = this.playlistElement.querySelector('.playlist-item.active');
        if (activeItem) {
            activeItem.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    setProgress(e) {
        const progressBarRect = this.progressBar.getBoundingClientRect();
        const clickX = e.clientX - progressBarRect.left;
        const progressBarWidth = progressBarRect.width;
        const progressPercent = Math.max(0, Math.min(100, (clickX / progressBarWidth) * 100));
        
        this.currentTime = (progressPercent / 100) * this.totalTime;
        
        // 检查音频是否已加载并可播放
        if (this.audio && this.audio.readyState >= 2) { // HAVE_CURRENT_DATA
            this.audio.currentTime = this.currentTime;
        } else {
            // 如果音频未加载完成，等待加载完成后再设置
            const setAudioTime = () => {
                if (this.audio && this.audio.readyState >= 2) {
                    this.audio.currentTime = this.currentTime;
                    this.audio.removeEventListener('loadeddata', setAudioTime);
                }
            };
            this.audio.addEventListener('loadeddata', setAudioTime);
        }
        
        this.updateProgress();
        this.updateDisplay();
    }
    
    setVolume(e) {
        const volumeSliderRect = this.volumeSlider.getBoundingClientRect();
        const clickX = e.clientX - volumeSliderRect.left;
        const volumeSliderWidth = volumeSliderRect.width;
        const volumePercent = Math.max(0, Math.min(100, (clickX / volumeSliderWidth) * 100));
        
        this.volume = volumePercent / 100;
        this.audio.volume = this.volume; // 同步设置音频音量
        this.updateVolumeDisplay();
    }
    
    updateVolumeDisplay() {
        const volumePercent = this.volume * 100;
        this.volumeLevel.style.width = `${volumePercent}%`;
        this.volumeHandle.style.left = `${volumePercent}%`;
    }
    
    startDragProgress(e) {
        this.isDraggingProgress = true;
        this.pendingProgressUpdate = true; // 标记有待处理的进度更新
        e.preventDefault();
    }
    
    startDragVolume(e) {
        this.isDraggingVolume = true;
        e.preventDefault();
    }
    
    handleDrag(e) {
        if (this.isDraggingProgress) {
            const progressBarRect = this.progressBar.getBoundingClientRect();
            const dragPosition = e.clientX - progressBarRect.left;
            const progressBarWidth = progressBarRect.width;
            const progressPercent = Math.max(0, Math.min(100, (dragPosition / progressBarWidth) * 100));
            
            // 只更新UI显示，不更新音频播放位置
            this.currentTime = (progressPercent / 100) * this.totalTime;
            this.updateProgress();
            this.updateDisplay();
        }
        
        if (this.isDraggingVolume) {
            const volumeSliderRect = this.volumeSlider.getBoundingClientRect();
            const dragPosition = e.clientX - volumeSliderRect.left;
            const volumeSliderWidth = volumeSliderRect.width;
            const volumePercent = Math.max(0, Math.min(100, (dragPosition / volumeSliderWidth) * 100));
            
            // 音量控制保持实时更新，因为音量变化不需要缓冲
            this.volume = volumePercent / 100;
            this.audio.volume = this.volume;
            this.updateVolumeDisplay();
        }
    }
    
    stopDrag() {
        // 如果正在拖拽进度条，则更新音频播放位置
        if (this.isDraggingProgress && this.pendingProgressUpdate) {
            // 清除之前的防抖定时器
            if (this.dragDebounceTimer) {
                clearTimeout(this.dragDebounceTimer);
            }
            
            // 使用防抖处理，避免快速连续拖拽结束时的重复更新
            this.dragDebounceTimer = setTimeout(() => {
                // 检查音频是否已加载并可播放
                if (this.audio && this.audio.readyState >= 2) { // HAVE_CURRENT_DATA
                    this.audio.currentTime = this.currentTime;
                } else {
                    // 如果音频未加载完成，等待加载完成后再设置
                    const setAudioTime = () => {
                        if (this.audio && this.audio.readyState >= 2) {
                            this.audio.currentTime = this.currentTime;
                            this.audio.removeEventListener('loadeddata', setAudioTime);
                        }
                    };
                    this.audio.addEventListener('loadeddata', setAudioTime);
                }
                this.pendingProgressUpdate = false;
            }, 100); // 100ms的防抖延迟
        }
        
        // 重置拖拽状态
        this.isDraggingProgress = false;
        this.isDraggingVolume = false;
    }
    
    previousTrack() {
        let newIndex = this.currentSongIndex - 1;
        if (newIndex < 0) {
            newIndex = this.playlist.length - 1; // 循环到最后一首
        }
        this.selectSong(newIndex);
    }
    
    nextTrack() {
        let newIndex;
        
        switch (this.playMode) {
            case 'random':
                // 随机播放（确保不会重复播放当前歌曲）
                newIndex = Math.floor(Math.random() * (this.playlist.length - 1));
                if (newIndex >= this.currentSongIndex) {
                    newIndex++;
                }
                break;
            case 'single':
                // 单曲循环，保持当前歌曲索引不变
                newIndex = this.currentSongIndex;
                break;
            case 'sequence':
            default:
                // 顺序播放
                newIndex = this.currentSongIndex + 1;
                if (newIndex >= this.playlist.length) {
                    newIndex = 0; // 循环到第一首
                }
                break;
        }
        
        this.selectSong(newIndex);
    }
    
    // 切换播放模式
    togglePlayMode() {
        switch (this.playMode) {
            case 'sequence':
                this.playMode = 'random';
                break;
            case 'random':
                this.playMode = 'single';
                break;
            case 'single':
                this.playMode = 'sequence';
                break;
        }
        this.updatePlayModeButton();
    }
    
    // 更新播放模式按钮显示
    updatePlayModeButton() {
        if (!this.playModeBtn) return;
        
        let modeHTML = '';
        let modeTitle = '';
        
        switch (this.playMode) {
            case 'sequence':
                modeHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M16.01 11H4v2h12.01v3L20 12l-3.99-4z"></path></svg>';
                modeTitle = '顺序播放';
                break;
            case 'random':
                modeHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M7 7h10v3l4-4l-4-4v3H5v6h2zm10 10H7v-3l-4 4l4 4v-3h12v-6h-2z"></path></svg>';
                modeTitle = '循环播放';
                break;
            case 'single':
                modeHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M7 7h10v3l4-4l-4-4v3H5v6h2zm10 10H7v-3l-4 4l4 4v-3h12v-6h-2zm-4-2V9h-1l-2 1v1h1.5v4z"></path></svg>';
                modeTitle = '单曲循环';
                break;
        }
        
        this.playModeBtn.innerHTML = modeHTML;
        this.playModeBtn.title = modeTitle;
    }
}

// 初始化播放器
document.addEventListener('DOMContentLoaded', () => {
    window.audioPlayer = new AudioPlayer();
});