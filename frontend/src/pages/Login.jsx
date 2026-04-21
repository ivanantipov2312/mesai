import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const data = await loginUser(form);

      /**
       * Expect backend to return:
       * {
       *   access_token: "...",
       *   user: {...}
       * }
       */

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/"); // go to dashboard
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-softbg px-4">

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 space-y-5"
      >

        <h1 className="text-3xl font-bold text-center">
          Welcome Back
        </h1>

        <p className="text-gray-500 text-center mb-4">
          Sign in to Smart Timetable AI
        </p>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Email */}
        <input
          className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />

        {/* Password */}
        <input
          className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-xl font-semibold transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-primary text-white hover:opacity-90"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Small helper */}
        <p className="text-center text-sm text-gray-500">
          Don’t have an account?{" "}
          <span
            className="text-primary cursor-pointer"
            onClick={() => navigate("/register")}
          >
            Register
          </span>
        </p>

      </form>
    </div>
  );
}
