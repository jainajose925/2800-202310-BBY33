const numPerPage = 4;
let numPages = 0;
const numPageBtn = 3;

const setup = async () => {
    // let v =
    console.log(entryList);
    showContents();
    // $('#entries').append()
    // $('#date').append('<h1>hello</h1>');
    // showPage(1);
}

function apple(__entries) {
    console.log(__entries);
}
async function showPage(currPage) {
    if (currPage > numPages)
        currPage = numPages;

    if (currPage < 1)
        currPage = 1;


    let entryGroup = $('#entries');
    let pagination = $('#pagination').empty();
    pagination.append(`
        <button type="button" onclick="apple(entries.length)" value="Spp">
    `)
}
$(document).ready(setup);

