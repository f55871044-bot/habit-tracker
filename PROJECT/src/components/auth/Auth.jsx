import { useState } from "react"; // ✅ useNavigate remove kiya
import { supabase } from "../../supabaseClient";

function Auth() {
  // ✅ useNavigate remove kiya - App.jsx khud handle karega

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // SIGN UP
  async function signUp() {
    if (loading) return;
    if (!email || !password) {
      alert("Email aur password required hai");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      console.log("Signup response:", data);

      alert("Signup successful 🎉 Check your email for verification");

      // ✅ navigate remove kiya - App.jsx onAuthStateChange se khud redirect karega

    } catch (err) {
      alert("Something went wrong");
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  // LOGIN
  async function login() {
    if (loading) return;
    if (!email || !password) {
      alert("Email aur password required hai");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      console.log("Login response:", data);

      // ✅ navigate remove kiya - App.jsx onAuthStateChange se khud redirect karega

    } catch (err) {
      alert("Something went wrong");
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600 p-6">
      
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl">

        <h1 className="text-3xl font-bold text-center mb-6">
          Habit Tracker 🔥
        </h1>

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-3 rounded-xl mb-4 outline-none"
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Enter password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-3 rounded-xl mb-6 outline-none"
        />

        {/* BUTTONS */}
        <div className="flex gap-3">

          <button
            onClick={signUp}
            disabled={loading}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl transition disabled:opacity-50"
          >
            {loading ? "Loading..." : "Sign Up"}
          </button>

          <button
            onClick={login}
            disabled={loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl transition disabled:opacity-50"
          >
            {loading ? "Loading..." : "Login"}
          </button>

        </div>

      </div>
    </div>
  );
}

export default Auth;