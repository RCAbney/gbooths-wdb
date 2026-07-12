import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import FavoriteBooths from './routes/FavoriteBooths';
import AllBooths from './routes/AllBooths';
import AuthContainer from './components/AuthContainer';
import { ViewProvider } from './context/ViewContext';
import { FilterProvider } from './context/FilterContext';

const queryClient = new QueryClient();

function App() {
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (!session) {
        return (
            <>
                <AuthContainer />
                <ToastContainer position="top-center" autoClose={750} />
            </>
        );
    } else {
        return (
            <QueryClientProvider client={queryClient}>
                <ReactQueryDevtools initialIsOpen={false} />
                <ViewProvider>
                    <FilterProvider>
                        <BrowserRouter>
                            <Routes>
                                <Route path="/" element={<AllBooths userId={session.user.id} />} />
                                <Route
                                    element={<FavoriteBooths userId={session.user.id} />}
                                    path="/favorite-booths"
                                />
                            </Routes>
                        </BrowserRouter>
                        <ToastContainer position="top-center" autoClose={750} />
                    </FilterProvider>
                </ViewProvider>
            </QueryClientProvider>
        );
    }
}

export default App;
