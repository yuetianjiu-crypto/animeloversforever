// PWA 安装助手 - 全球可访问版本
class PWAInstaller {
  constructor() {
    this.deferredPrompt = null;
    this.isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    this.isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    this.isAndroid = /android/.test(navigator.userAgent.toLowerCase());
    this.isInWeChat = /micromessenger/.test(navigator.userAgent.toLowerCase());
    this.installButton = null;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // 监听 PWA 安装事件
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('[PWA] 安装提示已准备');
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });

    // 监听应用安装成功
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] 应用安装成功');
      this.hideInstallButton();
      this.showSuccessMessage('应用已成功安装到您的设备！');
    });

    // 监听显示模式变化
    window.matchMedia('(display-mode: standalone)').addListener((e) => {
      this.isStandalone = e.matches;
      this.updateInstallUI();
    });

    // 页面加载完成后初始化
    window.addEventListener('load', () => {
      this.initializeInstallUI();
    });
  }

  initializeInstallUI() {
    this.createInstallButton();
    this.checkInstallStatus();
    
    // 检测微信环境
    if (this.isInWeChat) {
      this.showWeChatGuide();
    }
  }

  createInstallButton() {
    // 创建安装按钮
    const button = document.createElement('div');
    button.id = 'pwa-install-button';
    button.className = 'pwa-install-button';
    button.innerHTML = `
      <div class="install-icon">📱</div>
      <div class="install-content">
        <div class="install-title">安装应用到主屏幕</div>
        <div class="install-subtitle">获得更好的使用体验</div>
      </div>
      <div class="install-close" onclick="pwaInstaller.hideInstallButton()">×</div>
    `;
    
    button.onclick = () => this.promptInstall();
    document.body.appendChild(button);
    this.installButton = button;
  }

  showInstallButton() {
    if (this.installButton && !this.isStandalone) {
      this.installButton.classList.add('show');
      
      // 自动隐藏提示（5秒后）
      setTimeout(() => {
        this.hideInstallButton();
      }, 5000);
    }
  }

  hideInstallButton() {
    if (this.installButton) {
      this.installButton.classList.remove('show');
    }
  }

  async promptInstall() {
    if (!this.deferredPrompt) {
      this.showPlatformSpecificGuide();
      return;
    }

    try {
      // 显示安装提示
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('[PWA] 用户接受了安装');
        this.hideInstallButton();
      } else {
        console.log('[PWA] 用户拒绝了安装');
        this.showInstallReminder();
      }
      
      this.deferredPrompt = null;
    } catch (error) {
      console.error('[PWA] 安装失败:', error);
      this.showPlatformSpecificGuide();
    }
  }

  showPlatformSpecificGuide() {
    if (this.isIOS) {
      this.showIOSInstallGuide();
    } else if (this.isAndroid) {
      this.showAndroidInstallGuide();
    } else {
      this.showDesktopInstallGuide();
    }
  }

  showIOSInstallGuide() {
    const guide = document.createElement('div');
    guide.className = 'install-guide ios-guide';
    guide.innerHTML = `
      <div class="guide-content">
        <h3>📱 iPhone/iPad 安装指南</h3>
        <div class="guide-steps">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-text">点击底部工具栏的 <strong>分享按钮</strong></div>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-text">在分享菜单中选择 <strong>"添加到主屏幕"</strong></div>
          </div>
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-text">点击右上角的 <strong>"添加"</strong> 按钮</div>
          </div>
        </div>
        <button class="guide-close" onclick="this.parentElement.parentElement.remove()">知道了</button>
      </div>
    `;
    document.body.appendChild(guide);
  }

  showAndroidInstallGuide() {
    const guide = document.createElement('div');
    guide.className = 'install-guide android-guide';
    guide.innerHTML = `
      <div class="guide-content">
        <h3>📱 Android 安装指南</h3>
        <div class="guide-steps">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-text">点击浏览器右上角的 <strong>菜单按钮</strong></div>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-text">选择 <strong>"安装应用"</strong> 或 <strong>"添加到主屏幕"</strong></div>
          </div>
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-text">按照提示完成安装</div>
          </div>
        </div>
        <button class="guide-close" onclick="this.parentElement.parentElement.remove()">知道了</button>
      </div>
    `;
    document.body.appendChild(guide);
  }

  showDesktopInstallGuide() {
    const guide = document.createElement('div');
    guide.className = 'install-guide desktop-guide';
    guide.innerHTML = `
      <div class="guide-content">
        <h3>💻 桌面安装指南</h3>
        <div class="guide-steps">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-text">点击浏览器地址栏的 <strong>安装图标</strong></div>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-text">或点击菜单中的 <strong>"安装应用"</strong></div>
          </div>
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-text">按照提示完成安装</div>
          </div>
        </div>
        <button class="guide-close" onclick="this.parentElement.parentElement.remove()">知道了</button>
      </div>
    `;
    document.body.appendChild(guide);
  }

  showWeChatGuide() {
    if (this.isInWeChat) {
      const guide = document.createElement('div');
      guide.className = 'wechat-guide';
      guide.innerHTML = `
        <div class="wechat-content">
          <h3>⚠️ 微信浏览器提示</h3>
          <p>当前您在微信中打开此页面</p>
          <div class="wechat-steps">
            <div class="step">
              <div class="step-number">1</div>
              <div class="step-text">点击右上角的 <strong>菜单按钮</strong></div>
            </div>
            <div class="step">
              <div class="step-number">2</div>
              <div class="step-text">选择 <strong>"在浏览器打开"</strong></div>
            </div>
            <div class="step">
              <div class="step-number">3</div>
              <div class="step-text">在浏览器中安装应用</div>
            </div>
          </div>
          <button class="guide-close" onclick="this.parentElement.parentElement.remove()">知道了</button>
        </div>
      `;
      document.body.appendChild(guide);
    }
  }

  checkInstallStatus() {
    // 检查是否已经安装
    if (this.isStandalone) {
      console.log('[PWA] 应用已处于独立模式');
      return;
    }

    // 检查是否支持PWA安装
    if (!('serviceWorker' in navigator)) {
      console.log('[PWA] 不支持Service Worker');
      return;
    }

    if (!('BeforeInstallPromptEvent' in window) && !this.isIOS) {
      console.log('[PWA] 不支持PWA安装提示');
      return;
    }
  }

  showSuccessMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'install-toast success';
    toast.innerHTML = `
      <div class="toast-icon">✅</div>
      <div class="toast-message">${message}</div>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  showInstallReminder() {
    const toast = document.createElement('div');
    toast.className = 'install-toast reminder';
    toast.innerHTML = `
      <div class="toast-icon">💡</div>
      <div class="toast-message">您可以随时安装应用到主屏幕</div>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // 公共API
  canInstall() {
    return !this.isStandalone && (this.deferredPrompt !== null || this.isIOS);
  }

  getInstallStatus() {
    return {
      isStandalone: this.isStandalone,
      isIOS: this.isIOS,
      isAndroid: this.isAndroid,
      isInWeChat: this.isInWeChat,
      canInstall: this.canInstall(),
      hasPrompt: this.deferredPrompt !== null
    };
  }
}

