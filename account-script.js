const demoUsers = JSON.parse(localStorage.getItem('demoUsers')) || [];
const adminUsers = JSON.parse(localStorage.getItem('adminUsers')) || []; // filled out hard coded

// create default admin
if (adminUsers.length === 0) {
    adminUsers.push({
        firstName: 'Admin',
        lastName: 'Admin',
        email: 'admin@a.com',
        password: 'admin'
    });
    localStorage.setItem('adminUsers', JSON.stringify(adminUsers));
}

document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registration-form');
    const loginForm = document.getElementById('login-form');
    const editAccountForm = document.getElementById('edit-account-form');
    const deleteAccountForm = document.getElementById('delete-account-form');
    const userToken = sessionStorage.getItem('userToken');
    const adminToken = sessionStorage.getItem('adminToken');
    const navList = document.querySelector('nav ul');
    const heroSection = document.getElementById('hero');

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
        navList.appendChild(myAccountLink);

        // remove sign-in link
        const signInLink = document.querySelector('nav ul li a[href="sign-in.html"]');
        if (signInLink) {
            signInLink.parentElement.remove();
        }

        // add sign-out link
        const signOutLink = document.createElement('li');
        signOutLink.innerHTML = '<a href="#" id="sign-out">Sign Out</a>';
        navList.appendChild(signOutLink);
        signOutLink.addEventListener('click', signOut);
    } else {
        // logged out, add sign-in link
        const signInLink = document.createElement('li');
        signInLink.innerHTML = '<a href="sign-in.html">Sign In</a>';
        navList.appendChild(signInLink);
    }

    // event handling
    if (registrationForm) {
        registrationForm.addEventListener('submit', handleRegistration);
    }
    if (loginForm){
        loginForm.addEventListener('submit', handleLogin);
    }
    if(editAccountForm){
        editAccountForm.addEventListener('submit', handleEditAccount);
    }
    if (deleteAccountForm) {
        deleteAccountForm.addEventListener('submit', handleDeleteAccount);
    }

    // debug function
    function logDemoUsers() {
        console.log('demoUsers:', demoUsers);
    }
    setInterval(logDemoUsers, 10000);

    function handleRegistration(event) {
        event.preventDefault();
        const formData = new FormData(registrationForm);
        const accountData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirm-password'),
        };

        if (validateAccountData(accountData)) {
            createAccount(accountData);
        }
    }

    function validateAccountData(data) {
        // validate password (add more secure validation?)
        if (data.password !== data.confirmPassword) {
            alert('Passwords do not match');
            return false;
        }

        // validate email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(data.email)) {
            alert('Invalid email address');
            return false;
        }

        // ensure first and last names are capitalized properly
        data.firstName = data.firstName.charAt(0).toUpperCase() + data.firstName.slice(1).toLowerCase();
        data.lastName = data.lastName.charAt(0).toUpperCase() + data.lastName.slice(1).toLowerCase();

        return true;
    }

    function createAccount(data) {
        const existingUser = demoUsers.find(user => user.email === data.email);
        if (existingUser) {
            alert('An account with this email already exists');
            return;
        }
        demoUsers.push({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: data.password
        });
        // save to local storage
        localStorage.setItem('demoUsers', JSON.stringify(demoUsers));
        registrationForm.reset();
        alert('Account created successfully');
        // redirect to sign-in page
        window.location.href = 'sign-in.html';

        /* to be implemented
        fetch('https://placeholder.com/api/create-account', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                alert('Account created successfully');
            } else {
                alert('Account creation failed: ' + result.message);
            }
        })
        .catch(error => {
            console.error('Error creating account:', error);
            alert('An error occurred while creating the account');
        });
        */
    }

    function handleLogin(event) {
        event.preventDefault();
        const formData = new FormData(loginForm);
        const loginData = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        signIn(loginData);
    }

    function signIn(data) {
        // search for user
        const user = demoUsers.find(
            user => user.email === data.email && 
            user.password === data.password
        );
        // check if user is admin
        const admin = adminUsers.find(
            admin => admin.email === data.email && 
            admin.password === data.password
        );
        
        if (user && !admin) {
            alert('Signed in successfully');
            sessionStorage.setItem('userToken', user.email);
        } else {
            alert('Sign-in failed: Invalid email or password');
            console.log('Sign-in failed: Invalid email or password', data);
            console.log('demoUsers:', demoUsers);
        }

        if (admin) {
            alert('Signed in successfully as admin');
            sessionStorage.setItem('userToken', admin.email);
            sessionStorage.setItem('adminToken', admin.email);
        } else {
            alert('Sign-in failed: Invalid email or password');
            console.log('Sign-in failed: Invalid email or password', data);
            console.log('adminUsers:', adminUsers);
        }

        window.location.href = 'index.html';
        
        /* to be implemented
        fetch('https://placeholder.com/api/sign-in', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                alert('Signed in successfully');
                sessionStorage.setItem('userToken', result.data.token);
            } else {
                alert('Sign-in failed: ' + result.message);
            }
        })
        .catch(error => {
            console.error('Error signing in:', error);
            alert('An error occurred while signing in');
        });
        */
    }

    function handleEditAccount(event) {
        event.preventDefault();
        const formData = new FormData(editAccountForm);
        const accountData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirm-password'),
        };

        if (validateAccountData(accountData)) {
            editAccount(accountData);
        }
    }

    function editAccount(data) {
        const userIndex = demoUsers.findIndex(user => user.email === data.email);
        if (userIndex === -1) {
            alert('Account not found');
            return;
        }
        else if (userIndex !== -1) {
            demoUsers[userIndex] = {
                ...demoUsers[userIndex],
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                password: data.password
            };
            localStorage.setItem('demoUsers', JSON.stringify(demoUsers));
            alert('Your account is now changed');
            document.getElementById('edit-account-form').reset();
        } else {
            alert('Failed to edit');
        }

        // to be implemented 
        //fetch('https://placeholder.com/api/edit-account', {
        //     method: 'PUT',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': `Bearer ${sessionStorage.getItem('userToken')}`
        //     },
        //     body: JSON.stringify(data)
        // })
        // .then(response => response.json())
        // .then(result => {
        //     if (result.success) {
        //         alert('Your account is now changed');
        //     } else {
        //         alert('Failed to edit: ' + result.message);
        //     }
        // })
        // .catch(error => {
        //     console.error('Error editing account:', error);
        //     alert('An error occurred while editing the account');
        // });
    }

    function signOut() {
        sessionStorage.removeItem('userToken');
        alert('Signed out successfully');
        window.location.href = 'index.html';
    }

    function handleDeleteAccount(event) {
        event.preventDefault();
        const formData = new FormData(deleteAccountForm);
        const password = formData.get('password');
        if (confirm('Are you sure you want to delete your account?')) {
            deleteAccount(password);
        }
    }

    function deleteAccount(password) {
        const userIndex = demoUsers.findIndex(user => user.password === password);

        if (userIndex !== -1) {
            demoUsers.splice(userIndex, 1);
            localStorage.setItem('demoUsers', JSON.stringify(demoUsers));
            alert('Your account is now deleted');
            signOut();
        } else {
            alert('Account deletion failed: Account not found or incorrect password');
        }
    }
    // to be implemented
    // fetch('https://placeholder.com/api/delete-account', {
    //         method: 'DELETE',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Authorization': `Bearer ${sessionStorage.getItem('userToken')}`
    //         },
    //         body: JSON.stringify({ email: email })
    //     })
    //     .then(response => response.json())
    //     .then(result => {
    //         if (result.success) {
    //             alert('Your account is now deleted');
    //         } else {
    //             alert('Account deletion failed: ' + result.message);
    //         }
    //     })
    //     .catch(error => {
    //         console.error('Error deleting account:', error);
    //         alert('An error occurred while deleting the account');
    //     });
});