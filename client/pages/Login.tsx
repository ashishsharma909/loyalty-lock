import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Login successful
        navigate("/dashboard");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Login failed. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-cyber-900 to-background" />
        <div className="absolute w-96 h-96 -top-48 -left-48 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple opacity-20 blur-xl animate-float" />
        <div
          className="absolute w-64 h-64 top-1/3 -right-32 rounded-full bg-gradient-to-r from-neon-purple to-neon-violet opacity-20 blur-xl animate-float"
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-card border-0 border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
                <span className="text-white font-bold text-sm">LL</span>
              </div>
              <span className="text-xl font-display font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                Loyalty Lock
              </span>
            </Link>
            <Link
              to="/"
              className="text-foreground hover:text-neon-blue transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Login Form */}
      <div className="w-full max-w-md mx-auto px-6">
        <div className="glass-card p-8 animate-slide-up">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold mb-2">
              Welcome Back
            </h1>
            <p className="text-muted-foreground">
              Sign in to access your dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 glass-card border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent transition-all duration-300 placeholder-muted-foreground"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 glass-card border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent transition-all duration-300 placeholder-muted-foreground"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-gradient-to-r from-neon-blue to-neon-purple text-white font-semibold rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-neon-blue/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Signing In...
                </div>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-neon-blue hover:text-neon-purple transition-colors font-medium"
              >
                Sign Up
              </Link>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 glass-card rounded-xl border border-neon-blue/20">
            <h3 className="text-sm font-semibold text-neon-blue mb-2">
              Demo Credentials
            </h3>
            <p className="text-xs text-muted-foreground">
              Email: demo@loyaltylock.com
              <br />
              Password: demo123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
