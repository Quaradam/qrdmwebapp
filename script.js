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