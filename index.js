const { app, shell, Menu, Tray, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");

const {
  getRequestTokenAndAuthorizeUrl,
  getAccessToken,
  getKivaBalance
} = require("./oauth");

let accessToken;

// needed because https://stackoverflow.com/questions/46596493/why-does-my-electron-app-quit-when-closing-a-renderer-window
app.on("window-all-closed", e => e.preventDefault());

// Query to get balance: { my { userAccount { balance } } }

function authorizeWithKiva() {
  return new Promise(async resolve => {
    // Check if we have already saved an access token. If so, use that instead of authorizing again.
    if (fs.existsSync("accessToken.json")) {
      token = fs.readFileSync("accessToken.json");

      if (token) {
        accessToken = JSON.parse(token);

        return resolve();
      }
    }

    // oauth magic
    const {
      requestToken,
      authorizeUrl
    } = await getRequestTokenAndAuthorizeUrl();

    // Opening the Kiva authorize page in a browser
    shell.openExternal(authorizeUrl);

    // Opening a prompt to ask for the user's auth code
    let win = new BrowserWindow({
      x: 100,
      y: 100,
      width: 400,
      height: 150,
      alwaysOnTop: true,
      resizable: false,
      minimizable: false,
      fullscreenable: false,
      webPreferences: {
        nodeIntegration: true
      }
    });
    win.loadURL(`file://${__dirname}/prompt.html`);
    win.show();

    // When the prompt submits, close it, get the access token and save it in a file.
    ipcMain.on("submitAuthCode", async (_, authCode) => {
      win.close();
      accessToken = await getAccessToken(authCode, requestToken);

      fs.writeFileSync("accessToken.json", JSON.stringify(accessToken));

      resolve();
    });
  });
}

function setBalance(balance) {
  tray.setTitle(`$${balance.toString()}`);
}

function setAutoRefresh() {
  // Refresh the user's balance every 10 minutes
  setInterval(refreshBalance, 60000 * 10);
}

async function refreshBalance() {
  const balance = await getKivaBalance(accessToken);
  console.log(balance);
  setBalance(balance);
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
  authorizeWithKiva().then(() => {
    refreshBalance();
    setAutoRefresh();
  });
});
