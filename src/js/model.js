//polyfilling async await
import 'regenerator-runtime/runtime';
import { API_URL, KEY } from './config.js';
import { RES_PER_PAGE } from './config.js';
// import { getJSON, sendJSON } from './helpers.js';
import { AJAX } from './helpers.js';
export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
};

const createRecipeObject = function (data) {
  let { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    //&&operator checks if recipe.key exists
    //if it does key:recipe.key is spreaded from the object
    ...(recipe.key && { key: recipe.key }),
  };
};

export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);
    ///change the property names to better JS names
    state.recipe = createRecipeObject(data);
    //check if recipe already exists as a bookmark
    //if bookmarked is true it will recieve the right icon upon rendering
    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;
  } catch (err) {
    //thrown to controller
    throw err;
  }
};
export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
    console.log(data);
    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });
    //reset page to 1 for new search results
    state.search.page = 1;
  } catch (err) {
    throw err;
  }
};

export const getSearchResultsPage = function (page = state.search.page) {
  //save in the state which page is currently active
  state.search.page = page;
  //dynamically calc start and end in slicing the array
  //page 1 starts with 0, then ends with 10
  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;
  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
    //newQt = oldQt * newServings/ oldServings
  });
  //update new servings in the state
  state.recipe.servings = newServings;
};
//to be used to store bookmarks in local storage
const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};
export const addBookmark = function (recipe) {
  // add bookmark to state
  state.bookmarks.push(recipe);

  //mark current recipe as bookmark
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;
  //saves current state of bookmarks in local storage
  persistBookmarks();
};
export const deleteBookmark = function (id) {
  //delete bookmark from array
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1);
  //mark current recipe as not bookmarked
  if (id === state.recipe.id) state.recipe.bookmarked = false;
  //saves current state of bookmarks in local storage
  persistBookmarks();
};
///init function to load local bookmarks from storage
const init = function () {
  const storage = localStorage.getItem('bookmarks');
  //if bookmarks available they are save in the state
  if (storage) state.bookmarks = JSON.parse(storage);
};
init();

///used for developing purposes to clear bookmarks from local storage
const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};

export const uploadRecipe = async function (newRecipe) {
  //1. restructuring iongredients to match API structure
  ///object is turned back into array and filtered for entries
  // where the first entry starts with ingredient and the second entry is not empty
  //then map the second entries of the ingredient array
  //first saving al the inputs as quantity, unit and description, then returning it as an object
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].split(',').map(el => el.trim());
        ///checks if there are actually three ingredients in the array, otherise it throws error
        //and the function will be exited
        if (ingArr.length !== 3)
          throw new Error(
            'Wrong ingredient fromat! Please use the correct format'
          );
        const [quantity, unit, description] = ingArr;
        //ternary operator for quantity: if there is one convert it to number
        //otherwise set it to null
        return { quantity: quantity ? +quantity : null, unit, description };
      });
    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };

    //created in helpers.js and imported
    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    //refactor the received data with the createRecipeObject method
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    ///error is thrown back to the controller(controlAddRecipe)
    throw err;
  }
};
