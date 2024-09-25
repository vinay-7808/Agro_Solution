import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Auth';

const Header = () => {
    const { isLoggedIn, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const response = await fetch('https://algo-solution.onrender.com/api/v1/users/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            if (response.ok) {
                logout();
                navigate('/login');
            } else {
                console.error('Failed to log out:', response.status);
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <header className="w-full h-16 bg-purple-600 text-white p-4 shadow-md">
            <div className="flex justify-between items-center mx-auto">
                <Link to="/" className="text-lg font-bold">AlgoSolutions</Link>
                <nav>
                    {isLoggedIn ? (
                        <div className="flex items-center">
                            <Link to="/profile" className="mr-4">My Profile</Link>
                            <button 
                                onClick={handleLogout} 
                                className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition duration-300"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center">
                            <Link to="/login" className="mr-4">Login</Link>
                            <Link 
                                to="/signup" 
                                className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition duration-300"
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;