# 🌐 域名部署包

这个文件夹包含可以直接上传到你的域名空间的文件。

## 📁 文件结构

```
域名部署包/
├── index.html              # 主页面文件
├── assets/                 # CSS和JS文件
├── icons/                  # 应用图标
├── images/                 # 图片资源
├── manifest.json          # PWA配置文件
├── sw.js                  # Service Worker
└── .htaccess              # Apache服务器配置（可选）
```

## 🚀 部署步骤

### 方法一：直接上传
1. 将整个 `dist` 文件夹的内容上传到你的域名根目录
2. 确保 `index.html` 在根目录下
3. 访问你的域名即可使用

### 方法二：使用FTP工具
1. 使用FileZilla等FTP工具连接你的主机
2. 上传所有文件到 `public_html` 或 `www` 目录
3. 设置正确的文件权限（644 for files, 755 for directories）

### 方法三：使用cPanel文件管理器
1. 登录你的cPanel
2. 打开文件管理器
3. 上传所有文件到根目录
4. 解压（如果是压缩包）

## ⚙️ 服务器配置

### Apache服务器 (.htaccess)
如果你的服务器是Apache，可以使用提供的 `.htaccess` 文件来：
- 启用压缩
- 设置缓存
- 处理SPA路由
- 强制HTTPS（可选）

### Nginx服务器
如果你使用Nginx，需要在配置文件中添加：
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

## 🔧 环境变量配置

由于静态托管无法使用环境变量，你需要在 `index.html` 中手动配置：

```html
<script>
  window.ENV = {
    VITE_SUPABASE_URL: '你的Supabase URL',
    VITE_SUPABASE_ANON_KEY: '你的Supabase匿名密钥'
  };
</script>
```

## 📱 PWA配置

确保你的域名支持HTTPS，PWA功能才能正常工作。

在 `manifest.json` 中更新：
```json
{
  "name": "你的动漫社交平台",
  "short_name": "动漫社交",
  "start_url": "https://你的域名/",
  "scope": "https://你的域名/"
}
```

## 🎯 功能验证

部署完成后，请测试以下功能：
- ✅ 用户注册/登录
- ✅ 发布帖子
- ✅ 图片上传
- ✅ 深色模式
- ✅ 移动端适配
- ✅ PWA安装

## 🔍 故障排除

### 页面空白
- 检查浏览器控制台错误
- 确认Supabase配置正确
- 验证所有文件是否上传完整

### 图片无法显示
- 检查图片路径是否正确
- 确认文件权限设置正确
- 检查是否有大小写问题

### PWA无法安装
- 确认域名支持HTTPS
- 检查manifest.json配置
- 验证Service Worker是否注册成功

## 📞 技术支持

如果遇到问题，请检查：
1. 浏览器开发者工具控制台
2. 网络请求是否成功
3. Supabase数据库连接状态
4. 文件上传是否完整

---

**祝部署顺利！** 🎉