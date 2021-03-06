const original = require('original');
const parse = require('url').parse;
const events = require('events');
const https = require('https');
const http = require('http');
const util = require('util');

const httpsOptions = [
  'pfx', 'key', 'passphrase', 'cert', 'ca', 'ciphers',
  'rejectUnauthorized', 'secureProtocol', 'servername',
];

/**
 * Creates a new EventSource object
 *
 * @param {String} url the URL to which to connect
 * @param {Object} [eventSourceInitDict] extra init params. See README for details.
 * @api public
 * */
function EventSource(url, eventSourceInitDict) {
  let readyState = EventSource.CONNECTING;
  Object.defineProperty(this, 'readyState', {
    get() {
      return readyState;
    },
  });

  Object.defineProperty(this, 'url', {
    get() {
      return url;
    },
  });

  const self = this;
  self.reconnectInterval = 60000;

  function onConnectionClosed() {
    if (readyState === EventSource.CLOSED) return;
    readyState = EventSource.CONNECTING;
    _emit('error', new Event('error'));

    // The url may have been changed by a temporary
    // redirect. If that's the case, revert it now.
    if (reconnectUrl) {
      url = reconnectUrl;
      reconnectUrl = null;
    }
    setTimeout(() => {
      if (readyState !== EventSource.CONNECTING) {
        return;
      }
      connect();
    }, self.reconnectInterval);
  }

  let req;
  let lastEventId = '';
  if (eventSourceInitDict && eventSourceInitDict.headers && eventSourceInitDict.headers['Last-Event-ID']) {
    lastEventId = eventSourceInitDict.headers['Last-Event-ID'];
    delete eventSourceInitDict.headers['Last-Event-ID'];
  }

  let discardTrailingNewline = false;
  let data = '';
  let eventName = '';

  let reconnectUrl = null;

  function connect() {
    const options = parse(url);
    let isSecure = options.protocol === 'https:';
    options.headers = { 'Cache-Control': 'no-cache', Accept: 'text/event-stream' };
    if (lastEventId) options.headers['Last-Event-ID'] = lastEventId;
    if (eventSourceInitDict && eventSourceInitDict.headers) {
      for (const i in eventSourceInitDict.headers) {
        const header = eventSourceInitDict.headers[i];
        if (header) {
          options.headers[i] = header;
        }
      }
    }

    // Legacy: this should be specified as `eventSourceInitDict.https.rejectUnauthorized`,
    // but for now exists as a backwards-compatibility layer
    options.rejectUnauthorized = !(eventSourceInitDict && !eventSourceInitDict.rejectUnauthorized);

    // If specify http proxy, make the request to sent to the proxy server,
    // and include the original url in path and Host headers
    const useProxy = eventSourceInitDict && eventSourceInitDict.proxy;
    if (useProxy) {
      const proxy = parse(eventSourceInitDict.proxy);
      isSecure = proxy.protocol === 'https:';

      options.protocol = isSecure ? 'https:' : 'http:';
      options.path = url;
      options.headers.Host = options.host;
      options.hostname = proxy.hostname;
      options.host = proxy.host;
      options.port = proxy.port;
    }

    // If https options are specified, merge them into the request options
    if (eventSourceInitDict && eventSourceInitDict.https) {
      for (const optName in eventSourceInitDict.https) {
        if (httpsOptions.indexOf(optName) === -1) {
          continue;
        }

        const option = eventSourceInitDict.https[optName];
        if (option !== undefined) {
          options[optName] = option;
        }
      }
    }

    // Pass this on to the XHR
    if (eventSourceInitDict && eventSourceInitDict.withCredentials !== undefined) {
      options.withCredentials = eventSourceInitDict.withCredentials;
    }

    req = (isSecure ? https : http).request(options, (res) => {
      // Handle HTTP errors
      if (res.statusCode === 500 || res.statusCode === 502
        || res.statusCode === 503 || res.statusCode === 504) {
        _emit('error', new Event('error', { status: res.statusCode }));
        onConnectionClosed();
        return;
      }

      // Handle HTTP redirects
      if (res.statusCode === 301 || res.statusCode === 307) {
        if (!res.headers.location) {
          // Server sent redirect response without Location header.
          _emit('error', new Event('error', { status: res.statusCode }));
          return;
        }
        if (res.statusCode === 307) reconnectUrl = url;
        url = res.headers.location;
        process.nextTick(connect);
        return;
      }

      if (res.statusCode !== 200) {
        _emit('error', new Event('error', { status: res.statusCode }));
        return self.close();
      }

      // protect against multiple connects
      // https://github.com/tigertext/eventsource/commit/ca8a6e0ca0db10c23ba7bf2b7f8affaa23d7a265
      if (readyState === EventSource.OPEN) {
        return;
      }

      readyState = EventSource.OPEN;
      res.on('close', () => {
        res.removeAllListeners('close');
        res.removeAllListeners('end');
        onConnectionClosed();
      });

      res.on('end', () => {
        res.removeAllListeners('close');
        res.removeAllListeners('end');
        onConnectionClosed();
      });
      _emit('open', new Event('open'));

      // text/event-stream parser adapted from webkit's
      // Source/WebCore/page/EventSource.cpp
      let buf = '';
      res.on('data', (chunk) => {
        buf += chunk;

        let pos = 0;
        const length = buf.length;

        while (pos < length) {
          if (discardTrailingNewline) {
            if (buf[pos] === '\n') {
              ++pos;
            }
            discardTrailingNewline = false;
          }

          let lineLength = -1;
          let fieldLength = -1;
          var c;

          for (let i = pos; lineLength < 0 && i < length; ++i) {
            c = buf[i];
            if (c === ':') {
              if (fieldLength < 0) {
                fieldLength = i - pos;
              }
            } else if (c === '\r') {
              discardTrailingNewline = true;
              lineLength = i - pos;
            } else if (c === '\n') {
              lineLength = i - pos;
            }
          }

          if (lineLength < 0) {
            break;
          }

          parseEventStreamLine(buf, pos, fieldLength, lineLength);

          pos += lineLength + 1;
        }

        if (pos === length) {
          buf = '';
        } else if (pos > 0) {
          buf = buf.slice(pos);
        }
      });
    });

    req.on('error', onConnectionClosed);
    if (req.setNoDelay) req.setNoDelay(true);
    req.end();
  }

  connect();

  function _emit() {
    if (self.listeners(arguments[0]).length > 0) {
      self.emit(...arguments);
    }
  }

  this._close = function () {
    if (readyState === EventSource.CLOSED) return;
    readyState = EventSource.CLOSED;
    if (req.abort) req.abort();
    if (req.xhr && req.xhr.abort) req.xhr.abort();
  };

  function parseEventStreamLine(buf, pos, fieldLength, lineLength) {
    if (lineLength === 0) {
      if (data.length > 0) {
        const type = eventName || 'message';
        _emit(type, new MessageEvent(type, {
          data: data.slice(0, -1), // remove trailing newline
          lastEventId,
          origin: original(url),
        }));
        data = '';
      }
      eventName = void 0;
    } else if (fieldLength > 0) {
      const noValue = fieldLength < 0;
      let step = 0;
      const field = buf.slice(pos, pos + (noValue ? lineLength : fieldLength));

      if (noValue) {
        step = lineLength;
      } else if (buf[pos + fieldLength + 1] !== ' ') {
        step = fieldLength + 1;
      } else {
        step = fieldLength + 2;
      }
      pos += step;

      const valueLength = lineLength - step;
      const value = buf.slice(pos, pos + valueLength);

      if (field === 'data') {
        data += `${value}\n`;
      } else if (field === 'event') {
        eventName = value;
      } else if (field === 'id') {
        lastEventId = value;
      } else if (field === 'retry') {
        const retry = parseInt(value, 10);
        if (!Number.isNaN(retry)) {
          self.reconnectInterval = retry;
        }
      }
    }
  }
}

