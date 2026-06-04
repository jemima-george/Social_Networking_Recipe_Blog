import { showSection } from './authentication.js';

// Managing links of the navigation bar
const indexLink = document.getElementById("indexLink");
const homeLink= document.getElementById("homeLink");
const registerLink = document.getElementById("registerLink");

// Links of the content of the page divisions
const indexPage = document.getElementById("indexPage");
const registerForm = document.getElementById("registerForm");
const indexRegisterButton = document.getElementById("indexRegisterButton");

// Check if a user is logged in
function checkLoggedIn() {
    const currentUser = sessionStorage.getItem("currentUser");

    // Hide all sections initially
    document.querySelectorAll(".container > div").forEach(section => {
        section.style.display = "none";
    });

    if (currentUser) {
        // User is logged in, show the recipe card
        document.getElementById("recipeForm").style.display = "block";
    } else {
        // No user logged in, show the index page
        document.getElementById("indexPage").style.display = "block";
    }
}

// Call this function on page load
document.addEventListener("DOMContentLoaded", () => {
    checkLoggedIn();
});

// Event listeners for navigation links
indexLink.addEventListener("click", (event) => {
    event.preventDefault();
    showSection(indexPage); // Show the index page
});

homeLink.addEventListener("click", (event) => {
    event.preventDefault();
    showSection(indexPage); // Show the index page
});

indexRegisterButton.addEventListener("click", (event) => {
    event.preventDefault();
    showSection(registerForm); // Show the register form
});

registerLink.addEventListener("click", (event) => {
    event.preventDefault();
    showSection(registerForm); // Show the register form
});

