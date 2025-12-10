// 文章组件类
class ArticleComponent {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            markdownPath: options.markdownPath || 'test-markdown.md',
            ...options
        };
        this.articleContent = container.querySelector('.article-content');
        
        this.init();
    }
    
    // 初始化组件
    init() {
        this.setupMobileMenu();
        this.loadAndRenderMarkdown();
    }
    
    // 移动端菜单切换功能
    setupMobileMenu() {
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
    }
    
    // 从Markdown内容中提取标题
    extractHeadings(markdownContent) {
        const lines = markdownContent.split('\n');
        const headings = [];
        
        lines.forEach(line => {
            // 严格匹配Markdown标题语法：#符号后直接跟随标题文本（允许一个或多个空格）
            const match = line.match(/^(#{1,6})\s+(.*)$/);
            if (match) {
                const level = match[1].length;
                const text = match[2];
                headings.push({ level, text });
            }
        });
        
        return headings;
    }
    
    // 生成HTML格式的目录
    generateHTMLTOC(headings) {
        if (headings.length === 0) {
            return '';
        }
        
        let tocHTML = '<nav class="table-of-contents" aria-label="文章目录">\n';
        tocHTML += '<h2 class="toc-title">目录</h2>\n';
        tocHTML += '<ul class="toc-list">\n';
        
        let currentLevel = 1;
        
        headings.forEach(heading => {
            const { level, text } = heading;
            const id = text;
            
            // 处理层级变化
            if (level > currentLevel) {
                // 增加层级
                for (let i = currentLevel; i < level; i++) {
                    tocHTML += '<ul class="toc-sublist">\n';
                }
            } else if (level < currentLevel) {
                // 减少层级
                for (let i = currentLevel; i > level; i--) {
                    tocHTML += '</ul>\n';
                }
            }
            
            // 生成目录项
            tocHTML += `<li class="toc-item"><a class="toc-link" href="#${id}" aria-label="跳转到${text}">${text}</a></li>\n`;
            
            currentLevel = level;
        });
        
        // 关闭所有未闭合的层级
        for (let i = currentLevel; i > 1; i--) {
            tocHTML += '</ul>\n';
        }
        
        tocHTML += '</ul>\n';
        tocHTML += '</nav>\n';
        
        return tocHTML;
    }
    
    // 为标题添加ID和锚点链接图标
    addHeadingAnchors() {
        const headings = this.articleContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
        
        headings.forEach(heading => {
            const text = heading.textContent;
            // 每个标题的id属性值必须严格设置为标题文本内容
            const id = text;
            heading.id = id;
            
            // 创建锚点链接元素
            const anchorLink = document.createElement('a');
            anchorLink.className = 'heading-anchor';
            anchorLink.href = `#${id}`;
            anchorLink.innerHTML = '#';
            anchorLink.title = '复制链接到标题';
            
            // 添加到标题
            heading.appendChild(anchorLink);
        });
    }
    
    // 目录高亮功能
    setupTOCHighlighting() {
        const tocLinks = this.container.querySelectorAll('.toc-link');
        const headings = this.articleContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
        
        if (tocLinks.length === 0) {
            return;
        }
        
        // 创建节间距离映射
        function createSections() {
            const sections = [];
            headings.forEach(heading => {
                const id = heading.getAttribute('id');
                if (id) {
                    sections.push({
                        id: id,
                        element: heading
                    });
                }
            });
            return sections;
        }
        
        let sections = createSections();
        
        // 防抖函数，避免频繁触发滚动事件导致性能问题
        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
        
        function updateTOCHighlight() {
            // 获取导航栏的实际高度（从CSS中可以看到是60px）
            const navbarHeight = 60;
            
            // 移除所有活动状态
            tocLinks.forEach(link => {
                link.classList.remove('active');
            });
            
            // 查找当前活动的部分 - 标题顶部完全显示在导航栏下方的部分
            let currentSection = null;
            for (let i = 0; i < sections.length; i++) {
                const section = sections[i];
                // 获取元素相对于视口的位置
                const rect = section.element.getBoundingClientRect();
                
                // 检查标题是否完全显示在导航栏下方（标题顶部 >= 导航栏底部）
                const isVisible = rect.top >= navbarHeight;
                
                // 如果找到第一个完全可见的标题，就将其设为当前活动部分
                // 如果所有标题都不可见，则选择最后一个标题
                if (isVisible || i === sections.length - 1) {
                    currentSection = section;
                    break;
                }
            }
            
            // 高亮当前部分对应的目录项
            if (currentSection) {
                const activeLink = document.querySelector(`.toc-link[href="#${currentSection.id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                    
                    // 只在宽屏设备上才让目录项滚动，避免非宽屏设备的抽搐问题
                    if (window.innerWidth >= 1200) {
                        // 确保当前激活的目录项可见
                        activeLink.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                    }
                }
            }
        }
        
        // 使用防抖优化滚动事件，减少触发频率
        const debouncedUpdateTOCHighlight = debounce(updateTOCHighlight, 100);
        
        // 监听滚动事件
        window.addEventListener('scroll', debouncedUpdateTOCHighlight);
        
        // 初始化高亮
        updateTOCHighlight();
    }
    
    // 加载并渲染Markdown文件
    async loadAndRenderMarkdown() {
        try {
            // 直接使用Markdown内容作为备份，确保页面能正常显示
            let markdownContent = '# 测试标题\n\n## 1. 第一个带数字的标题\n\n这是第一个带数字的标题内容。\n\n## 2. 第二个带数字的标题\n\n这是第二个带数字的标题内容。\n\n## 3. 第三个带数字的标题\n\n这是第三个带数字的标题内容。';
            
            // 从文件路径中提取文件名（不含扩展名）作为文章标题
            const fileName = this.options.markdownPath.split('/').pop().replace('.md', '');
            
            try {
                // 尝试从文件系统加载Markdown文件
                const response = await fetch(this.options.markdownPath);
                if (response.ok) {
                    markdownContent = await response.text();
                } else {
                    console.warn('无法从服务器加载Markdown文件，使用内置内容');
                }
            } catch (fetchError) {
                console.warn('Fetch请求失败，使用内置内容:', fetchError.message);
            }
            
            // 使用marked.js渲染Markdown内容
            const htmlContent = marked.parse(markdownContent);
            
            // 创建文章标题和信息区域
            const articleInfoHTML = this.createArticleInfo(fileName);
            
            // 将标题、信息区域和渲染后的内容组合
            this.articleContent.innerHTML = articleInfoHTML + htmlContent;
            
            // 添加标题锚点
            this.addHeadingAnchors();
            
            // 提取所有标题
            const headings = this.extractHeadings(markdownContent);
            
            // 生成HTML格式的目录
            const tocHTML = this.generateHTMLTOC(headings);
            
            // 检查是否已经存在目录，如果存在则移除
            let tocElement = this.container.querySelector('.table-of-contents');
            if (tocElement) {
                tocElement.remove();
            }
            
            // 将目录插入到.article-container中，作为.article-content的兄弟元素
            if (tocHTML) {
                this.articleContent.insertAdjacentHTML('beforebegin', tocHTML);
            }
            
            // 设置目录高亮
            this.setupTOCHighlighting();
        } catch (error) {
            console.error('Error loading Markdown:', error);
            this.articleContent.innerHTML = `<p>Failed to load article content. Error: ${error.message}</p>`;
        }
    }
    
    // 创建文章标题和信息区域
    createArticleInfo(title) {
        // 模拟文章信息（实际项目中可以从Markdown文件或API获取）
        const articleInfo = {
            author: 'BAINANO',
            publishDate: '2025-12-10',
            category: '技术'
        };
        
        // 创建符合博客列表页面设计风格的HTML
        return `
            <div class="article-info">
                <h1 class="article-title">${title}</h1>
                <div class="article-meta">
                    <span class="article-author">
                        <strong>作者：</strong>${articleInfo.author}
                    </span>
                    <span class="article-date">
                        <strong>发布时间：</strong>${articleInfo.publishDate}
                    </span>
                    <span class="article-category">
                        <strong>分类：</strong>${articleInfo.category}
                    </span>
                </div>
            </div>
        `;
    }
}

// 页面加载完成后初始化组件
document.addEventListener('DOMContentLoaded', function() {
    // 查找所有带有data-article-component属性的容器
    const articleContainers = document.querySelectorAll('[data-article-component]');
    
    articleContainers.forEach(container => {
        // 从data属性中获取配置
        const markdownPath = container.getAttribute('data-markdown-path') || 'test-markdown.md';
        
        // 初始化文章组件
        new ArticleComponent(container, {
            markdownPath: markdownPath
        });
    });
});