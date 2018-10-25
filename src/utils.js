import _ from 'underscore';

import Pipeline from './pipeline';

const defaultMethods = ['get', 'post', 'put', 'delete', 'upload'];

/**
 * 将一般对象转换为 Pipeline 对象，一般对象的格式为：
 * {
 *   key1: Function,
 *   key2: [Function1, Function2, ...],
 * }
 *
 * 注意：数组的顺序越靠前就越先执行。
 * @param {Object} list 需要转换为管道的一般对象。
 */
export function convertPipeline(list) {
  if (!list) {
    return new Pipeline();
  }

  return _.reduce(list, (x, y) => x.add(y.filter, y.fn), new Pipeline());
}

/**
 * 转换参数缺省值为预置的对象，有如下两种格式：
 *   - Function： 一个无参的函数，执行上下文是传入的参数对象本身。
 *     - 执行时可能部分参数还是函数，并没有转换为固定的值，所以不要互相引用。
 *     - 转换后的函数是一个包含了属性名称 * 的对象。
 *   - Object：一个包含了四种 HTTP 请求方法的对象，每种方法的值都是上述说明的 Function。
 *     - 如果定义了一个名称为 * 的属性，则这个属性会在请求的方法不存在时执行。
 *     - 如果定义了对象的方法名称，则这个属性会在请求时执行。
 *     - 属性名称不区分大小写，即 GET 和 get 的作用时相同的。
 * @param {Object} obj 参数为 Function 或者 Object 两种方式。
 */
export function convertDefaultValue(obj) {
  const { defaultValue } = obj;
  if (!defaultValue) {
    return;
  }

  const isSimpleType =
    typeof defaultValue === 'string' ||
    typeof defaultValue === 'number' ||
    typeof defaultValue === 'boolean' ||
    _.isFunction(defaultValue);

  if (isSimpleType) {
    return { '*': defaultValue };
  } else if (!_.isArray(defaultValue) && _.isObject(defaultValue)) {
    const defaultValueMapper = (x, y) => {
      x[y] = defaultValue[y];

      return x;
    };

    return _.reduce(defaultMethods, defaultValueMapper, {});
  }
}

/**
 * 获取经过计算的缺省值：不带有 Function。
 * @param {String} method 目标请求方法字符串
 * @param {Object} target 需要获取的目标源：为带有 Function 的缺省值参数。
 */
export function getDefaultValue(method, target) {
  return _.reduce(
    target,
    (acc, v, k) => {
      if (_.isFunction(v)) {
        acc[k] = v.call(acc);
      } else {
        let fn = v[method.toLowerCase()];
        if (_.isFunction(fn)) {
          acc[k] = fn.call(acc);
        } else if (_.isUndefined(fn)) {
          fn = v['*'];
          if (_.isFunction(fn)) {
            acc[k] = fn.call(acc);
          } else if (!_.isUndefined(fn)) {
            acc[k] = fn;
          }
        } else {
          acc[k] = fn;
        }
      }

      return acc;
    },
    {},
  );
}
