const axios = require("axios");
const fs = require("fs");
const path = require("path");
const cron = require("node-cron");
const Mastodon = require("mastodon-api");

const apiEndpoints = [
  { name: "anal", url: "https://api.n-sfw.com/nsfw/anal" },
  { name: "ass", url: "https://api.n-sfw.com/nsfw/ass" },
  { name: "blowjob", url: "https://api.n-sfw.com/nsfw/blowjob" },
  { name: "breeding", url: "https://api.n-sfw.com/nsfw/breeding" },
  { name: "buttplug", url: "https://api.n-sfw.com/nsfw/buttplug" },
  { name: "cages", url: "https://api.n-sfw.com/nsfw/cages" },
  { name: "ecchi", url: "https://api.n-sfw.com/nsfw/ecchi" },
  { name: "feet", url: "https://api.n-sfw.com/nsfw/feet" },
  { name: "fo", url: "https://api.n-sfw.com/nsfw/fo" },
  { name: "furry", url: "https://api.n-sfw.com/nsfw/furry" },
  { name: "gif", url: "https://api.n-sfw.com/nsfw/gif" },
  { name: "hentai", url: "https://api.n-sfw.com/nsfw/hentai" },
  { name: "legs", url: "https://api.n-sfw.com/nsfw/legs" },
  { name: "masturbation", url: "https://api.n-sfw.com/nsfw/masturbation" },
  { name: "milf", url: "https://api.n-sfw.com/nsfw/milf" },
  { name: "muscle", url: "https://api.n-sfw.com/nsfw/muscle" },
  { name: "neko", url: "https://api.n-sfw.com/nsfw/neko" },
  { name: "paizuri", url: "https://api.n-sfw.com/nsfw/paizuri" },
  { name: "petgirls", url: "https://api.n-sfw.com/nsfw/petgirls" },
  { name: "pierced", url: "https://api.n-sfw.com/nsfw/pierced" },
  { name: "selfie", url: "https://api.n-sfw.com/nsfw/selfie" },
  { name: "smothering", url: "https://api.n-sfw.com/nsfw/smothering" },
  { name: "socks", url: "https://api.n-sfw.com/nsfw/socks" },
  { name: "trap", url: "https://api.n-sfw.com/nsfw/trap" },
  { name: "vagina", url: "https://api.n-sfw.com/nsfw/vagina" },
  { name: "yuri", url: "https://api.n-sfw.com/nsfw/yuri" },
];

const progressFilePath = path.join(__dirname, "progress.txt");

const M = new Mastodon({
  access_token: "DEIN_ACCESS_TOKEN",
  api_url: "https://mastodon.example/api/v1/",
});

const downloadFolder = path.join(__dirname, "downloads");
if (!fs.existsSync(downloadFolder)) {
  fs.mkdirSync(downloadFolder);
}

async function downloadFile(url, destination) {
  try {
    const response = await axios({ url, method: "GET", responseType: "stream" });

    if (response.headers["content-length"] === "0") {
      throw new Error("Leere Datei erhalten.");
    }

    const writer = fs.createWriteStream(destination);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    const stats = fs.statSync(destination);
    if (stats.size === 0) {
      fs.unlinkSync(destination);
      throw new Error("Heruntergeladene Datei ist leer.");
    }

    return true;
  } catch (error) {
    console.error(`Fehler beim Herunterladen: ${error.message}`);
    return false;
  }
}

async function postImageOnMastodon(imagePath, imageURL, endpointName) {
  try {
    const mediaResponse = await M.post("media", { file: fs.createReadStream(imagePath) });
    const mediaId = mediaResponse.data.id;

    await M.post("statuses", {
      status: `Kategorie: #${endpointName}\nLink: https://n-sfw.com/nsfw/${endpointName.toLowerCase()}\nBild: ${imageURL}`,
      media_ids: [mediaId],
      sensitive: true,
    });

    console.log(`Bild erfolgreich gepostet: ${imagePath}`);
    fs.unlinkSync(imagePath);
  } catch (error) {
    console.error(`Fehler beim Posten: ${error.message}`);
  }
}

function loadProgress() {
  if (fs.existsSync(progressFilePath)) {
    const content = fs.readFileSync(progressFilePath, "utf8").trim();
    if (content) {
      const [index, filename] = content.split(",");
      return { index: parseInt(index), filename };
    }
  }
  return { index: 0, filename: "" };
}

function saveProgress(index, filename) {
  fs.writeFileSync(progressFilePath, `${index},${filename}`);
}

let { index: currentApiIndex, filename: lastPostedFilename } = loadProgress();

async function downloadFromAPIAndPostOnMastodon() {
  try {
    const { name, url } = apiEndpoints[currentApiIndex];
    const response = await axios.get(url);
    const { file: filename, url: imageUrl } = response.data;

    if (filename !== lastPostedFilename) {
      const destination = path.join(downloadFolder, filename);
      const downloaded = await downloadFile(imageUrl, destination);

      if (downloaded) {
        await postImageOnMastodon(destination, imageUrl, name);
        lastPostedFilename = filename;
        saveProgress(currentApiIndex, lastPostedFilename);
      }
    } else {
      console.log("Bereits gepostetes Bild übersprungen:", imageUrl);
    }

    currentApiIndex = (currentApiIndex + 1) % apiEndpoints.length;
  } catch (error) {
    console.error("Fehler im Hauptprozess:", error.message);
  }
}

cron.schedule("0 * * * *", downloadFromAPIAndPostOnMastodon);