module.exports = EventSource;

util.inherits(EventSource, events.EventEmitter);
EventSource.prototype.constructor = EventSource; // make stacktraces readable

['open', 'error', 'message'].forEach((method) => {
  Object.defineProperty(EventSource.prototype, `on${method}`, {
    /**
     * Returns the current listener
     *
     * @return {Mixed} the set function or undefined
     * @api private
     */
    get: function get() {
      const listener = this.listeners(method)[0];
      return listener ? (listener._listener ? listener._listener : listener) : undefined;
    },

    /**
     * Start listening for events
     *
     * @param {Function} listener the listener
     * @return {Mixed} the set function or undefined
     * @api private
     */
    set: function set(listener) {
      this.removeAllListeners(method);
      this.addEventListener(method, listener);
    },
  });
});

/**
 * Ready states
 */
Object.defineProperty(EventSource, 'CONNECTING', { enumerable: true, value: 0 });
Object.defineProperty(EventSource, 'OPEN', { enumerable: true, value: 1 });
Object.defineProperty(EventSource, 'CLOSED', { enumerable: true, value: 2 });

EventSource.prototype.CONNECTING = 0;
EventSource.prototype.OPEN = 1;
EventSource.prototype.CLOSED = 2;

/**
 * Closes the connection, if one is made, and sets the readyState attribute to 2 (closed)
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/EventSource/close
 * @api public
 */
EventSource.prototype.close = function () {
  this._close();
};

/**
 * Emulates the W3C Browser based WebSocket interface using addEventListener.
 *
 * @param {String} type A string representing the event type to listen out for
 * @param {Function} listener callback
 * @see https://developer.mozilla.org/en/DOM/element.addEventListener
 * @see http://dev.w3.org/html5/websockets/#the-websocket-interface
 * @api public
 */
EventSource.prototype.addEventListener = function addEventListener(type, listener) {
  if (typeof listener === 'function') {
    // store a reference so we can return the original function again
    listener._listener = listener;
    this.on(type, listener);
  }
};

/**
 * Emulates the W3C Browser based WebSocket interface using removeEventListener.
 *
 * @param {String} type A string representing the event type to remove
 * @param {Function} listener callback
 * @see https://developer.mozilla.org/en/DOM/element.removeEventListener
 * @see http://dev.w3.org/html5/websockets/#the-websocket-interface
 * @api public
 */
EventSource.prototype.removeEventListener = function removeEventListener(type, listener) {
  if (typeof listener === 'function') {
    listener._listener = undefined;
    this.removeListener(type, listener);
  }
};

/**
 * W3C Event
 *
 * @see http://www.w3.org/TR/DOM-Level-3-Events/#interface-Event
 * @api private
 */
function Event(type, optionalProperties) {
  Object.defineProperty(this, 'type', { writable: false, value: type, enumerable: true });
  if (optionalProperties) {
    for (const f in optionalProperties) {
      if (optionalProperties.hasOwnProperty(f)) {
        Object.defineProperty(this, f, { writable: false, value: optionalProperties[f], enumerable: true });
      }
    }
  }
}

/**
 * W3C MessageEvent
 *
 * @see http://www.w3.org/TR/webmessaging/#event-definitions
 * @api private
 */
function MessageEvent(type, eventInitDict) {
  Object.defineProperty(this, 'type', { writable: false, value: type, enumerable: true });
  for (const f in eventInitDict) {
    if (eventInitDict.hasOwnProperty(f)) {
      Object.defineProperty(this, f, {
        writable: false, value: eventInitDict[f], enumerable: true
      });
    }
  }
}
