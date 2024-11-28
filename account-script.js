/*
* Authors: Andrew Oh 40166897
* Class: SOEN 287
*/

document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registration-form');
    const loginForm = document.getElementById('login-form');
    const editAccountForm = document.getElementById('edit-account-form');
    const deleteAccountForm = document.getElementById('delete-account-form');
    const rightNavList = document.querySelector('nav ul.right-links');
    const serviceContainer = document.getElementById('service-container');
    const loginPrompt = document.getElementById('login-prompt');
    const adminEmails = ['admin1@email.com', 'admin2@email.com'];

    async function emailExists(email) {
        const response = await fetch(`http://localhost:3000/user/${email}`);
        if (response.ok) {
            const user = await response.json()
            return { valid: true, user };
        }
        return { valid: false, message: 'Email does not exist' };
    }

    // Event listeners
    if (registrationForm) {
        console.log('registrationForm');
        registrationForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(registrationForm);
            const data = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                password: formData.get('password')
            };
            console.log(data);

            // Check if email already exists
            const emailCheck = await emailExists(data.email);
            if (emailCheck.valid) {
                alert('Email already exists');
                return;
            }

            const validation = validateAccountData(data);
            if (!validation.valid) {
                alert(validation.message);
                return;
            }

            const response = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert('Registration successful');
                window.location.href = 'sign-in.html';
            } else {
                alert('Registration failed');
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(loginForm);
            const data = {
                email: formData.get('email'),
                password: formData.get('password')
            };

            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                // check if user is admin
                const isAdmin = adminEmails.includes(data.email);
                const result = await response.json();
                alert('Login successful');
                // Set user token in session storage
                sessionStorage.setItem('userToken', 'true');
                sessionStorage.setItem('userEmail', data.email);
                if (isAdmin) {
                    sessionStorage.setItem('adminToken', 'true');
                    console.log('adminToken ', sessionStorage.getItem('adminToken'));
                }
                // window.location.href = 'index.html';
            } else {
                alert('Login failed');
            }
        });
    }

    if(editAccountForm){
        editAccountForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(editAccountForm);
            const data = {};
            const firstName = formData.get('firstName');
            const lastName = formData.get('lastName');
            const password = formData.get('password');
            const confirmPassword = formData.get('confirmPassword');
            const email = sessionStorage.getItem('userEmail');

            if (firstName) {
                data.firstName = firstName
            } else { // fetch first name from db
                const response = await fetch(`http://localhost:3000/get-user?email=${email}`);
                const user = await response.json();
                data.firstName = user.firstName;
            };
            if (lastName) {
                data.lastName = lastName
            } else { // fetch last name from db
                const response = await fetch(`http://localhost:3000/get-user?email=${email}`);
                const user = await response.json();
                data.lastName = user.lastName;
            }

            // if pw form != confirm pw form, alert
            // else if pw form is empty and confirm pw form is empty, skip
            if (password || confirmPassword) {
                if (password !== confirmPassword) {
                    alert('Passwords do not match');
                    return;
                } else { // fetch password from db
                    const response = await fetch(`http://localhost:3000/get-user?email=${email}`);
                    const user = await response.json();
                    data.password = user.password;
                }
            }

            const newEmail = formData.get('email');
            if (newEmail && newEmail !== email) {
                if (!validateEmail(newEmail)) {
                    alert('Invalid email address');
                    return;
                } else {
                    data.email = newEmail;
                    // sessionStorage.setItem('userEmail', newEmail);
                }
            } else {
                data.email = email;
            }

            // Ensure email is always included in the data
            if (!data.email) {
                alert('Email is required');
                return;
            }

            const response = await fetch('http://localhost:3000/edit-account', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert('Account updated');
                window.location.reload();
            } else {
                alert('Failed to update account');
            }
        });
    }

    if (deleteAccountForm) {
        deleteAccountForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(deleteAccountForm);
            const data = {
                email: sessionStorage.getItem('userEmail'),
                password: formData.get('password')
            };

            const response = await fetch('http://localhost:3000/delete-account', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert('Account deleted successfully');
                // Clear user token from session storage
                sessionStorage.removeItem('userToken');
                sessionStorage.removeItem('userEmail');
                sessionStorage.removeItem('adminToken');
                window.location.href = 'index.html';
            } else {
                alert('Failed to delete account');
            }
        });
    }

    // if logged in
    if (sessionStorage.getItem('userToken')) {
        const myAccountLink = document.createElement('li');
        // redirect to admin dashboard if admin
        if (sessionStorage.getItem('adminToken')) {
            myAccountLink.innerHTML = '<a href="admin-dashboard.html">My Account</a>';
        }
        // redirect to customer dashboard if customer
        else {
            myAccountLink.innerHTML = '<a href="customer-dashboard.html">My Account</a>';
        }
        rightNavList.appendChild(myAccountLink);

        // remove sign-in link
        const signInLink = document.querySelector('nav ul li a[href="sign-in.html"]');
        if (signInLink) {
            signInLink.parentElement.remove();
        }

        // add sign-out link
        const signOutLink = document.createElement('li');
        signOutLink.innerHTML = '<a href="#" id="sign-out">Sign Out</a>';
        rightNavList.appendChild(signOutLink);
        signOutLink.addEventListener('click', signOut);

        if (serviceContainer) {
            serviceContainer.style.display = 'block';
        }
        if (loginPrompt) {
            loginPrompt.style.display = 'none';
        }
    } else {
        // logged out, add sign-in link
        const signInLink = document.createElement('li');
        signInLink.innerHTML = '<a href="sign-in.html">Sign In</a>';
        rightNavList.appendChild(signInLink);

        if (serviceContainer) {
            serviceContainer.style.display = 'none';
        }
        if (loginPrompt) {
            loginPrompt.style.display = 'block';
        }
    }

    function validateAccountData(data) {
        const { firstName, lastName, email, password } = data;
    
        if (!email) {
            return { valid: false, message: 'Email is required' };
        }
    
        // validate password if provided
        if (password) {
            const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
            if (!passwordPattern.test(password)) {
                return { valid: false, message: 'Password must be at least 8 characters long and contain at least one letter and one number' };
            }
        }
    
        // validate email
        if (!validateEmail(email)) {
            return { valid: false, message: 'Invalid email address' };
        }
    
        // ensure first and last names are capitalized properly if provided
        if (firstName) {
            data.firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
        }
        if (lastName) {
            data.lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();
        }
    
        return { valid: true };
    }
    
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    function signOut() {
        sessionStorage.removeItem('userToken');
        if (sessionStorage.getItem('adminToken')) {
            sessionStorage.removeItem('adminToken');
        }
        alert('Signed out successfully');
        window.location.href = 'index.html';
    }
});