// OneShot Security Notification Service Worker
// Handles push notifications and background sync for security alerts

const CACHE_NAME = 'oneshot-security-notifications-v1';
const API_BASE = '/api';

// Service Worker Install Event
self.addEventListener('install', (event) => {
  console.log('OneShot Security Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/icons/security-alert.png',
        '/icons/security-badge.png',
        '/admin/security'
      ]);
    })
  );
  
  // Force service worker to become active immediately
  self.skipWaiting();
});

// Service Worker Activate Event
self.addEventListener('activate', (event) => {
  console.log('OneShot Security Service Worker activated');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Claim all clients immediately
  self.clients.claim();
});

// Push Event Handler - Receives push notifications from server
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  if (!event.data) {
    console.log('Push event but no data');
    return;
  }

  try {
    const data = event.data.json();
    console.log('Push notification data:', data);

    const options = {
      body: data.body || 'OneShot Security Alert',
      icon: data.icon || '/icons/security-alert.png',
      badge: data.badge || '/icons/security-badge.png',
      tag: data.tag || 'security-notification',
      data: data.data || {},
      actions: data.actions || [
        {
          action: 'view',
          title: 'View Details',
          icon: '/icons/view.png'
        },
        {
          action: 'acknowledge',
          title: 'Acknowledge',
          icon: '/icons/acknowledge.png'
        }
      ],
      requireInteraction: data.data?.severity === 'critical',
      silent: false,
      vibrate: getSeverityVibration(data.data?.severity),
      timestamp: Date.now()
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );

  } catch (error) {
    console.error('Error processing push notification:', error);
    
    // Show fallback notification
    event.waitUntil(
      self.registration.showNotification('OneShot Security Alert', {
        body: 'A security notification was received',
        icon: '/icons/security-alert.png',
        tag: 'security-fallback'
      })
    );
  }
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  // Close the notification
  notification.close();

  if (action === 'acknowledge') {
    // Handle acknowledgment
    event.waitUntil(
      acknowledgeNotification(data.notificationId)
        .then(() => {
          console.log('Notification acknowledged successfully');
        })
        .catch((error) => {
          console.error('Failed to acknowledge notification:', error);
        })
    );
    return;
  }

  // Default action or 'view' action - open the security dashboard
  const targetUrl = data.url || '/admin/security';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if security dashboard is already open
        for (const client of clientList) {
          if (client.url.includes('/admin/security') && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window if no matching client found
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// Notification Close Handler
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  
  const data = event.notification.data || {};
  
  // Track notification dismissal for analytics
  event.waitUntil(
    trackNotificationDismissal(data.notificationId)
  );
});

// Background Sync for Offline Acknowledgments
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event.tag);
  
  if (event.tag === 'acknowledge-notification') {
    event.waitUntil(syncPendingAcknowledgments());
  }
});

// Helper Functions

/**
 * Get vibration pattern based on severity
 */
function getSeverityVibration(severity) {
  switch (severity) {
    case 'critical':
      return [200, 100, 200, 100, 200]; // Urgent pattern
    case 'high':
      return [100, 50, 100]; // Important pattern
    case 'medium':
      return [100]; // Single vibration
    case 'low':
      return []; // No vibration
    default:
      return [100];
  }
}

/**
 * Acknowledge a security notification
 */
async function acknowledgeNotification(notificationId) {
  if (!notificationId) {
    throw new Error('No notification ID provided');
  }

  try {
    // Get stored token
    const token = await getStoredToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(`${API_BASE}/notifications/acknowledge/${notificationId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to acknowledge notification: ${response.statusText}`);
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error('Error acknowledging notification:', error);
    
    // Store acknowledgment for retry if offline
    await storePendingAcknowledgment(notificationId);
    
    // Register background sync
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      await self.registration.sync.register('acknowledge-notification');
    }
    
    throw error;
  }
}

/**
 * Track notification dismissal
 */
async function trackNotificationDismissal(notificationId) {
  if (!notificationId) return;

  try {
    const token = await getStoredToken();
    if (!token) return;

    // Send dismissal analytics (fire and forget)
    fetch(`${API_BASE}/notifications/track-dismissal`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        notificationId,
        timestamp: new Date().toISOString(),
        action: 'dismissed'
      })
    }).catch(() => {
      // Ignore errors for analytics
    });

  } catch (error) {
    console.error('Error tracking notification dismissal:', error);
  }
}

/**
 * Get stored authentication token
 */
async function getStoredToken() {
  try {
    // Try to get token from IndexedDB first (more reliable)
    const token = await getTokenFromIndexedDB();
    if (token) return token;

    // Fallback to communicating with clients for localStorage token
    const clients = await self.clients.matchAll();
    for (const client of clients) {
      const response = await new Promise((resolve) => {
        const channel = new MessageChannel();
        channel.port1.onmessage = (event) => resolve(event.data);
        client.postMessage({ type: 'GET_TOKEN' }, [channel.port2]);
        
        // Timeout after 5 seconds
        setTimeout(() => resolve(null), 5000);
      });
      
      if (response && response.token) {
        return response.token;
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting stored token:', error);
    return null;
  }
}

/**
 * Get token from IndexedDB
 */
async function getTokenFromIndexedDB() {
  return new Promise((resolve) => {
    const request = indexedDB.open('oneshot-tokens', 1);
    
    request.onerror = () => resolve(null);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('tokens')) {
        resolve(null);
        return;
      }
      
      const transaction = db.transaction(['tokens'], 'readonly');
      const store = transaction.objectStore('tokens');
      const getRequest = store.get('auth-token');
      
      getRequest.onsuccess = () => {
        const result = getRequest.result;
        resolve(result ? result.value : null);
      };
      
      getRequest.onerror = () => resolve(null);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('tokens')) {
        db.createObjectStore('tokens', { keyPath: 'key' });
      }
    };
  });
}

/**
 * Store pending acknowledgment for offline retry
 */
async function storePendingAcknowledgment(notificationId) {
  return new Promise((resolve) => {
    const request = indexedDB.open('oneshot-pending', 1);
    
    request.onerror = () => resolve();
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['acknowledgments'], 'readwrite');
      const store = transaction.objectStore('acknowledgments');
      
      store.add({
        id: notificationId,
        timestamp: Date.now()
      });
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => resolve();
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('acknowledgments')) {
        const store = db.createObjectStore('acknowledgments', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

/**
 * Sync pending acknowledgments when back online
 */
async function syncPendingAcknowledgments() {
  return new Promise((resolve) => {
    const request = indexedDB.open('oneshot-pending', 1);
    
    request.onerror = () => resolve();
    
    request.onsuccess = async (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('acknowledgments')) {
        resolve();
        return;
      }
      
      const transaction = db.transaction(['acknowledgments'], 'readwrite');
      const store = transaction.objectStore('acknowledgments');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = async () => {
        const pendingAcknowledgments = getAllRequest.result;
        
        for (const pending of pendingAcknowledgments) {
          try {
            await acknowledgeNotification(pending.id);
            store.delete(pending.id);
            console.log('Synced pending acknowledgment:', pending.id);
          } catch (error) {
            console.error('Failed to sync acknowledgment:', pending.id, error);
          }
        }
        
        resolve();
      };
      
      getAllRequest.onerror = () => resolve();
    };
  });
}

// Message Handler for Communication with Main Thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('OneShot Security Service Worker loaded successfully'); 