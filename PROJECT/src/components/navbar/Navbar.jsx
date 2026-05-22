function Navbar({ onAdd }) {
  return (
    <nav className="flex items-center justify-between bg-white rounded-3xl px-6 py-4 shadow-md m-6">

      <h1 className="text-3xl font-bold text-purple-700">
        HabitFlow
      </h1>

      <button
        onClick={onAdd}
        className="bg-purple-600 text-white px-5 py-2 rounded-xl hover:scale-105 transition"
      >
        + Add Habit
      </button>

    </nav>
  );
}

export default Navbar;