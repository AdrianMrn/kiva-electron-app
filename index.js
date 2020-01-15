const { app, shell, Menu, Tray } = require("electron");
const { authWithKiva } = require("./oauth");

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

let tray;
app.on("ready", () => {
  // Initializing tray icon
  tray = new Tray("./logo_kiva.png");

  // Initializing context menu
  const contextMenu = Menu.buildFromTemplate([
    { label: "Open Kiva", click: openKiva },
    { label: "Refresh Balance", click: refreshBalance },
    { label: "Authorize app with Kiva", click: authWithKiva }
  ]);

  tray.setContextMenu(contextMenu);

  // Initializing Kiva connection
  authWithKiva();
});
