const OAuth = require("oauth");
const { shell } = require("electron");
const electronPrompt = require("electron-prompt");

const request_token_url = "https://api.kivaws.org/oauth/request_token.json";
const access_token_url = "https://api.kivaws.org/oauth/access_token.json";
const consumer_key = "com.spatie.kiva-electron-app";
const consumer_secret = "Rw8Nh0xHX5Os-5coEWhCezY4A-KNA5wL";
const authorization_url =
  "https://www.kiva.org/oauth/authorize?response_type=code&client_id=" +
  consumer_key;

/* const resource_url = "https://api.kivaws.org/v1/my/account.json"; */

const consumer = new OAuth.OAuth(
  request_token_url,
  access_token_url,
  consumer_key,
  consumer_secret,
  "1.0",
  null,
  "HMAC-SHA1"
);

consumer.setClientOptions({ followRedirects: false });

function authWithKiva() {
  consumer.getOAuthRequestToken(
    { oauth_callback: "oob" },
    (err, _1, _2, queryString) => {
      if (err) console.error(err);

      // { oauth_token: '…', oauth_token_secret: '…' }
      const requestToken = JSON.parse(Object.keys(queryString)[0]);

      const authorizeUrl = `${authorization_url}&oauth_token=${requestToken.oauth_token}&oauth_callback=oob`;

      shell.openExternal(authorizeUrl);

      // TODO: electronPrompt seems to break something. Get the access code in a different way.
      // maybe try electron-osx-prompt
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
  );
}

function getAccessToken(oauthVerifier, requestToken) {
  /* console.log(oauthVerifier, requestToken); */

  /* console.log(consumer); */

  consumer.getOAuthAccessToken(
    requestToken.oauth_token,
    requestToken.oauth_token_secret,
    oauthVerifier,
    (err, token, token_secret, queryString) => {
      console.log("hm");
      if (err) console.error(err);

      console.log(token, token_secret, queryString);
    }
  );
}

/* getAccessToken('4RT5HC', {
  oauth_token: 'lVbIUt9mmkGISmcuhAroAw6zD7AHBL4p;com.spatie.kiva-electron-app',
  oauth_token_secret: 'HOPTWdjuiDBkCbKZYYdPBHxGZrmCENzd',
  oauth_callback_confirmed: 'true'
}) */

/* getAccessToken("3G9BED", {
  oauth_token: "1YC8zcWh2PE66nW04tTggR.Q-Kq8Yf4b;com.spatie.kiva-electron-app",
  oauth_token_secret: "B7kJLsWQc3s-wPMoof7wq5A4NyKFZwBb",
  oauth_callback_confirmed: "true"
}); */

/* oauth.get(
  "https://api.kivaws.org/v1/my/account.json",
  "your user token for this app", //test user token
  "your user secret for this app", //test user secret
  function(e, data, res) {
    if (e) console.error(e);
    console.log(require("util").inspect(data));
  }
); */

module.exports = {
  authWithKiva
};
