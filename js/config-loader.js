/**
 * 配置文件加载器
 * 从 config.json 和 posts 文件夹加载配置并渲染到页面
 */

// 全局配置对象
let siteConfig = null;
let postList = { posts: [] };

/**
 * 加载配置文件
 */
async function loadConfig() {
  const base = getBasePath();
  try {
    // 加载站点配置
    const configResponse = await fetch(`${base}config.json`);
    if (configResponse.ok) {
      siteConfig = await configResponse.json();
      renderConfig();
    }
    
    // 从 posts 文件夹加载文章列表
    await loadPostListFromFolder();
    renderPostList();
    
    return { siteConfig, postList };
  } catch (error) {
    console.error('Config loading error:', error);
    return null;
  }
}

/**
 * 从 posts 文件夹加载文章列表
 */
async function loadPostListFromFolder() {
  const postIds = await scanPostIds();
  const posts = await loadPostList(postIds);
  postList = { posts };
}

/**
 * 根据配置渲染页面内容
 */
function renderConfig() {
  if (!siteConfig) return;
  
  // 渲染导航
  renderNav();
  
  // 渲染头部标题
  renderHeader();
  
  // 渲染页脚
  renderFooter();
  
  // 渲染页面标题
  renderPageTitle();
  
  // 渲染友情链接
  renderFriends();
}

/**
 * 渲染导航
 */
function renderNav() {
  const navMenu = document.getElementById('navMenu');
  if (!navMenu) return;
  
  const navLinks = siteConfig.headerNav || siteConfig.nav;
  if (!navLinks) return;
  
  navMenu.innerHTML = navLinks.map(item => 
    `<li><a href="${item.url}">${item.text}</a></li>`
  ).join('');
}

/**
 * 渲染头部标题
 */
function renderHeader() {
  if (!siteConfig.header) return;
  
  const pageTitle = document.querySelector('.page-title');
  const pageSubtitle = document.querySelector('.page-subtitle');
  
  if (pageTitle && siteConfig.header.title) {
    pageTitle.textContent = siteConfig.header.title;
  }
  
  if (pageSubtitle && siteConfig.header.subtitle) {
    pageSubtitle.textContent = siteConfig.header.subtitle;
  }
}

/**
 * 渲染页脚
 */
function renderFooter() {
  if (!siteConfig.footer) return;
  
  // 渲染描述
  const footerDesc = document.querySelector('.footer-desc');
  if (footerDesc) {
    const line1 = siteConfig.footer.description || '';
    const line2 = siteConfig.footer.descriptionLine2 || '';
    footerDesc.innerHTML = `${line1}<br>${line2}`;
  }
  
  // 渲染链接
  const footerLinks = document.querySelector('.footer-links');
  const footerNavLinks = siteConfig.footerNav || siteConfig.footer.links;
  if (footerLinks && footerNavLinks) {
    footerLinks.innerHTML = footerNavLinks.map(link => 
      `<a href="${link.url}">${link.text}</a>`
    ).join('');
  }
  
  // 渲染版权
  const copyright = document.querySelector('.copyright');
  if (copyright && siteConfig.footer.copyright) {
    copyright.textContent = siteConfig.footer.copyright;
  }
}

/**
 * 渲染页面标题和 logo
 */
function renderPageTitle() {
  if (!siteConfig.site) return;
  
  // 更新 logo 文字
  const logos = document.querySelectorAll('.logo, .footer-logo');
  logos.forEach(logo => {
    if (siteConfig.site.name) {
      logo.textContent = siteConfig.site.name;
    }
  });
  
  // 更新页面标题
  if (siteConfig.site.name) {
    const titleSuffix = siteConfig.site.name;
    const currentTitle = document.title;
    if (!currentTitle.includes(titleSuffix)) {
      document.title = currentTitle + ' | ' + titleSuffix;
    }
  }
}

/**
 * 渲染友情链接
 */
function renderFriends() {
  const friendsGrid = document.getElementById('friendsGrid');
  if (!friendsGrid || !siteConfig.friends) return;
  
  friendsGrid.innerHTML = siteConfig.friends.map(friend => `
    <a href="${friend.url}" target="_blank" rel="noopener" class="friend-card">
      <img src="${friend.image}" alt="${friend.title}" class="friend-image">
      <span class="friend-title">${friend.title}</span>
    </a>
  `).join('');
}

/**
 * 生成文章 URL
 */
function getPostUrl(postId) {
  return `post/?id=${postId}`;
}

/**
 * 渲染文章列表
 */
function renderPostList() {
  if (!postList || !postList.posts || postList.posts.length === 0) return;
  
  const postListContainer = document.getElementById('postList');
  if (!postListContainer) return;
  
  const postsHTML = postList.posts.map(post => `
    <article class="post-card">
      <div class="post-thumbnail">
        <img src="${post.image}" alt="${post.alt}" loading="lazy">
      </div>
      <div class="post-content">
        <div class="post-meta">
          <span class="post-category">${post.category}</span>
          <span class="post-date">${formatDate(post.createdAt)}</span>
        </div>
        <h2 class="post-title">
          <a href="${getPostUrl(post.id)}">${post.title}</a>
        </h2>
        <p class="post-excerpt">${post.excerpt}</p>
        <a href="${getPostUrl(post.id)}" class="read-more">阅读全文</a>
      </div>
    </article>
  `).join('');
  
  postListContainer.innerHTML = postsHTML;
}

// 页面加载完成后自动加载配置
document.addEventListener('DOMContentLoaded', loadConfig);
