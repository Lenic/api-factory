const request = [
  {
    filter: (ajaxOption, opts) => ajaxOption.method === 'POST',
    fn: (next, ajaxOption, opts) => {
      ajaxOption.headers.token = Date.now().toString(16);

      return next();
    },
  },
];

const response = [
  {
    filter: (result, ajaxOption, opts) => result.code === 404,
    fn: (next, result, ajaxOption, opts) => {
      result.data = 'Not Found';

      return next();
    },
  },
];

export default {
  request,
  response,
}
