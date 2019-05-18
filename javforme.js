const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

module.exports = {
    keepGettingVideos
};

async function keepGettingVideos() {
    let index = 0;
    let totalVideos = [];
    let numTry = 0;

    while (true) {
        try {
            const videos = await getVideos(index);
            if (videos.length === 0)
                break;

            index += videos.length;

            totalVideos.push(...videos);

            console.log(`adicionado ${videos.length} videos da página ${index}`);
            console.log(`${totalVideos.length} videos baixados até o momento`);

            numTry = 0;
        } catch (e) {
            console.error(`Erro ao pegar vídeos da página ${index}`);
            numTry++;

            if (numTry > 3) {
                console.error(e);
                console.warn("Limite de tentativas alcançado, abortando");
                break;
            } else {
                console.warn(`Tentando novamente pela ${numTry} vez`);
            }
        }
    }

    console.log(`${totalVideos.length} vídeos coletados até a página ${index}`);

    fs.writeFileSync("javforme-videos.json", JSON.stringify(totalVideos), {
        encoding: "utf8"
    });
}

async function getVideos(index = 0) {
    const html = await fetchHTML(index);
    const videos = parseHTML(html);

    return videos;
}

function parseHTML(html) {
    const $ = cheerio.load(html);

    const videos = [];
    $(".video-img > a > img").each(function (index) {
        const video = {
            name: $(this).attr("alt"),
            image: $(this).attr("src")
        };
        videos.push(video);
    });

    return videos;
}

async function fetchHTML(index) {
    const url = "https://javfor.me/jav-api.php";
    const res = await axios.request({
        url,
        method: "post",
        data: `action=list-new&index=${index}`,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        }
    });

    return res.data;
}