// 初始化PWA安装器
const pwaInstaller = new PWAInstaller();

// 添加CSS样式
const style = document.createElement('style');
style.textContent = `
  /* PWA安装按钮样式 */
  .pwa-install-button {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 15px 20px;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 10000;
    transform: translateY(100px);
    opacity: 0;
    transition: all 0.3s ease;
    max-width: 280px;
  }

  .pwa-install-button.show {
    transform: translateY(0);
    opacity: 1;
  }

  .pwa-install-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 40px rgba(0,0,0,0.4);
  }

  .install-icon {
    font-size: 24px;
    animation: bounce 2s infinite;
  }

  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-10px); }
    60% { transform: translateY(-5px); }
  }

  .install-content {
    flex: 1;
  }

  .install-title {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 2px;
  }

  .install-subtitle {
    font-size: 12px;
    opacity: 0.9;
  }

  .install-close {
    font-size: 20px;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.2s;
  }

  .install-close:hover {
    opacity: 1;
  }

  /* 安装指南样式 */
  .install-guide {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 20000;
    animation: fadeIn 0.3s ease;
  }

  .guide-content {
    background: white;
    border-radius: 20px;
    padding: 30px;
    max-width: 350px;
    margin: 20px;
    animation: slideUp 0.3s ease;
  }

  .guide-content h3 {
    text-align: center;
    margin-bottom: 20px;
    color: #333;
  }

  .guide-steps {
    margin-bottom: 20px;
  }

  .step {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    padding: 10px;
    background: #f8f9fa;
    border-radius: 10px;
  }

  .step-number {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    margin-right: 15px;
    flex-shrink: 0;
  }

  .step-text {
    font-size: 14px;
    color: #666;
  }

  .guide-close {
    width: 100%;
    padding: 12px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .guide-close:hover {
    transform: translateY(-1px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
  }

  /* 微信提示样式 */
  .wechat-guide {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 20000;
    animation: fadeIn 0.3s ease;
  }

  .wechat-content {
    background: white;
    border-radius: 20px;
    padding: 30px;
    max-width: 350px;
    margin: 20px;
    text-align: center;
    animation: slideUp 0.3s ease;
  }

  .wechat-content h3 {
    color: #07c160;
    margin-bottom: 15px;
  }

  /* Toast提示样式 */
  .install-toast {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    padding: 15px 20px;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 30000;
    animation: slideInRight 0.3s ease;
  }

  .install-toast.success {
    border-left: 4px solid #4CAF50;
  }

  .install-toast.reminder {
    border-left: 4px solid #ff9800;
  }

  .toast-icon {
    font-size: 20px;
  }

  .toast-message {
    font-size: 14px;
    color: #333;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { transform: translateY(50px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes slideInRight {
    from { transform: translateX(100px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  /* 响应式设计 */
  @media (max-width: 480px) {
    .pwa-install-button {
      bottom: 10px;
      right: 10px;
      left: 10px;
      max-width: none;
    }

    .guide-content {
      margin: 10px;
      padding: 20px;
    }
  }
`;
document.head.appendChild(style);

// 导出全局API
window.PWAInstaller = PWAInstaller;
window.pwaInstaller = pwaInstaller;