import { supabase } from '../lib/supabase';
import Nav from './Nav';
import { Link, useNavigate } from 'react-router-dom';
import d20 from '../img/d20.png';
import { useView } from '../context/ViewContext';
import { useState } from 'react';
import { toast } from 'react-toastify';

function Header() {
    const { showPublisher, toggleView } = useView();
    const [isSigningOut, setIsSigningOut] = useState(false);
    const navigate = useNavigate();

    const handleSignOut = async (e) => {
        e.preventDefault(); // Prevent any default behavior
        if (isSigningOut) return; // Prevent double-taps

        setIsSigningOut(true);
        try {
            // First try to get the current session
            const {
                data: { session },
            } = await supabase.auth.getSession();

            // Attempt to sign out
            const { error } = await supabase.auth.signOut();

            if (error) {
                // If we get an AuthSessionMissingError, the session is already gone
                // so we can consider this a successful sign-out
                if (error.name === 'AuthSessionMissingError' || !session) {
                    toast.success('Signed out successfully');
                    navigate('/');
                    return;
                }
                throw error;
            }

            toast.success('Signed out successfully');
            navigate('/');
        } catch (error) {
            console.error('Sign out error:', error);
            toast.error('Unable to sign out. Please try closing and reopening the app.');
        } finally {
            setIsSigningOut(false);
        }
    };

    return (
        <header className="bg-white shadow-sm sticky top-0">
            <div className="flex items-center justify-between bg-black p-4">
                <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold leading-7 text-white sm:truncate">
                        <Link to="/" className="flex gap-3">
                            <img
                                src={d20}
                                alt="GBooths app"
                                width="30"
                                height="30"
                                style={{ filter: 'brightness(0) invert(1)' }}
                            />{' '}
                            GBooths
                        </Link>
                    </h2>
                </div>
                <div className="flex md:mt-0 md:ml-4 gap-4">
                    <button
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                        className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                            ${isSigningOut ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'} 
                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500
                            touch-manipulation`}
                        style={{ minHeight: '44px', minWidth: '44px' }}
                    >
                        {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                    </button>
                </div>
            </div>
            <div className="flex items-center justify-between bg-black p-4">
                <button
                    onClick={toggleView}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
                >
                    {showPublisher ? 'Publisher' : 'Location'}
                </button>
                <div className="flex items-center justify-around sm:justify-end gap-4">
                    <Link
                        to="/"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
                    >
                        View All
                    </Link>
                    <Link
                        to="/favorite-booths"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
                    >
                        My Booths
                    </Link>
                </div>
            </div>
        </header>
    );
}

export default Header;
