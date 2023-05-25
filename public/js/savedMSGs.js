// console.log(messages.split(",\n"));

const setup = async () => {

    messages =
        messages.split("M,");
    const savedMessages = $('.saved-messages').empty();

    if (messages[0] === "") {
        return;
    }
    for (let i = 0; i < messages.length; i++) {
        let tempArray = messages[i].split("Bot");
        savedMessages.append(`
        <p class="text-break botMessage" data-value="${i}">
            ${tempArray[0]}
            <br>
            <span class="extraActions">
                <img style="display:none" class="actionIcon" src="/img/star-favorite.svg">
            </span>
        </p>
    `);
    }

    let botParagraphs = document.querySelectorAll('.botMessage');

    botParagraphs.forEach(ele => {
        let holdTimeout;

        /**
         * Function is displaying the list of actions to the bot message.
         *
         * Reference: ChatGPT.
         */
        ele.addEventListener("mousedown", function() {
            holdTimeout = setTimeout(function() {
                // Perform action when the button is held for a certain duration
                ele.setAttribute("style", "background-color: #c1b1c3");
                // console.log(ele.children[0].childNodes[2].childNodes[1].style = "");
                // ele.children[0].childNodes[2].childNodes[0].removeAttribute("style");
                // console.log();
                ele.children[1].children[0].removeAttribute("style")
                // ele.children[0].childNodes[2].childNodes[1].style = "";
                // console.log(ele.innerText);
                // console.log("Button held");
            }, 1000); // Adjust the duration as needed
        });

        ele.children[1].children[0].addEventListener("click", function() {
            fetch('/chatbot/remove', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ botMsg: ele.dataset.value})
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

}

$(document).ready(setup());