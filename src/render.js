const { ipcRenderer } = require("electron");

function captureSnapshot() {
  var percyToken = document.getElementById("percyToken").value;
  var percyBranch = document.getElementById("percyBranch").value;
  if (percyToken === "" || percyBranch === "") {
    alert("Please add the Percy Token and Percy Branch.");
  } else {
    // Capture Snapshots
    document.getElementById("snapshotButton").disabled = true;
    document.getElementsByClassName("loading")[0].style.display = "block";
    ipcRenderer.send("createPercyTokenFile", percyToken);
    ipcRenderer.send("createPercyBranchFile", percyBranch);
    let Data = {
      token: percyToken,
      branch: percyBranch,
    };
    ipcRenderer.send("captureSnapshot-action", Data);
  }
}

ipcRenderer.on("captureSnapshot-response", (event, arg) => {
  console.log(arg);
});

ipcRenderer.on("captureSnapshot-completed", (event, arg) => {
  document.getElementById("snapshotButton").disabled = false;
  document.getElementsByClassName("loading")[0].style.display = "none";
});

ipcRenderer.on("createSnapshotFileResponse", (event, arg) => {
  console.log(arg);
});

ipcRenderer.on("createPercyConfigFileResponse", (event, arg) => {
  console.log(arg);
});

ipcRenderer.on("loadSnapshotFile-response", (event, arg) => {
  console.log(arg);
  var snapshotListItem = `
    <tr>
      <th>Snapshot Name*</th>
      <th>Website URL*</th>
      <th>Wait Time</th>
    </tr>`;
  arg.forEach((element) => {
    snapshotListItem += `
    <tr>
      <div class="snapshotListItem">
      <td><input class="snapshotName" type="text" placeholder="Add Snapshot Name*" value="${element.name}" disabled required/></td>
      <td><input class="url" type="text" placeholder="Add Website URL*" value="${element.url}" disabled required/></td>
      <td><input class="waitTime" type="number" placeholder="Add Wait Time (Optional)" value="${element.waitForTimeout}" disabled/></td>
      <td><button class="removeButton" onclick="removeUrl(this)" style="visibility: hidden"> - </button></td>
      </div>
    </tr>
  `;
  });
  var list = document.getElementById("weburls");
  list.innerHTML = snapshotListItem;
});

ipcRenderer.on("loadPercyConfigFile-response", (event, arg) => {
  document.getElementById("percyConfig").innerHTML = arg;
});

ipcRenderer.on("loadPercyTokenFile-response", (event, arg) => {
  document.getElementById("percyToken").value = arg;
});

ipcRenderer.on("loadPercyBranchFile-response", (event, arg) => {
  document.getElementById("percyBranch").value = arg;
});

function addUrl() {
  var snapshotListItem = `
    <tr>
      <div class="snapshotListItem">
        <td><input class="snapshotName" type="text" placeholder="Add Snapshot Name*" required/></td>
        <td><input class="url" type="text" placeholder="Add Website URL*" required/></td>
        <td><input class="waitTime" type="number" placeholder="Add Wait Time (Optional)"/></td>
        <td><button class="removeButton" onclick="removeUrl(this)" style="visibility: visible"> - </button></td>
      </div>
    </tr>
  `;
  var list = document.getElementById("weburls");
  list.insertAdjacentHTML("beforeend", snapshotListItem);
}

function removeUrl(element) {
  element.parentElement.parentElement.remove();
}

function toggleEdit(element) {
  var elementValue = element.innerHTML;
  var isEdit = elementValue === "Edit";

  var urls = document.getElementsByClassName("url");
  var snapshotNames = document.getElementsByClassName("snapshotName");
  var waitTimes = document.getElementsByClassName("waitTime");
  var removeButtons = document.getElementsByClassName("removeButton");
  var webUrls = [];

  if (!isEdit) {
    for (var i = 0; i < urls.length; i++) {
      if (urls[i].value === "" || snapshotNames[i].value === "") {
        console.log("Web URLs or Snapshot Names can't be empty.");
        ipcRenderer.send("showDialog", {
          title: "Missing Data",
          type: "error",
          message: "Web URLs or Snapshot Names can't be empty.",
        });
        return;
      }
      webUrls.push({
        name: snapshotNames[i].value,
        url: urls[i].value,
        waitForTimeout: Number(waitTimes[i].value) || 2000,
      });
    }
    console.log(webUrls);
    ipcRenderer.send("createSnapshotFile", webUrls);
  }

  element.innerHTML = isEdit ? "Save" : "Edit";
  document.getElementById("addButton").style.visibility = isEdit
    ? "visible"
    : "hidden";
  document.getElementById("importButton").style.visibility = !isEdit
    ? "visible"
    : "hidden";
  document.getElementById("exportButton").style.visibility = !isEdit
    ? "visible"
    : "hidden";
  for (var i = 0; i < urls.length; i++) {
    urls[i].disabled = !isEdit;
    snapshotNames[i].disabled = !isEdit;
    waitTimes[i].disabled = !isEdit;
  }
  for (var i = 0; i < removeButtons.length; i++) {
    removeButtons[i].style.visibility = isEdit ? "visible" : "hidden";
  }
}

function toggleConfigEdit(element) {
  var elementValue = element.innerHTML;
  var isEdit = elementValue === "Edit";
  element.innerHTML = isEdit ? "Save" : "Edit";
  var percyConfigTextArea = document.getElementById("percyConfig");
  if (!isEdit && percyConfigTextArea.value !== "") {
    ipcRenderer.send("createPercyConfigFile", percyConfigTextArea.value);
  }
  percyConfigTextArea.disabled = !isEdit;
}

function importSnapshot() {
  ipcRenderer.send("importSnapshots");
}

function exportSnapshot() {
  ipcRenderer.send("exportSnapshots");
}
