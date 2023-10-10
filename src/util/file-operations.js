const { app } = require("electron");
const path = require("path");
const fs = require("fs");

const scrollYML = `
references:
  scrollDown: &scrollDown |
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    for (let i = 0; i < document.body.scrollHeight; i += 100) {
      window.scrollTo(0, i);
      await delay(100);
    }

snapshots:
`;

const homePath = app.getPath("home");
const percyManualHome = path.join(homePath, "./.percy-manual");
const snapshotFilePath = path.join(
  homePath,
  "./.percy-manual",
  "./snapshot.json"
);
const snapshotYMLFilePath = path.join(
  homePath,
  "./.percy-manual",
  "./snapshot.yml"
);
const percyConfigFilePath = path.join(
  homePath,
  "./.percy-manual",
  "./.percy.yml"
);

const percyTokenFilePath = path.join(
  homePath,
  "./.percy-manual",
  "./.percy_token"
);

const percyBranchFilePath = path.join(
  homePath,
  "./.percy-manual",
  "./.percy_branch"
);

const createDataFolder = () => {
  if (!fs.existsSync(percyManualHome)) fs.mkdirSync(percyManualHome);
};

const snapshotFileExists = () => {
  return fs.existsSync(snapshotFilePath);
};

const createSnapshotFile = (snapshotJson, callback) => {
  var str = scrollYML;
  for (var i in snapshotJson) {
    str += `
  - name: ${snapshotJson[i]["name"]}
    url: ${snapshotJson[i]["url"]}
    waitForTimeout: ${snapshotJson[i]["waitForTimeout"]}
    execute: *scrollDown`;
  }
  str += `\n`;
  fs.writeFileSync(snapshotYMLFilePath, str, "utf8");
  fs.writeFile(
    snapshotFilePath,
    JSON.stringify(snapshotJson),
    "utf8",
    callback
  );
};

const loadSnapshotFile = (callback) => {
  fs.readFile(snapshotFilePath, "utf8", callback);
};

const percyTokenFileExists = () => {
  return fs.existsSync(percyTokenFilePath);
};

const createPercyTokenFile = (percyToken, callback) => {
  fs.writeFile(percyTokenFilePath, percyToken, "utf8", callback);
};

const loadPercyTokenFile = (callback) => {
  fs.readFile(percyTokenFilePath, "utf8", callback);
};

const percyBranchFileExists = () => {
  return fs.existsSync(percyBranchFilePath);
};

const createPercyBranchFile = (percyBranch, callback) => {
  fs.writeFile(percyBranchFilePath, percyBranch, "utf8", callback);
};

const loadPercyBranchFile = (callback) => {
  fs.readFile(percyBranchFilePath, "utf8", callback);
};

const percyConfigFileExists = () => {
  return fs.existsSync(percyConfigFilePath);
};

const createPercyConfigFile = (data, callback) => {
  fs.writeFile(percyConfigFilePath, data, "utf8", callback);
};

const loadPercyConfigFile = (callback) => {
  fs.readFile(percyConfigFilePath, "utf8", callback);
};

const moveSnapshotFile = (importPath, callback) => {
  fs.copyFile(importPath, snapshotFilePath, callback);
};

exports.createDataFolder = createDataFolder;
exports.snapshotFileExists = snapshotFileExists;
exports.createSnapshotFile = createSnapshotFile;
exports.loadSnapshotFile = loadSnapshotFile;
exports.percyConfigFileExists = percyConfigFileExists;
exports.createPercyConfigFile = createPercyConfigFile;
exports.loadPercyConfigFile = loadPercyConfigFile;
exports.percyTokenFileExists = percyTokenFileExists;
exports.createPercyTokenFile = createPercyTokenFile;
exports.loadPercyTokenFile = loadPercyTokenFile;
exports.percyBranchFileExists = percyBranchFileExists;
exports.createPercyBranchFile = createPercyBranchFile;
exports.loadPercyBranchFile = loadPercyBranchFile;
exports.moveSnapshotFile = moveSnapshotFile;
exports.snapshotFilePath = snapshotFilePath;
exports.percyConfigFilePath = percyConfigFilePath;
exports.snapshotYMLFilePath = snapshotYMLFilePath;
