// 监听深色模式变化并更新giscus主题
function updateGiscusTheme() {
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    const theme = isDarkMode ? 'dark' : 'light';
    
    // 查找所有giscus iframe
    const giscusFrames = document.querySelectorAll('iframe.giscus-frame');
    
    giscusFrames.forEach(frame => {
        // 发送主题切换消息给giscus iframe
        frame.contentWindow.postMessage(
            {
                giscus: {
                    setConfig: {
                        theme: theme
                    }
                }
            },
            'https://giscus.app'
        );
    });
}

// 创建观察器来监听data-theme属性的变化
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
            updateGiscusTheme();
        }
    });
});

// 开始观察document.documentElement的data-theme属性变化
observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
});

// 页面加载时初始化主题
document.addEventListener('DOMContentLoaded', updateGiscusTheme);

// 当giscus加载完成时也更新主题
window.addEventListener('message', function(e) {
    if (e.origin !== 'https://giscus.app') return;
    if (e.data?.giscus?.discussion?.ready) {
        updateGiscusTheme();
    }
});