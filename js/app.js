// 디지털 디톡스 타이머 앱
class DetoxTimer {
    constructor() {
        this.selectedMinutes = 30;
        this.remainingSeconds = 0;
        this.totalSeconds = 0;
        this.timerInterval = null;
        this.isRunning = false;
        
        // 통계 데이터
        this.stats = this.loadStats();
        
        // 동기부여 메시지
        this.motivationMessages = [
            "잠시 멈추고, 현재에 집중하세요.",
            "스마트폰 없이도 충분히 행복할 수 있어요.",
            "진정한 연결은 눈을 마주칠 때 시작됩니다.",
            "오늘 하루, 나에게 집중하는 시간을 가져보세요.",
            "디지털 세상에서 벗어나 자연을 느껴보세요.",
            "휴식은 게으름이 아니라 재충전입니다.",
            "지금 이 순간이 가장 소중합니다.",
            "마음의 평화는 알림 소리 밖에 있습니다.",
            "스크린 너머의 세상을 발견해보세요.",
            "당신의 시간은 소중합니다."
        ];
        
        // 타이머 중 메시지
        this.timerMessages = [
            "집중하고 있어요! 잘하고 있습니다.",
            "훌륭해요! 계속 유지하세요.",
            "스마트폰 없이도 잘 하고 있어요!",
            "마음이 편안해지고 있나요?",
            "깊은 호흡을 해보세요.",
            "지금 이 순간을 즐기세요.",
            "거의 다 왔어요! 조금만 더!",
            "당신은 할 수 있습니다!"
        ];
        
        // 호흡 가이드 텍스트
        this.breathTexts = [
            "숨을 깊게 들이쉬세요...",
            "잠시 멈추세요...",
            "천천히 내쉬세요...",
            "다시 들이쉬세요..."
        ];
        this.breathIndex = 0;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateStats();
        this.showRandomMotivation();
        this.registerServiceWorker();
    }
    
