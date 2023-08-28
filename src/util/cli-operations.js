const { dialog } = require("electron");
const { spawn } = require("child_process");

const runScript = (command, mainWindow, args, callback) => {
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
};

exports.runScript = runScript;
