import { useState } from "react";
import { registerUser } from "../api/authApi";

export default function Register() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    program: "",
    semester: 1,
    career_interests: "",
    existing_skills: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const parseList = (str) =>
    str
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setSuccess(false);

    const payload = {
      email: form.email,
      password: form.password,
      name: form.name,
      program: form.program,
      semester: Number(form.semester),
      career_interests: parseList(form.career_interests),
      existing_skills: parseList(form.existing_skills),
    };

    try {
      await registerUser(payload);
      setSuccess(true);

      // optional reset
      setForm({
        email: "",
        password: "",
        name: "",
        program: "",
        semester: 1,
        career_interests: "",
        existing_skills: "",
      });
    } catch (err) {
      setError(err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-softbg px-4">

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 space-y-4"
      >

        <h1 className="text-3xl font-bold text-center">
          Create Account
        </h1>

        <p className="text-gray-500 text-center mb-4">
          Smart Timetable AI
        </p>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 text-green-600 p-3 rounded-lg text-sm">
            Registration successful!
          </div>
        )}

        {/* Inputs */}

        <input
          className="w-full p-3 border rounded-xl"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />

        <input
          className="w-full p-3 border rounded-xl"
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />

        <input
          className="w-full p-3 border rounded-xl"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
        />

        <input
          className="w-full p-3 border rounded-xl"
          name="program"
          placeholder="Program (e.g. CS)"
          value={form.program}
          onChange={handleChange}
        />

        <input
          className="w-full p-3 border rounded-xl"
          name="semester"
          type="number"
          placeholder="Semester"
          value={form.semester}
          onChange={handleChange}
        />

        <input
          className="w-full p-3 border rounded-xl"
          name="career_interests"
          placeholder="Career interests (comma separated)"
          value={form.career_interests}
          onChange={handleChange}
        />

        <input
          className="w-full p-3 border rounded-xl"
          name="existing_skills"
          placeholder="Skills (comma separated)"
          value={form.existing_skills}
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
          {loading ? "Registering..." : "Register"}
        </button>

      </form>
    </div>
  );
}
