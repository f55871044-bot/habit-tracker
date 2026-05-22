import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // get logged-in user
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();
  }, []);

  // logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-6">

      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-10 text-center">

        <h1 className="text-3xl font-bold text-gray-800">
          🚀 Dashboard
        </h1>

        <p className="mt-4 text-gray-600">
          Welcome back 👋
        </p>

        <p className="text-lg font-semibold text-purple-600 mt-2">
          {user?.email}
        </p>

        {/* BOX */}
        <div className="mt-8 bg-purple-100 p-5 rounded-2xl">
          <h2 className="text-xl font-bold">🔥 Your App is Running</h2>
          <p className="text-gray-600 mt-2">
            You are successfully logged in 🎉
          </p>
        </div>

        {/* BUTTON */}
        <button
          onClick={handleLogout}
          className="mt-8 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl transition"
        >
          Logout 🚪
        </button>

      </div>
    </div>
  );
}

export default Dashboard;