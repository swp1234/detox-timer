// 다국어 지원 시스템 (i18n) - Detox Timer

class I18n {
    constructor() {
        this.supportedLanguages = ['ko', 'en', 'ja', 'es', 'pt', 'zh', 'id', 'tr', 'de', 'fr', 'hi', 'ru'];
        this.translations = {};
        this.currentLang = this.detectLanguage();
    }

    detectLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        const langCode = browserLang.split('-')[0];

        const savedLang = localStorage.getItem('app_language');
        if (savedLang && this.supportedLanguages.includes(savedLang)) {
            return savedLang;
        }

        if (this.supportedLanguages.includes(langCode)) {
            return langCode;
        }

        return 'en';
    }

    async loadTranslations(lang) {
        try {
            // 이미 로드된 언어는 캐시에서 반환
            if (this.translations[lang]) {
                return true;
            }

            const response = await fetch(`js/locales/${lang}.json`);
            if (!response.ok) throw new Error('Translation file not found');
            const data = await response.json();
            this.translations[lang] = data;
            return true;
        } catch (error) {
            console.error(`Failed to load ${lang} translations:`, error);
            if (lang !== 'en') {
                // 현재 언어 로드 실패 시 영어로 폴백
                return this.loadTranslations('en');
            }
            return false;
        }
    }

    t(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLang];

        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                console.warn(`Translation missing for key: ${key} in ${this.currentLang}`);
                return key;
            }
        }

        return value;
    }

    async setLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) {
            console.error(`Unsupported language: ${lang}`);
            return false;
        }

        if (!this.translations[lang]) {
            await this.loadTranslations(lang);
        }

        this.currentLang = lang;
        localStorage.setItem('app_language', lang);
        document.documentElement.lang = lang;

        this.updateUI();
        return true;
    }

    updateUI() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.t(key);
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });

        document.title = this.t('app.title');

        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.content = this.t('app.description');
        }
    }

    getCurrentLanguage() {
        return this.currentLang;
    }

    getSupportedLanguages() {
        return this.supportedLanguages.map(lang => ({
            code: lang,
            name: this.getLanguageName(lang)
        }));
    }

    getLanguageName(lang) {
        const names = {
            'ko': '한국어',
            'en': 'English',
            'ja': '日本語',
            'es': 'Español',
            'pt': 'Português',
            'zh': '简体中文',
            'id': 'Bahasa Indonesia',
            'tr': 'Türkçe',
            'de': 'Deutsch',
            'fr': 'Français',
            'hi': 'हिन्दी',
            'ru': 'Русский'
        };
        return names[lang] || lang;
    }
}

const i18n = new I18n();
