const OAuth = require("oauth");

const request_token_url = "https://api.kivaws.org/oauth/request_token.json";
const access_token_url = "https://api.kivaws.org/oauth/access_token";
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

function getRequestTokenAndAuthorizeUrl() {
  return new Promise(resolve => {
    consumer.getOAuthRequestToken(
      { oauth_callback: "oob" },
      (err, _1, _2, queryString) => {
        if (err) console.err(err);

        // { oauth_token: '…', oauth_token_secret: '…' }
        const requestToken = JSON.parse(Object.keys(queryString)[0]);

        const authorizeUrl = `${authorization_url}&oauth_token=${requestToken.oauth_token}&oauth_callback=oob`;

        console.log(requestToken);
        resolve({ requestToken, authorizeUrl });
      }
    );
  });
}

function getAccessToken(oauthVerifier, requestToken) {
  console.log(typeof oauthVerifier, oauthVerifier);
  console.log(requestToken.oauth_token, requestToken.oauth_token_secret);

  consumer.getOAuthAccessToken(
    requestToken.oauth_token,
    requestToken.oauth_token_secret,
    oauthVerifier,
    (err, token, token_secret, queryString) => {
      console.log(err, token, token_secret, queryString);
    }
  );
}

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
  getRequestTokenAndAuthorizeUrl,
  getAccessToken
};
