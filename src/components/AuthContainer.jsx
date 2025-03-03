import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';
import d20 from '../img/d20.png';

function AuthContainer() {
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
                <Auth
                    supabaseClient={supabase}
                    appearance={{
                        theme: ThemeSupa,
                        style: {
                            button: { background: '#4285f4', color: 'white', borderRadius: '6px' },
                            anchor: { display: 'none' },
                            container: { width: '100%' },
                        },
                    }}
                    providers={['google']}
                    view="sign_in"
                    showLinks={false}
                    onlyThirdPartyProviders={true}
                />
            </div>
        </div>
    );
}

export default AuthContainer;
