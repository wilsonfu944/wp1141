// 跑步紀錄介面
interface RunningRecord {
    id: string;
    date: string;
    distance: number;
    time: number;
    pace: number;
    mood: string;
}

// 跑步賽事介面
interface RaceRecord {
    id: string;
    name: string;
    date: string;
    distance: number;
    time: string;
    rank?: string;
    mood: string;
}

// 應用程式主類別
class RunningTrackerApp {
    private records: RunningRecord[] = [];
    private races: RaceRecord[] = [];
    private currentSortBy: 'date' | 'distance' | 'pace' = 'date';
    private currentMonth: Date = new Date();
    private distanceChart: Chart | null = null;
    private paceChart: Chart | null = null;

    constructor() {
        this.init();
    }

    // 初始化應用程式
    private init(): void {
        this.loadData();
        this.setupEventListeners();
        this.renderLeaderboard();
        this.renderRaces();
        this.renderCalendar();
        this.renderCharts();
        this.setDefaultDate();
    }

    // 設定事件監聽器
    private setupEventListeners(): void {
        // 跑步紀錄表單提交
        const form = document.getElementById('runningForm') as HTMLFormElement;
        form.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // 跑步賽事表單提交
        const raceForm = document.getElementById('raceForm') as HTMLFormElement;
        raceForm.addEventListener('submit', (e) => this.handleRaceFormSubmit(e));

        // 排序按鈕
        document.getElementById('sortByDistance')?.addEventListener('click', () => this.sortRecords('distance'));
        document.getElementById('sortByPace')?.addEventListener('click', () => this.sortRecords('pace'));
        document.getElementById('sortByDate')?.addEventListener('click', () => this.sortRecords('date'));

        // 月曆控制
        document.getElementById('prevMonth')?.addEventListener('click', () => this.changeMonth(-1));
        document.getElementById('nextMonth')?.addEventListener('click', () => this.changeMonth(1));
    }

    // 處理表單提交
    private handleFormSubmit(e: Event): void {
        e.preventDefault();
        
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        
        const date = formData.get('date') as string;
        const distance = parseFloat(formData.get('distance') as string);
        const time = parseInt(formData.get('time') as string);
        const mood = formData.get('mood') as string;
        
        if (!date || isNaN(distance) || isNaN(time) || distance <= 0 || time <= 0 || !mood) {
            alert('請填寫有效的資料');
            return;
        }

        const pace = time / distance;
        const record: RunningRecord = {
            id: Date.now().toString(),
            date,
            distance,
            time,
            pace: Math.round(pace * 100) / 100,
            mood
        };

        this.addRecord(record);
        form.reset();
        this.setDefaultDate();
    }

    // 處理跑步賽事表單提交
    private handleRaceFormSubmit(e: Event): void {
        e.preventDefault();
        
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        
        const name = formData.get('raceName') as string;
        const date = formData.get('raceDate') as string;
        const distance = parseFloat(formData.get('raceDistance') as string);
        const time = formData.get('raceTime') as string;
        const rank = formData.get('raceRank') as string;
        const mood = formData.get('raceMood') as string;
        
        if (!name || !date || isNaN(distance) || !time || distance <= 0 || !mood) {
            alert('請填寫有效的資料');
            return;
        }

        const race: RaceRecord = {
            id: Date.now().toString(),
            name,
            date,
            distance,
            time,
            rank: rank || undefined,
            mood
        };

        this.addRace(race);
        form.reset();
    }

    // 新增紀錄
    private addRecord(record: RunningRecord): void {
        // 檢查是否破紀錄
        const isDistanceRecord = this.checkDistanceRecord(record.distance);
        const isPaceRecord = this.checkPaceRecord(record.pace);
        
        this.records.push(record);
        this.saveData();
        this.renderLeaderboard();
        this.renderCalendar();
        this.renderCharts();
        
        // 如果破紀錄，顯示慶祝效果
        if (isDistanceRecord || isPaceRecord) {
            this.showRecordCelebration(isDistanceRecord, isPaceRecord);
        }
    }

    // 檢查距離紀錄
    private checkDistanceRecord(newDistance: number): boolean {
        const existingRecords = this.records.filter(r => r.id !== 'temp');
        if (existingRecords.length === 0) return true;
        return newDistance > Math.max(...existingRecords.map(r => r.distance));
    }

