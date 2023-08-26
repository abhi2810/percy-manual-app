const { ipcRenderer } = require("electron");

// Create a new list item when clicking on the "Add" button
function captureSnapshot() {
  var inputValue = document.getElementById("percyToken").value;
  if (inputValue === "") {
    alert("Please add the Percy Token");
  } else {
    // Capture Snapshots
    let Data = {
      token: inputValue,
      file: "/Users/abhi/snapshot.json",
    };
    ipcRenderer.send("captureSnapshot-action", Data);
  }
}

ipcRenderer.on("captureSnapshot-response", (event, arg) => {
  console.log(arg);
});
