/**
 * 文章加载器
 * 从 posts 文件夹读取 JSON 文章并渲染
 */

/**
 * 获取 URL 查询参数
 */
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

/**
 * 加载文章
 */
async function loadPost() {
  const postId = getQueryParam('id');
  
  if (!postId) {
    showError();
    return;
  }
  
  try {
    // 加载文章元数据
    const base = getBasePath();
    const response = await fetch(`${base}posts/${postId}.json`);
    if (!response.ok) {
      throw new Error('Post not found');
    }
    
    const post = await response.json();
    
    // 加载 Markdown 内容
    if (post.contentFile) {
      const contentResponse = await fetch(`${base}${post.contentFile}`);
      if (contentResponse.ok) {
        post.content = await contentResponse.text();
      }
    }
    
    // 加载文章列表用于导航
    const postIds = await scanPostIds();
    const posts = await loadPostList(postIds);
    
    renderPost(post);
    renderNavigation(posts, postId);
    
  } catch (error) {
    console.error('Failed to load post:', error);
    showError();
  }
}

/**
 * 渲染文章
 */
function renderPost(post) {
  // 隐藏加载状态
  document.getElementById('loadingState').style.display = 'none';
  
  // 更新页面标题
  document.title = `${post.title} | 墨言`;
  
  // 渲染文章头部
  document.getElementById('articleCategory').textContent = post.category || '生活';
  document.getElementById('articleTitle').textContent = post.title;
  document.getElementById('articleDate').textContent = formatDate(post.createdAt);
  document.getElementById('articleHeader').style.display = 'block';
  
  // 渲染特色图片
  if (post.image) {
    const imgElement = document.getElementById('articleImage');
    imgElement.src = post.image;
    imgElement.alt = post.alt || post.title;
    document.getElementById('articleImageContainer').style.display = 'block';
  }
  
  // 渲染 Markdown 内容
  const articleBody = document.getElementById('articleBody');
  if (post.content) {
    articleBody.innerHTML = parseMarkdown(post.content);
  } else {
    articleBody.innerHTML = '';
  }
  articleBody.style.display = 'block';
  
  // 显示文章导航容器
  document.getElementById('articleNav').style.display = 'grid';
}

/**
 * 渲染文章导航（上一篇/下一篇）
 */
function renderNavigation(posts, currentId) {
  const currentIndex = posts.findIndex(p => String(p.id) === String(currentId));
  
  if (currentIndex === -1) {
    document.getElementById('articleNav').style.display = 'none';
    return;
  }
  
  const navPrev = document.getElementById('navPrev');
  const navNext = document.getElementById('navNext');
  
  // 上一篇
  if (currentIndex > 0) {
    const prevPost = posts[currentIndex - 1];
    document.getElementById('navPrevTitle').textContent = prevPost.title;
    document.getElementById('navPrevTitle').href = `?id=${prevPost.id}`;
    navPrev.style.display = 'flex';
  } else {
    navPrev.style.display = 'none';
  }
  
  // 下一篇
  if (currentIndex < posts.length - 1) {
    const nextPost = posts[currentIndex + 1];
    document.getElementById('navNextTitle').textContent = nextPost.title;
    document.getElementById('navNextTitle').href = `?id=${nextPost.id}`;
    navNext.style.display = 'flex';
  } else {
    navNext.style.display = 'none';
  }
}

/**
 * 显示错误状态
 */
function showError() {
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('errorState').style.display = 'block';
}

// 页面加载完成后加载文章
document.addEventListener('DOMContentLoaded', loadPost);
