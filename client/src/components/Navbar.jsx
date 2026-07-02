import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-slate-900 text-white p-4 shadow-md w-full"> {/* Added w-full */}
      <div className="container mx-auto flex justify-between items-center">
        {/* Smart Redirect: Goes to /report if logged in, otherwise /login */}
        <Link to={user ? "/report" : "/login"} className="text-xl font-bold text-green-400">
          CivicConnect
        </Link>
        
        <div className="space-x-4">
          {user ? (
            <>
              <span className="text-gray-300 hidden md:inline">Hello, {user.full_name}</span>
              <Link to="/report" className="hover:text-green-400">Report Issue</Link>


              {/* Added History Link for Citizen Navigation */}
              <Link to="/my-history" className="hover:text-green-400">My History</Link>
              
              {/* Only show Admin link if user is actually an admin */}
              {user.role === 'admin' && (
                <Link to="/admin" className="text-yellow-400 font-bold hover:text-yellow-300">
                  Admin Panel
                </Link>
              )}
              <button onClick={logout} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">
                Logout
              </button>
            </>
          ) : (
            <div className="space-x-4">
              <Link to="/login" className="hover:text-green-400">Login</Link>
              <Link to="/register" className="bg-green-600 px-3 py-1 rounded hover:bg-green-700">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}