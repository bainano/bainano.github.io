/**
 * 墨言博客 - 主要交互脚本
 */

document.addEventListener('DOMContentLoaded', function() {
  // 移动端菜单切换
  initMobileMenu();
  
  // 导航栏滚动效果
  initNavbarScroll();
  
  // 平滑滚动
  initSmoothScroll();
  
  // 图片懒加载优化
  initLazyLoad();
});

/**
 * 移动端菜单切换
 */
function initMobileMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  
  if (!menuToggle || !navMenu) return;
  
  menuToggle.addEventListener('click', function() {
    navMenu.classList.toggle('active');
    document.body.classList.toggle('menu-open');
  });
  
  // 点击菜单项后关闭菜单
  const navLinks = navMenu.querySelectorAll('a');
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      navMenu.classList.remove('active');
      document.body.classList.remove('menu-open');
    });
  });
  
  // 点击外部关闭菜单
  document.addEventListener('click', function(e) {
    if (!menuToggle.contains(e.target) && !navMenu.contains(e.target)) {
      navMenu.classList.remove('active');
      document.body.classList.remove('menu-open');
    }
  });
}

/**
 * 导航栏滚动效果
 */
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  
  let lastScrollY = window.scrollY;
  let ticking = false;
  
  function updateNavbar() {
    const scrollY = window.scrollY;
    
    // 滚动超过50px添加阴影效果
    if (scrollY > 50) {
      navbar.style.boxShadow = '0 1px 0 rgba(0, 0, 0, 0.05)';
    } else {
      navbar.style.boxShadow = 'none';
    }
    
    lastScrollY = scrollY;
    ticking = false;
  }
  
  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  }, { passive: true });
}

/**
 * 平滑滚动
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

/**
 * 图片懒加载优化
 */
function initLazyLoad() {
  // 检查浏览器是否支持 IntersectionObserver
  if (!('IntersectionObserver' in window)) {
    // 不支持则直接加载所有图片
    document.querySelectorAll('img[data-src]').forEach(img => {
      img.src = img.dataset.src;
    });
    return;
  }
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px 0px',
    threshold: 0.01
  });
  
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

/**
 * 简单的淡入动画
 */
function fadeInElements() {
  const elements = document.querySelectorAll('.fade-in');
  
  if (!('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('visible'));
    return;
  }
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1
  });
  
  elements.forEach(el => observer.observe(el));
}

// 页面加载完成后执行淡入动画
document.addEventListener('DOMContentLoaded', fadeInElements);
