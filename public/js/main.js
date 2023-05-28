
const moodButtons = document.querySelectorAll('.moodButton');
const submitButton = document.querySelector('#submitMood');

/*
  Mood button event listeners
 */
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

/*
    Enable editing of text box
 */
function enableEdit() {
  var editBtn = document.querySelector(".editButton");
  var textBox = document.querySelector(".textbox");
  var saveBtn = document.querySelector(".saveButton");

  textBox.disabled = false;
  saveBtn.classList.remove("hidden");
  editBtn.style.display = "none";
}


/*
  Saves the changes made to the mood logger
 */
function saveChanges() {
  var editBtn = document.querySelector(".editButton");
  var textBox = document.querySelector(".textbox");
  var saveBtn = document.querySelector(".saveButton");


  textBox.disabled = true;
  saveBtn.classList.add("hidden");
  editBtn.style.display = "block";
}

