const request = [
  {
    filter: (ajaxOption, opts) => ajaxOption.method === 'POST',
    fn: (next, ajaxOption, opts) => {
      ajaxOption.headers.token = Date.now().toString(16);

      return next();
    }
  }
];

const response = [
  {
    filter: (result, ajaxOption, opts) => result.code === 404,
    fn: (next, result, ajaxOption, opts) => next().then(() => (result.data += ' - Not Found'))
  },
  {
    filter: (result, ajaxOption, opts) => result.code === 404,
    fn: (next, result, ajaxOption, opts) => {
      result.data = (Date.now() % 13).toString();

      return next();
    }
  },
  {
    filter: (result, ajaxOption, opts) => result.code === 200,
    fn: (next, result, ajaxOption, opts) => {
      result.data = {
        ...result.data,
        list: []
      };

      return next();
    }
  },
  {
    filter: (result, ajaxOption, opts) => result.code === 200,
    fn: (next, result, ajaxOption, opts) => {
      result.data.list.push(1);

      return next();
    }
  },
  {
    filter: (result, ajaxOption, opts) => result.code === 200,
    fn: (next, result, ajaxOption, opts) =>
      next().then(() => {
        result.data.list.push(2);

        return result.data;
      })
  },
  {
    filter: (result, ajaxOption, opts) => result.code === 200,
    fn: (next, result, ajaxOption, opts) => {
      result.data.list.push(3);

      return next();
    }
  }
];

export default {
  request,
  response
};
