import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Book from './pages/Book';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/book" element={
            <ProtectedRoute role="customer">
              <Book />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;