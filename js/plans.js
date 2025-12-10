document.addEventListener('DOMContentLoaded', function() {
    // 处理导航栏菜单切换
    const menuToggle = document.querySelector('.menu-toggle');
    const navItems = document.querySelector('.nav-items');
    
    if (menuToggle && navItems) {
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            menuToggle.classList.toggle('is-clicked');
            navItems.classList.toggle('is-open');
        });
        
        // 点击导航项后关闭菜单
        const navLinks = navItems.querySelectorAll('.nav-item');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                menuToggle.classList.remove('is-clicked');
                navItems.classList.remove('is-open');
            });
        });
        
        // 点击菜单外部关闭菜单
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.navbar')) {
                menuToggle.classList.remove('is-clicked');
                navItems.classList.remove('is-open');
            }
        });
    }
    
    // 处理行动召唤按钮点击事件
    const ctaButtons = document.querySelectorAll('.cta-button');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 这里可以添加表单提交或跳转逻辑
            alert('感谢您的关注！我们将尽快与您联系。');
        });
    });
    

    
    // 添加视差滚动效果
    const planHeader = document.querySelector('.plan-header');
    if (planHeader) {
        window.addEventListener('scroll', function() {
            const scrollPosition = window.scrollY;
            planHeader.style.backgroundPositionY = `${scrollPosition * 0.5}px`;
        });
    }
});