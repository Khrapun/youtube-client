import App from './App';

describe('AppModel.sortDataByCards', () => {
  const app = new App();
  it('Should be an instance of Function', () => {
    expect(app.sortDataByCards).toBeInstanceOf(Function);
  });
});
