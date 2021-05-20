class SearchView {
  _parentEl = document.querySelector('.search');
  _clearInput() {
    this._parentEl.querySelector('.search__field').value = '';
  }
  getQuery() {
    //selects and returns input form the child el of search form, in this case the text input
    const query = this._parentEl.querySelector('.search__field').value;
    this._clearInput();
    return query;
  }

  addHandlerSearch(handler) {
    //handler function should be only called after event default is prevented
    //otherwise the page reloads before calling the handler function
    this._parentEl.addEventListener('submit', function (e) {
      e.preventDefault();
      handler();
    });
  }
}

export default new SearchView();
