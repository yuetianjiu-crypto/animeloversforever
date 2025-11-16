// Service Worker for Anime Social App - Global PWA Version
const CACHE_NAME = 'anime-social-global-v1';
const RUNTIME_CACHE = 'anime-social-runtime';
const OFFLINE_CACHE = 'anime-social-offline';

// 需要缓存的核心资源 - 全球CDN优化版本
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/offline.html',
  // 图标 - 多种尺寸支持
  '/icons/app-icon-192.svg',
  '/icons/app-icon-512.svg',
  '/icons/app-icon-72.svg',
  '/icons/app-icon-96.svg',
  '/icons/app-icon-144.svg',
  '/icons/app-icon-168.svg',
  // 默认图片
  '/images/default-avatar.png',
  '/images/default-post.png',
  // 启动画面
  '/screenshots/splash-screen.svg',
  // 安装相关
  '/install.js',
  '/app-install.css'
];

// 第三方CDN资源
const CDN_ASSETS = [
  'https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js',
  'https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js',
  'https://cdn.jsdelivr.net/npm/react-router-dom@6/dist/umd/react-router-dom.production.min.js',
  'https://cdn.tailwindcss.com'
];

// 安装事件 - 缓存核心资源
self.addEventListener('install', (event) => {
  console.log('[SW] 安装中...');
  event.waitUntil(
    Promise.all([
      // 缓存本地资源
      caches.open(CACHE_NAME)
        .then((cache) => {
          console.log('[SW] 缓存核心资源');
          return cache.addAll(CORE_ASSETS);
        }),
      // 缓存CDN资源
      caches.open(OFFLINE_CACHE)
        .then((cache) => {
          console.log('[SW] 缓存CDN资源');
          return Promise.all(
            CDN_ASSETS.map(url => 
              fetch(url, { mode: 'cors' })
                .then(response => cache.put(url, response))
                .catch(err => console.log('[SW] CDN缓存失败:', url, err))
            )
          );
        })
    ])
    .then(() => {
      console.log('[SW] 跳过等待，立即激活');
      return self.skipWaiting();
    })
    .catch(err => {
      console.error('[SW] 安装失败:', err);
    })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('[SW] 激活中...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[SW] 删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] 接管所有页面');
      return self.clients.claim();
    })
  );
});

// 获取事件 - 智能缓存策略
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 跳过非GET请求
  if (request.method !== 'GET') {
    return;
  }

  // 处理CDN资源请求
  if (CDN_ASSETS.includes(request.url)) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(request).then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(OFFLINE_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        }).catch(() => {
          // CDN失败时尝试备用方案
          return new Response('// CDN资源加载失败', { 
            status: 200, 
            headers: { 'Content-Type': 'application/javascript' }
          });
        });
      })
    );
    return;
  }

  // HTML页面 - 网络优先，离线回退
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 缓存成功的响应
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // 网络失败时返回缓存
          return caches.match(request).then((response) => {
            return response || caches.match('/offline.html');
          });
        })
    );
    return;
  }

  // API请求 - 网络优先，缓存回退
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // 静态资源 - 缓存优先，网络回退
  if (request.destination === 'image' || 
      request.destination === 'style' || 
      request.destination === 'script' ||
      url.pathname.includes('/assets/')) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(request).then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // 默认策略 - 网络优先
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

// 后台同步
self.addEventListener('sync', (event) => {
  console.log('[SW] 后台同步:', event.tag);
  
  if (event.tag === 'sync-likes') {
    event.waitUntil(syncLikes());
  } else if (event.tag === 'sync-posts') {
    event.waitUntil(syncPosts());
  } else if (event.tag === 'sync-comments') {
    event.waitUntil(syncComments());
  }
});

// 推送通知
self.addEventListener('push', (event) => {
  console.log('[SW] 推送通知');
  
  const options = {
    body: event.data ? event.data.text() : '你有新的消息',
    icon: '/icons/app-icon-192.svg',
    badge: '/icons/app-icon-72.svg',
    vibrate: [200, 100, 200],
    tag: 'notification',
    renotify: true,
    actions: [
      {
        action: 'view',
        title: '查看',
        icon: '/icons/view.svg'
      },
      {
        action: 'close',
        title: '关闭',
        icon: '/icons/close.svg'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('动漫社交平台', options)
  );
});

// 通知点击事件
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] 通知点击');
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// 消息处理
self.addEventListener('message', (event) => {
  console.log('[SW] 收到消息:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: '1.0.0',
      cacheName: CACHE_NAME,
      timestamp: Date.now()
    });
  } else if (event.data.type === 'CACHE_URLS') {
    // 动态缓存指定URLs
    event.waitUntil(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});

// 同步函数
async function syncLikes() {
  console.log('[SW] 同步点赞数据...');
  // 实现点赞数据同步逻辑
}

async function syncPosts() {
  console.log('[SW] 同步发布数据...');
  // 实现发布数据同步逻辑
}

async function syncComments() {
  console.log('[SW] 同步评论数据...');
  // 实现评论数据同步逻辑
}