const { app, shell, Menu, Tray } = require("electron");
const electronPrompt = require("electron-prompt");

const { getRequestTokenAndAuthorizeUrl, getAccessToken } = require("./oauth");

// Query to get balance: { my { userAccount { balance } } }

async function authorizeWithKiva() {
  const { requestToken, authorizeUrl } = await getRequestTokenAndAuthorizeUrl();

  shell.openExternal(authorizeUrl);

  // TODO: electronPrompt seems to break something. Get the access code in a different way.
  electronPrompt({
    title: "Enter your Kiva authorization code",
    label: "Kiva authorization code:",
    value: "",
    type: "input"
  })
    .then(verifier => {
      getAccessToken(verifier, requestToken);
    })
    .catch(console.error);
}

function setBalance(balance) {
  tray.setTitle(`$${balance.toString()}`);
}

function refreshBalance() {
  setBalance(15.23);
}

function openKiva() {
  shell.openExternal("https://www.kiva.org/lend-by-category");
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
