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
        this.history = this.loadHistory();
        this.badges = this.loadBadges();

        // 동기부여 명언 (폴백용)
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
        this.loadQuotableQuote();
        this.registerServiceWorker();
        this.checkAndAwardBadges();
        this.initI18n();
    }

    async initI18n() {
        try {
            await i18n.loadTranslations(i18n.getCurrentLanguage());
            i18n.updateUI();

            const currentLang = i18n.getCurrentLanguage();
            document.querySelector(`[data-lang="${currentLang}"]`)?.classList.add('active');

            this.setupLanguageSelector();
        } catch (e) {
            // i18n 파일 없으면 기본 한국어 유지
        }
    }

    setupLanguageSelector() {
        const langToggle = document.getElementById('lang-toggle');
        const langMenu = document.getElementById('lang-menu');
        const langOptions = document.querySelectorAll('.lang-option');

        langToggle.addEventListener('click', () => {
            langMenu.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.language-selector')) {
                langMenu.classList.add('hidden');
            }
        });

        langOptions.forEach(option => {
            option.addEventListener('click', async () => {
                const lang = option.getAttribute('data-lang');
                await i18n.setLanguage(lang);
                langOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                langMenu.classList.add('hidden');
            });
        });
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

        // 히스토리 보기 버튼
        const historyBtn = document.getElementById('view-history-btn');
        if (historyBtn) {
            historyBtn.addEventListener('click', () => this.showHistoryScreen());
        }

        // 히스토리 닫기 버튼
        const closeHistoryBtn = document.getElementById('close-history-btn');
        if (closeHistoryBtn) {
            closeHistoryBtn.addEventListener('click', () => this.closeHistoryScreen());
        }

        // 프리미엄 분석 버튼
        const premiumBtn = document.getElementById('premium-analysis-btn');
        if (premiumBtn) {
            premiumBtn.addEventListener('click', () => this.showPremiumAnalysis());
        }

        // 프리미엄 모달 닫기
        const closePremiumBtn = document.getElementById('close-premium-btn');
        if (closePremiumBtn) {
            closePremiumBtn.addEventListener('click', () => this.closePremiumModal());
        }
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

        // 히스토리 저장
        this.saveSessionToHistory(success, minutes);

        this.saveStats();
        this.checkAndAwardBadges();
    }

    // 세션 히스토리 저장
    saveSessionToHistory(success, minutes) {
        const session = {
            date: new Date().toISOString(),
            success: success,
            minutes: minutes,
            targetMinutes: this.selectedMinutes
        };

        this.history.sessions.push(session);

        // 최근 30일만 유지
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        this.history.sessions = this.history.sessions.filter(s =>
            new Date(s.date) > thirtyDaysAgo
        );

        this.saveHistory();
    }

    loadHistory() {
        const saved = localStorage.getItem('detoxHistory');
        if (saved) {
            return JSON.parse(saved);
        }
        return { sessions: [] };
    }

    saveHistory() {
        localStorage.setItem('detoxHistory', JSON.stringify(this.history));
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
    
    // Quotable API로 동기부여 명언 가져오기
    async loadQuotableQuote() {
        try {
            const response = await fetch('https://api.quotable.io/quotes/random?tags=inspirational|motivational|wisdom&maxLength=100');
            const data = await response.json();
            if (data && data[0]) {
                const quote = data[0];
                const messageEl = document.getElementById('motivation-text');
                if (messageEl) {
                    messageEl.textContent = `"${quote.content}" - ${quote.author}`;
                }
            }
        } catch (error) {
            // API 실패 시 폴백 메시지 사용
            this.showRandomMotivation();
        }
    }

    // 뱃지 시스템
    loadBadges() {
        const saved = localStorage.getItem('detoxBadges');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            firstSuccess: false,
            streak7: false,
            streak30: false,
            total10Hours: false,
            total50Sessions: false,
            perfectWeek: false
        };
    }

    saveBadges() {
        localStorage.setItem('detoxBadges', JSON.stringify(this.badges));
    }

    checkAndAwardBadges() {
        let newBadge = false;

        // 첫 성공
        if (!this.badges.firstSuccess && this.stats.successfulSessions >= 1) {
            this.badges.firstSuccess = true;
            newBadge = true;
        }

        // 7일 연속
        if (!this.badges.streak7 && this.stats.streak >= 7) {
            this.badges.streak7 = true;
            newBadge = true;
        }

        // 30일 연속
        if (!this.badges.streak30 && this.stats.streak >= 30) {
            this.badges.streak30 = true;
            newBadge = true;
        }

        // 총 10시간
        if (!this.badges.total10Hours && this.stats.totalMinutes >= 600) {
            this.badges.total10Hours = true;
            newBadge = true;
        }

        // 총 50세션
        if (!this.badges.total50Sessions && this.stats.totalSessions >= 50) {
            this.badges.total50Sessions = true;
            newBadge = true;
        }

        if (newBadge) {
            this.saveBadges();
        }
    }

    getBadgesList() {
        const badges = [
            { id: 'firstSuccess', name: '🌱 첫 성공', desc: '첫 디톡스 완료', unlocked: this.badges.firstSuccess },
            { id: 'streak7', name: '🔥 일주일 연속', desc: '7일 연속 성공', unlocked: this.badges.streak7 },
            { id: 'streak30', name: '💎 한 달 연속', desc: '30일 연속 성공', unlocked: this.badges.streak30 },
            { id: 'total10Hours', name: '⏰ 마스터', desc: '총 10시간 달성', unlocked: this.badges.total10Hours },
            { id: 'total50Sessions', name: '🏆 베테랑', desc: '총 50세션 완료', unlocked: this.badges.total50Sessions }
        ];
        return badges;
    }

    // 배지 렌더링 (히스토리 화면용)
    renderBadges() {
        const badges = this.getBadgesList();
        let html = '<div class="badges-grid">';
        badges.forEach(badge => {
            const className = badge.unlocked ? 'badge unlocked' : 'badge locked';
            html += `
                <div class="${className}">
                    <div class="badge-icon">${badge.unlocked ? badge.name.split(' ')[0] : '🔒'}</div>
                    <div class="badge-name">${badge.name.split(' ')[1]}</div>
                    <div class="badge-desc">${badge.desc}</div>
                </div>
            `;
        });
        html += '</div>';
        return html;
    }

    // 히스토리 화면
    showHistoryScreen() {
        const modal = document.getElementById('history-modal');
        if (!modal) return;

        const content = modal.querySelector('.history-content-body');

        let html = '';

        // 배지 섹션
        html += `
            <div class="badges-section">
                <h3>🏅 업적</h3>
                ${this.renderBadges()}
            </div>
        `;

        // 히스토리 섹션
        if (this.history.sessions.length === 0) {
            html += '<p class="empty-state">아직 기록이 없습니다. 첫 디톡스를 시작해보세요!</p>';
        } else {
            html += '<div class="history-section"><h3>📖 최근 기록</h3>';
            html += '<div class="history-list">';
            const sortedSessions = [...this.history.sessions].reverse().slice(0, 10);

            sortedSessions.forEach(session => {
                const date = new Date(session.date);
                const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
                const statusIcon = session.success ? '✅' : '⏸️';
                const statusText = session.success ? '성공' : '중단';

                html += `
                    <div class="history-item">
                        <span class="history-icon">${statusIcon}</span>
                        <div class="history-info">
                            <div class="history-date">${dateStr}</div>
                            <div class="history-detail">${session.minutes}분 / ${session.targetMinutes}분 목표 - ${statusText}</div>
                        </div>
                    </div>
                `;
            });

            html += '</div></div>';
        }

        content.innerHTML = html;
        modal.classList.add('active');
    }

    closeHistoryScreen() {
        const modal = document.getElementById('history-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // 프리미엄 분석
    showPremiumAnalysis() {
        this.showInterstitialAd(() => {
            this.renderPremiumContent();
        });
    }

    renderPremiumContent() {
        const modal = document.getElementById('premium-modal');
        const body = document.getElementById('premium-body');
        if (!modal || !body) return;

        const successRate = this.stats.totalSessions > 0
            ? Math.round((this.stats.successfulSessions / this.stats.totalSessions) * 100)
            : 0;

        // 주간 패턴 분석
        const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
        const dayCount = {};
        weekDays.forEach(d => dayCount[d] = { total: 0, success: 0 });

        this.history.sessions.forEach(s => {
            const day = weekDays[new Date(s.date).getDay()];
            dayCount[day].total++;
            if (s.success) dayCount[day].success++;
        });

        let bestDay = '-';
        let bestDayRate = 0;
        Object.entries(dayCount).forEach(([day, data]) => {
            if (data.total > 0) {
                const rate = data.success / data.total;
                if (rate > bestDayRate) {
                    bestDayRate = rate;
                    bestDay = day;
                }
            }
        });

        // 평균 세션 시간
        const avgMinutes = this.history.sessions.length > 0
            ? Math.round(this.history.sessions.reduce((sum, s) => sum + s.minutes, 0) / this.history.sessions.length)
            : 0;

        // 레벨 판정
        let level, levelDesc;
        if (this.stats.totalMinutes >= 600) {
            level = '🏆 디톡스 마스터';
            levelDesc = '10시간 이상의 디지털 디톡스를 달성했습니다! 당신의 집중력은 최상급입니다.';
        } else if (this.stats.totalMinutes >= 300) {
            level = '💎 디톡스 전문가';
            levelDesc = '5시간 이상의 디톡스 경험으로 자기 관리 능력이 뛰어납니다.';
        } else if (this.stats.totalMinutes >= 60) {
            level = '🌟 디톡스 실천가';
            levelDesc = '1시간 이상 디톡스를 실천하고 계시네요! 꾸준히 이어가세요.';
        } else {
            level = '🌱 디톡스 입문자';
            levelDesc = '디지털 디톡스의 첫 걸음을 내딛었습니다. 조금씩 시간을 늘려보세요!';
        }

        // 개선 팁
        let tips = [];
        if (successRate < 50) {
            tips.push('목표 시간을 줄여서 성공 경험을 쌓아보세요.');
            tips.push('디톡스 전에 알림을 끄고, 폰을 다른 방에 두세요.');
        } else if (successRate < 80) {
            tips.push('성공률이 좋아지고 있어요! 목표 시간을 조금씩 늘려보세요.');
            tips.push('디톡스 시간에 산책이나 명상을 함께 해보세요.');
        } else {
            tips.push('훌륭한 성공률! 더 긴 세션에 도전해보세요.');
            tips.push('친구나 가족과 함께 디톡스를 시도해보는 건 어떨까요?');
        }
        tips.push('매일 같은 시간에 디톡스하면 습관이 됩니다.');
        tips.push('디톡스 후 기분을 기록하면 동기부여에 도움이 됩니다.');

        let html = `
            <div class="premium-analysis-content">
                <div class="premium-level-section">
                    <div class="premium-level-badge">${level}</div>
                    <p class="premium-level-desc">${levelDesc}</p>
                </div>

                <div class="premium-stats-grid">
                    <div class="premium-stat-card">
                        <div class="premium-stat-value">${this.stats.totalSessions}</div>
                        <div class="premium-stat-label">총 세션</div>
                    </div>
                    <div class="premium-stat-card">
                        <div class="premium-stat-value">${successRate}%</div>
                        <div class="premium-stat-label">성공률</div>
                    </div>
                    <div class="premium-stat-card">
                        <div class="premium-stat-value">${avgMinutes}분</div>
                        <div class="premium-stat-label">평균 시간</div>
                    </div>
                    <div class="premium-stat-card">
                        <div class="premium-stat-value">${this.stats.streak}일</div>
                        <div class="premium-stat-label">연속 성공</div>
                    </div>
                </div>

                <div class="premium-block">
                    <h4>📅 요일별 패턴</h4>
                    <div class="day-pattern">
                        ${weekDays.map(day => {
                            const data = dayCount[day];
                            const rate = data.total > 0 ? Math.round((data.success / data.total) * 100) : 0;
                            const height = Math.max(rate, 5);
                            return `
                                <div class="day-bar-wrap">
                                    <div class="day-bar" style="height: ${height}%; background: ${rate >= 70 ? 'var(--primary)' : rate >= 40 ? 'var(--warning)' : 'var(--danger)'}"></div>
                                    <span class="day-label">${day}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <p class="pattern-note">최고 성과 요일: <strong>${bestDay}요일</strong></p>
                </div>

                <div class="premium-block">
                    <h4>🎯 개인 맞춤 조언</h4>
                    <ul class="premium-tips-list">
                        ${tips.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>

                <div class="premium-block">
                    <h4>📊 총 디톡스 시간</h4>
                    <p class="total-time-display">${this.stats.totalMinutes >= 60 ? `${Math.floor(this.stats.totalMinutes / 60)}시간 ${this.stats.totalMinutes % 60}분` : `${this.stats.totalMinutes}분`}</p>
                    <p class="time-note">스마트폰 없이 보낸 소중한 시간입니다</p>
                </div>
            </div>
        `;

        body.innerHTML = html;
        modal.classList.add('active');
    }

    closePremiumModal() {
        const modal = document.getElementById('premium-modal');
        if (modal) {
            modal.classList.remove('active');
        }
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
