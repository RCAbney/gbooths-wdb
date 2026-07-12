import { supabase } from '../lib/supabase';
import d20 from '../img/d20.png';
import { useState } from 'react';

function AuthContainer() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleMagicLinkSignIn = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: window.location.origin,
                },
            });

            if (error) throw error;
            setMessage('Check your email for the magic link!');
        } catch (error) {
            setMessage(error.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-200">
            <div className="max-w-md mx-4 sm:mx-0 w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
                <div className="flex items-center justify-center gap-4 mb-8">
                    <img
                        src={d20}
                        alt="GBooths"
                        className="w-8 h-8"
                        style={{ filter: 'brightness(0) invert(0)' }}
                    />
                    <h1 className="text-4xl font-bold text-gray-900">GBooths</h1>
                </div>

                <form onSubmit={handleMagicLinkSignIn} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Enter your email"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-xs text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Send Magic Link
                    </button>
                </form>

                {message && (
                    <div
                        className={`mt-4 text-sm ${message.includes('error') ? 'text-red-600' : 'text-green-600'}`}
                    >
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AuthContainer;
