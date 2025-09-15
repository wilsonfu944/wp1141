// TypeScript 類型定義
interface RunningRecord {
    id: number;
    date: string;
    distance: number;
    time: number;
    mood: number;
}

interface ChartData {
    distance: Chart | null;
    pace: Chart | null;
}

interface MoodOption {
    value: number;
    label: string;
    emoji: string;
}

// Chart.js 類型聲明（如果沒有安裝 @types/chart.js）
declare class Chart {
    constructor(ctx: CanvasRenderingContext2D, config: any);
    data: {
        labels: string[];
        datasets: Array<{
            label: string;
            data: (number | null)[];
            borderColor: string;
            backgroundColor: string;
            borderWidth: number;
            fill: boolean;
            tension: number;
            spanGaps?: boolean;
        }>;
    };
    options: {
        responsive: boolean;
        maintainAspectRatio: boolean;
        plugins: {
            legend: {
                display: boolean;
                position: string;
            };
        };
        scales: {
            y: {
                beginAtZero?: boolean;
                min?: number;
                max?: number;
                ticks: {
                    stepSize: number;
                    maxTicksLimit: number;
                };
                title: {
                    display: boolean;
                    text: string;
                };
            };
            x: {
                ticks: {
                    maxTicksLimit: number;
                };
                title: {
                    display: boolean;
                    text: string;
                };
            };
        };
    };
    update(): void;
}

// 跑步紀錄追蹤器類別
class RunningTracker {
    private records: RunningRecord[] = [];
    private charts: ChartData = {
        distance: null,
        pace: null
    };
    private selectedMood: number = 3;
    private currentDate: Date = new Date();
    private moodOptions: MoodOption[] = [
        { value: 1, label: '很差', emoji: '😞' },
        { value: 2, label: '不好', emoji: '😕' },
        { value: 3, label: '普通', emoji: '😐' },
        { value: 4, label: '不錯', emoji: '😊' },
        { value: 5, label: '很好', emoji: '😄' }
    ];

    constructor() {
        this.loadRecords();
        this.setupMoodButtons();
        this.renderLeaderboard();
        this.renderCalendar();
        this.initCharts();
    }

    // 載入儲存的紀錄
    private loadRecords(): void {
        const saved = localStorage.getItem('runningRecords');
        if (saved) {
            this.records = JSON.parse(saved);
        }
    }

    // 儲存紀錄到 localStorage
    private saveRecords(): void {
        localStorage.setItem('runningRecords', JSON.stringify(this.records));
    }

    // 設定心情按鈕
    private setupMoodButtons(): void {
        const moodGroup = document.querySelector('.mood-group') as HTMLElement;
        if (!moodGroup) return;

        moodGroup.innerHTML = '';
        this.moodOptions.forEach(option => {
            const button = document.createElement('button');
            button.className = `mood-btn ${option.value === this.selectedMood ? 'selected' : ''}`;
            button.innerHTML = `${option.emoji} ${option.label}`;
            button.onclick = () => this.selectMood(option.value);
            moodGroup.appendChild(button);
        });
    }

    // 選擇心情
    private selectMood(mood: number): void {
        this.selectedMood = mood;
        this.setupMoodButtons();
    }

    // 重置心情選擇
    private resetMoodSelection(): void {
        this.selectedMood = 3;
        this.setupMoodButtons();
    }

    // 新增跑步紀錄
    addRecord(): void {
        const dateInput = document.getElementById('date') as HTMLInputElement;
        const distanceInput = document.getElementById('distance') as HTMLInputElement;
        const timeInput = document.getElementById('time') as HTMLInputElement;

        const date = dateInput.value;
        const distance = parseFloat(distanceInput.value);
        const time = parseFloat(timeInput.value);

        if (!date || isNaN(distance) || isNaN(time) || distance <= 0 || time <= 0) {
            this.showMessage('請填寫完整的跑步資訊！', 'error');
            return;
        }

        const newRecord: RunningRecord = {
            id: Date.now(),
            date,
            distance,
            time,
            mood: this.selectedMood
        };

        this.records.push(newRecord);
        this.saveRecords();
        this.renderLeaderboard();
        this.updateCharts();
        this.renderCalendar();
        this.resetMoodSelection();
        
        // 清空表單
        dateInput.value = '';
        distanceInput.value = '';
        timeInput.value = '';

        this.showMessage('跑步紀錄已新增！', 'success');

        // 檢查是否破紀錄
        this.checkRecords(newRecord);
    }

