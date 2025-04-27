// DeepWiki图标相关的代码
const DEEPWIKI_ICONS = {
  // 备用SVG图标定义为常量，避免重复
  FALLBACK_SVG: `<svg xmlns="http://www.w3.org/2000/svg" style="margin-right:4px" width="16" height="16"  viewBox="0 0 24 24"><!-- Icon from IconaMoon by Dariush Habibpour - https://creativecommons.org/licenses/by/4.0/ --><g fill="none" stroke="#3b82f6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"><circle cx="12" cy="12" r="9"/><path d="M14 14v-4h-4"/></g></svg>`,
  
  /**
   * 异步获取SVG图标内容
   * @returns {Promise<string>} SVG图标内容
   */
  async fetchSvgIcon() {
    try {
      const response = await fetch(chrome.runtime.getURL('icons/deepwiki-icon.svg'));
      const svgText = await response.text();
      // 将SVG内容转换为可插入的HTML，并设置宽高
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
      const svgElement = svgDoc.documentElement;
      svgElement.setAttribute('width', '16');
      svgElement.setAttribute('height', '16');
      svgElement.classList.add('deepwiki-icon');
      return svgElement.outerHTML;
    } catch (error) {
      console.error('加载SVG图标失败:', error);
      // 返回备用图标
      return this.FALLBACK_SVG;
    }
  },
  
  // 缓存的SVG内容
  _svgContent: null,

  /**
   * 获取按钮HTML
   * @param {string} owner - 仓库所有者
   * @param {string} repo - 仓库名称
   * @returns {Promise<string>} - 返回包含SVG图标的按钮HTML
   */
  async getButtonHTMLAsync(owner, repo) {
    // 如果没有缓存的SVG内容，则加载
    if (!this._svgContent) {
      this._svgContent = await this.fetchSvgIcon();
    }
    
    return `
      <a href="https://deepwiki.com/${owner}/${repo}" target="_blank" class="deepwiki-link" title="在 DeepWiki 中查看此项目">
        <span class="deepwiki-button">
          ${this._svgContent}
          <span>DeepWiki</span>
        </span>
      </a>
    `;
  },
  
  /**
   * 同步获取按钮HTML (使用备用图标)
   * @param {string} owner - 仓库所有者
   * @param {string} repo - 仓库名称
   * @returns {string} - 返回包含备用图标的按钮HTML
   */
  getButtonHTML(owner, repo) {
    return `
      <a href="https://deepwiki.com/${owner}/${repo}" target="_blank" class="deepwiki-link" title="在 DeepWiki 中查看此项目">
        <span class="deepwiki-button">
          ${this._svgContent || this.FALLBACK_SVG}
          <span>DeepWiki</span>
        </span>
      </a>
    `;
  }
};

// 立即尝试加载SVG
(async function() {
  try {
    DEEPWIKI_ICONS._svgContent = await DEEPWIKI_ICONS.fetchSvgIcon();
  } catch (e) {
    console.error('预加载SVG图标失败:', e);
  }
})();

// 导出对象，供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DEEPWIKI_ICONS;
} 
