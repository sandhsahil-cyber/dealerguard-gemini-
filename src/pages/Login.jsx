import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { ShieldAlert, Mail, Lock, Loader2, LogIn, UserPlus } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    
    // Reset states
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isSignUp) {
        // Handle Sign Up
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          }
        });

        if (signUpError) throw signUpError;
        
        if (data.session) {
          setSuccess('Account created successfully!');
        } else {
          setSuccess('Signup successful! Please check your email to confirm your account.');
        }
      } else {
        // Handle Login
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          if (signInError.message.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password. Please try again.');
          }
          throw signInError;
        }

        if (!data.user) {
          throw new Error('Login failed. User not found.');
        }

        console.log('Login successful for:', data.user.email);
      }
    } catch (err) {
      console.error('Auth error:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="brand-logo">
            <ShieldAlert size={40} color="#2563eb" />
          </div>
          <h1>{isSignUp ? 'Join DealerGuard' : 'DealerGuard Login'}</h1>
          <p>{isSignUp ? 'Create your administrator account' : 'Enter your credentials to continue'}</p>
        </div>

        <form onSubmit={handleAuth} className="login-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                id="email"
                type="email"
                placeholder="admin@dealership.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="current-password"
              />
            </div>
          </div>

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <div className="flex-center gap-2">
                {isSignUp ? <UserPlus size={18} /> : <LogIn size={18} />}
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
              </div>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isSignUp ? 'Already have an account?' : 'Need an account?'}
            <button 
              type="button" 
              className="toggle-auth-btn" 
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setSuccess(null);
              }}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