    // 檢查是否破紀錄
    private checkRecords(newRecord: RunningRecord): void {
        const maxDistance = Math.max(...this.records.map(r => r.distance));
        const minPace = Math.min(...this.records.map(r => r.time / r.distance));

        if (newRecord.distance === maxDistance) {
            this.showCongratulation('距離新紀錄！', `恭喜！您跑出了 ${newRecord.distance} 公里的新紀錄！`);
        }

        if (newRecord.time / newRecord.distance === minPace) {
            this.showCongratulation('配速新紀錄！', `恭喜！您跑出了 ${(newRecord.time / newRecord.distance).toFixed(2)} 分鐘/公里的最佳配速！`);
        }
    }

    // 顯示恭喜訊息
    private showCongratulation(title: string, message: string): void {
        const modal = document.createElement('div');
        modal.className = 'congratulation-modal';
        modal.innerHTML = `
            <div class="congratulation-content">
                <h2>🎉 ${title}</h2>
                <p>${message}</p>
                <button onclick="this.parentElement.parentElement.remove()">太棒了！</button>
            </div>
        `;
        document.body.appendChild(modal);

        // 添加彩帶效果
        this.createConfetti(modal);
        
        // 3秒後自動關閉
        setTimeout(() => {
            if (modal.parentElement) {
                        modal.remove();
            }
        }, 3000);
    }

