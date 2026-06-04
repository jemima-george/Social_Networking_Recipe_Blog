// Utility functions for validation and other shared operations

// Regular expression for password validation
const passwordRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{6,})");

// Validate password format
export function validatePassword(password) {
    return passwordRegex.test(password);
}

// Store a user in local storage
export function storeUser(name, email, password, phone) {
    const users = JSON.parse(localStorage.getItem("users")) || {};
    users[email] = { name, password, phone };
    localStorage.setItem("users", JSON.stringify(users));
}
