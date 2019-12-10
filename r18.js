const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

module.exports = {
    getAllVideos
};

function log(msg) {
    console.log(`[r18] ${msg}`);
}

async function getAllVideos(startingPage = 1) {
    const videos = [];

    let currentPage = startingPage;

    while (true) {
        try {
            log(`Baixando página ${currentPage}...`);

            const page = await getPage(currentPage);

            videos.push(...page.videos);

            log(`Página ${currentPage} baixada`);
            log(`Adicionado ${page.videos.length} vídeos`);
            log(`Total de vídeos: ${videos.length}`);

            if (!page.hasNextPage)
                break;

            currentPage++;
        } catch (e) {
            console.error(e);
            break;
        }
    }

    log(`Terminou de baixar os vídeos!!!`);
    log(`Baixados ${videos.length} vídeos no total`);
    log(`Da página ${startingPage} até a página ${currentPage}`);

    saveVideos(videos);

    log(`Vídeos salvos!`);

    return videos;
}

function saveVideos(videos) {
    fs.writeFileSync("r18-videos.json", JSON.stringify(videos), {
        encoding: "utf8"
    });
}

async function getPage(pageNum) {
    const html = await getHtml(pageNum);
    const page = parseHtml(html);

    return page;
}

async function getHtml(page) {
    const res = await axios.get(
        `https://www.r18.com/videos/vod/movies/list/pagesize=120/price=all/sort=popular/type=all/page=${page}/`
    );

    return res.data;
}

function parseHtml(html) {
    const $ = cheerio.load(html);
    const videos = [];

    $(".item-list > a").each(function (index) {
        const video = {
            name: $(this).find("dl > dt").text(),
            image: $(this).find("p > img").attr("data-original"),
            javid: $(this).find("p > img").attr("alt")
        };
        videos.push(video);
    });

    const hasNextPage = !$(".next > a").hasClass("off");

    return {
        videos,
        hasNextPage
    };
}