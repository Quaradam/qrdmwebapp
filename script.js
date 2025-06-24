// Прелоадер
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  preloader.style.opacity = '0';
  setTimeout(() => {
    preloader.style.display = 'none';
  }, 500);
});

// Модальное окно
const modal = document.getElementById('aboutModal');

function openModal() {
  modal.style.display = 'flex';
  requestAnimationFrame(() => {
    modal.classList.add('show');
  });
}

function closeModal() {
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
  const musicIcon = musicBtn.querySelector('i');
  const musicInfo = document.getElementById('music-now-playing');

  window.toggleMusic = function () {
    if (isPlaying) {
      music.pause();
      musicIcon.className = 'fas fa-play';
      musicInfo.classList.remove('show');
      musicBtn.classList.remove('playing');
    } else {
      music.play();
      musicIcon.className = 'fas fa-pause';
      musicInfo.classList.add('show');
      musicBtn.classList.add('playing');
    }
    isPlaying = !isPlaying;
  };
});