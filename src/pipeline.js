function* each(list) {
  for (let i = 0; i < list.length; i++) {
    const item = list[i];

    yield item;
  }
}

export default class Pipeline {
  constructor() {
    this.$list = [];
  }

  add(filter, fn) {
    if (!filter) {
      throw new Error('The filter must be exists.');
    }

    if (!fn) {
      throw new Error('The fn must be exists.');
    }

    this.$list.push({ fn, filter });
    return this;
  }

  exec(...args) {
    if (!this.$list.length) {
      return Promise.resolve(args[0]);
    }

    const iterator = each(this.$list),
      next = () => {
        const item = iterator.next();
        if (item.done) {
          return Promise.resolve(args[0]);
        }

        const { filter, fn } = item.value;
        if (!filter.apply(null, args)) {
          return next();
        } else {
          return new Promise(r => r(fn(next, ...args)));
        }
      };

    return next();
  }
}
