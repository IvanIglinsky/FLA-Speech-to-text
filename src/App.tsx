
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import Register from './pages/Register.tsx';
import Login from './pages/Login.tsx';
import Recorder from './Component/Recorder.tsx';
import { useAuth } from './pages/auth-context.tsx';

function App() {
    const { isAuthenticated } = useAuth();

    return (
        <Router>
            <Routes>
                <Route
                    path="/register"
                    element={isAuthenticated ? <Navigate to="/recorder" /> : <Register />}
                />
                <Route
                    path="/login"
                    element={isAuthenticated ? <Navigate to="/recorder" /> : <Login />}
                />
                <Route
                    path="/recorder"
                    element={isAuthenticated ? <Recorder /> : <Navigate to="/login" />}
                />
                <Route path="/*" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

export default App;
