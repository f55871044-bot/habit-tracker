function HabitCard({ habits, onDelete, onComplete }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">

      {habits.map((habit) => (
       <div
  key={habit.id}
  className={`bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] hover:ring-2 hover:ring-purple-400/40 ${
    habit.completed
      ? "ring-2 ring-green-400/60 shadow-green-200 scale-[1.01]"
      : ""
  }`}
>
          {/* TITLE + EMOJI */}
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <span>{habit.emoji}</span>
            {habit.title}
          </h2>

          {/* STREAK */}
          <p className="text-sm  font-medium text-gray-500 dark:text-gray-300 mt-1">
            🔥 Streak: {habit.streak} Day streak
          </p>

          {/* PROGRESS BAR */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mt-3 overflow-hidden">
  <div
    className="h-2 bg-green-500 rounded-full transition-all duration-700 ease-in-out"
    style={{ width: `${habit.progress}%` }}
  />
</div>

          {/* PROGRESS TEXT */}
          <p className="text-xs text-gray-500 mt-1">
            Progress: {habit.progress}%
          </p>

          {/* BUTTONS */}
          <div className="flex justify-between mt-4 gap-2">

           
  <button
  onClick={() => onComplete(habit.id)}
  className={`px-3 py-1 rounded-lg text-white transition-all duration-300 active:scale-90 ${
    habit.completed
      ? "bg-gray-500"
      : "bg-green-500 hover:bg-green-600 hover:scale-105"
  }`}
>
  {habit.completed ? "Done ✔" : "Complete"}
</button>

<button
  onClick={() => onDelete(habit.id)}
  className="bg-red-500 hover:bg-red-600 active:scale-95 transition px-3 py-1 rounded-lg text-white"
>
  Delete
</button>
          </div>

        </div>
      ))}

    </div>
  );
}

export default HabitCard;