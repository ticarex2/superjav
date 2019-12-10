const javforme = require("./javforme");
const r18 = require("./r18");
const _ = require('lodash');
const fs = require("fs");

main();

async function main() {
    // await Promise.all([javforme.keepGettingVideos(), r18.getAllVideos()]);

    const javformeVideos = readVideosFile("javforme-videos.json");
    const r18Videos = readVideosFile("r18-videos.json");

    normalizeJavids(javformeVideos);
    normalizeJavids(r18Videos);

    const allVideos = joinVideos(javformeVideos, r18Videos);

    saveVideos("www/videos.json", allVideos);
}

function readVideosFile(filename) {
    return JSON.parse(
        fs.readFileSync(filename, {
            encoding: "utf8"
        })
    );
}

function normalizeJavids(videos) {
    for (const video of videos) {
        video.javid = video.javid.toUpperCase().trim();
    }
}

function joinVideos(...videos) {
    const allVideos = [].concat(...videos);

    const uniqueVideos = _.uniqBy(allVideos, "javid");

    return uniqueVideos;
}

function saveVideos(filename, videos) {
    fs.writeFileSync(filename, JSON.stringify(videos), {
        encoding: "utf8"
    });
}