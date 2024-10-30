/*
* To do:
* 2. Delete account
*/

const demoUsers = JSON.parse(localStorage.getItem('demoUsers')) || [];
document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registration-form');
    const loginForm = document.getElementById('login-form');
    const editAccountForm = document.getElementById('edit-account-form');
    const deleteAccountForm = document.getElementById('delete-account-form');
    const userToken = sessionStorage.getItem('userToken');
    const navList = document.querySelector('nav ul');
    const heroSection = document.getElementById('hero');

    if (userToken) {
        const myAccountLink = document.createElement('li');
        myAccountLink.innerHTML = '<a href="my-account.html">My Account</a>';
        navList.appendChild(myAccountLink);

        const signInLink = document.querySelector('nav ul li a[href="sign-in.html"]');
        if (signInLink) {
            signInLink.parentElement.remove();
        }

        const signOutLink = document.createElement('li');
        signOutLink.innerHTML = '<a href="#" id="sign-out">Sign Out</a>';
        navList.appendChild(signOutLink);
        signOutLink.addEventListener('click', signOut);

        // const welcomeMessage = document.createElement('p');
        // welcomeMessage.textContent = 'Welcome back!';
        // heroSection.appendChild(welcomeMessage);
    } else {
        const signInLink = document.createElement('li');
        signInLink.innerHTML = '<a href="sign-in.html">Sign In</a>';
        navList.appendChild(signInLink);
    }

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
        localStorage.setItem('demoUsers', JSON.stringify(demoUsers));

        registrationForm.reset();

        alert('Account created successfully');
        window.location.href = 'sign-in.html';

        /*
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
        const user = demoUsers.find(
            user => user.email === data.email && 
            user.password === data.password
        );
        if (user) {
            alert('Signed in successfully');
            sessionStorage.setItem('userToken', user.email);
        } else {
            alert('Sign-in failed: Invalid email or password');
            console.log('Sign-in failed: Invalid email or password', data);
            console.log('demoUsers:', demoUsers);
        }
        window.location.href = 'index.html';
        
        /*
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
        } else {
            alert('Failed to edit');
        }

        // fetch('https://placeholder.com/api/edit-account', {
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
        const userToken = sessionStorage.getItem('userToken');
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
    //     fetch('https://placeholder.com/api/delete-account', {
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
    // }
});