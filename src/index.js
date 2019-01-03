import _ from 'underscore';
import Deferred from '@lenic/deferred';

import Descriptor from './descriptor';

const CanceledObject = {};

export default function factory(descriptor) {
  const desc = new Descriptor(descriptor);

  return function(query, body, opts) {
    const obj = { sendResult: null };

    function fn(method, preFilter, context) {
      let preResolved = Promise.resolve();
      if (obj.sendResult) {
        preResolved = obj.sendResult.abort();
      }

      return preResolved.then(() => {
        const defer = Deferred();

        desc.interceptors.request
          .exec(desc.makeRequest(method, query, body, context), opts)
          .then(ajaxOption => {
            if (_.isFunction(preFilter)) {
              preFilter(ajaxOption);
            }

            obj.sendResult = desc.engine(ajaxOption, CanceledObject);
            obj.sendResult.promise.then(
              v => {
                obj.sendResult = null;
                if (v === CanceledObject) {
                  return;
                }

                desc.interceptors.response
                  .exec(v, ajaxOption, opts)
                  .then(defer.resolve, defer.reject);
              },
              e => {
                obj.sendResult = null;

                desc.interceptors.response
                  .exec(e, ajaxOption, opts)
                  .then(defer.reject, defer.reject);
              }
            );
          });

        return defer.promise;
      });
    }

    obj.exec = fn;
    obj.get = (preFilter, context) => fn('GET', preFilter, context);
    obj.post = (preFilter, context) => fn('POST', preFilter, context);
    obj.put = (preFilter, context) => fn('PUT', preFilter, context);
    obj.del = (preFilter, context) => fn('DELETE', preFilter, context);

    return obj;
  };
}
