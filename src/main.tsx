import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.tsx';
import './index.css';

const GOOGLE_CLIENT_ID = "332335405878-voifflm0iau83nl7t44vo9ohfn3ah8bg.apps.googleusercontent.com";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <App />
        </GoogleOAuthProvider>
    </StrictMode>,
);