    // 創建彩帶效果
    private createConfetti(container: HTMLElement): void {
        const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: absolute;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}%;
                top: -10px;
                animation: confettiFall ${2 + Math.random() * 3}s linear forwards;
                transform: rotate(${Math.random() * 360}deg);
            `;
            
            container.appendChild(confetti);
        }
    }

    // 刪除紀錄
    deleteRecord(recordId: number): void {
        this.records = this.records.filter(record => record.id !== recordId);
        this.saveRecords();
        this.renderLeaderboard();
        this.updateCharts();
        this.renderCalendar();
        this.showMessage('紀錄已刪除！', 'success');
    }

    // 渲染排行榜
    private renderLeaderboard(): void {
        const tbody = document.querySelector('#leaderboard tbody') as HTMLElement;
        if (!tbody) return;

        if (this.records.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="no-records">尚無跑步紀錄</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        this.records.forEach((record, index) => {
            const row = document.createElement('tr');
            const pace = (record.time / record.distance).toFixed(2);
            const mood = this.moodOptions.find(m => m.value === record.mood);
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${record.date}</td>
                <td>${record.distance} km</td>
                <td>${record.time} 分鐘</td>
                <td>${pace} min/km</td>
                <td>${mood ? mood.emoji : '😐'}</td>
                <td><button onclick="runningTracker.deleteRecord(${record.id})" class="delete-btn">刪除</button></td>
            `;
            tbody.appendChild(row);
        });
    }

    // 切換月份
    changeMonth(direction: number): void {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.renderCalendar();
        this.updateCharts();
    }

    // 渲染月曆
    private renderCalendar(): void {
        const monthYearElement = document.getElementById('currentMonth') as HTMLElement;
        const calendarGrid = document.querySelector('.calendar-grid') as HTMLElement;
        
        if (!monthYearElement || !calendarGrid) return;

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        monthYearElement.textContent = `${year}年${month + 1}月`;

        // 清空月曆
        calendarGrid.innerHTML = '';

        // 獲取當月第一天和最後一天
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay();

        // 添加空白格子（上個月的日期）
        for (let i = 0; i < startDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyDay);
        }

        // 添加當月的日期
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = day.toString();
            dayElement.appendChild(dayNumber);

            // 檢查這一天是否有跑步紀錄
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayRecords = this.records.filter(record => record.date === dateString);
            
            if (dayRecords.length > 0) {
                const totalDistance = dayRecords.reduce((sum, record) => sum + record.distance, 0);
                const runningData = document.createElement('div');
                runningData.className = 'running-data';
                runningData.innerHTML = `<div class="running-icon">🏃‍♂️</div><div>${totalDistance}km</div>`;
                dayElement.appendChild(runningData);
            }

            calendarGrid.appendChild(dayElement);
        }

        this.updateMonthlyTotal();
    }

    // 更新月總計
    private updateMonthlyTotal(): void {
        const totalElement = document.querySelector('.total-distance') as HTMLElement;
        if (!totalElement) return;

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        const monthRecords = this.records.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate.getFullYear() === year && recordDate.getMonth() === month;
        });

        const totalDistance = monthRecords.reduce((sum, record) => sum + record.distance, 0);
        totalElement.textContent = `本月總距離: ${totalDistance.toFixed(1)} km`;
    }

    // 初始化圖表
    private initCharts(): void {
        this.initDistanceChart();
        this.initPaceChart();
        this.updateCharts();
    }

    // 更新圖表
    private updateCharts(): void {
        this.updateDistanceChart();
        this.updatePaceChart();
    }

    // 距離變化圖表
    private initDistanceChart(): void {
        const canvas = document.getElementById('distanceChart') as HTMLCanvasElement;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        this.charts.distance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: '跑步距離 (km)',
                    data: [],
                    borderColor: '#4A90E2',
                    backgroundColor: 'rgba(74, 144, 226, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        min: 0,
                        max: 20,
                        ticks: {
                            stepSize: 0.05, // 刻度標籤每0.05顯示一個
                            maxTicksLimit: 100 // 極大增加刻度密度，視覺間距極小
                        },
                        title: {
                            display: true,
                            text: '距離 (公里)'
                        }
                    },
                    x: {
                        ticks: {
                            maxTicksLimit: 15
                        },
                        title: {
                            display: true,
                            text: '日期'
                        }
                    }
                }
            }
        });
    }

    // 更新距離圖表
    private updateDistanceChart(): void {
        if (!this.charts.distance) return;

        const currentYear = this.currentDate.getFullYear();
        const currentMonth = this.currentDate.getMonth();
        
        // 獲取當月所有日期
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const labels: string[] = [];
        const data: number[] = [];
        
        // 創建當月所有日期的數據
        for (let day = 1; day <= daysInMonth; day++) {
            const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            labels.push(this.formatChartDate(dateString));
            
            // 查找該日期的跑步記錄
            const dayRecords = this.records.filter(record => record.date === dateString);
            const totalDistance = dayRecords.reduce((sum, record) => sum + record.distance, 0);
            data.push(totalDistance);
        }
        
        this.charts.distance.data.labels = labels;
        this.charts.distance.data.datasets[0].data = data;
        
        // 確保Y軸刻度設定
        this.charts.distance.options.scales.y.ticks.stepSize = 0.05;
        this.charts.distance.options.scales.y.ticks.maxTicksLimit = 100;
        this.charts.distance.update();
        
        // 更新平均值顯示
        this.updateDistanceAverage(data);
    }

    // 配速變化圖表
    private initPaceChart(): void {
        const canvas = document.getElementById('paceChart') as HTMLCanvasElement;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        this.charts.pace = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: '平均配速 (min/km)',
                    data: [],
                    borderColor: '#E74C3C',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    spanGaps: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        min: 3,
                        max: 8,
                        ticks: {
                            stepSize: 0.05, // 刻度標籤每0.05顯示一個
                            maxTicksLimit: 100 // 極大增加刻度密度，視覺間距極小
                        },
                        title: {
                            display: true,
                            text: '配速 (分鐘/公里)'
                        }
                    },
                    x: {
                        ticks: {
                            maxTicksLimit: 15
                        },
                        title: {
                            display: true,
                            text: '日期'
                        }
                    }
                }
            }
        });
    }

    // 更新配速圖表
    private updatePaceChart(): void {
        if (!this.charts.pace) return;

        const currentYear = this.currentDate.getFullYear();
        const currentMonth = this.currentDate.getMonth();
        
        // 獲取當月所有日期
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const labels: string[] = [];
        const data: (number | null)[] = [];
        
        // 創建當月所有日期的數據
        for (let day = 1; day <= daysInMonth; day++) {
            const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            labels.push(this.formatChartDate(dateString));
            
            // 查找該日期的跑步記錄
            const dayRecords = this.records.filter(record => record.date === dateString);
            if (dayRecords.length > 0) {
                // 計算當日平均配速
                const totalTime = dayRecords.reduce((sum, record) => sum + record.time, 0);
                const totalDistance = dayRecords.reduce((sum, record) => sum + record.distance, 0);
                const averagePace = totalDistance > 0 ? totalTime / totalDistance : null;
                data.push(averagePace);
            } else {
                data.push(null);
            }
        }
        
        this.charts.pace.data.labels = labels;
        this.charts.pace.data.datasets[0].data = data;
        
        // 確保Y軸刻度設定
        this.charts.pace.options.scales.y.ticks.stepSize = 0.05;
        this.charts.pace.options.scales.y.ticks.maxTicksLimit = 100;
        this.charts.pace.update();
        
        // 更新平均值顯示
        this.updatePaceAverage(data);
    }

    // 格式化圖表日期
    private formatChartDate(dateString: string): string {
        const date = new Date(dateString);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    }

    // 更新距離平均值
    private updateDistanceAverage(data: number[]): void {
        const averageElement = document.querySelector('.chart-average.distance') as HTMLElement;
        if (!averageElement) return;

        const nonZeroData = data.filter(value => value > 0);
        if (nonZeroData.length > 0) {
            const average = nonZeroData.reduce((sum, value) => sum + value, 0) / nonZeroData.length;
            averageElement.textContent = `平均距離: ${average.toFixed(2)} km`;
        } else {
            averageElement.textContent = '平均距離: 0 km';
        }
    }

    // 更新配速平均值
    private updatePaceAverage(data: (number | null)[]): void {
        const averageElement = document.querySelector('.chart-average.pace') as HTMLElement;
        if (!averageElement) return;

        const validData = data.filter(value => value !== null) as number[];
        if (validData.length > 0) {
            const average = validData.reduce((sum, value) => sum + value, 0) / validData.length;
            averageElement.textContent = `平均配速: ${average.toFixed(2)} min/km`;
        } else {
            averageElement.textContent = '平均配速: 0 min/km';
        }
    }

    // 顯示訊息
    private showMessage(message: string, type: 'success' | 'error'): void {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
}

