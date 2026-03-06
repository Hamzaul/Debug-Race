import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/RegisterPage";
import Home from "../pages/HomePage";
import Profile from "../pages/profilePage";
import { useAuth } from "../features/auth/features.authContext";
import ProtectedRoute from "./ProtectedRoute";
import Loader from "../pages/LoaderPage";
import Lobby from "../pages/LobbyPage";
import RoomPage from "../pages/roomPage";
const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={<Loader/>}
        
      />
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/home" />}
      />
      <Route
        path="/register"
        element={!user ? <Register /> : <Navigate to="/home" />}
      />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route path="/lobby" element={<ProtectedRoute><Lobby/></ProtectedRoute>}/>
      <Route path="/room/:code" element={<ProtectedRoute> <RoomPage /> </ProtectedRoute>} />
    </Routes>
    
  );
};

export default AppRoutes;
