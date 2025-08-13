// Load saved data from localStorage on page load
window.addEventListener("DOMContentLoaded", () => {
    // Load meal plan
    const savedMealPlan = localStorage.getItem("mealPlan");
    if (savedMealPlan) {
        mealPlan = JSON.parse(savedMealPlan);
        updateMealPlanUI();
    }

    // Load manual shopping items
    const savedShoppingItems = localStorage.getItem("manualShoppingItems");
    if (savedShoppingItems) {
        manualShoppingItems = JSON.parse(savedShoppingItems);
        updateShoppingListUI();
    }
});

// Save mealPlan and manualShoppingItems to localStorage helper function
function saveToLocalStorage() {
    localStorage.setItem("mealPlan", JSON.stringify(mealPlan));
    localStorage.setItem("manualShoppingItems", JSON.stringify(manualShoppingItems));
}

// EVENT LISTENER for recipe search
document.getElementById("searchButton").addEventListener("click", searchRecipes);

// SEARCH RECIPES FUNCTION
async function searchRecipes() {
    const query = document.getElementById("searchInput").value.trim();
    const resultsDiv = document.getElementById("searchResults");
    resultsDiv.innerHTML = ""; 

    if (!query) {
        alert("Please enter a recipe name!");
        return;
    }

    const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            resultsDiv.innerHTML = `<p style='color:red;'>API request failed with status: ${response.status}</p>`;
            throw new Error(`API request failed with status ${response.status}`);
        }
        const data = await response.json();

        if (!data.meals) {
            resultsDiv.innerHTML = "<p>No recipes found for your search.</p>";
            return;
        }

        displayResults(data.meals);
    } catch (error) {
        console.error("Error fetching recipes:", error);
        if (resultsDiv.innerHTML === "") {
            resultsDiv.innerHTML = "<p style='color:red;'>Sorry, something went wrong. Please try again later.</p>";
        }
    }
}

// DISPLAY RECIPE RESULTS
function displayResults(recipes) {
    const resultsDiv = document.getElementById("searchResults");
    resultsDiv.innerHTML = ""; // Clear old results

    if (!recipes || recipes.length === 0) {
        resultsDiv.innerHTML = "<p>No recipes found.</p>";
        return;
    }

    recipes.forEach(recipe => {
        // Collect ingredients 
        let ingredients = [];
        for (let i = 1; i <= 20; i++) {
            const ingredient = recipe[`strIngredient${i}`];
            const measure = recipe[`strMeasure${i}`];
            if (ingredient && ingredient.trim()) {
                ingredients.push(`${measure ? measure.trim() : ""} ${ingredient.trim()}`.trim());
            }
        }
        const ingredientsText = ingredients.join(", ");

        const instructions = recipe.strInstructions || "No instructions available.";

        const recipeCard = document.createElement("div");
        recipeCard.classList.add("recipe-card");
        recipeCard.innerHTML = `
            <h3>${recipe.strMeal}</h3>
            <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" width="150">
            <p><strong>Ingredients:</strong> ${ingredientsText}</p>
            <p><strong>Instructions:</strong> ${instructions}</p>
            <button class="add-to-mealplan" data-recipe='${JSON.stringify({
              id: recipe.idMeal,
              title: recipe.strMeal,
              image: recipe.strMealThumb,
              ingredients: ingredientsText
            })}'>Add to Meal Plan</button>
        `;
        resultsDiv.appendChild(recipeCard);
    });

    document.querySelectorAll(".add-to-mealplan").forEach(button => {
        button.addEventListener("click", () => {
            const recipe = JSON.parse(button.getAttribute("data-recipe"));
            addToMealPlan(recipe);
        });
    });
}

function updateDateTime() {
    const now = new Date();
    const options = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false 
    };
    document.getElementById("dateTime").textContent = now.toLocaleString("en-US", options);
}
updateDateTime();
setInterval(updateDateTime, 1000);

// ---------- MEAL PLANNER AND SHOPPING LIST ------------

let mealPlan = [];
let manualShoppingItems = [];

function addToMealPlan(recipe) {
    if (mealPlan.find(r => r.id === recipe.id)) {
        alert("This recipe is already in your meal plan.");
        return;
    }
    mealPlan.push(recipe);
    updateMealPlanUI();
    updateShoppingListUI();
    saveToLocalStorage(); // <-- Save after adding
}

function updateMealPlanUI() {
    const container = document.getElementById("mealPlanContainer");
    container.innerHTML = "";

    if (mealPlan.length === 0) {
        container.innerHTML = "<p>No recipes added to your meal plan yet.</p>";
        return;
    }

    mealPlan.forEach(recipe => {
        const div = document.createElement("div");
        div.classList.add("meal-plan-item");
        div.innerHTML = `
            <h4>${recipe.title}</h4>
            <img src="${recipe.image}" alt="${recipe.title}" width="100">
            <button class="remove-mealplan" data-id="${recipe.id}">Remove</button>
        `;
        container.appendChild(div);
    });

    document.querySelectorAll(".remove-mealplan").forEach(button => {
        button.addEventListener("click", () => {
            const id = button.getAttribute("data-id");
            removeFromMealPlan(id);
        });
    });
}

function removeFromMealPlan(id) {
    mealPlan = mealPlan.filter(recipe => recipe.id != id);
    updateMealPlanUI();
    updateShoppingListUI();
    saveToLocalStorage(); // <-- Save after removing
}

function updateShoppingListUI() {
    const shoppingList = document.getElementById("shoppingListItems");
    shoppingList.innerHTML = "";

    let allIngredients = [];
    mealPlan.forEach(recipe => {
        if (recipe.ingredients) {
            const ingredientsArray = recipe.ingredients.split(", ");
            allIngredients = allIngredients.concat(ingredientsArray);
        }
    });

    let combinedList = [...new Set(allIngredients.concat(manualShoppingItems))];

    if (combinedList.length === 0) {
        shoppingList.innerHTML = "<li>Your shopping list is empty.</li>";
        return;
    }

    combinedList.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        shoppingList.appendChild(li);
    });
}

const shoppingInput = document.getElementById("shoppingInput");
const addShoppingBtn = document.getElementById("addShoppingBtn");

addShoppingBtn.addEventListener("click", () => {
    const newItem = shoppingInput.value.trim();
    if (newItem === "") {
        alert("Please enter an item to add.");
        return;
    }
    if (!manualShoppingItems.includes(newItem)) {
        manualShoppingItems.push(newItem);
    }
    shoppingInput.value = "";
    updateShoppingListUI();
    saveToLocalStorage(); // <-- Save after adding manual item
});

