/* eslint-disable operator-linebreak */
/* eslint-disable space-infix-ops */
/* eslint-disable max-len */
/* eslint-disable indent */
/* eslint-disable no-restricted-syntax */

/* eslint-disable nonblock-statement-body-position */
/* eslint-disable curly */
/* eslint-disable no-plusplus */
/* eslint-disable no-trailing-spaces */
/* eslint-disable class-methods-use-this */
class View {
  appendToCardContainer(element) {
    const target = document.getElementById('cardContainer');
    if (Array.isArray(element)) {
      target.innerHTML = '';
      for (const elem of element) {
        target.appendChild(elem);
      }
    } else target.appendChild(element);
  }

  pagginatContainerRender(value) {
    let pag = '';
    for (let i = 0; i < value.pagesTotal; i++) {
      if (i === value.pagesTotal / 2)
        pag += `<div class="pagginate-elem pagginate__current">${
          value.pageCurrent
        }</div>`;
      else pag += '<div class="pagginate-elem pagginate__even"></div>';
    }
    document.getElementById('pagginateContainer').innerHTML = pag;
  }

  createCard(object = {}) {
    const card = Object.assign({}, object);
    return `<div class="card">
                  <div class="card__thumbnails">
                    <img src="${card.snippet.thumbnails.medium.url}" height="${
      card.snippet.thumbnails.medium.height
    }" width="${
      card.snippet.thumbnails.medium.width
    }" alt="http://alphachan.org/utochka/thumb/154549656782.png">
    <a href="https://www.youtube.com/watch?v=${
                      card.id.videoId
                    }" target="_blank">${card.snippet.title}</a>
                  </div>
                  <div class="card__author"><i class="fas fa-user"></i>${
                    card.snippet.channelTitle
                  }</div>
                  <div class="card__upload"><i class="far fa-calendar-alt"></i>${card.snippet.publishedAt
                    .split('T')
                    .shift()}</div>
                  <div class="card__count"><i class="far fa-eye"></i>${
                    card.statistics.viewCount
                  }</div>
                  <div class="card__description">${
                    card.snippet.description
                  }</div>
                  </div>`;
  }

  calculateWidthOfCardContainerN(value) {
    document.getElementById('cardContainer').style.setProperty('--n', value);
  }

  calculateWidthOfCardContainerI(value) {
    document.getElementById('cardContainer').style.setProperty('--i', value);
  }

  render() {
    const favicon = document.createElement('link');
    favicon.rel = 'stylesheet';
    favicon.integrity =
      'sha384-oS3vJWv+0UjzBfQzYUhtDYW+Pj2yciDJxpsK1OYPAYjqT085Qq/1cq5FLXAZQ7Ay';
    favicon.crossOrigin = 'anonymous';
    favicon.href = 'https://use.fontawesome.com/releases/v5.8.2/css/all.css';

    document.head.appendChild(favicon);

    const page = `<div id="app">
    <div class="search">
      <form id = "search-form" onsubmit="return false;">
        <input type ="text" name="search" id="input" placeholder=" search...">
        <button id="search">
          <i class="fas fa-search"></i>
        </button>
      </form>
    </div>
    <div id = "cardContainer"></div>
    <div id="pagginateContainer">paggination</div>
    </div>`;
    document.body.innerHTML = page;
  }
  // document.body.innerHTML = `${this.inputRender()} ${this.cardContainerInit()} ${this.pagginatContainerInit()}`;
}

export default View;
