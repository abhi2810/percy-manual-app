const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const path = require("path");
const { getPlatform } = require("./util/get-platform");
const { runScript } = require("./util/cli-operations");
const {
  createDataFolder,
  snapshotFileExists,
  createSnapshotFile,
  snapshotFilePath,
  loadSnapshotFile,
  createPercyConfigFile,
  percyConfigFileExists,
  loadPercyConfigFile,
  percyConfigFilePath,
  percyTokenFileExists,
  loadPercyTokenFile,
  createPercyTokenFile,
  moveSnapshotFile,
  percyBranchFileExists,
  loadPercyBranchFile,
  createPercyBranchFile,
  snapshotYMLFilePath,
} = require("./util/file-operations");

const IS_DEV = process.env.NODE_ENV === "dev";
const PLATFORM = getPlatform();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}
let mainWindow;
const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });
  // mainWindow.maximize();
  createDataFolder();
  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "index.html")).then(() => {
    if (snapshotFileExists()) {
      console.log("Loading Snapshot file");
      loadSnapshotFile((err, data) => {
        if (err) {
          console.log("Error reading snapshot file:" + err);
        } else {
          mainWindow.webContents.send(
            "loadSnapshotFile-response",
            JSON.parse(data)
          );
        }
      });
    }
    if (percyConfigFileExists()) {
      console.log("Loading Percy Config file");
      loadPercyConfigFile((err, data) => {
        if (err) {
          console.log("Error reading Percy Config file:" + err);
        } else {
          mainWindow.webContents.send("loadPercyConfigFile-response", data);
        }
      });
    }
    if (percyTokenFileExists()) {
      console.log("Loading Percy Token file");
      loadPercyTokenFile((err, data) => {
        if (err) {
          console.log("Error reading Percy Token file:" + err);
        } else {
          mainWindow.webContents.send("loadPercyTokenFile-response", data);
        }
      });
    }
    if (percyBranchFileExists()) {
      console.log("Loading Percy Branch file");
      loadPercyBranchFile((err, data) => {
        if (err) {
          console.log("Error reading Percy Branch file:" + err);
        } else {
          mainWindow.webContents.send("loadPercyBranchFile-response", data);
        }
      });
    }
  });

  // Open the DevTools.
  if (IS_DEV) mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on("importSnapshots", (event, arg) => {
  var importFilePath = dialog.showOpenDialogSync({
    filters: [{ name: "snapshot", extensions: ["json"] }],
    properties: ["openFile"],
  });
  moveSnapshotFile(importFilePath[0], function (err) {
    if (err) {
      dialog.showMessageBox({
        title: "Error occured while importing the snapshot file.",
        type: "warning",
        message: "Error occured.\r\n" + err,
      });
      return;
    }
    if (snapshotFileExists()) {
      console.log("Loading Snapshot file");
      loadSnapshotFile((err, data) => {
        if (err) {
          console.log("Error reading snapshot file:" + err);
        } else {
          mainWindow.webContents.send(
            "loadSnapshotFile-response",
            JSON.parse(data)
          );
        }
      });
    }
  });
});

ipcMain.on("exportSnapshots", (event, arg) => {
  dialog.showMessageBox({
    title: "Opening File Location",
    type: "info",
    message: "File Located, Please copy the snapshot.json file.",
  });
  shell.showItemInFolder(snapshotFilePath);
});

ipcMain.on("createPercyConfigFile", (event, arg) => {
  createPercyConfigFile(arg, (err) => {
    if (err) {
      dialog.showMessageBox({
        title: "Error occured while creating the file.",
        type: "warning",
        message: "Error occured.\r\n" + err,
      });
    }
    event.sender.send("createPercyConfigFileResponse", true);
  });
});

ipcMain.on("showDialog", (event, arg) => {
  dialog.showMessageBox(arg);
});

ipcMain.on("createSnapshotFile", (event, arg) => {
  createSnapshotFile(arg, (err) => {
    if (err) {
      dialog.showMessageBox({
        title: "Error occured while creating the file.",
        type: "warning",
        message: "Error occured.\r\n" + err,
      });
    }
    event.sender.send("createSnapshotFileResponse", true);
  });
});

ipcMain.on("createPercyTokenFile", (event, arg) => {
  createPercyTokenFile(arg, (err) => {
    if (err) {
      dialog.showMessageBox({
        title: "Error occured while creating the file.",
        type: "warning",
        message: "Error occured.\r\n" + err,
      });
    }
  });
});

ipcMain.on("createPercyBranchFile", (event, arg) => {
  createPercyBranchFile(arg, (err) => {
    if (err) {
      dialog.showMessageBox({
        title: "Error occured while creating the file.",
        type: "warning",
        message: "Error occured.\r\n" + err,
      });
    }
  });
});

ipcMain.on("captureSnapshot-action", (event, arg) => {
  if (snapshotFileExists()) {
    process.env["PERCY_TOKEN"] = arg.token;
    process.env["PERCY_BRANCH"] = arg.branch;
    if (IS_DEV) {
      mainWindow.webContents.send("captureSnapshot-response", process.arch);
      runScript(
        `npx percy snapshot ${snapshotYMLFilePath} -c ${percyConfigFilePath}`,
        mainWindow
      );
    } else {
      var percyCLI = PLATFORM === "win" ? "run.cmd" : "run.cjs";
      var nodeCLI = PLATFORM === "win" ? "node.exe" : "node";
      const percyPath = path.join(
        path.dirname(process.execPath),
        "..",
        "./Resources",
        "./app/node_modules/@percy/cli/bin",
        `./${percyCLI}`
      );
      const nodePath = path.join(
        path.dirname(process.execPath),
        "..",
        "./Resources",
        "./binary",
        `./${PLATFORM}-${process.arch}/${nodeCLI}`
      );
      runScript(
        `${nodePath} ${percyPath} snapshot ${snapshotYMLFilePath} -c ${percyConfigFilePath}`,
        mainWindow
      );
    }
    console.log(arg);
  } else {
    dialog.showMessageBox({
      title: "Missing URLs",
      type: "error",
      message: "Please add URLs for capturing snapshots.",
    });
  }
});
