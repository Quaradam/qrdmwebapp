// Прелоадер
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    preloader.style.opacity = '0';
    setTimeout(() => {
      preloader.style.display = 'none';
    }, 500);
  }
});

// Модальное окно
const modal = document.getElementById('aboutModal');

function openModal() {
  if (!modal) return;
  modal.style.display = 'flex';
  requestAnimationFrame(() => {
    modal.classList.add('show');
  });
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove('show');
  modal.addEventListener('transitionend', () => {
    modal.style.display = 'none';
  }, { once: true });
}

window.onclick = function(event) {
  if (event.target === modal) {
    closeModal();
  }
};
let isPlaying = false;

window.addEventListener('DOMContentLoaded', () => {
  const music = document.getElementById('bg-music');
  const musicBtn = document.getElementById('music-toggle');
  const musicIcon = musicBtn ? musicBtn.querySelector('i') : null;
  const musicInfo = document.getElementById('music-now-playing');

  window.toggleMusic = function () {
    if (!music) return;
    if (isPlaying) {
      music.pause();
      if (musicIcon) musicIcon.className = 'fas fa-play';
      if (musicInfo) musicInfo.classList.remove('show');
      if (musicBtn) musicBtn.classList.remove('playing');
    } else {
      music.play().catch(()=>{});
      if (musicIcon) musicIcon.className = 'fas fa-pause';
      if (musicInfo) musicInfo.classList.add('show');
      if (musicBtn) musicBtn.classList.add('playing');
    }
    isPlaying = !isPlaying;
  };
});
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then(() => {
    console.log('Service Worker зарегистрирован');
  }).catch((error) => {
    console.log('Ошибка регистрации Service Worker:', error);
  });
}

(function initYouTubeFeed() {
  // Настройки — замените на свои
  const API_KEY = ''; // <-- вставьте ваш ключ YouTube Data API v3
  const CHANNEL_ID = 'UCehkSUlIKdvApXvkJydIbvQ'; // <-- вставьте ID канала (UC...)
  const MAX_RESULTS = 6;
  const POLL_INTERVAL_MS = 5 * 60 * 1000;

  function log(...args) { console.log('[ytfeed]', ...args); }

  // Если DOM не содержит контейнеры — создаём их внутри .main
  function ensurePlayerUI() {
    const main = document.querySelector('.main');
    if (!main) {
      log('Контейнер .main не найден — пропускаем инициализацию видео');
      return null;
    }

    let playerRow = document.querySelector('.player-row');
    if (!playerRow) {
      playerRow = document.createElement('div');
      playerRow.className = 'player-row';
      // вставляем перед футером или в конец main
      main.appendChild(playerRow);
    }

    let mainContainer = document.getElementById('main-video-container');
    if (!mainContainer) {
      mainContainer = document.createElement('div');
      mainContainer.id = 'main-video-container';
      mainContainer.className = 'video-container';
      // пустой placeholder
      playerRow.appendChild(mainContainer);
    }

    let thumbs = document.getElementById('video-thumbs');
    if (!thumbs) {
      thumbs = document.createElement('div');
      thumbs.id = 'video-thumbs';
      thumbs.className = 'video-thumbs';
      playerRow.appendChild(thumbs);
    }

    return { mainContainer, thumbs };
  }

  function createIframe(videoId, title) {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
    iframe.title = title || 'YouTube video';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', '');
    return iframe;
  }

  async function fetchLatestVideos() {
    if (!API_KEY || API_KEY.startsWith('REPLACE') || !CHANNEL_ID || CHANNEL_ID.startsWith('REPLACE')) {
      log('API_KEY или CHANNEL_ID не заданы — используем fallback');
      return null;
    }
    const url = `https://www.googleapis.com/youtube/v3/search?key=${encodeURIComponent(API_KEY)}&channelId=${encodeURIComponent(CHANNEL_ID)}&part=snippet,id&order=date&maxResults=${MAX_RESULTS}&type=video`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        log('YouTube API ответ не OK', res.status);
        return null;
      }
      const json = await res.json();
      return json.items || [];
    } catch (e) {
      console.error('[ytfeed] fetch error', e);
      return null;
    }
  }

  function renderMainVideo(container, videoId, title) {
    if (!container) return;
    container.innerHTML = '';
    const iframe = createIframe(videoId, title);
    container.appendChild(iframe);
    log('renderMainVideo', videoId);
  }

  function clearActiveThumb(thumbs) {
    if (!thumbs) return;
    const prev = thumbs.querySelector('.video-thumb.active');
    if (prev) prev.classList.remove('active');
  }

  function renderThumbnails(thumbs, items) {
    if (!thumbs) return;
    thumbs.innerHTML = '';
    if (!items || items.length === 0) return;

    items.forEach((item, idx) => {
      const videoId = item.id?.videoId;
      if (!videoId) return;
      const thumbUrl = item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || '';
      const title = item.snippet?.title || '';

      const wrap = document.createElement('div');
      wrap.className = 'video-thumb';
      wrap.title = title;
      wrap.style.cursor = 'pointer';
      wrap.style.display = 'flex';
      wrap.style.gap = '8px';
      wrap.style.alignItems = 'center';
      wrap.style.padding = '6px';
      wrap.style.borderRadius = '6px';

      const img = document.createElement('img');
      img.src = thumbUrl;
      img.alt = title;
      img.style.width = '120px';
      img.style.height = '68px';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '4px';
      img.loading = 'lazy';

      const t = document.createElement('div');
      t.className = 'title';
      t.textContent = title.length > 60 ? title.slice(0,57) + '...' : title;
      t.style.fontSize = '13px';
      t.style.color = '#222';
      t.style.lineHeight = '1.2';

      wrap.appendChild(img);
      wrap.appendChild(t);

      wrap.addEventListener('click', () => {
        clearActiveThumb(thumbs);
        wrap.classList.add('active');
        renderMainVideo(document.getElementById('main-video-container'), videoId, title);
      });

      if (idx === 0) wrap.classList.add('active');
      thumbs.appendChild(wrap);
    });
  }

  async function updateVideosLoop() {
    const ui = ensurePlayerUI();
    if (!ui) return;
    const { mainContainer, thumbs } = ui;

    const items = await fetchLatestVideos();
    if (!items) {
      // fallback: показать тестовое видео (встраивание iframe проверяется)
      renderMainVideo(mainContainer, 'KhbnV1qPP50', 'Тестовое видео');
      return;
    }
    if (items.length === 0) {
      log('Нет видео в ответе API');
      return;
    }
    // ставим первое видео в основной плеер и список превью
    renderMainVideo(mainContainer, items[0].id.videoId, items[0].snippet?.title);
    renderThumbnails(thumbs, items);
  }

  // expose for debug
  window.renderMainVideo = function(id, title) {
    const container = document.getElementById('main-video-container');
    renderMainVideo(container, id, title || 'YouTube video');
  };

  // старт через DOMContentLoaded (если документ уже загружен — выполнится сразу)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      updateVideosLoop();
      setInterval(updateVideosLoop, POLL_INTERVAL_MS);
    });
  } else {
    updateVideosLoop();
    setInterval(updateVideosLoop, POLL_INTERVAL_MS);
  }

})();