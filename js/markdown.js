/**
 * Markdown 解析器
 * 支持完整 Markdown 语法，所有生成的 HTML 标签添加 class="markdown"
 */

class MarkdownParser {
  /**
   * 解析 Markdown 文本
   * @param {string} text - Markdown 文本
   * @returns {string} - HTML 字符串
   */
  parse(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }

    const lines = text.split('\n');
    let result = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // 空行跳过
      if (trimmed === '') {
        i++;
        continue;
      }

      // 代码块 ```
      if (trimmed.startsWith('```')) {
        const lang = trimmed.slice(3);
        let codeLines = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(this.escapeHtml(lines[i]));
          i++;
        }
        result.push(`<pre class="markdown"><code class="markdown language-${lang}">${codeLines.join('\n')}</code></pre>`);
        i++;
        continue;
      }

      // 分割线 --- *** ___
      if (/^[-*_]{3,}$/.test(trimmed)) {
        result.push('<hr class="markdown">');
        i++;
        continue;
      }

      // 引用块 >
      if (line.startsWith('>')) {
        const blockquoteLines = [];
        while (i < lines.length && lines[i].startsWith('>')) {
          blockquoteLines.push(lines[i].replace(/^>\s?/, ''));
          i++;
        }
        const blockquoteContent = this.parse(blockquoteLines.join('\n'));
        result.push(`<blockquote class="markdown">${blockquoteContent}</blockquote>`);
        continue;
      }

      // 表格 | xxx | - 必须在表格处理之前先判断
      // 表格行以 | 开头和结尾，且包含内容
      if (this.isTableRow(line)) {
        const tableLines = [];
        while (i < lines.length && this.isTableRow(lines[i])) {
          tableLines.push(lines[i]);
          i++;
        }
        // 只有当有至少2行时才认为是表格
        if (tableLines.length >= 2) {
          result.push(this.parseTable(tableLines));
          continue;
        }
      }

      // 无序列表 - xxx 或 * xxx 或 + xxx
      if (/^[-*+]\s+/.test(trimmed)) {
        const listItems = [];
        while (i < lines.length && /^[-*+]\s+/.test(lines[i].trim())) {
          const itemText = lines[i].trim().slice(2);
          // 任务列表 - [ ] 或 - [x]
          if (/^\[([ xX])\]\s/.test(itemText)) {
            const match = itemText.match(/^\[([ xX])\]\s(.+)$/);
            const checked = match[1].toLowerCase() === 'x' ? ' checked' : '';
            listItems.push(`<li class="markdown"><input type="checkbox" class="markdown"${checked} disabled> ${this.parseInline(match[2])}</li>`);
          } else {
            listItems.push(`<li class="markdown">${this.parseInline(itemText)}</li>`);
          }
          i++;
        }
        result.push(`<ul class="markdown">${listItems.join('')}</ul>`);
        continue;
      }

      // 有序列表 1. xxx
      if (/^\d+\.\s+/.test(trimmed)) {
        const listItems = [];
        while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
          const itemText = lines[i].trim().replace(/^\d+\.\s+/, '');
          listItems.push(`<li class="markdown">${this.parseInline(itemText)}</li>`);
          i++;
        }
        result.push(`<ol class="markdown">${listItems.join('')}</ol>`);
        continue;
      }

      // 标题 ## xxx - 必须在段落之后检查
      if (trimmed.startsWith('#')) {
        const headerMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
        if (headerMatch) {
          const level = headerMatch[1].length;
          const content = this.parseInline(headerMatch[2]);
          result.push(`<h${level} class="markdown">${content}</h${level}>`);
          i++;
          continue;
        }
      }

      // 段落 - 收集连续的非特殊行
      const paragraphLines = [];
      while (i < lines.length) {
        const currentLine = lines[i];
        const currentTrimmed = currentLine.trim();

        if (currentTrimmed === '') break;
        if (currentTrimmed.startsWith('#')) break;
        if (/^[-*_]{3,}$/.test(currentTrimmed)) break;
        if (currentLine.startsWith('>')) break;
        if (this.isTableRow(currentLine)) break;
        if (/^[-*+]\s+/.test(currentTrimmed)) break;
        if (/^\[([ xX])\]\s/.test(currentTrimmed)) break;
        if (/^\d+\.\s+/.test(currentTrimmed)) break;
        if (currentTrimmed.startsWith('```')) break;

        paragraphLines.push(currentLine);
        i++;
      }

      if (paragraphLines.length > 0) {
        const content = paragraphLines.map(l => this.parseInline(l)).join('<br class="markdown">');
        result.push(`<p class="markdown">${content}</p>`);
      }
    }

    return result.join('\n');
  }

  /**
   * 检查是否是表格行
   */
  isTableRow(line) {
    const trimmed = line.trim();
    // 表格行必须以 | 开头或结尾，且包含内容
    return (trimmed.startsWith('|') && trimmed.endsWith('|')) && trimmed.includes('|');
  }

  /**
   * 解析行内元素
   */
  parseInline(text) {
    if (!text) return '';

    let result = text;

    // 转义 HTML 特殊字符
    result = this.escapeHtml(result);

    // 图片 ![alt](url)
    result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img class="markdown" src="$2" alt="$1">');

    // 链接 [text](url)
    result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a class="markdown" href="$2">$1</a>');

    // 自动链接 <url>
    result = result.replace(/<(https?:\/\/[^>]+)>/g, '<a class="markdown" href="$1">$1</a>');

    // 加粗斜体 ***text*** 或 ___text___
    result = result.replace(/\*\*\*(.+?)\*\*\*|___(.+?)___/g, '<strong class="markdown"><em class="markdown">$1$2</em></strong>');

    // 加粗 **text** 或 __text__
    result = result.replace(/\*\*(.+?)\*\*|__(.+?)__/g, '<strong class="markdown">$1$2</strong>');

    // 斜体 *text* 或 _text_
    result = result.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)|(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, '<em class="markdown">$1$2</em>');

    // 删除线 ~~text~~
    result = result.replace(/~~(.+?)~~/g, '<del class="markdown">$1</del>');

    // 行内代码 `code`
    result = result.replace(/`([^`]+)`/g, '<code class="markdown">$1</code>');

    return result;
  }

  /**
   * 解析表格
   */
  parseTable(lines) {
    if (lines.length < 2) return '';

    const headerLine = lines[0];
    const dividerLine = lines[1];
    const bodyLines = lines.slice(2);

    // 解析表头
    const headers = headerLine.split('|').map(h => h.trim()).filter(Boolean);

    // 解析对齐方式
    const dividers = dividerLine.split('|').map(d => d.trim()).filter(Boolean);
    const alignments = dividers.map(d => {
      if (d.startsWith(':') && d.endsWith(':')) return 'center';
      if (d.endsWith(':')) return 'right';
      return 'left';
    });

    // 构建表头 HTML
    const headerHtml = headers.map((h, i) => {
      const align = alignments[i] || 'left';
      return `<th class="markdown" style="text-align: ${align}">${this.parseInline(h)}</th>`;
    }).join('');

    // 构建表体 HTML
    const bodyHtml = bodyLines.map(line => {
      const cells = line.split('|').map(c => c.trim()).filter(Boolean);
      const cellsHtml = cells.map((c, i) => {
        const align = alignments[i] || 'left';
        return `<td class="markdown" style="text-align: ${align}">${this.parseInline(c)}</td>`;
      }).join('');
      return `<tr class="markdown">${cellsHtml}</tr>`;
    }).join('');

    return `<table class="markdown"><thead class="markdown"><tr class="markdown">${headerHtml}</tr></thead><tbody class="markdown">${bodyHtml}</tbody></table>`;
  }

  /**
   * HTML 转义
   */
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}

// 导出解析器实例
const markdownParser = new MarkdownParser();

/**
 * 解析 Markdown 文本
 * @param {string} text - Markdown 文本
 * @returns {string} - HTML 字符串
 */
function parseMarkdown(text) {
  return markdownParser.parse(text);
}
