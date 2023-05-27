// Initiate the mood tracker
const form = document.getElementById("moodForm");
const radios = form.elements.mood;

for (let i = 0; i < radios.length; i++) {
    radios[i].addEventListener("click", () => {
        form.submit();
    });
}