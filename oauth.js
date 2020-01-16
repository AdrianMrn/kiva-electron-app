const OAuth = require("oauth");

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

function getRequestTokenAndAuthorizeUrl() {
  return new Promise(resolve => {
    consumer.getOAuthRequestToken(
      { oauth_callback: "oob" },
      (err, _1, _2, queryString) => {
        if (err) console.log(err);

        // { oauth_token: '…', oauth_token_secret: '…' }
        const requestToken = JSON.parse(Object.keys(queryString)[0]);
        const authorizeUrl = `${authorization_url}&oauth_token=${requestToken.oauth_token}&oauth_callback=oob`;

        resolve({ requestToken, authorizeUrl });
      }
    );
  });
}

function getAccessToken(oauthVerifier, requestToken) {
  return new Promise(resolve => {
    consumer.getOAuthAccessToken(
      requestToken.oauth_token,
      requestToken.oauth_token_secret,
      oauthVerifier,
      (err, _1, _2, queryString) => {
        if (err) console.log(err);

        const authToken = JSON.parse(Object.keys(queryString)[0]);

        return resolve(authToken);
      }
    );
  });
}

function getKivaBalance(accessToken) {
  return new Promise(resolve => {
    consumer.get(
      "https://api.kivaws.org/v1/my/balance.json",
      accessToken.oauth_token,
      accessToken.oauth_token_secret,
      (err, data, _) => {
        if (err) console.log(err);

        resolve(data);
      }
    );
  });
}

module.exports = {
  getRequestTokenAndAuthorizeUrl,
  getAccessToken,
  getKivaBalance
};
