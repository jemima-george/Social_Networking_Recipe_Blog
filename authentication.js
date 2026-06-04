import { validatePassword, storeUser } from "./shared_funcs.js";
import { registerUserServer, loginUserServer } from "../Backend/ajax.js";

// Highlight specific section without hiding others. Export to navigation.js
export function showSection(activeSection) {
    document.querySelectorAll(".auth-forms, .profile-section, .recipe-form, .indexpage, .recipes-container, .follow-form").forEach((section) => {
        section.style.display = section === activeSection ? "block" : "none";
    });

    // Keep the recipes list visible when the index page is active
    if (activeSection === document.getElementById("indexPage")) {
        document.getElementById("recipesList").style.display = "block";
    } else {
        document.getElementById("recipesList").style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Existing variables and setup
    const registerForm = document.querySelector("#registerForm form");
    const loginForm = document.querySelector("#loginForm form");
    const profilePage = document.getElementById("profilePage");
    const followForm = document.getElementById("followForm");
    const profileUserName = document.getElementById("profileName");
    const profileUserEmail = document.getElementById("profileUserEmail");
    const logoutButton = document.getElementById("logoutButton");
    const loginLink = document.getElementById("loginLink"); 
    const recipecardLink = document.getElementById("recipecardLink");
    const followLink = document.getElementById("followLink")
    const recipeForm = document.getElementById("recipeForm");

    // Prevent access to "Post A Recipe" unless logged in
    recipecardLink.addEventListener("click", (event) => {
        event.preventDefault(); // Prevent default navigation behavior
    
        const currentUser = sessionStorage.getItem("currentUser");
        if (currentUser) {
            // Allow access if logged in
            showSection(recipeForm);
        } else {
            alert("You must be logged in to access this page.");
            showSection(document.getElementById("loginForm")); // Redirect to login form
        }
    });    

    // Prevent access to "Follow A User" unless logged in
    followLink.addEventListener("click", (event) => {
        event.preventDefault(); // Prevent default navigation behavior
    
        const currentUser = sessionStorage.getItem("currentUser");
        if (currentUser) {
            // Allow access if logged in
            showSection(followForm);
        } else {
            alert("You must be logged in to access this page.");
            showSection(document.getElementById("loginForm")); // Redirect to login form
        }
    });    
    
    
    // Display Profile Page if user is already logged in
    loginLink.addEventListener("click", (event) => {
        event.preventDefault();
    
        const currentUser = JSON.parse(sessionStorage.getItem("currentUser")); // Dynamically parse current user
        if (currentUser) {
            // Show profile page if logged in
            showSection(profilePage);
        } else {
            // Show login form if not logged in
            showSection(document.getElementById("loginForm"));
        }
    });
    

    // Add event listener to navigation links
    document.querySelectorAll("nav a").forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault(); // Prevent page reload
    
            // Skip if it's the "Post A Recipe" link
            if (link === recipecardLink) return;
            if (link === followLink) return;
    
            const sectionId = event.target.getAttribute("data-section"); // Get target section
            const targetSection = document.getElementById(sectionId);
    
            if (sectionId === "profilePage") {
                const currentUser = sessionStorage.getItem("currentUser");
                if (currentUser) {
                    showSection(profilePage); // Show profile page
                } else {
                    alert("You need to log in to view the profile page.");
                }
            } else if (targetSection) {
                showSection(targetSection); // Show the selected section
            }
        });
    });   

    // Handle registration
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = event.target.rname.value.trim();
        const email = event.target.remail.value.trim();
        const password = event.target.rpass.value.trim();
        const phone = event.target.rnum.value.trim();

        let isValid = true;

        if (!/^\d{3}-\d{3}-\d{4}$/.test(phone)) {
            alert("Invalid phone number format. Use ###-###-####.");
            isValid = false;
        }
        

        if (!validatePassword(password)) {
            alert("Password is not secure. Use lowercase letters, uppercase letters, and numbers.");
            isValid = false;
        }

        if (isValid) {
            try {
                const users = storeUser(name, email, password, phone);
                // Forward validated data to the server
                const response = await registerUserServer({ name, email, password, phone });

                if (response.success) {
                    alert("Registration successful! Please log in.");
                    registerForm.reset();
                    showSection(document.getElementById("loginForm")); // Redirect to login form
                } else {
                    alert(`Registration failed: ${response.message}`);
                    registerForm.reset();
                }
            } catch (error) {
                console.error("Server Error:", error.message);
                alert("An error occurred during registration. Please try again.");
            }
        }
    });

    // Fetch and display profile details
    async function fetchAndDisplayProfile() {
        const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
        if (!currentUser) return;

        try {
            // Fetch profile data from the server
            const response = await fetch(`/profile`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // Include session cookies
            });

            const data = await response.json();

            if (data.success) {
                const { name, email, followers, posts } = data.profile;

                // Update profile details
                profileUserName.textContent = name;
                profileUserEmail.textContent = email;

                // Update followers and posts
                const profileFollowers = document.getElementById("profileFollowers");
                const profilePosts = document.getElementById("profilePosts");

                if (profileFollowers) profileFollowers.textContent = `Followers: ${followers || 0}`;
                if (profilePosts) profilePosts.textContent = `Posts: ${posts || 0}`;

                console.log("Profile data fetched and updated successfully:", data.profile);
            } else {
                console.error("Failed to fetch profile data:", data.message);
            }
        } catch (error) {
            console.error("Error fetching profile data:", error);
        }
    }

    // After successful login, fetch and display the profile
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
    if (currentUser) {
        const { name, email } = currentUser;

        profileUserName.textContent = name;
        profileUserEmail.textContent = email;

        // Update login link to show user's name
        loginLink.textContent = name;
        loginLink.setAttribute("data-section", "profilePage");

        // Fetch and display complete profile details
        fetchAndDisplayProfile();

        // Show the profile page
        showSection(profilePage);
    } else {
        loginLink.textContent = "Login";
        loginLink.setAttribute("data-section", "loginForm");
    }


    // Handle login
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const email = event.target.lemail.value.trim();
        const password = event.target.lpass.value.trim();        

        try {
            // Send login data to the server
            const response = await loginUserServer({ email, password });

            if (response.success) {
                const { name, email } = response.user; // Assume server returns user details
                sessionStorage.setItem("currentUser", JSON.stringify({ name, email })); // Save logged-in user
                alert(`Welcome, ${name}!`);

                // Update profile details
                profileUserName.textContent = name;
                profileUserEmail.textContent = email;

                // Update login link to show user's name and redirect to profile
                loginLink.textContent = name;
                loginLink.setAttribute("data-section", "profilePage");

                // Show profile page
                showSection(profilePage);

                window.location.reload();
            } else {
                // Show error message from server
                alert(`Login failed: ${response.message}`);
            }
        } catch (error) {
            console.error("Login Error:", error.message);
            alert("Invalid email or password. Have you registered?.");
        }

        loginForm.reset();
    });

    // Logout functionality
    logoutButton.addEventListener("click", function () {
        sessionStorage.removeItem("currentUser"); // Remove the current user
        profileUserName.textContent = ""; // Clear profile name
        profileUserEmail.textContent = ""; // Clear profile email
        profilePage.style.display = "none"; // Hide profile page
    
        // Reset login link text and behavior
        loginLink.textContent = "Login";
        loginLink.setAttribute("data-section", "loginForm");
    
        showSection(document.getElementById("loginForm")); // Show login form
    });   
});

