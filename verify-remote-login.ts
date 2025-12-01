import axios from 'axios';

async function verifyLogin() {
    const url = 'https://hisecure-backend.onrender.com/auth/login';
    const credentials = {
        email: 'admin@hisecure.com',
        password: 'admin123'
    };

    console.log(`Attempting login to ${url}...`);
    try {
        const response = await axios.post(url, credentials);
        console.log('Login SUCCESS!');
        console.log('Token:', response.data.access_token ? 'Received' : 'Missing');
        console.log('User:', response.data.user);
    } catch (error: any) {
        console.error('Login FAILED');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

verifyLogin();
