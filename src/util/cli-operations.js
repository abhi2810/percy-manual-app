const { dialog } = require("electron");
const { spawn } = require("child_process");

const runScript = (command, mainWindow, args, callback) => {
  var child = spawn(command, args, {
    encoding: "utf8",
    shell: true,
  });

  child.on("error", (error) => {
    dialog.showMessageBox({
      title: "Command Failed",
      type: "warning",
      message: "Error occured.\r\n" + error,
    });
    mainWindow.webContents.send("captureSnapshot-completed", error);
  });

  child.stdout.setEncoding("utf8");
  child.stdout.on("data", (data) => {
    data = data.toString();
    mainWindow.webContents.send("captureSnapshot-response", data);
    if (data.indexOf("Finalized build") !== -1) {
      dialog.showMessageBox({
        title: "Snapshot Captured",
        type: "info",
        message: data,
      });
    }
    console.log(data);
  });

  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (data) => {
    mainWindow.webContents.send("captureSnapshot-response", data);
    console.log(data);
  });

  child.on("close", (code) => {
    switch (code) {
      case 0:
        dialog.showMessageBox({
          title: "Command Executed",
          type: "info",
          message: "End process.\r\n",
        });
        mainWindow.webContents.send("captureSnapshot-completed", code);
        break;
    }
  });
  if (typeof callback === "function") callback();
};

exports.runScript = runScript;
