import _ from 'lodash';
import AppModel from '../models/AppModel';
import AppView from '../views/AppView';
import { mergeById, getId } from '../services';

class App {
  constructor() {
    this.state = {
      events: null,
      nextPageToken: ``,
      prevPageToken: ``,
      value: ``,
      paggination: {
        pagesTotal: 0,
        pageCurrent: 0
      },
      wrappedItems: [],
      rawItems: [],
      cashedRequests: {},
      numCardsOnPage: 4
    };
    this.db = new AppModel();
    this.view = new AppView();
    this.render();
    this.initDOMHandlers();
    this.start();
  }

  start() {
    this.setState({ value: `js` });
    this.executeSearch(`js`, true)
      .then(res => {
        this.windowSizeHandler();
        this.pagginatContainer({
          pagesTotal: this.getState().numCardsOnPage,
          pageCurrent: this.getPaggination().pageCurrent
        });
      })
      .catch(e => console.log(e));
  }

  initDOMHandlers() {
    const cardContainer = document.getElementById(`cardContainer`);

    /**
     * init search && get value for search && rerender results
     */
    this.x0 = null;

    const lock = e => {
      this.x0 = unify(e).clientX;
    };
    this.i = 0;

    const move = e => {
      if (this.x0 || this.x0 === 0) {
        const dx = unify(e).clientX - this.x0;
        const s = Math.sign(dx);

        if (
          (this.i > 0 || s < 0) &&
          (this.i <
            document.getElementById(`cardContainer`).children.length - 1 ||
            s > 0)
        ) {
          this.calculateWidthOfCardContainer(true, (this.i -= s));
          console.log(this.getPaggination(), this.i);
          if (this.i === this.getState().paggination.pagesTotal - 2) {
            console.log('need next page');
            cardContainer.dispatchEvent(this.getState().events.needNextPage);
          }
        }
        this.x0 = null;
        this.setPaggination({ what: `pageCurrent`, value: this.i });
        this.pagginatContainer({
          pagesTotal: this.getState().numCardsOnPage,
          pageCurrent: this.getPaggination().pageCurrent
        });
      }
    };
    // unify touch and mouse events
    const unify = e => {
      return e.changedTouches ? e.changedTouches[0] : e;
    };
    cardContainer.addEventListener('mousedown', lock, false);
    cardContainer.addEventListener('touchstart', lock, false);

    cardContainer.addEventListener('mouseup', move, false);
    cardContainer.addEventListener('touchend', move, false);
    document.getElementById('search').onclick = async e => {
      e.preventDefault();
      console.log(`searching...`);
      const what = document.getElementById(`input`).value;
      this.refreshCardContainer();
      if (
        what === this.getState().value ||
        Object.keys(this.getState().cashedRequests).includes(what)
      ) {
        this.setState({ value: what });
        console.log(`REQUEST FOR NEW: from cash`);
        this.sortDataByCards(
          this.getState().cashedRequests[what].rawItems,
          false,
          true
        );
      } else {
        this.setState({ value: what });
        console.log(`REQUEST FOR NEW: from youtube`);
        await this.executeSearch(what, true);
      }
    };

    this.setState({
      events: {
        needNextPage: new Event('needNextPage')
      }
    });
    cardContainer.addEventListener(
      'needNextPage',
      e => {
        e.preventDefault();
        this.getNext(this.getState().value, this.getState().nextPageToken).then(
          res => console.log(res)
        );
      },
      false
    );
  }

  setState(value) {
    const { ...state } = this.state;
    const newState = _.merge(state, value);
    this.state = newState;
  }

  getState() {
    return this.state;
  }

  getPaggination() {
    return this.getState().paggination;
  }

  setPaggination(obj) {
    this.setState({ paggination: { [obj.what]: obj.value } });
  }

  // TODO decompose to render
  async executeSearch(what, isNew) {
    const data = await this.db.fetchData(what);
    console.log(`state`, this.getState());
    this.setState({
      nextPageToken: data.nextPageToken,
      prevPageToken: data.prevPageToken,
      cashedRequests: {
        [this.getState().value]: {
          rawItems: [],
          wrappedItems: [],
          nextPageToken: data.nextPageToken,
          prevPageToken: data.prevPageToken
        }
      }
    });
    console.log(`state`, this.getState());
    const statistics = await this.db.fetchStatistic(getId(data));
    const merged = mergeById(data, statistics);
    this.sortDataByCards([].concat(merged.items), false, isNew);
  }

