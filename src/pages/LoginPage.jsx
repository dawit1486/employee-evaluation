import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import companyLogo from '../assets/company-logo.png';
import './LoginPage.css';

export default function LoginPage() {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const user = await login(id, password);
            if (user.role === 'hr') {
                navigate('/hr-dashboard');
            } else if (user.role === 'management') {
                navigate('/evaluator-dashboard');
            } else {
                navigate('/employee-dashboard');
            }
        } catch {
            setError('Invalid ID or Password');
        }
    };



    return (
        <div className="login-page">
            <div className="background-shapes">
                <div className="shape shape1"></div>
                <div className="shape shape2"></div>
                <div className="shape shape3"></div>
            </div>

            <div className="login-container">
                <div className="logo">
                    <img src={companyLogo} alt="Gutema Firisa Construction" className="logo-icon" />
                </div>

                <h1>Welcome back</h1>
                <p className="subtitle">Enter your credentials to access your account</p>

                {error && (
                    <div className="error-message">
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Employee ID</label>
                        <input
                            type="text"
                            id="email"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            placeholder=""
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder=""
                            required
                        />
                    </div>

                    <button type="submit" className="login-btn">Sign In</button>
                </form>

                <div className="footer-text">
                    Employee Tracking System
                </div>
            </div>
        </div>
    );
}
