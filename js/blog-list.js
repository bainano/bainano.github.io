// 博客列表页面交互逻辑

// 示例博客文章数据
const blogPosts = [
    {
        id: 1,
        title: "如何使用Markdown编写技术文档",
        excerpt: "Markdown是一种轻量级标记语言，广泛用于技术文档编写。本文将介绍Markdown的基本语法和高级技巧...",
        category: "tech",
        date: "2025-01-15",
        readTime: "5分钟阅读"
    },
    {
        id: 2,
        title: "网页设计中的色彩搭配原则",
        excerpt: "良好的色彩搭配能够提升用户体验，传达品牌价值。本文探讨了网页设计中色彩搭配的核心原则和实践方法...",
        category: "design",
        date: "2025-01-10",
        readTime: "8分钟阅读"
    },
    {
        id: 3,
        title: "远程工作的效率提升技巧",
        excerpt: "远程工作已成为现代职场的重要趋势。如何在这种工作模式下保持高效？本文分享了一些实用的经验和技巧...",
        category: "life",
        date: "2025-01-05",
        readTime: "6分钟阅读"
    },
    {
        id: 4,
        title: "JavaScript异步编程详解",
        excerpt: "异步编程是JavaScript的核心特性之一。本文深入讲解了Promise、async/await等异步编程技术...",
        category: "tech",
        date: "2024-12-28",
        readTime: "12分钟阅读"
    },
    {
        id: 5,
        title: "响应式设计的最佳实践",
        excerpt: "随着设备类型的多样化，响应式设计变得至关重要。本文介绍了实现响应式设计的关键技术和最佳实践...",
        category: "design",
        date: "2024-12-20",
        readTime: "10分钟阅读"
    },
    {
        id: 6,
        title: "健康生活方式的养成",
        excerpt: "现代生活节奏加快，如何保持健康的生活方式？本文从饮食、运动、作息等方面提供了全面的建议...",
        category: "life",
        date: "2024-12-15",
        readTime: "7分钟阅读"
    }
];

// 当前页面状态
let currentPage = 1;
const postsPerPage = 4;
let filteredPosts = [...blogPosts];

// DOM元素
const blogPostsContainer = document.getElementById('blogPostsContainer');
const paginationContainer = document.getElementById('paginationContainer');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const categoryFilter = document.getElementById('categoryFilter');

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    // 绑定事件监听器
    bindEventListeners();
    
    // 渲染初始内容
    renderBlogPosts();
    renderPagination();
});

// 绑定事件监听器
function bindEventListeners() {
    // 搜索按钮点击事件
    searchButton.addEventListener('click', handleSearch);
    
    // 回车键触发搜索
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // 分类筛选变化事件
    categoryFilter.addEventListener('change', handleCategoryFilter);
}

// 处理搜索
function handleSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (searchTerm === '') {
        filteredPosts = [...blogPosts];
    } else {
        filteredPosts = blogPosts.filter(post => 
            post.title.toLowerCase().includes(searchTerm) || 
            post.excerpt.toLowerCase().includes(searchTerm)
        );
    }
    
    currentPage = 1;
    renderBlogPosts();
    renderPagination();
}

// 处理分类筛选
function handleCategoryFilter() {
    const selectedCategory = categoryFilter.value;
    
    if (selectedCategory === 'all') {
        filteredPosts = [...blogPosts];
    } else {
        filteredPosts = blogPosts.filter(post => post.category === selectedCategory);
    }
    
    currentPage = 1;
    renderBlogPosts();
    renderPagination();
}

// 渲染博客文章
function renderBlogPosts() {
    // 计算当前页的文章
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const postsToShow = filteredPosts.slice(startIndex, endIndex);
    
    // 清空容器
    blogPostsContainer.innerHTML = '';
    
    // 如果没有文章显示提示
    if (postsToShow.length === 0) {
        blogPostsContainer.innerHTML = `
            <div class="no-posts-message">
                <p>没有找到相关文章。</p>
            </div>
        `;
        return;
    }
    
    // 渲染文章卡片
    postsToShow.forEach(post => {
        const postCard = createPostCard(post);
        blogPostsContainer.appendChild(postCard);
    });
}

// 创建文章卡片元素
function createPostCard(post) {
    const card = document.createElement('div');
    card.className = 'blog-post-card';
    
    // 获取分类名称
    const categoryNames = {
        'tech': '技术',
        'design': '设计',
        'life': '生活'
    };
    
    card.innerHTML = `
        <div class="blog-post-image">
            文章封面图片
        </div>
        <div class="blog-post-content">
            <span class="blog-post-category">${categoryNames[post.category] || post.category}</span>
            <h3 class="blog-post-title">
                <a href="article.html">${post.title}</a>
            </h3>
            <p class="blog-post-excerpt">${post.excerpt}</p>
            <div class="blog-post-meta">
                <span class="blog-post-date">${post.date}</span>
                <span class="blog-post-read-time">${post.readTime}</span>
            </div>
        </div>
    `;
    
    return card;
}

// 渲染分页
function renderPagination() {
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
    
    // 清空分页容器
    paginationContainer.innerHTML = '';
    
    // 如果只有一页或没有文章，不显示分页
    if (totalPages <= 1) {
        return;
    }
    
    // 创建分页按钮
    const fragment = document.createDocumentFragment();
    
    // 上一页按钮
    const prevButton = createPaginationButton('上一页', currentPage === 1);
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderBlogPosts();
            renderPagination();
            scrollToTop();
        }
    });
    fragment.appendChild(prevButton);
    
    // 页码按钮
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = createPaginationButton(i, false, i === currentPage);
        pageButton.addEventListener('click', () => {
            currentPage = i;
            renderBlogPosts();
            renderPagination();
            scrollToTop();
        });
        fragment.appendChild(pageButton);
    }
    
    // 下一页按钮
    const nextButton = createPaginationButton('下一页', currentPage === totalPages);
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderBlogPosts();
            renderPagination();
            scrollToTop();
        }
    });
    fragment.appendChild(nextButton);
    
    paginationContainer.appendChild(fragment);
}

// 创建分页按钮
function createPaginationButton(text, disabled = false, active = false) {
    const button = document.createElement('button');
    button.className = 'pagination-button';
    button.textContent = text;
    
    if (disabled) {
        button.classList.add('disabled');
        button.disabled = true;
    }
    
    if (active) {
        button.classList.add('active');
    }
    
    return button;
}

// 滚动到页面顶部
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// 移动端菜单切换功能（复用主页的逻辑）
document.addEventListener('DOMContentLoaded', function() {
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
});