// 跑步經歷管理功能
function addExperience(): void {
    const input = document.getElementById('experienceInput') as HTMLInputElement;
    const text = input.value.trim();
    if (text) {
        const list = document.getElementById('experienceList') as HTMLElement;
        const li = document.createElement('li');
        li.className = 'experience-item';
        li.innerHTML = `
            <span>${text}</span>
            <button onclick="removeExperience(this)" class="remove-btn">×</button>
        `;
        list.appendChild(li);
        input.value = '';
    }
}

function removeExperience(button: HTMLElement): void {
    const li = button.parentElement;
    if (li) {
        li.remove();
    }
}

// 添加動畫樣式
const style = document.createElement('style');
style.textContent = `
    .message {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    }
    
    .message.success {
        background: #28a745;
    }
    
    .message.error {
        background: #dc3545;
    }
    
    .congratulation-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
        animation: fadeIn 0.3s ease;
    }
    
    .congratulation-content {
        background: white;
        padding: 40px;
        border-radius: 20px;
        text-align: center;
        max-width: 400px;
        animation: bounceIn 0.5s ease;
        position: relative;
        overflow: hidden;
    }
    
    .congratulation-content h2 {
        color: #FFD700;
        font-size: 2rem;
        margin-bottom: 15px;
    }
    
    .congratulation-content p {
        color: #333;
        font-size: 1.2rem;
        margin-bottom: 25px;
    }
    
    .congratulation-content button {
        background: #4A90E2;
            color: white;
        border: none;
        padding: 12px 30px;
        border-radius: 25px;
        font-size: 1.1rem;
            font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .congratulation-content button:hover {
        background: #357ABD;
        transform: translateY(-2px);
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes bounceIn {
        0% {
            transform: scale(0.3);
            opacity: 0;
        }
        50% {
            transform: scale(1.05);
        }
        70% {
            transform: scale(0.9);
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }
    
    @keyframes confettiFall {
        0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 當頁面載入完成時初始化應用
let runningTracker: RunningTracker;
document.addEventListener('DOMContentLoaded', () => {
    runningTracker = new RunningTracker();
});