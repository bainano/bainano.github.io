/**
 * 通用工具函数库
 */

/**
 * 获取基础路径
 * 根据当前页面路径返回正确的基础路径
 */
function getBasePath() {
  const path = window.location.pathname;
  if (path.includes('/post/') || path.includes('/about/') || path.includes('/friends/') || path.includes('/categories/')) {
    return '../';
  }
  return '';
}

/**
 * 格式化日期
 * 将日期字符串格式化为 "YYYY年MM月DD日 HH:mm"
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${hours}:${minutes}`;
}

/**
 * 自动扫描文章 ID 列表
 * 尝试获取 posts 目录下的 post-ids.json 文件
 */
async function scanPostIds() {
  const base = getBasePath();
  try {
    const response = await fetch(`${base}posts/post-ids.json`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to load post IDs:', error);
  }
  return [];
}

/**
 * 加载文章列表
 * 根据文章ID列表加载文章元数据并排序
 */
async function loadPostList(postIds, options = {}) {
  const base = getBasePath();
  const posts = [];
  const { includeIgnored = false } = options;

  for (const id of postIds) {
    try {
      const response = await fetch(`${base}posts/${id}.json`);
      if (response.ok) {
        const post = await response.json();
        post.id = id;
        if (includeIgnored || !post.ignore) {
          posts.push(post);
        }
      }
    } catch (error) {
      console.error(`Failed to load post ${id}:`, error);
    }
  }

  // 按创建时间倒序排序
  posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return posts;
}
