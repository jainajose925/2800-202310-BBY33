const savedMSGLink = document.getElementById("savedMSGHyper-Link");
savedMSGLink.addEventListener("click", function() {
    window.location.href = "/chatbot/1";
})
let botParagraphs = document.querySelectorAll('.botMessage');

botParagraphs.forEach(ele => {
    let saved = false;


    ele.addEventListener("dblclick", function() {
        if (saved)
            return;

        saved = !saved;
            ele.children.namedItem("display").children.namedItem("extraAction").toggleAttribute("hidden");
        fetch('/chatbot/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ botMsg: ele.innerText })
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
            })
            .catch(error => {
                console.error('Error:', error);
            });
    });


    // ele.children.namedItem("display").children.namedItem("extraAction").children.namedItem("save").addEventListener("click", function() {

    // })
})