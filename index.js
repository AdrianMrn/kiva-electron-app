const { app, shell, Menu, Tray } = require("electron");
const { getRequestTokenAndAuthorizeUrl, getAccessToken } = require("./oauth");
const prompt = require("electron-prompt");

// Query to get balance: { my { userAccount { balance } } }

function setBalance(balance) {
  tray.setTitle(`$${balance.toString()}`);
}

function refreshBalance() {
  /* setBalance(15.23); */
}

function openKiva() {
  shell.openExternal("https://www.kiva.org/lend-by-category");
}

async function authorizeWithKiva() {
  const { requestToken, authorizeUrl } = await getRequestTokenAndAuthorizeUrl();

  shell.openExternal(authorizeUrl);

  const verifier = await prompt({
    title: "Enter your Kiva authorization code",
    label: "Kiva authorization code:",
    value: "",
    type: "input"
  });

  getAccessToken(verifier, requestToken);
}

let tray;
app.on("ready", () => {
  // Initializing tray icon
  tray = new Tray("./logo_kiva.png");

  // Initializing context menu
  const contextMenu = Menu.buildFromTemplate([
    { label: "Open Kiva", click: openKiva },
    { label: "Refresh Balance", click: refreshBalance },
    { label: "Authorize app with Kiva", click: authorizeWithKiva }
  ]);

  tray.setContextMenu(contextMenu);

  // Initializing Kiva connection
  authorizeWithKiva();
});
