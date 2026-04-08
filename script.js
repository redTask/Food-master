
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const mealsContainer = document.getElementById("meals-container");
const hintChips = document.querySelectorAll(".hint-chip");


const API_BASE = "https://www.themealdb.com/api/json/v1/1/search.php?s=";



/**

 * @param {string} query 
 * @returns {Promise<Object[]|null>} 
 */
async function fetchMeals(query) {
  const response = await fetch(`${API_BASE}${encodeURIComponent(query)}`);

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.meals; 
}


function renderLoading() {
  mealsContainer.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading delicious meals…</p>
    </div>
  `;
}

/**

 * @param {string} message 
 */
function renderError(message) {
  mealsContainer.innerHTML = `
    <div class="error-state">
      <div class="error-icon">⚠️</div>
      <h2>Something went wrong</h2>
      <p>${message}</p>
    </div>
  `;
}

/**

 * @param {string} query 
 */
function renderNoResults(query) {
  mealsContainer.innerHTML = `
    <div class="error-state">
      <div class="error-icon">🍽️</div>
      <h2>No meals found</h2>
      <p>We couldn't find any meals matching "<strong>${escapeHTML(query)}</strong>". Try a different search term.</p>
    </div>
  `;
}

/**

 * @param {Object[]} meals 
 * @param {string} query 
 */
function renderMeals(meals, query) {
  const resultsHeader = `
    <div class="results-header">
      <h2>Results for "<span>${escapeHTML(query)}</span>"</h2>
      <p>${meals.length} meal${meals.length !== 1 ? "s" : ""} found</p>
    </div>
  `;

  const cardsHTML = meals.map(createMealCard).join("");

  mealsContainer.innerHTML = `
    ${resultsHeader}
    <div class="meals-grid">
      ${cardsHTML}
    </div>
  `;
}

/**

 * @param {Object} meal 
 * @returns {string} 
 */
function createMealCard(meal) {
  return `
    <article class="meal-card" id="meal-${meal.idMeal}">
      <div class="meal-card-image">
        <img
          src="${meal.strMealThumb}"
          alt="${escapeHTML(meal.strMeal)}"
          loading="lazy"
        />
      </div>
      <div class="meal-card-body">
        <h3 class="meal-card-name">${escapeHTML(meal.strMeal)}</h3>
        <div class="meal-card-tags">
          ${meal.strCategory ? `<span class="meal-tag category"><span class="meal-tag-icon">📂</span> ${escapeHTML(meal.strCategory)}</span>` : ""}
          ${meal.strArea ? `<span class="meal-tag area"><span class="meal-tag-icon">🌍</span> ${escapeHTML(meal.strArea)}</span>` : ""}
        </div>
      </div>
    </article>
  `;
}


/**


 */
async function handleSearch() {
  const query = searchInput.value.trim();

  if (!query) {
    searchInput.focus();
    searchInput.classList.add("shake");
    setTimeout(() => searchInput.classList.remove("shake"), 500);
    return;
  }


  renderLoading();

  try {
    const meals = await fetchMeals(query);

    if (!meals) {
      renderNoResults(query);
      return;
    }

    renderMeals(meals, query);
  } catch (error) {
    console.error("Fetch error:", error);
    renderError("Failed to fetch meals. Please check your internet connection and try again.");
  }
}


/**

 * @param {string} str - 
 * @returns {string} 
 */
function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}



searchBtn.addEventListener("click", handleSearch);


searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleSearch();
  }
});


hintChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    searchInput.value = chip.dataset.query;
    handleSearch();
  });
});


const themeToggle = document.getElementById("theme-toggle");
const root = document.documentElement;


const savedTheme = localStorage.getItem("mm-theme") || "dark";
if (savedTheme === "light") {
  root.setAttribute("data-theme", "light");
}

themeToggle.addEventListener("click", () => {
  const isLight = root.getAttribute("data-theme") === "light";
  const newTheme = isLight ? "dark" : "light";
  root.setAttribute("data-theme", newTheme);
  localStorage.setItem("mm-theme", newTheme);
});