    bindEvents() {
        // 시간 선택 버튼
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectTime(e.target));
        });
        
        // 커스텀 시간 입력
        document.getElementById('custom-minutes').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            if (value > 0 && value <= 480) {
                this.selectedMinutes = value;
                document.querySelectorAll('.time-btn').forEach(btn => {
                    btn.classList.remove('selected');
                });
            }
        });
        
        // 시작 버튼
        document.getElementById('start-btn').addEventListener('click', () => this.startTimer());
        
        // 포기 버튼
        document.getElementById('give-up-btn').addEventListener('click', () => this.giveUp());
        
        // 다시 시작 버튼
        document.getElementById('restart-btn').addEventListener('click', () => this.restart());
        
        // 공유 버튼
        document.getElementById('share-btn').addEventListener('click', () => this.shareResult());
        
        // 광고 닫기 버튼
        document.getElementById('close-ad-btn').addEventListener('click', () => this.closeInterstitialAd());
    }
    
    selectTime(btn) {
        document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedMinutes = parseInt(btn.dataset.minutes);
        document.getElementById('custom-minutes').value = '';
    }
    
    startTimer() {
        this.totalSeconds = this.selectedMinutes * 60;
        this.remainingSeconds = this.totalSeconds;
        this.isRunning = true;
        
        this.showScreen('timer-screen');
        this.updateTimerDisplay();
        this.initProgressRing();
        
        // 타이머 시작
        this.timerInterval = setInterval(() => this.tick(), 1000);
        
        // 메시지 변경 인터벌
        this.messageInterval = setInterval(() => this.changeTimerMessage(), 30000);
        
        // 호흡 가이드 인터벌
        this.breathInterval = setInterval(() => this.updateBreathGuide(), 4000);
    }
    
    tick() {
        if (this.remainingSeconds <= 0) {
            this.completeTimer(true);
            return;
        }
        
        this.remainingSeconds--;
        this.updateTimerDisplay();
        this.updateProgressRing();
    }
    
    updateTimerDisplay() {
        const minutes = Math.floor(this.remainingSeconds / 60);
        const seconds = this.remainingSeconds % 60;
        
        document.getElementById('timer-minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('timer-seconds').textContent = seconds.toString().padStart(2, '0');
    }
    
    initProgressRing() {
        const circle = document.querySelector('.progress-ring-circle');
        const radius = circle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        
        circle.style.strokeDasharray = circumference;
        circle.style.strokeDashoffset = 0;
    }
    
    updateProgressRing() {
        const circle = document.querySelector('.progress-ring-circle');
        const radius = circle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        
        const progress = this.remainingSeconds / this.totalSeconds;
        const offset = circumference * (1 - progress);
        
        circle.style.strokeDashoffset = offset;
        
        // 색상 변경 (시간이 적으면 경고색)
        if (progress < 0.1) {
            circle.style.stroke = '#00b894';  // 거의 완료 - 성공색
        } else if (progress < 0.3) {
            circle.style.stroke = '#fdcb6e';  // 경고색
        }
    }
    
    changeTimerMessage() {
        const messageEl = document.getElementById('timer-message');
        const randomMessage = this.timerMessages[Math.floor(Math.random() * this.timerMessages.length)];
        messageEl.style.opacity = 0;
        setTimeout(() => {
            messageEl.textContent = randomMessage;
            messageEl.style.opacity = 1;
        }, 300);
    }
    
    updateBreathGuide() {
        const breathText = document.querySelector('.breath-text');
        this.breathIndex = (this.breathIndex + 1) % this.breathTexts.length;
        breathText.textContent = this.breathTexts[this.breathIndex];
    }
    
    giveUp() {
        this.stopTimer();
        
        // 전면 광고 표시
        this.showInterstitialAd(() => {
            this.completeTimer(false);
        });
    }
    
    completeTimer(success) {
        this.stopTimer();
        
        // 통계 업데이트
        const elapsedMinutes = Math.floor((this.totalSeconds - this.remainingSeconds) / 60);
        this.updateStatsData(success, elapsedMinutes);
        
        // 결과 화면 표시
        this.showCompletionScreen(success, elapsedMinutes);
        this.showScreen('complete-screen');
    }
    
    showCompletionScreen(success, minutes) {
        const icon = document.getElementById('complete-icon');
        const title = document.getElementById('complete-title');
        const message = document.getElementById('complete-message');
        const resultTime = document.getElementById('result-time');
        const resultStreak = document.getElementById('result-streak');
        
        if (success) {
            icon.textContent = '🎉';
            title.textContent = '축하합니다!';
            message.textContent = '디지털 디톡스를 성공적으로 완료했습니다.';
        } else {
            icon.textContent = '💪';
            title.textContent = '괜찮아요!';
            message.textContent = `${minutes}분 동안 노력했어요. 다음에 더 잘할 수 있어요!`;
        }
        
        resultTime.textContent = success ? `${this.selectedMinutes}분` : `${minutes}분`;
        resultStreak.textContent = `${this.stats.streak}회`;
    }
    
    stopTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        if (this.messageInterval) clearInterval(this.messageInterval);
        if (this.breathInterval) clearInterval(this.breathInterval);
        this.isRunning = false;
    }
    
    restart() {
        this.showScreen('setup-screen');
        this.updateStats();
        this.showRandomMotivation();
        
        // 프로그레스 링 리셋
        const circle = document.querySelector('.progress-ring-circle');
        circle.style.strokeDashoffset = 0;
        circle.style.stroke = '#00b894';
    }
    
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }
    
    showRandomMotivation() {
        const messageEl = document.getElementById('motivation-text');
        const randomMessage = this.motivationMessages[Math.floor(Math.random() * this.motivationMessages.length)];
        messageEl.textContent = randomMessage;
    }
    
    // 통계 관련
    loadStats() {
        const saved = localStorage.getItem('detoxStats');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            totalSessions: 0,
            successfulSessions: 0,
            totalMinutes: 0,
            streak: 0,
            lastSessionDate: null
        };
    }
    
    saveStats() {
        localStorage.setItem('detoxStats', JSON.stringify(this.stats));
    }
    
    updateStatsData(success, minutes) {
        this.stats.totalSessions++;
        this.stats.totalMinutes += minutes;
        
        if (success) {
            this.stats.successfulSessions++;
            
            // 연속 성공 체크
            const today = new Date().toDateString();
            if (this.stats.lastSessionDate === today) {
                // 같은 날 여러 번
            } else {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                if (this.stats.lastSessionDate === yesterday.toDateString()) {
                    this.stats.streak++;
                } else if (this.stats.lastSessionDate !== today) {
                    this.stats.streak = 1;
                }
            }
            this.stats.lastSessionDate = today;
        } else {
            this.stats.streak = 0;
        }
        
        this.saveStats();
    }
    
    updateStats() {
        document.getElementById('total-sessions').textContent = this.stats.totalSessions;
        
        const successRate = this.stats.totalSessions > 0 
            ? Math.round((this.stats.successfulSessions / this.stats.totalSessions) * 100) 
            : 0;
        document.getElementById('success-rate').textContent = `${successRate}%`;
        
        const totalTime = this.stats.totalMinutes >= 60 
            ? `${Math.floor(this.stats.totalMinutes / 60)}시간` 
            : `${this.stats.totalMinutes}분`;
        document.getElementById('total-time').textContent = totalTime;
    }
    
    // 전면 광고
    showInterstitialAd(callback) {
        const adEl = document.getElementById('interstitial-ad');
        const closeBtn = document.getElementById('close-ad-btn');
        
        adEl.classList.add('active');
        closeBtn.disabled = true;
        
        let countdown = 5;
        closeBtn.textContent = `광고 닫기 (${countdown}초)`;
        
        const countdownInterval = setInterval(() => {
            countdown--;
            closeBtn.textContent = `광고 닫기 (${countdown}초)`;
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                closeBtn.disabled = false;
                closeBtn.textContent = '광고 닫기';
            }
        }, 1000);
        
        this.adCallback = callback;
    }
    
    closeInterstitialAd() {
        document.getElementById('interstitial-ad').classList.remove('active');
        if (this.adCallback) {
            this.adCallback();
            this.adCallback = null;
        }
    }
    
    // 결과 공유
    shareResult() {
        const text = `🧘 디지털 디톡스 완료!\n` +
            `📱 ${this.selectedMinutes}분 동안 스마트폰 없이 지냈어요.\n` +
            `🔥 연속 ${this.stats.streak}회 성공!\n` +
            `#디지털디톡스 #마음챙김`;
        
        if (navigator.share) {
            navigator.share({
                title: '디지털 디톡스 타이머',
                text: text
            }).catch(() => {
                this.copyToClipboard(text);
            });
        } else {
            this.copyToClipboard(text);
        }
    }
    
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            alert('결과가 클립보드에 복사되었습니다!');
        }).catch(() => {
            alert('공유 기능을 사용할 수 없습니다.');
        });
    }
    
    // PWA 서비스 워커
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').catch(() => {
                // 서비스 워커 등록 실패 (개발 환경에서는 정상)
            });
        }
    }
}

// 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
    new DetoxTimer();
});
