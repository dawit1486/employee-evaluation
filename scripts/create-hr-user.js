// Script to create HR user directly via API
const API_URL = 'http://localhost:3001/api';

const createHRUser = async () => {
    try {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: 'hr01',
                name: 'HR Manager',
                role: 'hr',
                password: 'hr'
            })
        });

        if (response.ok) {
            const user = await response.json();
            console.log('HR user created successfully:', user);
        } else {
            const error = await response.json();
            console.error('Failed to create HR user:', error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

createHRUser();
