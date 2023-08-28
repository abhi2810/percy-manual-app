const { app } = require("electron");
const path = require("path");
const fs = require("fs");

const homePath = app.getPath("home");
const percyManualHome = path.join(homePath, "./.percy-manual");

const createDataFolder = () => {
  if (!fs.existsSync(percyManualHome)) fs.mkdirSync(percyManualHome);
};

exports.createDataFolder = createDataFolder;
