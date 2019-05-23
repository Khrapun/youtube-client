class Model {
  fetchData(requerString = `js`) {
    return new Promise((resolve, reject) => {
      const QUERY = `https://www.googleapis.com/youtube/v3/search?key=AIzaSyC69L4q5W1p-FnVnxhUxAshmR0FLeLA7-c&type=video&part=snippet&maxResults=15&q=${requerString}`;
      fetch(QUERY)
        .then(res => resolve(res.json()))
        .catch(e => reject(e));
    });
  }

  fetchStatistic(id) {
    return new Promise((resolve, reject) => {
      const QUERY = `https://www.googleapis.com/youtube/v3/videos?key=AIzaSyC69L4q5W1p-FnVnxhUxAshmR0FLeLA7-c&id=${id}&part=snippet,statistics`;
      fetch(QUERY)
        .then(res => resolve(res.json()))
        .catch(e => reject(e));
    });
  }
}

export default Model;
