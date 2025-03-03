import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { supabase } from './lib/supabase';
import Home from './routes/Home';
import AllBooths from './routes/AllBooths';
import AuthContainer from './components/AuthContainer';

const queryClient = new QueryClient();

function App() {
    const [session, setSession] = useState(null);

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
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<AllBooths userId={session.user.id} />} />
                        <Route element={<Home userId={session.user.id} />} path="/all-booths" />
                    </Routes>
                </BrowserRouter>
                <ToastContainer position="top-center" autoClose={750} />
            </QueryClientProvider>
        );
    }
}

export default App;
