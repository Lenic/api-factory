import axios from 'axios';

import Deferred from '@lenic/deferred';

export default function send(opts, canceled) {
  const defer = Deferred(),
    cancel = Deferred(),
    CancelToken = axios.CancelToken,
    source = CancelToken.source();

  const parameter = {
    method: opts.method,
    url: opts.url,
    params: opts.query,
    responseType: opts.responseType,
    headers: opts.headers,
    data: opts.body,
    timeout: opts.timeout,
    cancelToken: source.token
  };

  axios.request(parameter).then(
    v =>
      defer.resolve({
        code: v.status,
        data: v.data,
        headers: v.headers
      }),
    e => {
      if (axios.isCancel(e)) {
        defer.resolve(canceled);
        cancel.resolve();
      } else {
        if (e.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          defer.reject({
            code: e.response.status,
            data: e.response.data,
            headers: e.response.headers
          });
        } else if (e.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          defer.reject({
            code: -1,
            data: 'no received',
            headers: {}
          });
        } else {
          // Something happened in setting up the request that triggered an Error
          defer.reject({
            code: 0,
            data: 'send error',
            headers: {}
          });
        }
      }
    }
  );

  return {
    promise: defer.promise,
    abort: () => {
      source.cancel('Operation canceled by the abort manual.');

      return cancel.promise;
    }
  };
}
