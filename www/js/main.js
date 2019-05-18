const PAGE_SIZE = 50;

const g = {
    videos: [],
    results: [],
    page: 0
};

main();

function searchButton() {
    const term = document.querySelector("#term").value.trim();

    searchVideo(term);
}

function goTo(el, service) {
    const item = el.parentElement.parentElement;
    const name = item.querySelector(".name").innerText;
    const id = item.dataset.javid;

    let url = "";
    switch (service) {
        case "google":
            url = `https://www.google.com/search?q=${encodeURI(id)}`
            break;
        default:
        case "javmost":
            url = `https://www.javmost.com/tag/${encodeURI(id)}/`
            break;
    }

    window.open(url, '_blank');
}

async function main() {
    await setup();
}

async function setup() {
    g.videos = await getVideos();
}

function searchVideo(term) {
    search(term);

    return false;
}

function search(query) {
    query = query.trim();

    const terms = query.split(" ");

    const results = [];

    for (const video of g.videos) {
        const name = video.name;
        let score = 0;

        if (includesWord(name, query)) {
            score = terms.length + 1;
        } else {
            for (const term of terms) {
                if (includesWord(name, term))
                    score++;
            }
        }

        if (score > 0)
            results.push({
                ...video,
                score
            });
    }

    const shuffledResults = shuffle(results);

    shuffledResults.sort((a, b) => {
        return b.score - a.score;
    });

    g.results = shuffledResults;
    g.page = 0;

    renderResults();
}

function renderResults() {
    const results = g.results;

    const $results = document.getElementById("results");
    $results.innerHTML = "";

    for (const result of results.slice(g.page * PAGE_SIZE, g.page * PAGE_SIZE + PAGE_SIZE)) {
        $results.innerHTML += `
                    <div class="item" data-javid="${result.javid}">
                        <div class="javid">[${result.javid}]</div>
                        <div class="name">${result.name}</div>
                        <div class="score">search score: ${result.score}</div>
                        <div class="image">
                            <img src="${result.image}">
                        </div>
                        <div class="buttons">
                            <button onclick="goTo(this, 'google')">Google</button>
                            <button onclick="goTo(this, 'javmost')">javmost</button>
                        </div>
                    </div>
                `;
    }

    const $prevPageButton = document.querySelector("#prev-page");
    const $nextPageButton = document.querySelector("#next-page");

    if (g.page > 0)
        $prevPageButton.disabled = false;
    else
        $prevPageButton.disabled = true;

    if (g.page * PAGE_SIZE + PAGE_SIZE >= g.results.length)
        $nextPageButton.disabled = true;
    else
        $nextPageButton.disabled = false;

    document.querySelector("#current-page").innerText = g.page + 1;
    document.querySelector("#results-num").innerText = g.results.length;

    window.scrollTo(0, 0);
}

function nextPage() {
    g.page++;
    renderResults();
}

function prevPage() {
    if (g.page > 0)
        g.page--;
    renderResults();
}

function includesWord(haystack, word) {
    haystack = haystack.toLowerCase();
    word = word.toLowerCase();

    if (haystack === word)
        return true;

    if (word.length > haystack)
        return false;

    if (haystack.startsWith(word + " "))
        return true;

    if (haystack.endsWith(" " + word))
        return true;

    if (haystack.includes(" " + word + " "))
        return true;

    return false;
}

async function getVideos() {
    let res = await fetch("videos.json");
    let videos = await res.json();

    return videos;
}

function shuffle(array) {
    var currentIndex = array.length,
        temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}