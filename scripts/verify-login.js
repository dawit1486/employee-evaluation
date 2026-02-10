// import fetch from 'node-fetch'; // Using global fetch

async function verifyLogin() {
    try {
        const response = await fetch('http://localhost:3001/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: 'supervisor', password: 'sup' })
        });

        if (response.ok) {
            const user = await response.json();
            console.log('Login Successful:', user);
        } else {
            console.error('Login Failed:', await response.text());
            process.exit(1);
        }
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

verifyLogin();