    // 檢查配速紀錄
    private checkPaceRecord(newPace: number): boolean {
        const existingRecords = this.records.filter(r => r.id !== 'temp');
        if (existingRecords.length === 0) return true;
        return newPace < Math.min(...existingRecords.map(r => r.pace));
    }

    // 顯示破紀錄慶祝效果
    private showRecordCelebration(isDistanceRecord: boolean, isPaceRecord: boolean): void {
        // 創建慶祝通知
        const notification = document.createElement('div');
        notification.className = 'record-notification';
        
        let message = '🎉 恭喜！';
        if (isDistanceRecord && isPaceRecord) {
            message += ' 同時破了距離和配速紀錄！';
        } else if (isDistanceRecord) {
            message += ' 破了距離紀錄！';
        } else if (isPaceRecord) {
            message += ' 破了配速紀錄！';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // 創建彩帶效果
        this.createConfetti();
        
        // 3秒後移除通知
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    // 創建彩帶效果
    private createConfetti(): void {
        const confettiContainer = document.createElement('div');
        confettiContainer.className = 'confetti';
        document.body.appendChild(confettiContainer);
        
        // 創建50個彩帶碎片
        for (let i = 0; i < 50; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.left = Math.random() * 100 + '%';
            piece.style.animationDelay = Math.random() * 3 + 's';
            piece.style.animationDuration = (Math.random() * 2 + 2) + 's';
            confettiContainer.appendChild(piece);
        }
        
        // 3秒後移除彩帶
        setTimeout(() => {
            if (confettiContainer.parentNode) {
                confettiContainer.parentNode.removeChild(confettiContainer);
            }
        }, 3000);
    }

    // 新增賽事
    private addRace(race: RaceRecord): void {
        this.races.push(race);
        this.saveData();
        this.renderRaces();
    }

    // 刪除跑步紀錄
    public deleteRecord(id: string): void {
        if (confirm('確定要刪除這筆跑步紀錄嗎？')) {
            this.records = this.records.filter(record => record.id !== id);
            this.saveData();
            this.renderLeaderboard();
            this.renderCalendar();
            this.renderCharts();
        }
    }

    // 刪除跑步賽事
    public deleteRace(id: string): void {
        if (confirm('確定要刪除這筆賽事紀錄嗎？')) {
            this.races = this.races.filter(race => race.id !== id);
            this.saveData();
            this.renderRaces();
        }
    }

    // 獲取心情對應的 CSS 類別
    private getMoodClass(mood: string): string {
        switch (mood) {
            case '非常開心': return 'mood-very-happy';
            case '開心': return 'mood-happy';
            case '普通': return 'mood-normal';
            case '不開心': return 'mood-sad';
            case '非常不開心': return 'mood-very-sad';
            default: return 'mood-normal';
        }
    }

    // 獲取心情對應的表情符號
    private getMoodEmoji(mood: string): string {
        switch (mood) {
            case '非常開心': return '😄';
            case '開心': return '😊';
            case '普通': return '😐';
            case '不開心': return '😔';
            case '非常不開心': return '😢';
            default: return '😐';
        }
    }

    // 排序紀錄
    private sortRecords(sortBy: 'date' | 'distance' | 'pace'): void {
        this.currentSortBy = sortBy;
        
        // 更新按鈕狀態
        document.querySelectorAll('.sort-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`sortBy${sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}`)?.classList.add('active');

        this.records.sort((a, b) => {
            switch (sortBy) {
                case 'date':
                    return new Date(a.date).getTime() - new Date(b.date).getTime();
                case 'distance':
                    return b.distance - a.distance;
                case 'pace':
                    return a.pace - b.pace;
                default:
                    return 0;
            }
        });

        this.renderLeaderboard();
    }

    // 渲染排行榜
    private renderLeaderboard(): void {
        const tbody = document.getElementById('leaderboardBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (this.records.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="7" style="text-align: center; color: #999;">尚無跑步紀錄</td>';
            tbody.appendChild(row);
            return;
        }

        this.records.forEach((record, index) => {
            const row = document.createElement('tr');
            const moodClass = this.getMoodClass(record.mood);
            const moodEmoji = this.getMoodEmoji(record.mood);
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${this.formatDate(record.date)}</td>
                <td>${record.distance}</td>
                <td>${record.time}</td>
                <td>${record.pace}</td>
                <td>
                    <span class="mood-display ${moodClass}">${moodEmoji} ${record.mood}</span>
                </td>
                <td>
                    <button class="delete-btn" onclick="app.deleteRecord('${record.id}')">刪除</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // 渲染跑步賽事
    private renderRaces(): void {
        const container = document.getElementById('racesContainer');
        if (!container) return;

        container.innerHTML = '';

        if (this.races.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.color = '#999';
            emptyMessage.style.padding = '40px';
            emptyMessage.textContent = '尚無跑步賽事紀錄';
            container.appendChild(emptyMessage);
            return;
        }

        // 按日期排序（最新的在前）
        const sortedRaces = [...this.races].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        sortedRaces.forEach(race => {
            const raceElement = document.createElement('div');
            raceElement.className = 'race-item';
            
            const moodClass = this.getMoodClass(race.mood);
            const moodEmoji = this.getMoodEmoji(race.mood);
            
            raceElement.innerHTML = `
                <div class="race-header">
                    <div class="race-name">${race.name}</div>
                    <div class="race-date">${this.formatDate(race.date)}</div>
                </div>
                <div class="race-details">
                    <div class="race-detail">
                        <div class="race-detail-label">距離</div>
                        <div class="race-detail-value">${race.distance} km</div>
                    </div>
                    <div class="race-detail">
                        <div class="race-detail-label">完賽時間</div>
                        <div class="race-detail-value">${race.time}</div>
                    </div>
                    ${race.rank ? `
                    <div class="race-detail">
                        <div class="race-detail-label">排名</div>
                        <div class="race-detail-value">${race.rank}</div>
                    </div>
                    ` : ''}
                    <div class="race-detail">
                        <div class="race-detail-label">心情</div>
                        <div class="race-detail-value">
                            <span class="mood-display ${moodClass}">${moodEmoji} ${race.mood}</span>
                        </div>
                    </div>
                </div>
                <div class="race-actions">
                    <button class="delete-btn" onclick="app.deleteRace('${race.id}')">刪除</button>
                </div>
            `;
            
            container.appendChild(raceElement);
        });
    }

    // 渲染月曆
    private renderCalendar(): void {
        const calendar = document.getElementById('calendar');
        const currentMonthElement = document.getElementById('currentMonth');
        
        if (!calendar || !currentMonthElement) return;

        // 更新月份顯示
        currentMonthElement.textContent = this.currentMonth.toLocaleDateString('zh-TW', { 
            year: 'numeric', 
            month: 'long' 
        });

        // 清空月曆
        calendar.innerHTML = '';

        // 加入星期標題
        const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
        weekDays.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-header';
            dayHeader.textContent = day;
            calendar.appendChild(dayHeader);
        });

        // 計算月份資訊
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        // 生成42天（6週）的月曆
        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            // 如果不是當月，添加 other-month 類別
            if (currentDate.getMonth() !== month) {
                dayElement.classList.add('other-month');
            }
            
            // 如果是今天，添加 today 類別
            const today = new Date();
            if (currentDate.toDateString() === today.toDateString()) {
                dayElement.classList.add('today');
            }

            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = currentDate.getDate().toString();
            dayElement.appendChild(dayNumber);

            // 查找當天的跑步距離
            const dayDistance = this.getDayDistance(currentDate);
            if (dayDistance > 0) {
                const distanceElement = document.createElement('div');
                distanceElement.className = 'day-distance';
                distanceElement.textContent = `${dayDistance}km`;
                dayElement.appendChild(distanceElement);
            }

            calendar.appendChild(dayElement);
        }
    }

    // 獲取指定日期的跑步距離
    private getDayDistance(date: Date): number {
        const dateString = date.toISOString().split('T')[0];
        const dayRecords = this.records.filter(record => record.date === dateString);
        return dayRecords.reduce((total, record) => total + record.distance, 0);
    }

    // 渲染圖表
    private renderCharts(): void {
        this.renderDistanceChart();
        this.renderPaceChart();
    }

    // 渲染距離圖表
    private renderDistanceChart(): void {
        const ctx = document.getElementById('distanceChart') as HTMLCanvasElement;
        if (!ctx) return;

        // 銷毀現有圖表
        if (this.distanceChart) {
            this.distanceChart.destroy();
        }

        const chartData = this.getChartData();
        
        this.distanceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: '跑步距離 (公里)',
                    data: chartData.distances,
                    borderColor: '#4A90E2',
                    backgroundColor: 'rgba(74, 144, 226, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        min: 0,
                        max: 40,
                        ticks: {
                            stepSize: 5
                        },
                        title: {
                            display: true,
                            text: '距離 (公里)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: '日期'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: '距離隨時間變化'
                    }
                }
            }
        });
    }

    // 渲染配速圖表
    private renderPaceChart(): void {
        const ctx = document.getElementById('paceChart') as HTMLCanvasElement;
        if (!ctx) return;

        // 銷毀現有圖表
        if (this.paceChart) {
            this.paceChart.destroy();
        }

        const chartData = this.getChartData();
        
        this.paceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: '平均配速 (分鐘/公里)',
                    data: chartData.paces,
                    borderColor: '#E74C3C',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        min: 3,
                        max: 8,
                        ticks: {
                            stepSize: 0.5
                        },
                        title: {
                            display: true,
                            text: '配速 (分鐘/公里)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: '日期'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: '平均配速隨時間變化'
                    }
                }
            }
        });
    }

    // 獲取圖表資料
    private getChartData(): { labels: string[], distances: number[], paces: number[] } {
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const labels: string[] = [];
        const distances: number[] = [];
        const paces: number[] = [];

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateString = date.toISOString().split('T')[0];
            labels.push(day.toString());

            const dayRecords = this.records.filter(record => record.date === dateString);
            
            if (dayRecords.length > 0) {
                const totalDistance = dayRecords.reduce((sum, record) => sum + record.distance, 0);
                const totalTime = dayRecords.reduce((sum, record) => sum + record.time, 0);
                const averagePace = totalTime / totalDistance;
                
                distances.push(Math.round(totalDistance * 100) / 100);
                paces.push(Math.round(averagePace * 100) / 100);
            } else {
                distances.push(0);
                paces.push(0);
            }
        }

        return { labels, distances, paces };
    }

    // 切換月份
    private changeMonth(direction: number): void {
        this.currentMonth.setMonth(this.currentMonth.getMonth() + direction);
        this.renderCalendar();
        this.renderCharts();
    }

    // 設定預設日期為今天
    private setDefaultDate(): void {
        const dateInput = document.getElementById('date') as HTMLInputElement;
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
        }
    }

    // 格式化日期
    private formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-TW');
    }

    // 載入資料
    private loadData(): void {
        const savedRecords = localStorage.getItem('runningRecords');
        if (savedRecords) {
            this.records = JSON.parse(savedRecords);
        } else {
            // 載入範例資料
            this.loadSampleData();
        }

        const savedRaces = localStorage.getItem('runningRaces');
        if (savedRaces) {
            this.races = JSON.parse(savedRaces);
        } else {
            // 載入範例賽事資料
            this.loadSampleRaces();
        }
    }

    // 儲存資料
    private saveData(): void {
        localStorage.setItem('runningRecords', JSON.stringify(this.records));
        localStorage.setItem('runningRaces', JSON.stringify(this.races));
    }

    // 載入範例資料
    private loadSampleData(): void {
        const today = new Date();
        const sampleRecords: RunningRecord[] = [
            {
                id: '1',
                date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                distance: 5.2,
                time: 28,
                pace: 5.38,
                mood: '開心'
            },
            {
                id: '2',
                date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                distance: 3.8,
                time: 20,
                pace: 5.26,
                mood: '普通'
            },
            {
                id: '3',
                date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                distance: 7.5,
                time: 42,
                pace: 5.6,
                mood: '非常開心'
            }
        ];
        
        this.records = sampleRecords;
        this.saveData();
    }

    // 載入範例賽事資料
    private loadSampleRaces(): void {
        const today = new Date();
        const sampleRaces: RaceRecord[] = [
            {
                id: '1',
                name: '台北馬拉松',
                date: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                distance: 42.195,
                time: '3:45:30',
                rank: '第15名 / 總排名 150/500',
                mood: '非常開心'
            },
            {
                id: '2',
                name: '新竹城市馬拉松',
                date: new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                distance: 21.1,
                time: '1:35:20',
                rank: '第8名 / 總排名 80/300',
                mood: '開心'
            },
            {
                id: '3',
                name: '台大校園路跑',
                date: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                distance: 10,
                time: '42:15',
                rank: '第3名 / 總排名 30/200',
                mood: '非常開心'
            }
        ];
        
        this.races = sampleRaces;
        this.saveData();
    }
}

// 全域應用程式實例
let app: RunningTrackerApp;

// 當頁面載入完成時初始化應用程式
document.addEventListener('DOMContentLoaded', () => {
    app = new RunningTrackerApp();
});