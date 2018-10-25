import ajax from '@lenic/api-factory';

import engine from '../../src/engine';
import interceptors from './interceptor';

const api = ajax({
  engine,
  interceptors,
  url: v => `/api/v1${v.url}`,
  optionParams: ['url'],
  params: {
    _: {
      defaultValue: {
        get: () => Date.now(),
        put: 34,
        post: () => (~Date.now()).toString(16),
      }
    },
  },
  body: {
    web: {
      defaultValue: {
        post: () => (~~(Math.random()*(1 << 24))).toString(16),
        put: 22,
      },
    },
  },
})

class DataSource {
  constructor() {
    this.$data = {
      id: Date.now() % 2,
      name: '张三',
      scores: {
        math: 89,
        chinese: 95,
        english: 78,
      },
    }

    this.dataApi = api(() => `/students/${this.$data.id}`, {
      name: () => this.$data.name,
      math: () => this.$data.scores.math,
      chinese: () => this.$data.scores.chinese,
      english: () => this.$data.scores.english,
    });

    this.$domContainer = document.querySelector('#ulList');
  }

  changeName(name) {
    this.$data.name = (name || '--').trim();
  }

  send() {
    this.dataApi.post().then(
      v => {
        const li = document.createElement('li')
          , pre = document.createElement('pre');

        pre.innerText = JSON.stringify(v, null, ' ');
        li.appendChild(pre);

        this.$domContainer.appendChild(li);
      },
      e => {
        const li = document.createElement('li')
          , pre = document.createElement('pre');

        pre.innerText = JSON.stringify(e, null, ' ');
        li.appendChild(pre);

        this.$domContainer.appendChild(li);
      },
    );
  }
}

const dataSource = new DataSource();

document.querySelector('#txtChinese')
  .addEventListener('blur', e => dataSource.changeName(e.target.value));

document.querySelector('#btnSubmit')
  .addEventListener('click', () => dataSource.send());
