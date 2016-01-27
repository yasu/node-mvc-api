/**
 * Copyright 2016 Yasuhiro Manai <yasuhiro.manai@gmail.com>. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

var VERSION = "1.0.6",
  querystring = require("querystring"),
  oauth = require("oauth"),
  oauth2 = oauth.OAuth2,
  request = require("request"),
  fs = require("fs"),
  _ = require('lodash'),
  EventEmitter = require('events').EventEmitter;

var baseUrl = "https://www.mvc-online.com/api/";
var authUrl = "https://www.mvc-online.com/oauth/authorize/";

var r; // = request({})

var MVC = function(clientId, clientSecret, redirectUri, opt_opts) {
  this.clientId_ = clientId;
  this.clientSecret_ = clientSecret;
  this.redirectUri_ = redirectUri;
  this.opts = opt_opts || {};
  this.credentials = {};

  this.oa = new oauth2(this.clientId_, this.clientSecret_, 'https://www.mvc-online.com/', null, 'oauth/token', null);
  this.oa.useAuthorizationHeaderforGET(true);

  return this;
};
MVC.VERSION = VERSION;

/**
 * Generates URL for consent page landing.
 * @param {object=} opt_opts Options.
 * @return {String} URL to consent page.
 */
MVC.prototype.generateAuthUrl = function(opt_opts) {
  var opts = opt_opts || {};
  opts.response_type = opts.response_type || 'code';
  opts.client_id = opts.client_id || this.clientId_;
  opts.redirect_uri = opts.redirect_uri || this.redirectUri_;

  // Allow scopes to be passed either as array or a string
  if (opts.scope instanceof Array) {
    opts.scope = opts.scope.join(' ');
  }

  return this.oa.getAuthorizeUrl(opts);
};

/**
 * Gets the access token for given code.
 * @param  {String} code The authorization code.
 * @param  {Function} callback.
 */
MVC.prototype.getToken = function(code, callback) {
  this.oa.getOAuthAccessToken(
    code,
    {'grant_type': 'authorization_code', 'redirect_uri': this.redirectUri_},
    function (e, access_token, refresh_token, results) {
      if (e) {
        callback(e);
      } else {
        callback(null, access_token, refresh_token, results);
      }
    }
  );
};

/**
 * Gets user info
 * @param {String} accessToken
 * @param {Function} callback
 * @param {String} params
 */
MVC.prototype.verifyCredentials = function(accessToken, callback, params) {
  var url = baseUrl + "me";
  if (params) {
    url += '?' + querystring.stringify(params);
  }
  this.oa.get(url, accessToken, function(error, data, response) {
    if (error) {
      callback(error);
    } else {
      try {
        callback(null, JSON.parse(data));
      } catch (e) {
        callback(e, data);
      }
    }
  });
};


// Communities
MVC.prototype.communities = function(accessToken, callback, params) {
  var url = baseUrl + "communities";
  if (params) {
    url += '?' + querystring.stringify(params);
  }
  this.oa.get(url, accessToken, function(error, data, response) {
    if (error) {
      callback(error, data, response, url);
    } else {
      try {
        callback(null, JSON.parse(data), response);
      } catch (e) {
        callback(e, data, response);
      }
    }
  });
};

// Upload
MVC.prototype.upload = function(params, accessToken, callback) {
  r = request.post({
    url: baseUrl + "upload?" + querystring.stringify(_.omit(params, ['file'])),
    auth: {
      bearer: accessToken
    }
  }, function(error, response, body) {
    clearInterval(progress_interval);
    if (error) {
      callback(error, body, response, baseUrl + "upload?" + querystring.stringify(_.omit(params, ['file'])));
    } else {
      try {
        callback(null, JSON.parse(body), response);
      } catch (e) {
        callback(e, body, response);
      }
    }
  });

  // multipart/form-data
  var form = r.form();
  if (fs.existsSync(params.file)) {
    form.append('file', fs.createReadStream(params.file));
  } else {
    form.append('file', params.file);
  }

  var ev = new EventEmitter;
  var progress;
  var progress_interval = setInterval(function() {
    progress = r.req.connection._bytesDispatched / r.headers['content-length'];
    ev.emit('progress', progress);
  }, 250);
  return ev;
};

MVC.prototype.cancelUpload = function() {
  if (r) r.end();
};


module.exports = MVC;
