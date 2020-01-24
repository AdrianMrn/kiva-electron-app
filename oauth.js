const OAuth = require("oauth");
require("dotenv").config();

const request_token_url = "https://api.kivaws.org/oauth/request_token.json";
const access_token_url = "https://api.kivaws.org/oauth/access_token.json";
const consumer_key = "com.spatie.kiva-electron-app";
const consumer_secret = process.env.KIVA_CONSUMER_SECRET;
const authorization_url = `https://www.kiva.org/oauth/authorize?response_type=code&client_id=${consumer_key}&scope=user_balance`;

const balanceUrl = "https://api.kivaws.org/v1/my/balance.json";

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
  return new Promise((resolve, reject) => {
    consumer.getOAuthRequestToken(
      { oauth_callback: "oob" },
      (err, _1, _2, queryString) => {
        if (err) return reject(err);

        // { oauth_token: '…', oauth_token_secret: '…' }
        const requestToken = JSON.parse(Object.keys(queryString)[0]);
        const authorizeUrl = `${authorization_url}&oauth_token=${requestToken.oauth_token}&oauth_callback=oob`;

        resolve({ requestToken, authorizeUrl });
      }
    );
  });
}

function getAccessToken(oauthVerifier, requestToken) {
  return new Promise((resolve, reject) => {
    consumer.getOAuthAccessToken(
      requestToken.oauth_token,
      requestToken.oauth_token_secret,
      oauthVerifier,
      (err, _1, _2, queryString) => {
        if (err) return reject(err);

        const authToken = JSON.parse(Object.keys(queryString)[0]);

        return resolve(authToken);
      }
    );
  });
}

function getKivaBalance(accessToken) {
  return new Promise((resolve, reject) => {
    consumer.get(
      balanceUrl,
      accessToken.oauth_token,
      accessToken.oauth_token_secret,
      (err, data, _) => {
        if (err) return reject(err);

        resolve(JSON.parse(data).user_balance.balance);
      }
    );
  });
}

module.exports = {
  getRequestTokenAndAuthorizeUrl,
  getAccessToken,
  getKivaBalance
};
