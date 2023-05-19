console.log("Hi?");
let botParagraphs = document.querySelectorAll('.botMessage');
let action = document.querySelectorAll('.actionIcon');
let i = 0;
botParagraphs.forEach(function (ele) {
    let holdTimeout;
    /**
     * Function is displaying the list of actions to the bot message.
     *
     * Reference: ChatGPT.
     */
    ele.addEventListener("mousedown", function() {
        holdTimeout = setTimeout(function() {
            // Perform action when the button is held for a certain duration
            ele.setAttribute("style", "background-color: blue");
            action[i].removeAttribute("style");
            // console.log(ele.innerText);
            // console.log("Button held");
        }, 1000); // Adjust the duration as needed
    });

    action[i].addEventListener("click", function() {
        fetch('/chatbot/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ botMsg: ele.innerHTML })
        })
            .then(response => {
                if (response.ok) {
                    return response.text();
                } else {
                    throw new Error('Network response was not ok.');
                }
            })
            .then(responseText => {
                console.log(responseText); // Response from the server
                this.setAttribute("style", "display: none");
            })
            .catch(error => {
                console.error('Error:', error);
            });
    })
    ele.addEventListener("mouseup", function() {
        ele.removeAttribute("style");
        clearTimeout(holdTimeout);
    });
})