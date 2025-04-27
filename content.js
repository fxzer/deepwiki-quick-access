// 在 GitHub 页面上添加 DeepWiki 图标
(function() {
  // 存储当前路径，用于检测变化
  let currentPath = window.location.pathname;
  
  // 提取仓库所有者和名称并添加按钮的主函数
  async function processPage() {
    // 清除之前添加的按钮
    const existingButtons = document.querySelectorAll('.deepwiki-container');
    existingButtons.forEach(button => button.remove());
    
    // 检查是否在正确的 GitHub 页面
    const pathParts = window.location.pathname.split('/').filter(part => part);
    if (pathParts.length < 2) return; // 不是有效的仓库页面
    
    const owner = pathParts[0];
    const repo = pathParts[1];
    
    // 如果已经找到pagehead-actions，直接添加按钮
    const repoNav = document.querySelector('ul.pagehead-actions');
    if (repoNav) {
      await addDeepWikiButton(owner, repo);
      return;
    }
    
    // 否则，监听DOM变化，等待pagehead-actions出现
    const observer = new MutationObserver(function(mutations) {
      const repoNav = document.querySelector('ul.pagehead-actions');
      if (repoNav && !document.querySelector('.deepwiki-container')) {
        addDeepWikiButton(owner, repo).catch(err => console.error('添加DeepWiki按钮失败:', err));
        observer.disconnect(); // 找到并添加后停止观察
      }
    });
    
    // 开始观察文档变化
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }
  
  // 添加 DeepWiki 图标
  async function addDeepWikiButton(owner, repo) {
    // 检查是否已经添加过按钮
    if (document.querySelector('.deepwiki-container')) {
      return; // 已经存在按钮，不再添加
    }
    
    // 创建 DeepWiki 按钮元素
    const deepwikiContainer = document.createElement('div');
    deepwikiContainer.className = 'deepwiki-container';
    deepwikiContainer.style.marginRight = '8px';
    deepwikiContainer.style.float = 'left';
    
    try {
      // 尝试使用异步方法获取按钮HTML
      const buttonHTML = await DEEPWIKI_ICONS.getButtonHTMLAsync(owner, repo);
      deepwikiContainer.innerHTML = buttonHTML;
    } catch (error) {
      // 如果异步获取失败，使用同步方法（带有备用图标）
      console.error('异步获取按钮HTML失败，使用备用图标:', error);
      deepwikiContainer.innerHTML = DEEPWIKI_ICONS.getButtonHTML(owner, repo);
    }
    
    // 获取目标容器
    const targetContainer = document.querySelector('ul.pagehead-actions');
    if (targetContainer) {
      // 检查页面中是否已经有含有DeepWiki文本的元素
      const existingDeepwikiButton = Array.from(targetContainer.querySelectorAll('*'))
        .find(el => el.textContent && el.textContent.includes('DeepWiki'));
      
      if (existingDeepwikiButton) {
        // 如果已经存在DeepWiki按钮，则不再添加
        return;
      }
      
      // 查找是否存在特殊class的子元素
      const specialElements = targetContainer.querySelectorAll('div[data-testid], div[class*="collection-assistant"]');
      
      if (specialElements.length > 0) {
        // 我们只把按钮放在第一个特殊元素后面
        targetContainer.insertBefore(deepwikiContainer, specialElements[0].nextSibling);
      } else {
        // 如果没有特殊元素，放在最前面
        targetContainer.insertBefore(deepwikiContainer, targetContainer.firstChild);
      }
    }
  }
  
  // 立即处理当前页面
  processPage().catch(err => console.error('处理页面失败:', err));
  
  // 设置URL变化检测（处理GitHub的单页应用导航）
  function checkURLChange() {
    if (currentPath !== window.location.pathname) {
      currentPath = window.location.pathname;
      processPage().catch(err => console.error('URL变化后处理页面失败:', err));
    }
  }
  
  // 使用setInterval定期检查URL变化
  setInterval(checkURLChange, 1000);
  
  // 使用History API监听路由变化
  const originalPushState = history.pushState;
  history.pushState = function() {
    originalPushState.apply(this, arguments);
    processPage().catch(err => console.error('pushState后处理页面失败:', err));
  };
  
  const originalReplaceState = history.replaceState;
  history.replaceState = function() {
    originalReplaceState.apply(this, arguments);
    processPage().catch(err => console.error('replaceState后处理页面失败:', err));
  };
  
  // 监听popstate事件（后退/前进按钮）
  window.addEventListener('popstate', function() {
    processPage().catch(err => console.error('popstate后处理页面失败:', err));
  });
})();
