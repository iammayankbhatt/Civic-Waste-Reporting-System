import { useEffect } from 'react'; // 1. Import useEffect
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const { register, handleSubmit } = useForm();
  const { login, user } = useAuth(); // 2. Get user from context
  const navigate = useNavigate();

  // 3. ADD THIS EFFECT
  useEffect(() => {
    if (user) {
      navigate('/report'); // Redirect if already logged in
    }
  }, [user, navigate]);

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password);
      navigate('/report');
    } catch (err) {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="flex justify-center items-center h-[80vh]">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded shadow-md w-96 space-y-4">
        <h2 className="text-2xl font-bold text-center">Welcome Back</h2>
        <input {...register('email')} placeholder="Email" className="w-full p-2 border rounded" />
        <input {...register('password')} type="password" placeholder="Password" className="w-full p-2 border rounded" />
        <button className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">Login</button>
        
        <p className="text-center text-sm text-gray-600 mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-green-600 font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
}