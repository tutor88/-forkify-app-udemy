import View from './View.js';
import icons from 'url:../../img/icons.svg';
class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');

  addHandlerClick(handler) {
    //event delegation
    //listen to parent element for a click
    this._parentElement.addEventListener('click', function (e) {
      //important to use closest method
      //user can also click on span element or svg
      const btn = e.target.closest('.btn--inline');
      if (!btn) return;
      //take the pagenumber to go to and store it
      //check markup below for how this data attribute is added
      const goToPage = +btn.dataset.goto;
      handler(goToPage);
    });
  }
  //important, because render method is called with the argument of state.search on the instance of this object in controller
  //this._data contains the state.search property
  _generateMarkup() {
    const curPage = this._data.page;
    const numPages = Math.ceil(
      this._data.results.length / this._data.resultsPerPage
    );

    ///Page 1, more pages
    if (curPage === 1 && numPages > 1) {
      return this._generateBtn(curPage)[1];
    }

    ///Last page
    if (curPage === numPages && numPages > 1) {
      return this._generateBtn(curPage)[0];
    }
    ///Other page
    if (curPage < numPages) {
      ///takes whole array, apparently this also work with insertAdjecentHTMl method
      return this._generateBtn(curPage);
    }
    ////Page1, no other pages
    return '';
  }
  ///create array with strings for html of both prev and next button
  //above the part of the array with the right btn is chosen
  _generateBtn(curPage) {
    return [
      `
    <button data-goto="${
      curPage - 1
    }" class="btn--inline pagination__btn--prev">
          <svg class="search__icon">
            <use href="${icons}#icon-arrow-left"></use>
          </svg>
          <span>Page ${curPage - 1}</span>
        </button>
    `,
      `<button
        data-goto="${curPage + 1}"
        class="btn--inline pagination__btn--next"
      >
        <svg class="search__icon">
          <use href="${icons}#icon-arrow-right"></use>
        </svg>
        <span>Page ${curPage + 1}</span>
      </button>`,
    ];
  }
}

export default new PaginationView();
