/**
 * 分类加载器
 * 加载分类数据并渲染分类列表和分类详情页
 */

// 分类数据缓存
let categoriesData = null;

/**
 * 获取 URL 查询参数
 */
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

/**
 * 加载分类数据
 */
async function loadCategories() {
  try {
    const response = await fetch('./categories.json');
    if (response.ok) {
      categoriesData = await response.json();
      return categoriesData;
    }
  } catch (error) {
    console.error('Failed to load categories:', error);
  }
  return { categories: [] };
}

/**
 * 加载指定文章
 */
async function loadPostById(postId) {
  const base = getBasePath();
  try {
    const response = await fetch(`${base}posts/${postId}.json`);
    if (response.ok) {
      const post = await response.json();
      post.id = postId;
      return post;
    }
  } catch (error) {
    console.error(`Failed to load post ${postId}:`, error);
  }
  return null;
}

/**
 * 初始化分类页面
 */
async function initCategoryPage() {
  const categoryName = getQueryParam('category');
  
  if (categoryName) {
    // 显示分类详情页
    await showCategoryDetail(categoryName);
  } else {
    // 显示分类列表页
    await showCategoriesList();
  }
}

/**
 * 显示分类列表页
 */
async function showCategoriesList() {
  // 显示列表页，隐藏详情页
  document.getElementById('categoriesListPage').classList.remove('hidden');
  document.getElementById('categoryDetailPage').classList.add('hidden');
  document.getElementById('loadingState').classList.add('hidden');
  document.getElementById('errorState').classList.add('hidden');
  
  // 加载分类数据
  const data = await loadCategories();
  
  if (!data.categories || data.categories.length === 0) {
    document.getElementById('errorState').classList.remove('hidden');
    return;
  }
  
  // 渲染分类列表
  renderCategoriesList(data.categories);
}

/**
 * 渲染分类列表
 */
function renderCategoriesList(categories) {
  const container = document.getElementById('categoriesGrid');
  if (!container) return;
  
  const categoriesHTML = categories.map(category => `
    <a href="?category=${encodeURIComponent(category.name)}" class="category-card">
      <h2 class="category-name">${category.name}</h2>
      <div class="category-count">${category.postIds.length} 篇文章</div>
      <p class="category-description">${category.description}</p>
    </a>
  `).join('');
  
  container.innerHTML = categoriesHTML;
}

/**
 * 显示分类详情页
 */
async function showCategoryDetail(categoryName) {
  // 显示加载状态
  document.getElementById('loadingState').classList.remove('hidden');
  document.getElementById('categoriesListPage').classList.add('hidden');
  
  // 加载分类数据
  const data = await loadCategories();
  
  // 查找指定分类
  const category = data.categories.find(c => c.name === categoryName);
  
  if (!category) {
    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('errorState').classList.remove('hidden');
    return;
  }
  
  // 加载该分类下的所有文章
  const posts = [];
  for (const postId of category.postIds) {
    const post = await loadPostById(postId);
    if (post && !post.ignore) {
      posts.push(post);
    }
  }
  
  // 按创建时间倒序排序
  posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  // 渲染分类详情
  renderCategoryDetail(category, posts);
  
  // 隐藏加载状态，显示详情页
  document.getElementById('loadingState').classList.add('hidden');
  document.getElementById('categoryDetailPage').classList.remove('hidden');
}

/**
 * 渲染分类详情
 */
function renderCategoryDetail(category, posts) {
  // 更新页面标题
  document.title = `${category.name} | 墨言`;
  
  // 更新分类信息
  document.getElementById('categoryDetailName').textContent = category.name;
  document.getElementById('categoryDetailDescription').textContent = category.description;
  
  // 渲染文章列表
  renderCategoryPosts(posts);
}

/**
 * 渲染分类下的文章列表
 */
function renderCategoryPosts(posts) {
  const container = document.getElementById('categoryPostList');
  if (!container) return;
  
  if (posts.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--color-text-muted); padding: 60px 0;">该分类下暂无文章</p>';
    return;
  }
  
  const postsHTML = posts.map(post => `
    <article class="post-card">
      <div class="post-thumbnail">
        <img src="${post.image}" alt="${post.alt || post.title}" loading="lazy">
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
  
  container.innerHTML = postsHTML;
}

/**
 * 生成文章 URL
 */
function getPostUrl(postId) {
  return `${getBasePath()}post/?id=${postId}`;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initCategoryPage);
