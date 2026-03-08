/**
 * 关于页面内容加载器
 * 从 about.md 加载并渲染内容
 */

/**
 * 加载文章数量
 */
async function loadPostCount() {
  const postCountEl = document.getElementById('postCount');
  if (!postCountEl) return;

  try {
    const response = await fetch('../posts/post-ids.json');
    if (response.ok) {
      const postIds = await response.json();
      postCountEl.textContent = postIds.length;
    }
  } catch (error) {
    console.error('Failed to load post count:', error);
  }
}

/**
 * 加载 about.md 内容
 */
async function loadAboutContent() {
  const aboutIntro = document.getElementById('aboutIntro');
  if (!aboutIntro) return;

  try {
    const response = await fetch('about.md');
    if (!response.ok) {
      throw new Error('Failed to load about.md');
    }

    const content = await response.text();
    aboutIntro.innerHTML = parseMarkdown(content);
  } catch (error) {
    console.error('Error loading about content:', error);
    aboutIntro.innerHTML = '<p class="markdown" style="color: var(--color-text-muted);">加载失败，请稍后重试</p>';
  }
}

// 页面加载完成后自动加载内容
document.addEventListener('DOMContentLoaded', () => {
  loadPostCount();
  loadAboutContent();
});
