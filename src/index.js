const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { getPlatform } = require("./util/get-platform");
const { runScript } = require("./util/cli-operations");
const { createDataFolder } = require("./util/file-operations");

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
    width: 800,
    height: 600,
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
  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
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

ipcMain.on("captureSnapshot-action", (event, arg) => {
  process.env["PERCY_TOKEN"] = arg.token;
  if (IS_DEV) {
    mainWindow.webContents.send("captureSnapshot-response", process.arch);
    runScript(`npx percy snapshot ${arg.file}`, mainWindow);
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
    runScript(`${nodePath} ${percyPath} snapshot ${arg.file}`, mainWindow);
  }
  console.log(arg);
});
