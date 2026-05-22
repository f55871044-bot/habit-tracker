import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

import Navbar from "./components/navbar/Navbar";
import Hero from "./components/hero/Hero";
import Stats from "./components/stats/Stats";
import HabitCard from "./components/habitCard/HabitCard";
import WeeklyChart, { useWeeklyReset } from "./components/weeklyChart/WeeklyChart";
import AddHabitModal from "./components/modal/AddHabitModal";
import Confetti from "react-confetti";
import Auth from "./components/auth/Auth";

function App() {
  const [dark, setDark] = useState(false);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const { isNewWeek } = useWeeklyReset();

  // GET USER + AUTH LISTENER
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // DARK MODE
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  // FETCH HABITS
  async function fetchHabits() {
    if (!user) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.log(error);
    }

    if (data) setHabits(data);

    setLoading(false);
  }

  useEffect(() => {
    if (user) fetchHabits();
  }, [user]);

  // WEEK RESET
  useEffect(() => {
    if (isNewWeek && user) {
      supabase
        .from("habits")
        .update({ completed: false, streak: 0, progress: 0 })
        .eq("user_id", user.id)
        .then(() => fetchHabits());
    }
  }, [isNewWeek, user]);

  // ADD HABIT
  async function addHabit(title) {
    if (!user) return;

    const newHabit = {
      title,
      streak: 0,
      progress: 0,
      emoji: "✨",
      completed: false,
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from("habits")
      .insert([newHabit])
      .select();

    if (error) {
      console.log(error);
      return;
    }

    if (data?.length) setHabits([...habits, data[0]]);
  }

  // DELETE HABIT
  async function deleteHabit(id) {
    const { error } = await supabase
      .from("habits")
      .delete()
      .eq("id", id);

    if (!error) {
      setHabits(habits.filter((h) => h.id !== id));
    }
  }

  // COMPLETE HABIT (FIXED ✅)
  async function completeHabit(id) {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;

    const isCompleted = !habit.completed;

    const updatedHabit = {
      completed: isCompleted,
      streak: isCompleted ? habit.streak + 1 : habit.streak,
      progress: isCompleted
        ? Math.min(habit.progress + 20, 100)
        : habit.progress,
    };

    const { error } = await supabase
      .from("habits")
      .update(updatedHabit)
      .eq("id", id);

    if (error) {
      console.log(error);
      return;
    }

    if (isCompleted) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }

    await fetchHabits();
  }

  // LOADING SCREEN
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl font-semibold text-purple-500">Loading... ⏳</p>
      </div>
    );
  }

  // AUTH CHECK
  if (!user) {
    return <Auth />;
  }

  return (
    <div className={dark ? "dark" : "light"}>
      {showConfetti && <Confetti />}

      <div className="min-h-screen bg-gradient-to-br from-[#F5F7FB] to-[#E9ECF5] dark:from-gray-900 dark:to-gray-800 transition-all duration-500">

        {/* DARK MODE */}
        <div className="flex justify-end p-4">
          <button
            onClick={() => setDark(!dark)}
            className="bg-purple-600 text-white px-5 py-2 rounded-xl"
          >
            {dark ? "Light Mode ☀️" : "Dark Mode 🌙"}
          </button>
        </div>

        <Navbar onAdd={() => setOpen(true)} />
        <Hero />
        <Stats habits={habits} />

        <h2 className="text-xl font-bold px-4 mt-6">Your Habits</h2>

        {loading ? (
          <p className="text-center mt-10">Loading...</p>
        ) : habits.length === 0 ? (
          <p className="text-center mt-10">No habits yet 👀</p>
        ) : (
          <div className="px-4 mt-6">
            <HabitCard
              habits={habits}
              onDelete={deleteHabit}
              onComplete={completeHabit}
            />
          </div>
        )}

        <WeeklyChart habits={habits} />

        {open && (
          <AddHabitModal
            onClose={() => setOpen(false)}
            onAdd={addHabit}
          />
        )}
      </div>
    </div>
  );
}

export default App;