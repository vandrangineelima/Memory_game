const container = document.getElementById('game-container');
const movesSpan = document.getElementById('moves');
const timerSpan = document.getElementById('timer');
const bestTimeSpan = document.getElementById('best-time');
const resetBtn = document.getElementById('reset');
const difficultySelect = document.getElementById('difficulty');
const messageDiv = document.getElementById('message');
const darkBtn = document.getElementById('toggle-dark');

// Dark / Light mode toggle
darkBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');

  if (document.body.classList.contains('dark-mode')) {
    darkBtn.textContent = "Light Mode";
  } else {
    darkBtn.textContent = "Dark Mode";
  }
});

let cards = [];
let hasFlippedCard = false;
let firstCard, secondCard;
let lockBoard = false;
let moves = 0;
let timer, seconds = 0, minutes = 0;
let matchedPairs = 0;
let totalPairs = 0;
let gameStarted = false;

// Load best time from localStorage
if (localStorage.getItem('bestTime')) {
  bestTimeSpan.textContent = localStorage.getItem('bestTime');
}

// Shuffle array
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// Create cards
function createCards(numCards) {
  container.innerHTML = '';
  cards = [];
  totalPairs = numCards / 2;
  matchedPairs = 0;

  let nums = [];
  for (let i = 1; i <= totalPairs; i++) {
    nums.push(i, i); // pair
  }

  shuffle(nums).forEach(num => {
    const card = document.createElement('div');
    card.classList.add('card');

    const inner = document.createElement('div');
    inner.classList.add('card-inner');

    const front = document.createElement('div');
    front.classList.add('card-front');
    front.textContent = '';

    const back = document.createElement('div');
    back.classList.add('card-back');
    back.textContent = num;

    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);

    card.dataset.name = num;
    card.addEventListener('click', flipCard);
    container.appendChild(card);
    cards.push(card);
  });

  // Grid layout: set cols for each difficulty
  let cols;
  if (numCards === 4) cols = 2;        // 2x2
  else if (numCards === 8) cols = 4;   // 2x4
  else if (numCards === 16) cols = 4;  // 4x4
  else if (numCards === 32) cols = 8;  // 4x8
  else cols = Math.min(Math.sqrt(numCards), 8);

  container.style.gridTemplateColumns = `repeat(${cols}, 100px)`;
}

// Timer
function startTimer() {
  if (gameStarted) return;
  gameStarted = true;
  timer = setInterval(() => {
    seconds++;
    if (seconds === 60) {
      minutes++;
      seconds = 0;
    }
    timerSpan.textContent =
      (minutes < 10 ? '0' + minutes : minutes) +
      ':' +
      (seconds < 10 ? '0' + seconds : seconds);
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
  gameStarted = false;
}

// Flip card
function flipCard() {
  startTimer();
  if (lockBoard) return;
  if (this === firstCard) return;

  this.classList.add('flipped');

  if (!hasFlippedCard) {
    hasFlippedCard = true;
    firstCard = this;
    return;
  }

  secondCard = this;
  checkForMatch();
}

// Check match
function checkForMatch() {
  moves++;
  movesSpan.textContent = moves;

  if (firstCard.dataset.name === secondCard.dataset.name) {
    disableCards();
    matchedPairs++;
    if (matchedPairs === totalPairs) {
      stopTimer();
      messageDiv.textContent = `🎉 Congratulations! Time: ${timerSpan.textContent} 🎉`;

      // Save best time
      if (!localStorage.getItem('bestTime') || timerSpan.textContent < localStorage.getItem('bestTime')) {
        localStorage.setItem('bestTime', timerSpan.textContent);
        bestTimeSpan.textContent = timerSpan.textContent;
      }
    }
  } else {
    unflipCards();
  }
}

function disableCards() {
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);
  resetBoard();
}

function unflipCards() {
  lockBoard = true;
  setTimeout(() => {
    firstCard.classList.remove('flipped');
    secondCard.classList.remove('flipped');
    resetBoard();
  }, 1000);
}

function resetBoard() {
  [hasFlippedCard, lockBoard] = [false, false];
  [firstCard, secondCard] = [null, null];
}

// Reset game
function resetGame() {
  stopTimer();
  seconds = 0;
  minutes = 0;
  timerSpan.textContent = '00:00';
  moves = 0;
  movesSpan.textContent = moves;
  messageDiv.textContent = '';
  createCards(parseInt(difficultySelect.value));
  gameStarted = false;
}

// Difficulty change
difficultySelect.addEventListener('change', resetGame);
resetBtn.addEventListener('click', resetGame);

// Initialize game
createCards(parseInt(difficultySelect.value));