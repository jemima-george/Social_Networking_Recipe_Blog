// Recipe functionality
document.addEventListener("DOMContentLoaded", () => {
    const recipesList = document.getElementById("recipesList");
    const recipeForm = document.getElementById("recipeForm");
    const currentUser = sessionStorage.getItem("currentUser");
    if (!currentUser) {
        recipeForm.style.display = "none"; // Hide recipe form if not logged in
        recipesList.style.display = "none"; // Hide recipes list if not logged in
        return;
    }

    // If logged in, show recipe form and load recipes
    recipeForm.style.display = "block";
    recipesList.style.display = "block";

    // Load recipes from the server
    loadRecipes();

// Function to render a recipe
function renderRecipe(title, ingredients, instructions, author) {
    const recipeCard = document.createElement("div");
    recipeCard.classList.add("recipe-card");

    recipeCard.innerHTML = `
        <h3>${title}</h3>
        <p><strong>By:</strong> ${author}</p>
        <p><strong>Ingredients:</strong><br>${ingredients.replace(/\n/g, "<br>")}</p>
        <p><strong>Instructions:</strong><br>${instructions.replace(/\n/g, "<br>")}</p>
    `;
    recipesList.appendChild(recipeCard);
}
// replace /n to <br> to keep whitespaces for ingredients and instructions because <p> tag in html might automatically remove whitespaces.

// Load recipes from MongoDb
async function loadRecipes() {
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
    if (!currentUser) return; // Do not load recipes if no user is logged in

    try {
        // Fetch recipes from the server
        const response = await fetch(`/contents`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include", // Include session cookie
        });

        const data = await response.json();

        if (data.success) {
            const recipes = data.contents;

            // Clear the recipes list before rendering to avoid repetition
            recipesList.innerHTML = "";

            // Render each recipe
            recipes.forEach(recipe => {
                renderRecipe(
                    recipe.title,
                    recipe.ingredients.join("\n"), // Convert array to string with line breaks
                    recipe.instructions,
                    recipe.author
                );
            });
        } else {
            console.warn("Failed to load recipes:", data.message);
        }
    } catch (error) {
        console.error("Error fetching recipes from server:", error);
    }
}

// Send recipe to server
async function saveRecipe(title, ingredients, instructions, author) {
    try {
        const response = await fetch(`/contents`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include", // Include session cookie
            body: JSON.stringify({ title, ingredients: ingredients.split("\n"), instructions }),
        });

        const data = await response.json();

        if (data.success) {
            alert("Recipe saved successfully!");
            renderRecipe(title, ingredients, instructions, author);
        } else {
            console.error("Failed to save recipe:", data.message);
            alert(`Failed to save recipe: ${data.message}`);
        }
    } catch (error) {
        console.error("Error saving recipe to server:", error);
    }
}

// Function to follow a user
async function followUser(usernameToFollow) {
    try {
        const response = await fetch(`/follow/${usernameToFollow}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include", // Include session cookies
        });

        const result = await response.json();

        if (response.ok) {
            alert(`${result.message}`);
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error("Error following user:", error);
        alert("An error occurred while trying to follow the user.");
    }
}

// Event listener to handle recipe form submission
recipeForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const title = event.target.title.value.trim();
    const ingredients = event.target.ingredients.value;
    const instructions = event.target.instructions.value;

    const currentUser = JSON.parse(sessionStorage.getItem("currentUser")); // Parse the user object
    const author = currentUser.name;

    if (title && ingredients && instructions) {
        renderRecipe(title, ingredients, instructions, author);
        saveRecipe(title, ingredients, instructions, author);
        event.target.reset();
    } else {
        alert("Please fill out all fields.");
    }
});
});
