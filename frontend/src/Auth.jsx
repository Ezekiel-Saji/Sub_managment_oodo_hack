
import { useState } from "react";
import {
  CreditCard,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import "./Auth.css";

function Auth({ onPreview }) {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isSignup && form.password !== form.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setMessage(
      "The authentication API is not connected yet. Please try again after integration."
    );
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-logo">
            <CreditCard size={25} />
          </div>
          <span>
            Subscript<span>ly</span>
          </span>
        </div>

        <div className="auth-content">
          <div className="auth-tag">
            <CheckCircle size={15} />
            Smart Subscription Management
          </div>

          <h1>
            Manage your business.
            <br />
            <span>Grow with confidence.</span>
          </h1>

          <p>
            Manage subscriptions, customers, payments and billing
            all in one simple platform.
          </p>

          <div className="auth-illustration">
            <div className="illustration-card card-one">
              <span className="illustration-icon">↗</span>
              <small>Total Revenue</small>
              <h2>₹4,52,890</h2>
              <span className="illustration-growth">+12.8% this month</span>
            </div>

            <div className="illustration-card card-two">
              <div className="illustration-circle">✓</div>
              <div>
                <strong>Subscription Active</strong>
                <small>Payment successful</small>
              </div>
            </div>

            <div className="illustration-decoration decoration-one" />
            <div className="illustration-decoration decoration-two" />
          </div>
        </div>

        <div className="auth-footer">
          © 2026 Subscriptly. All rights reserved.
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrapper">
          <div className="mobile-auth-brand">
            <div className="auth-logo">
              <CreditCard size={23} />
            </div>
            <span>
              Subscript<span>ly</span>
            </span>
          </div>

          <div className="auth-heading">
            <h2>
              {isSignup ? "Create your account" : "Welcome back!"}
            </h2>
            <p>
              {isSignup
                ? "Get started with your Subscriptly account."
                : "Enter your details to access your workspace."}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {isSignup && (
              <div className="auth-field">
                <label>Full Name</label>
                <div className="auth-input">
                  <User size={18} />
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}

            <div className="auth-field">
              <label>Email Address</label>
              <div className="auth-input">
                <Mail size={18} />
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Password</label>
              <div className="auth-input">
                <Lock size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {isSignup && (
              <div className="auth-field">
                <label>Confirm Password</label>
                <div className="auth-input">
                  <Lock size={18} />
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {!isSignup && (
              <div className="auth-options">
                <label className="remember-option">
                  <input type="checkbox" />
                  Remember me
                </label>
                <button
                  type="button"
                  className="forgot-button"
                  onClick={() =>
                    setMessage("Password recovery will be connected later.")
                  }
                >
                  Forgot password?
                </button>
              </div>
            )}

            {message && (
              <div className="auth-message">
                {message}
              </div>
            )}

            <button type="submit" className="auth-submit">
              {isSignup ? "Create Account" : "Sign In"}
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="auth-switch">
            {isSignup
              ? "Already have an account?"
              : "Don't have an account?"}

            <button
              onClick={() => {
                setIsSignup(!isSignup);
                setMessage("");
              }}
            >
              {isSignup ? "Sign In" : "Sign Up"}
            </button>
          </div>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <button
            type="button"
            className="preview-button"
            onClick={onPreview}
          >
            Preview Dashboard (Development Only)
          </button>
        </div>

        <div className="auth-bottom">
          Secure subscription management made simple.
        </div>
      </div>
    </div>
  );
}

export default Auth;
