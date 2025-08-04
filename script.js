const categories = {
  'Предметы': [
    'стол', 'стул', 'телефон', 'лампа', 'книга', 'ручка', 'окно', 'дверь', 'клавиатура', 'часы'
  ],
  'Животные': [
    'слон', 'тигр', 'крокодил', 'пингвин', 'жираф', 'лев', 'мышь', 'кошка', 'собака', 'воробей'
  ],
  'Действия': [
    'бегать', 'прыгать', 'плавать', 'читать', 'писать', 'летать', 'прыгать', 'танцевать', 'спать', 'кушать'
  ],
  'Профессии': [
    'врач', 'учитель', 'пожарный', 'программист', 'водитель', 'повар', 'парикмахер', 'строитель', 'полицейский', 'актер'
  ]
};

let selectedCategories = [];
let wordsPool = [];
let usedWords = new Set();
let teams = [];
let teamIndex = 0;
let roundTime = 60;
let pointsToWin = 15;
let timerInterval = null;
let timeLeft = 0;

const setupSection = document.getElementById('setup');
const gameSection = document.getElementById('game');
const wordBox = document.getElementById('wordBox');
const currentTeamDiv = document.getElementById('currentTeam');
const timerDiv = document.getElementById('timer');
const scoreBoardDiv = document.getElementById('scoreBoard');
const categoriesContainer = document.getElementById('categoriesContainer');
const startBtn = document.getElementById('startBtn');
const correctBtn = document.getElementById('correctBtn');
const skipBtn = document.getElementById('skipBtn');
const endGameBtn = document.getElementById('endGameBtn');
const bgMusic = document.getElementById('bgMusic');

function populateCategories() {
  for (const cat in categories) {
    const label = document.createElement('label');
    label.className = 'categoryCheckbox';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = cat;
    checkbox.checked = true;
    checkbox.addEventListener('change', updateSelectedCategories);
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(cat));
    categoriesContainer.appendChild(label);
  }
}

function updateSelectedCategories() {
  selectedCategories = [];
  const checkboxes = categoriesContainer.querySelectorAll('input[type=checkbox]');
  checkboxes.forEach(cb => {
    if(cb.checked) selectedCategories.push(cb.value);
  });
}

function buildWordsPool() {
  wordsPool = [];
  usedWords.clear();
  selectedCategories.forEach(cat => {
    wordsPool = wordsPool.concat(categories[cat]);
  });
  shuffleArray(wordsPool);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function startGame() {
  const teamText = document.getElementById('teamNames').value.trim();
  if(!teamText) {
    alert('Введите хотя бы одну команду');
    return;
  }
  teams = teamText.split('\n').filter(t => t.trim() !== '').map(name => ({name: name.trim(), score: 0}));
  if(teams.length < 1) {
    alert('Должна быть минимум одна команда');
    return;
  }
  updateSelectedCategories();
  if(selectedCategories.length === 0) {
    alert('Выберите хотя бы одну категорию');
    return;
  }
  buildWordsPool();
  roundTime = parseInt(document.getElementById('roundTime').value) || 60;
  pointsToWin = parseInt(document.getElementById('pointsToWin').value) || 15;
  teamIndex = 0;
  timeLeft = roundTime;
  setupSection.style.display = 'none';
  gameSection.style.display = 'block';
  updateScoreBoard();
  showCurrentTeam();
  nextWord();
  startTimer();
  bgMusic.play().catch(e => {});
}

function showCurrentTeam() {
  currentTeamDiv.textContent = `Ход команды: ${teams[teamIndex].name}`;
}

function startTimer() {
  clearInterval(timerInterval);
  timeLeft = roundTime;
  timerDiv.textContent = `Осталось времени: ${timeLeft} сек`;
  timerInterval = setInterval(() => {
    timeLeft--;
    timerDiv.textContent = `Осталось времени: ${timeLeft} сек`;
    if(timeLeft <= 0) {
      clearInterval(timerInterval);
      nextTurn();
    }
  }, 1000);
}

function nextWord() {
  if(wordsPool.length === 0) {
    wordBox.textContent = 'Слова закончились!';
    return;
  }
  let word;
  do {
    word = wordsPool[Math.floor(Math.random() * wordsPool.length)];
  } while(usedWords.has(word) && usedWords.size < wordsPool.length);
  usedWords.add(word);
  wordBox.textContent = word;
}

function correctWord() {
  teams[teamIndex].score++;
  updateScoreBoard();
  if(teams[teamIndex].score >= pointsToWin) {
    alert(`Команда "${teams[teamIndex].name}" выиграла игру! Поздравляем!`);
    resetGame();
    return;
  }
  nextWord();
}

function skipWord() {
  nextWord();
}

function nextTurn() {
  teamIndex = (teamIndex + 1) % teams.length;
  showCurrentTeam();
  startTimer();
  nextWord();
}

function updateScoreBoard() {
  scoreBoardDiv.innerHTML = '<h3>Счёт:</h3><ul>' +
    teams.map(t => `<li>${t.name}: ${t.score}</li>`).join('') +
    '</ul>';
}

function resetGame() {
  clearInterval(timerInterval);
  bgMusic.pause();
  bgMusic.currentTime = 0;
  setupSection.style.display = 'block';
  gameSection.style.display = 'none';
  teams = [];
  teamIndex = 0;
  usedWords.clear();
  wordsPool = [];
  wordBox.textContent = '';
  document.getElementById('teamNames').value = '';
  scoreBoardDiv.innerHTML = '';
}

startBtn.addEventListener('click', startGame);
correctBtn.addEventListener('click', correctWord);
skipBtn.addEventListener('click', skipWord);
endGameBtn.addEventListener('click', () => {
  if(confirm('Вы действительно хотите закончить игру?')) {
    resetGame();
  }
});

window.onload = () => {
  populateCategories();
};