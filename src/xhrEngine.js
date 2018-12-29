import _ from 'underscore';
import Deferred from '@lenic/deferred';
import encode from 'querystring-es3/encode';

function getXhr() {
  if (window.XMLHttpRequest) {
    return new XMLHttpRequest();
  } else {
    return new ActiveXObject('Microsoft.XMLHTTP');
  }
}

export default function send(opts, canceled) {
  const defer = Deferred(),
    cancel = Deferred(),
    xhr = getXhr();

  let url = opts.url;
  if (_.size(opts.query)) {
    if (opts.url.indexOf('?') === -1) {
      url = `${opts.url}?${encode(opts.query)}`;
    } else {
      url = `${opts.url}&${encode(opts.query)}`;
    }
  }
  xhr.open(opts.method, url, true);

  xhr.timeout = opts.timeout || 0;

  for (let i in opts.headers) {
    xhr.setRequestHeader(i, opts.headers[i]);
  }

  xhr.onload = () => {
    const headers = {};

    xhr.getAllResponseHeaders().replace(/^(.*?):[^\S\n]*([\s\S]*?)$/gm, (m, key, value) => {
      const current = key.toLowerCase(),
        header = headers[key];

      headers[current] = header ? `${header},${value}` : value;
    });

    let data = xhr.responseText;
    if (opts.responseType === 'json') {
      try {
        data = JSON.parse(xhr.responseText);
      } catch (error) {
        error.toString();
      }
    }

    defer.resolve({
      data,
      headers,
      code: xhr.status
    });
  };

  xhr.onabort = () => {
    defer.resolve(canceled);
    cancel.resolve();
  };

  xhr.ontimeout = xhr.onerror = () =>
    defer.reject({
      code: -1,
      data: 'no received',
      headers: {}
    });

  try {
    const contentType = opts.headers['content-type'];
    if (contentType && contentType.indexOf('application/json') >= 0) {
      xhr.send(JSON.stringify(opts.body));
    } else {
      xhr.send(opts.body);
    }
  } catch (error) {
    error && error.toString();

    defer.reject({
      code: 0,
      data: 'send error',
      headers: {}
    });
  }

  return {
    promise: defer.promise,
    abort: () => {
      setTimeout(() => xhr.abort(), 0);

      return cancel.promise;
    }
  };
}
