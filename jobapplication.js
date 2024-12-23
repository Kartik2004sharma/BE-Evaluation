document.getElementById('jobForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    let isValid = true;

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const contact = document.getElementById('contact').value.trim();
    const gender = document.getElementById('gender').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    document.getElementById('nameError').textContent = '';
    document.getElementById('emailError').textContent = '';
    document.getElementById('contactError').textContent = '';
    document.getElementById('genderError').textContent = '';
    document.getElementById('passwordError').textContent = '';
    document.getElementById('confirmPasswordError').textContent = '';

    if (name === '') {
        document.getElementById('nameError').textContent = 'Name is required.';
        isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        document.getElementById('emailError').textContent = 'Enter a valid email address.';
        isValid = false;
    }

    const contactRegex = /^\d{10}$/;
    if (!contactRegex.test(contact)) {
        document.getElementById('contactError').textContent = 'Enter a valid 10-digit contact number.';
        isValid = false;
    }

    if (gender === '') {
        document.getElementById('genderError').textContent = 'Select a gender.';
        isValid = false;
    }

    if (password.length < 6) {
        document.getElementById('passwordError').textContent = 'Password must be at least 6 characters long.';
        isValid = false;
    }

    if (password !== confirmPassword) {
        document.getElementById('confirmPasswordError').textContent = 'Passwords do not match.';
        isValid = false;
    }

    if (isValid) {
        alert('Form submitted successfully!');
        // Here, you can handle form submission (e.g., send data to the server)
    }
});