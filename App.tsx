import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleLogin = () => {
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
    };

    if (!isLoggedIn) {
        return <LandingPage onLogin={handleLogin} />;
    }

    return <Dashboard onLogout={handleLogout} />;
};

export default App;