const { ipcRenderer } = require("electron");

function sendForm(event) {
  event.preventDefault();

  const authCode = document.getElementById("code").value;

  ipcRenderer.send("submitAuthCode", authCode);

  handleForm(authCode);
  /* ipcRenderer.send("form-submission", authCode); */
}
