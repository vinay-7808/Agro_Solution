// src/Header.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Auth'; // Import useAuth

const Header = () => {
    const { isLoggedIn, logout } = useAuth(); // Access isLoggedIn and logout from context
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const response = await fetch('https://algo-solution.onrender.com/api/v1/users/logout', {
                method: 'POST',
                credentials: 'include',  // Ensure cookies are included
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            if (response.ok) {
                // Let the backend handle cookie clearing
                logout(); // Call the logout function from context to update the state
                navigate('/login'); // Redirect to login page after successful logout
            } else {
                console.error('Failed to log out:', response.status);
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