const buttons = document.querySelectorAll(".op");
const links = ["/account", "/contact", "/about", "/help"];

for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", function () {
        window.location.href = links[i];
    });
}