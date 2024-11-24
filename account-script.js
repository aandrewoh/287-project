document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registration-form');
    const loginForm = document.getElementById('login-form');
    const editAccountForm = document.getElementById('edit-account-form');
    const deleteAccountForm = document.getElementById('delete-account-form');
    const userToken = sessionStorage.getItem('userToken');
    const adminToken = sessionStorage.getItem('adminToken');
    const rightNavList = document.querySelector('nav ul.right-links');
    const serviceContainer = document.getElementById('service-container');
    const loginPrompt = document.getElementById('login-prompt');

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

            const validation = validateAccountData(data);
            if (!validation.valid) {
                alert(validation.message);
                return;
            }

            const response = await fetch('http://localhost:5000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert('Registration successful');
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

            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert('Login successful');
                // Set user token in session storage
                sessionStorage.setItem('userToken', 'true');
                if (response.isAdmin) {
                    sessionStorage.setItem('adminToken', 'true');
                }
                window.location.reload();
            } else {
                alert('Login failed');
            }
        });
    }

    if(editAccountForm){
        editAccountForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(editAccountForm);
            const data = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                password: formData.get('password')
            };

            const validation = validateAccountData(data);
            if (!validation.valid) {
                alert(validation.message);
                return;
            }

            const response = await fetch('http://localhost:5000/edit-account', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert('Account updated');
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
                email: formData.get('email'),
                password: formData.get('password')
            };

            const response = await fetch('http://localhost:5000/delete-account', {
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
                sessionStorage.removeItem('adminToken');
                window.location.reload();
            } else {
                alert('Failed to delete account');
            }
        });
    }

    // if logged in
    if (userToken) {
        const myAccountLink = document.createElement('li');
        // redirect to admin dashboard if admin
        if (adminToken) {
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

        if (!firstName || !lastName || !email || !password) {
            return { valid: false, message: 'All fields are required' };
        }

        // validate password (add more secure validation?)
        const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        if (!passwordPattern.test(data.password)) {
            return { valid: false, message: 'Password must be at least 8 characters long and contain at least one letter and one number' };
        }

        // validate email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(data.email)) {
            return { valid: false, message: 'Invalid email address' };
        }

        // ensure first and last names are capitalized properly
        data.firstName = data.firstName.charAt(0).toUpperCase() + data.firstName.slice(1).toLowerCase();
        data.lastName = data.lastName.charAt(0).toUpperCase() + data.lastName.slice(1).toLowerCase();

        return {valid: true};
    }

    function signOut() {
        sessionStorage.removeItem('userToken');
        if (adminToken) {
            sessionStorage.removeItem('adminToken');
        }
        alert('Signed out successfully');
        window.location.href = 'index.html';
    }
});