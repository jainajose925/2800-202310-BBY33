/*
    This file is used to handle the settings page.
 */
const hiddenSetting = document.querySelectorAll(".admin");
const buttons = document.querySelectorAll(".op");
const links = ["/account", "/about", "/help", "/members"];

if (adminStatus) {
    hiddenSetting.forEach(element => element.toggleAttribute("hidden"));
}
for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", function () {
        window.location.href = "/settings" + links[i];
    });
}