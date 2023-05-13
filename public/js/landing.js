// PlaceHolder for main merge issue.
const card = document.querySelector('.flip-card');
const flipButton = document.querySelector('.flip-btn');
const backButton = document.querySelector('.back-btn');

flipButton.addEventListener('click', function() {
  card.classList.add('is-flipped');
});

backButton.addEventListener('click', function() {
  card.classList.remove('is-flipped');
});