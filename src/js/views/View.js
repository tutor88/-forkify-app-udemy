//creating a general parent class so all the child classes have acces to the same functions
//these functions will be used by the child classes individually
import icons from 'url:../../img/icons.svg';

export default class View {
  _data;
  render(data, render = true) {
    ///guard clase if there is no data or if its an empty array then return and render error
    if (!data || data.length === 0) return this.renderError();
    this._data = data;
    const markup = this._generateMarkup();
    if (!render) return markup;
    this._clear();
    ///adding the rendered markup to the container
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }
  update(data) {
    this._data = data;
    const newMarkup = this._generateMarkup();
    //generates a virtual dom object, for comparing to the existing html in the dom
    const newDOM = document.createRange().createContextualFragment(newMarkup);
    ///selecting all elements of this virtual dom html and make an array from the nodelist
    const newElements = Array.from(newDOM.querySelectorAll('*'));
    //select al the current elements  and make an array from the nodelist
    const curElements = Array.from(this._parentElement.querySelectorAll('*'));
    //looping over both arrays and checking if they are equal with .isEqualNode()
    newElements.forEach((newEl, i) => {
      const curEl = curElements[i];
      /////Updates changed Text
      if (
        !newEl.isEqualNode(curEl) &&
        newEl.firstChild?.nodeValue.trim() !== ''
      ) {
        curEl.textContent = newEl.textContent;
      }
      /////Update changed attributes
      if (!newEl.isEqualNode(curEl)) {
        Array.from(newEl.attributes).forEach(attr =>
          curEl.setAttribute(attr.name, attr.value)
        );
      }
    });
  }
  _clear() {
    //removing the initial message
    this._parentElement.innerHTML = '';
  }
  renderSpinner() {
    const markup = `
      <div class="spinner">
              <svg>
                <use href="${icons}#icon-loader"></use>
              </svg>
            </div>
      `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }
  ///if no message is past in the auto message will be taken
  renderError(message = this._errorMessage) {
    const markup = `
        <div class="error">
         <div>
            <svg>
               <use href="${icons}#icon-alert-triangle"></use>
             </svg>
          </div>
          <p>${message}</p>
        </div> 
        `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }
  renderMessage(message = this._message) {
    const markup = `
        <div class="message">
         <div>
            <svg>
               <use href="${icons}#icon-smile"></use>
             </svg>
          </div>
          <p>${message}</p>
        </div> 
        `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }
}
