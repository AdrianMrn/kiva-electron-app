const {
  app,
  shell,
  Menu,
  Tray,
  BrowserWindow,
  ipcMain,
  dialog
} = require("electron");

const Store = require("electron-store");
const store = new Store();

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
  return new Promise(async (resolve, reject) => {
    // Check if we have already saved an access token. If so, use that instead of authorizing again.
    if (store.has("accessToken")) {
      token = store.get("accessToken");

      if (token) {
        accessToken = JSON.parse(token);

        return resolve();
      }
    }

    let requestToken, authorizeUrl;

    // oauth magic
    try {
      const {
        requestToken: token,
        authorizeUrl: url
      } = await getRequestTokenAndAuthorizeUrl();
      requestToken = token;
      authorizeUrl = url;
    } catch (error) {
      return reject(error);
    }

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
      frame: false,
      webPreferences: {
        nodeIntegration: true
      }
    });
    win.loadURL(`file://${__dirname}/prompt/index.html`);
    win.show();

    win.addListener("closed", reject);

    // When the prompt submits, close it, get the access token and save it in a file.
    ipcMain.on("submitAuthCode", async (_, authCode) => {
      win.removeAllListeners("closed");
      win.close();

      try {
        accessToken = await getAccessToken(authCode, requestToken);
      } catch (error) {
        return reject(error);
      }

      dialog.showMessageBoxSync(null, {
        type: "error",
        message: "2"
      });

      store.set("accessToken", JSON.stringify(accessToken));

      dialog.showMessageBoxSync(null, {
        type: "error",
        message: "3"
      });

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
  try {
    const balance = await getKivaBalance(accessToken);
    setBalance(balance);
  } catch (error) {
    dialog.showMessageBoxSync(null, {
      type: "error",
      message: error
    });
  }
}

function openKiva() {
  shell.openExternal("https://www.kiva.org/lend-by-category");
}

let tray;
app.on("ready", () => {
  // Initializing tray icon
  tray = new Tray(`${__dirname}/images/logo_kiva.png`);

  const menu = [
    { label: "Open Kiva", click: openKiva },
    { label: "(re)authorize app with Kiva", click: authorizeWithKiva }
  ];

  // Initializing context menu
  tray.setContextMenu(Menu.buildFromTemplate(menu));

  // Initializing Kiva connection
  authorizeWithKiva()
    .then(() => {
      refreshBalance();
      setAutoRefresh();

      tray.setContextMenu(
        Menu.buildFromTemplate([
          ...menu,
          { label: "Refresh Balance", click: refreshBalance }
        ])
      );
    })
    .catch(err => {
      if (err) console.error(err);

      dialog.showMessageBoxSync(null, {
        type: "error",
        message:
          "Something went wrong during the authentication. Please try again by pressing the tray icon."
      });
    });
});
