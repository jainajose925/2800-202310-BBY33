// function saveJournal() {
//     // changing the query selector to getElementbyID.
//     console.log(document.querySelector(".journal.active").parentNode.childNodes[1].childNodes[3]);
//     document.querySelector(".journal.active").parentNode.childNodes[1].childNodes[3].addEventListener("click", function() {
//         var journalText = document.getElementById("journalInput").value; // Input value
//         let journalDoc = db.collection('users').doc(localStorage.getItem('userID')).collection('journals').doc("My Journal");
//         journalDoc.update({
//             description: journalText
//         })
//     })
// }

// function getJournalContent() {
//     db.collection('users').doc(localStorage.getItem('userID')).collection('journals').doc("My Journal").get().then(text => {
//         document.getElementById("journalInput").innerHTML = text.data().description;
//     })
// }

function saveJournal(collection) {
    document.getElementById(/* saveButton*/"button").addEventListener("click", function () {
       let content = document.getElementById(/* journal text box*/journalText).value;
       // await collection.
        // Edit user journal array or somethin
    });
}

function getJournalContent(collection) {
}