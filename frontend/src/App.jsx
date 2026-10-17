import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Book from './pages/Book';
import MyDeliveries from './pages/MyDeliveries';
import ProtectedRoute from './components/ProtectedRoute';
import TrackDelivery from './pages/TrackDelivery';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/book" element={
          <ProtectedRoute role="customer">
            <Book />
          </ProtectedRoute>
        }
        />
        <Route
          path="/my-deliveries"
          element={
            <ProtectedRoute role="customer">
              <MyDeliveries />
            </ProtectedRoute>
          }
        />
        <Route
          path="/track-delivery/:id"
          element={
            <ProtectedRoute role="customer">
              <TrackDelivery />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;