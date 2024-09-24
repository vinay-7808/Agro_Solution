// src/Header.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Auth'; // Import useAuth

const Header = () => {
    const { isLoggedIn, logout } = useAuth(); // Access isLoggedIn and logout from context
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/v1/users/logout', {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";
                document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";
                logout(); // Call the logout function from context
                navigate('/login'); // Redirect to home after logout
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <header className="flex justify-between items-center p-4 bg-purple-600 text-white">
            <Link to="/" className="text-lg font-bold">AlgoSolutions</Link> {/* Make title clickable */}
            <nav>
                {isLoggedIn ? (
                    <div className="flex items-center">
                        <Link to="/profile" className="mr-4">My Profile</Link>
                        <button onClick={handleLogout} className="bg-red-600 px-4 py-2 rounded">Logout</button>
                    </div>
                ) : (
                    <div className="flex items-center">
                        <Link to="/login" className="mr-4">Login</Link>
                        <Link to="/signup" className="bg-blue-600 px-4 py-2 rounded">Sign Up</Link>
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Header;