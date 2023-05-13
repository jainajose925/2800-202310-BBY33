// PlaceHolder for main merge issue.
const moodButtons = document.querySelectorAll('.moodButton');
const submitButton = document.querySelector('#submitMood');

moodButtons.forEach((button) => {
  button.addEventListener('change', () => {
    if (document.querySelector('.moodButton:checked')) {
      document.querySelector('#submitMood').classList.add('expanded');
      submitButton.removeAttribute('disabled');
      document.querySelector('#moodLogger').classList.add('expanded');
    } else {
      document.querySelector('#moodLogger').classList.remove('expanded');
      document.querySelector('#submitMood').classList.remove('expanded');
      submitButton.setAttribute('disabled');
      
    }
  });
});


