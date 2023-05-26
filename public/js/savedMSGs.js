const setup = async () => {

    messages =
        messages.split("M,");
    const savedMessages = $('#msgs').empty();

    if (messages[0] === "") {
        return;
    }
    for (let i = 0; i < messages.length; i++) {
        let tempArray = messages[i].split("Bot");
        savedMessages.append(`
        <li class="text-break .botMessage">
            <p id="entry">
            <img id="delete" class="actionIcon" src="/img/delete.svg" data-value="${((currPg - 1) * numPerPg) + i}">
            ${tempArray[0]}
            </p>    
        </li>
        
    `);
    }

    let deleteIcons = document.querySelectorAll('.actionIcon');

    deleteIcons.forEach(ele => {
        ele.addEventListener("click", function() {
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
                window.location.reload();
            })
            .catch(error => {
                console.error('Error:', error);
            });

        });
    });

}

$(document).ready(setup());