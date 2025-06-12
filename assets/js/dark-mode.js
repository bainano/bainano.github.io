// 主题切换功能
class ThemeToggle {
    constructor() {
        this.theme = localStorage.getItem('theme') || 
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        
        // 初始化主题
        this.setTheme(this.theme);
        
        // 监听系统主题变化
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        this.mediaQuery.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    setTheme(newTheme) {
        this.theme = newTheme;
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // 更新按钮图标
        const moonIcon = document.querySelector('.theme-toggle .moon-icon');
        const sunIcon = document.querySelector('.theme-toggle .sun-icon');
        
        if (moonIcon && sunIcon) {
            if (newTheme === 'dark') {
                moonIcon.style.display = 'none';
                sunIcon.style.display = 'block';
            } else {
                moonIcon.style.display = 'block';
                sunIcon.style.display = 'none';
            }
        }
    }

    toggle() {
        this.setTheme(this.theme === 'dark' ? 'light' : 'dark');
    }
}

// 初始化主题切换功能
window.themeToggle = new ThemeToggle();