import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./pages/AuthContext";
import PrivateRoute from "./pages/PrivateRoute";
import Navbar from "./pages/Navbar";
import MainComponent from "./pages/MainComponent";
import QciProfile from "./pages/QciProfile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Header from "./pages/Header";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route
            path="/qci-profile"
            element={<PrivateRoute element={<QciProfile />} />}
          />
          <Route
            path="/Home"
            element={<PrivateRoute element={<MainComponent />} />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
        <Header />
      </Router>
    </AuthProvider>
  );
}

export default App;
