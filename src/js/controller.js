//importing all(*) the named variables from model.js
import icons from 'url:../img/icons.svg';
import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import bookmarksView from './views/bookmarksView.js';
import paginationView from './views/paginationView.js';
import addRecipeView from './views/addRecipeView.js';
//polyfilling
import 'core-js/stable';
///polyfilling async await
import 'regenerator-runtime/runtime';

// if (module.hot) {
//   module.hot.accept();
// }

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipes = async function () {
  try {
    //take the hash from the url to load the right recipe
    const id = window.location.hash.slice(1);
    ///guard clause if url has no id
    if (!id) return;
    recipeView.renderSpinner();
    ///0 Update results view to mark selected search results
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);
    ///1 Loading Recipe
    ///calling the loadrecipe on the imported model object
    ///returns a promise therefore the result needs 'await'
    await model.loadRecipe(id);

    ///2. rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    //call renderErr function from recipeView, so its shown in the view
    //Err is coming from the thrown error of the model
    recipeView.renderError();
    console.error(err);
  }
};
const controlSearchResults = async function () {
  try {
    //display spinner
    resultsView.renderSpinner();
    //1. get search query from DOM
    const query = searchView.getQuery();
    if (!query) return;

    //2. load search results
    await model.loadSearchResults(query);
    //3. render results
    //only for the page to be displayed, not all results
    resultsView.render(model.getSearchResultsPage());
    ///4. Render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};
const controlPagination = function (goToPage) {
  ///1. render the new page in the resultsview
  resultsView.render(model.getSearchResultsPage(goToPage));
  ///2. render new pagination buttions
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  ////Update the recipe servings (in state)
  model.updateServings(newServings);
  ///Update the recipe view with the new state with new quantities for the ingredients
  // recipeView.render(model.state.recipe);
  //will only update neccessary html elements
  recipeView.update(model.state.recipe);
};
const controlAddBookmark = function () {
  //1. add or remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  //2. update will only change the changed elements in the markup
  //so in this case from the normal bookmark icon to the filled one
  recipeView.update(model.state.recipe);
  //3.render bookmarks
  bookmarksView.render(model.state.bookmarks);
};
//function called on loading the page via the bookmarksview, immediately renders bookmarks from local storage
const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

//needs to be async function because it awaits the promise of model.uploadRecipe
const controlAddRecipe = async function (newRecipe) {
  try {
    //Show loading spinner
    addRecipeView.renderSpinner();
    ///Upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);
    ///Render recipe
    recipeView.render(model.state.recipe);
    // show succes message
    addRecipeView.renderMessage();
    //render bookmark view
    bookmarksView.render(model.state.bookmarks);
    /// change ID in url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    //Close form after 2,5 seconds
    setTimeout(function () {
      addRecipeView.toggleWindow;
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    //error is caught and logged in console+ error rendered in view of use
    console.error('ksjdkd', err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  ///check publisher subscriber pattern for more info
  //this way controller is in control without recipView knowing about controller
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  ///same for searchview. Initially addhandlersearch is called with searchresults function
  ///this way they are connected
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();

///show icons on menu bar
document.querySelector(
  '.search__icon'
).innerHTML = `<use href=${icons}#icon-search></use>`;
document.querySelector(
  '.nav__icon'
).innerHTML = `<use href=${icons}#icon-edit></use>`;
document.querySelector(
  '.nav__btn--bookmarks'
).innerHTML = `<svg class="nav__icon">
<use href="${icons}#icon-bookmark"></use>
</svg>
<span>Bookmarks</span>`;
