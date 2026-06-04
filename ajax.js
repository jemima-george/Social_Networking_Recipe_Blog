export async function registerUserServer(userData) {
    const errorMessage = document.getElementById("error-message");
    const successMessage = document.getElementById("success-message");

    try {
        const response = await fetch("http://localhost:8080/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        });

        if (response.ok) {
            const result = await response.json();
            successMessage.textContent = `Registration successful! Welcome, ${result.username}.`;
            return { success: true, username: result.username };
        } else {
            const errorResult = await response.json();
            errorMessage.textContent = errorResult.message || "Registration failed. Please try again.";
            return { success: false, message: errorResult.message };
        }
    } catch (error) {
        console.error("Error:", error.message);
        errorMessage.textContent = "An error occurred: " + error.message;
        errorMessage.style.display = "block";
        return { success: false, message: error.message };
    }
}

// Send login data to the server
export async function loginUserServer(loginData) {
    try {
        const response = await fetch("http://localhost:8080/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(loginData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json(); // Expect JSON response from the server
    } catch (error) {
        console.error("Server error:", error.message);
        throw error;
    }
}

// Send follow request to server
const followForm = document.getElementById("follow-user-form");
followForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const usernameToFollow = document.getElementById("usernameToFollow").value.trim();
    if (!usernameToFollow) {
        alert("Please enter a username to follow.");
        return;
    }

    try {
        // Send follow request to the server
        const response = await fetch(`http://localhost:8080/follow/${usernameToFollow}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include", // Ensure session cookies are sent
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
    followForm.reset();
});