  sortDataByCards(items, reRender = false, isNew = false) {
    // get number of child in cardContainer
    const cardsOnPage = this.getState().numCardsOnPage;
    const listsNum = Math.round(items.length / cardsOnPage);
    const sortedArray = [];
    let index = 0;
    // set cards view
    for (let i = 0; i < listsNum; i += 1) {
      let newArr = [...items];
      const cardsElements = newArr
        .splice(index * cardsOnPage, cardsOnPage)
        .map(item => this.createCard(item));
      const div = document.createElement(`div`);
      div.className = `cards`;
      if (!reRender) this.cardContainer(div);
      div.innerHTML = cardsElements.join(` `);
      sortedArray.push(div);
      index += 1;
    }
    if (reRender) this.cardContainer(sortedArray);
    if (!reRender) {
      this.setState({
        rawItems: this.getState().rawItems.concat(...items),
        wrappedItems: isNew
          ? [].concat(...sortedArray)
          : this.getState().wrappedItems.concat(...sortedArray),
        cashedRequests: {
          [this.getState().value]: {
            rawItems: isNew
              ? [...items]
              : this.getState().rawItems.concat(...items),
            wrappedItems: isNew
              ? [...sortedArray]
              : this.getState().wrappedItems.concat(...sortedArray)
          }
        }
      });
    }
    this.recalculateContainerAspect(
      document.getElementById(`cardContainer`).children.length
    );
  }

  recalculateContainerAspect(length) {
    this.calculateWidthOfCardContainer(false, length);
    // set pagesTotal for paggination
    this.setPaggination({
      what: `pagesTotal`,
      value: length
    });
    this.saveInLocalStorage();
  }

  async getNext(value, token) {
    const what = `${value} &pageToken=${token}`;
    await this.executeSearch(what, false);
  }

  refreshCardContainer() {
    const cardContainer = document.getElementById(`cardContainer`);
    this.x0 = null;
    this.i = 0;
    cardContainer.style.removeProperty(`--i`);
    this.setPaggination({ what: 'pageCurrent', value: 1 });
    cardContainer.innerHTML = ``;
  }

  windowSizeHandler() {
    const reRender = () => {
      if (
        this.getState().cashedRequests[this.getState().value].rawItems.length
      ) {
        this.sortDataByCards([...this.getState().rawItems], true);
      } else console.log(`nothing to reRender`);
    };
    const checkWindowSize = () => {
      if (window.innerWidth > 1200) {
        this.setState({ numCardsOnPage: 4 });
        reRender();
      }
      if (window.innerWidth < 1200 && window.innerWidth > 988) {
        this.setState({ numCardsOnPage: 3 });
        reRender();
      }
      if (window.innerWidth < 900) {
        this.setState({ numCardsOnPage: 1 });
        reRender();
      }
    };
    checkWindowSize();
    window.onresize = e => {
      checkWindowSize();
    };
  }

  cardContainer(elem) {
    return this.view.appendToCardContainer(elem);
  }

  pagginatContainer(howMuch = { pagesTotal: 0, pageCurrent: 0 }) {
    return this.view.pagginatContainerRender(howMuch);
  }

  createCard(object = {}) {
    return this.view.createCard(object);
  }

  calculateWidthOfCardContainer(isI, value) {
    isI
      ? this.view.calculateWidthOfCardContainerI(value)
      : this.view.calculateWidthOfCardContainerN(value);
  }

  restoreFromLocalStorage() {
    if (localStorage[`state`] !== undefined) {
      this.setState(JSON.parse(localStorage[`state`]));
    } else this.setState({});
  }

  saveInLocalStorage() {
    localStorage[`state`] = JSON.stringify(this.getState());
  }

  render() {
    this.restoreFromLocalStorage();
    this.view.render();
  }
}

export default App;
