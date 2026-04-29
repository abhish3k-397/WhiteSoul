import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useGameStore } from '../store/gameStore';
import './Overlay.css';

export default function AuthScreen() {
  const { sendOtp, verifyOtp, updateUsername, setPassword, signInWithPassword, profile, user, loading, error } = useAuthStore();
  const setScreen = useGameStore(s => s.setScreen);
  
  const [email, setEmail] = useState('');
  const [password, setPasswordInput] = useState('');
  const [otp, setOtp] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); // False = login, True = sign up
  const [step, setStep] = useState(1); // 1: Email/Pass, 2: OTP, 3: Set Username/Pass (if new)
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return;
    const success = await sendOtp(email);
    if (success) setStep(2);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    const success = await signInWithPassword(email, password);
    if (success) setScreen('menu');
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return;
    const success = await verifyOtp(email, otp);
    if (success) setStep(3);
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    let success = true;
    if (newUsername) success = await updateUsername(newUsername);
    if (newPassword && success) success = await setPassword(newPassword);
    
    if (success) {
      setScreen('menu');
    }
  };

  return (
    <div className="overlay complete-overlay">
      <div className="overlay-content" style={{ maxWidth: '400px' }}>
        <h2 className="overlay-title" style={{ color: '#c8c2b8', marginBottom: '10px' }}>
          {step === 1 ? 'Enter Soul' : step === 2 ? 'Verify Binding' : 'Name Thy Soul'}
        </h2>
        
        {error && <div style={{ color: '#ff3030', marginBottom: '15px', fontSize: '14px', fontFamily: '"JetBrains Mono", monospace' }}>{error}</div>}
        
        {step === 1 && !isSignUp && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p className="overlay-subtitle" style={{ fontSize: '14px' }}>Log in with your existing account.</p>
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              required
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPasswordInput(e.target.value)}
              style={inputStyle}
              required
            />
            <div className="overlay-buttons">
              <button type="submit" className="overlay-btn primary" disabled={loading}>
                {loading ? 'LOGGING IN...' : 'LOG IN'}
              </button>
              <button type="button" className="overlay-btn" onClick={() => setIsSignUp(true)}>NEED AN ACCOUNT?</button>
              <button type="button" className="overlay-btn" onClick={() => setScreen('menu')}>CANCEL</button>
            </div>
          </form>
        )}

        {step === 1 && isSignUp && (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p className="overlay-subtitle" style={{ fontSize: '14px' }}>Create a new account via Email OTP.</p>
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              required
            />
            <div className="overlay-buttons">
              <button type="submit" className="overlay-btn primary" disabled={loading}>
                {loading ? 'SENDING...' : 'SEND CODE'}
              </button>
              <button type="button" className="overlay-btn" onClick={() => setIsSignUp(false)}>LOG IN INSTEAD</button>
              <button type="button" className="overlay-btn" onClick={() => setScreen('menu')}>CANCEL</button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p className="overlay-subtitle" style={{ fontSize: '14px' }}>Check your email for the verification code.</p>
            <input 
              type="text" 
              placeholder="12345678" 
              value={otp}
              onChange={(e) => setOtp(e.target.value.trim())}
              style={{...inputStyle, letterSpacing: '6px', textAlign: 'center'}}
              required
            />
            <div className="overlay-buttons">
              <button type="submit" className="overlay-btn primary" disabled={loading}>
                {loading ? 'VERIFYING...' : 'VERIFY'}
              </button>
              <button type="button" className="overlay-btn" onClick={() => setStep(1)}>BACK</button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleSaveAccount} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p className="overlay-subtitle" style={{ fontSize: '14px' }}>
              Establish your credentials.
            </p>
            <input 
              type="text" 
              placeholder="Username" 
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              style={inputStyle}
              required
            />
            <input 
              type="password" 
              placeholder="Choose Password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={inputStyle}
              required
            />
            <div className="overlay-buttons">
              <button type="submit" className="overlay-btn primary" disabled={loading}>
                {loading ? 'SAVE & ENTER' : 'FINISH'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  background: 'rgba(0, 0, 0, 0.5)',
  border: '1px solid rgba(200, 194, 184, 0.2)',
  color: '#c8c2b8',
  padding: '12px 15px',
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: '16px',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box'
};
