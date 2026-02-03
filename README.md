# 🧘 디지털 디톡스 타이머

스마트폰 사용 시간을 줄이고 집중력을 높이는 PWA 앱

## 📱 기능

- **시간 선택**: 5분 ~ 2시간 디톡스 시간 설정
- **타이머**: 시각적 프로그레스 링과 카운트다운
- **호흡 가이드**: 명상을 위한 호흡 안내
- **동기부여 메시지**: 랜덤 동기부여 문구
- **통계 추적**: 총 세션, 성공률, 누적 시간
- **결과 공유**: SNS 공유 기능

## 🛠 기술 스택

- HTML5, CSS3, JavaScript (Vanilla)
- Progressive Web App (PWA)
- LocalStorage (통계 저장)
- SVG 아이콘

## 📁 파일 구조

```
detox-timer/
├── index.html          # 메인 HTML
├── manifest.json       # PWA 설정
├── css/
│   └── style.css       # 스타일
├── js/
│   └── app.js          # 앱 로직
├── icon-192.svg        # 앱 아이콘 (192x192)
├── icon-512.svg        # 앱 아이콘 (512x512)
└── README.md
```

## 🚀 배포

```bash
git init
git add .
git commit -m "Initial commit: Digital Detox Timer PWA"
git remote add origin https://github.com/swp1234/detox-timer.git
git push -u origin main
```

GitHub Pages에서 배포 활성화 후 접속:
https://swp1234.github.io/detox-timer/

## 💡 광고 영역

- 상단 배너: 50px
- 하단 배너: 60px
- 전면 광고: 포기 시 5초 카운트다운 후 닫기 가능

## 📊 통계 저장

LocalStorage에 다음 정보 저장:
- 총 세션 수
- 성공 세션 수
- 총 디톡스 시간 (분)
- 연속 성공 횟수
- 마지막 세션 날짜
