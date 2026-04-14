import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let result;

      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(
          formData.name,
          formData.email,
          formData.password,
        );
      }

      if (result.success) {
        navigate("/profiles");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "var(--bg)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 450,
          background: "var(--surface)",
          borderRadius: 12,
          padding: "clamp(24px, 5vw, 48px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}
      >
        {/* Logo/Title */}
        <h1
          style={{
            fontSize: 28,
            fontWeight: 900,
            color: "var(--text)",
            marginBottom: 32,
            textAlign: "center",
            fontFamily: "var(--font-display)",
            letterSpacing: 1,
          }}
        >
          FILMSORT
        </h1>

        {/* Form Title */}
        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "var(--text)",
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          {isLogin ? "Sign In" : "Sign Up"}
        </h2>

        {/* Error Message */}
        {error && (
          <div
            style={{
              background: "rgba(232, 55, 44, 0.15)",
              border: "1px solid rgba(232, 55, 44, 0.3)",
              borderRadius: 8,
              padding: 12,
              marginBottom: 20,
              color: "var(--accent)",
              fontSize: 13,
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          {/* Name Field (only for signup) */}
          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required={!isLogin}
              style={{
                width: "100%",
                padding: "12px 14px",
                background: "var(--bg2)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--text)",
                fontSize: 14,
                fontFamily: "var(--font-body)",
                outline: "none",
                transition: "border 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--blue)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          )}

          {/* Email Field */}
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "12px 14px",
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              color: "var(--text)",
              fontSize: 14,
              fontFamily: "var(--font-body)",
              outline: "none",
              transition: "border 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--blue)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />

          {/* Password Field */}
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "12px 14px",
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              color: "var(--text)",
              fontSize: 14,
              fontFamily: "var(--font-body)",
              outline: "none",
              transition: "border 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--blue)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 12,
              background: "var(--text)",
              color: "var(--bg)",
              border: "none",
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 700,
              fontFamily: "var(--font-body)",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => !loading && (e.target.style.opacity = "0.9")}
            onMouseLeave={(e) => !loading && (e.target.style.opacity = "1")}
          >
            {loading ? "Loading..." : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        {/* Toggle Auth Mode */}
        <p
          style={{
            textAlign: "center",
            marginTop: 20,
            color: "var(--text2)",
            fontSize: 14,
          }}
        >
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setFormData({ name: "", email: "", password: "" });
            }}
            style={{
              background: "none",
              border: "none",
              color: "var(--blue)",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 14,
              fontFamily: "var(--font-body)",
            }}
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}
