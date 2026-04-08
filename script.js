/* ========================================
   MEAL MASTER – SCRIPT.JS
   Fetches meals from TheMealDB API and
   renders them as dynamic cards.
   ======================================== */

// =====================
//  DOM REFERENCES
// =====================
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const mealsContainer = document.getElementById("meals-container");
const hintChips = document.querySelectorAll(".hint-chip");

// =====================
//  API CONFIGURATION
// =====================
const API_BASE = "https://www.themealdb.com/api/json/v1/1/search.php?s=";

// =====================
//  API FUNCTION
// =====================

/**
 * Fetches meals from TheMealDB API for the given search query.
 * @param {string} query - The search term entered by the user.
 * @returns {Promise<Object[]|null>} Array of meal objects or null if none found.
 */
async function fetchMeals(query) {
  const response = await fetch(`${API_BASE}${encodeURIComponent(query)}`);

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.meals; // null if no results
}

// =====================
//  RENDER FUNCTIONS
// =====================

/**
 * Renders the loading spinner inside the meals container.
 */
function renderLoading() {
  mealsContainer.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading delicious meals…</p>
    </div>
  `;
}

/**
 * Renders an error message inside the meals container.
 * @param {string} message - The error message to display.
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
 * Renders a "no results" message inside the meals container.
 * @param {string} query - The search term that yielded no results.
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
 * Renders meal cards inside the meals container.
 * @param {Object[]} meals - Array of meal objects from the API.
 * @param {string} query - The original search query (for the results header).
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
 * Creates the HTML string for a single meal card.
 * @param {Object} meal - A meal object from the API.
 * @returns {string} HTML string for the meal card.
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

// =====================
//  SEARCH HANDLER
// =====================

/**
 * Handles the search flow: validates input, shows loading,
 * fetches data, and renders results or errors.
 */
async function handleSearch() {
  const query = searchInput.value.trim();

  if (!query) {
    searchInput.focus();
    searchInput.classList.add("shake");
    setTimeout(() => searchInput.classList.remove("shake"), 500);
    return;
  }

  // Show loading state
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

// =====================
//  UTILITY FUNCTIONS
// =====================

/**
 * Escapes HTML special characters to prevent XSS.
 * @param {string} str - Raw string to escape.
 * @returns {string} Escaped string safe for innerHTML.
 */
function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// =====================
//  EVENT LISTENERS
// =====================

// Search button click
searchBtn.addEventListener("click", handleSearch);

// Enter key in search input
searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleSearch();
  }
});

// Hint chip clicks
hintChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    searchInput.value = chip.dataset.query;
    handleSearch();
  });
});

// =====================
//  THEME TOGGLE
// =====================
const themeToggle = document.getElementById("theme-toggle");
const root = document.documentElement;

// Apply saved theme on load (default: dark)
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
