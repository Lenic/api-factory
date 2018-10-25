/* eslint-disable no-invalid-this */

import _ from 'underscore';
import Deferred from '@lenic/deferred';

import Descriptor from './descriptor';

const CanceledObject = {};

export default descriptor => {
  const desc = new Descriptor(descriptor);

  return function(query, body, opts) {
    const obj = { sendResult: null },
      fn = async (method, preFilter, context) => {
        if (obj.sendResult) {
          return await obj.sendResult.abort();
        }

        let ajaxOption = desc.makeRequest(method, query, body, context);
        ajaxOption = await desc.interceptors.request.exec(ajaxOption, opts);

        if (_.isFunction(preFilter)) {
          preFilter(ajaxOption);
        }

        const defer = Deferred();

        obj.sendResult = desc.engine(ajaxOption, CanceledObject);
        obj.sendResult.promise.then(
          async v => {
            obj.sendResult = null;
            if (v === CanceledObject) {
              return;
            }

            defer.resolve(await desc.interceptors.response.exec(v, ajaxOption, opts));
          },
          async e => {
            obj.sendResult = null;

            const result = await desc.interceptors.response.exec(e, ajaxOption, opts);
            if (result) {
              defer.reject(result);
            }
          },
        );

        return await defer.promise;
      };

    obj.get = (preFilter, context) => fn('GET', preFilter, context);
    obj.post = (preFilter, context) => fn('POST', preFilter, context);
    obj.put = (preFilter, context) => fn('PUT', preFilter, context);
    obj.del = (preFilter, context) => fn('DELETE', preFilter, context);
    obj.upload = (preFilter, context) => fn('UPLOAD', preFilter, context);

    return obj;
  };
};
