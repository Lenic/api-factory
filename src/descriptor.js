import _ from 'underscore';

import { convertPipeline, convertDefaultValue, getDefaultValue, lowerCaseObject } from './utils';

export default class Descriptor {
  constructor(desc) {
    /**
     * 使用的 Ajax 发送引擎。
     */
    this.engine = desc.engine;

    /**
     * request 使用 method 作为处理的键值，全部则使用 * 作为键值。
     * response 使用 statusCode 作为处理的键值，全部则使用 * 作为键值。
     */
    this.interceptors = {
      request: convertPipeline(desc.interceptors && desc.interceptors.request),
      response: convertPipeline(desc.interceptors && desc.interceptors.response)
    };

    /**
     * 设置的默认参数。
     */
    this.$timeout = desc.timeout;
    this.$optionParams = desc.optionParams || [];
    this.$responseType = desc.responseType || 'json';
    this.$headers = lowerCaseObject(desc.headers || {});

    /**
     * 初始 URL 处理。
     */
    const { url } = desc;
    if (!url) {
      throw new TypeError("Can't be empty. Must be a value!");
    }
    this.$url = _.isFunction(url) ? url : () => url;

    /**
     * 转换默认的参数，用于在不写参数时默认填充。
     */
    this.$defaultBody = _.mapObject(desc.body || {}, convertDefaultValue);
    this.$defaultParams = _.mapObject(desc.params || {}, convertDefaultValue);

    /**
     * 默认的参数转换函数。
     */
    this.$paramExecutor = function(v, k, o) {
      return _.isFunction(v) ? v.call(o, this) : v;
    };
  }

  convertParams(method, target, context) {
    let computedValue = _.isFunction(target) ? target.call(context, context) : target;
    if (typeof computedValue === 'string') {
      computedValue = { url: computedValue };
    }

    const defaultParams = getDefaultValue(method, this.$defaultParams),
      fnObject = _.defaults({}, computedValue, defaultParams);

    const parameters = [fnObject, this.$paramExecutor];
    if (context) {
      parameters.push(context);
    }

    return _.mapObject.apply(_, parameters);
  }

  convertBody(method, target, context) {
    const computedValue = _.isFunction(target) ? target.call(context, context) : target;
    if (typeof computedValue === 'string') {
      return computedValue;
    }

    const defaultParams = getDefaultValue(method, this.$defaultBody),
      fnObject = _.defaults({}, computedValue, defaultParams);

    const parameters = [fnObject, this.$paramExecutor];
    if (context) {
      parameters.push(context);
    }

    return _.mapObject.apply(_, parameters);
  }

  makeRequest(method, query, body, context) {
    const params = this.convertParams(method, query, context),
      opts = {
        method,
        timeout: this.$timeout,
        headers: this.$headers,
        url: this.$url.call(context, params || {}, context),
        responseType: this.$responseType,
        query: _.omit(params, ...this.$optionParams)
      };

    if (method === 'POST' || method === 'PUT') {
      !opts.headers['content-type'] &&
        (opts.headers['content-type'] = 'application/json; charset=UTF-8');
      opts.body = this.convertBody(method, body, context);
    }

    return opts;
  }
}
