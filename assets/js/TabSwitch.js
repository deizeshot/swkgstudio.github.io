const gamesButton = document.getElementById('gamesButton');
const chatButton = document.getElementById('chatButton');
const filesButton = document.getElementById('filesButton');

gamesButton.addEventListener('click', () => {
  document.getElementById('tab-1').classList.add('show', 'active');
  document.getElementById('tab-2').classList.remove('show', 'active');
  document.getElementById('tab-3').classList.remove('show', 'active');
});

chatButton.addEventListener('click', () => {
  document.getElementById('tab-2').classList.add('show', 'active');
  document.getElementById('tab-1').classList.remove('show', 'active');
  document.getElementById('tab-3').classList.remove('show', 'active');
});

filesButton.addEventListener('click', () => {
  document.getElementById('tab-3').classList.add('show', 'active');
  document.getElementById('tab-1').classList.remove('show', 'active');
  document.getElementById('tab-2').classList.remove('show', 'active');
});

backButton.addEventListener('click', () => {
  document.getElementById('tab-2').classList.add('show', 'active');
  document.getElementById('tab-1').classList.remove('show', 'active');
  document.getElementById('tab-3').classList.remove('show', 'active');
});