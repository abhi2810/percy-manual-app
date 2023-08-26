const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const { spawn } = require("child_process");
const path = require("path");

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
  run_script("npx percy snapshot " + arg.file);
  console.log(arg);
});

function run_script(command, args, callback) {
  var child = spawn(command, args, {
    encoding: "utf8",
    shell: true,
    env: { ...process.env },
  });
  // You can also use a variable to save the output for when the script closes later
  child.on("error", (error) => {
    dialog.showMessageBox({
      title: "Title",
      type: "warning",
      message: "Error occured.\r\n" + error,
    });
  });

  child.stdout.setEncoding("utf8");
  child.stdout.on("data", (data) => {
    //Here is the output
    data = data.toString();
    mainWindow.webContents.send("captureSnapshot-response", data);
    console.log(data);
  });

  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (data) => {
    // Return some data to the renderer process with the mainprocess-response ID
    mainWindow.webContents.send("captureSnapshot-response", data);
    //Here is the output from the command
    console.log(data);
  });

  child.on("close", (code) => {
    //Here you can get the exit code of the script
    switch (code) {
      case 0:
        dialog.showMessageBox({
          title: "Title",
          type: "info",
          message: "End process.\r\n",
        });
        break;
    }
  });
  if (typeof callback === "function") callback();
}
