
const button = document.getElementById("signup");
button.addEventListener("click", function () {
    window.location.href = "/signUp";
});

document.getElementById("login").addEventListener("click", function () {
    let data = {__loginEmailAddress: document.getElementById("exampleInputEmail1").value, __loginKey: document.getElementById("exampleInputPassword1").value};
    postFormData('/login', data);
});


function postFormData(url, data) {
    // Fetch API POST request
    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (response.ok) {
                window.location.href = '/main';
            } else {
                console.error("Form submission failed");
            }
        })
        .catch(error => {
            console.error("An error occurred while submitting the form", error);
        });
}