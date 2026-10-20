import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Book from './pages/Book';
import MyDeliveries from './pages/MyDeliveries';
import ProtectedRoute from './components/ProtectedRoute';
import TrackDelivery from './pages/TrackDelivery';
import CourierJobs from './pages/CourierJobs';
import AskSwift from './components/AskSwift';
import Footer from './components/Footer';

function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1 d-flex flex-column">
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
          {/* Courier goes to their own jobs page */}
          <Route
            path="/courier/jobs"
            element={
              <ProtectedRoute role="courier">
                <CourierJobs />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
      <AskSwift />
    </div>
  );
}

export default App;