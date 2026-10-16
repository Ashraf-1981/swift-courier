import { Navigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { authAtom } from '../atoms/authAtom';

// Shows the page only if logged in (and the right role, if given)
function ProtectedRoute({ children, role }) {
  const auth = useAtomValue(authAtom);

  if (!auth) {
    return <Navigate to="/login" replace />;   // not logged in → Login
  }
  if (role && auth.user.role !== role) {
    return <Navigate to="/" replace />;        // wrong role → Home
  }
  return children;                             // OK → show the page
}

export default ProtectedRoute;