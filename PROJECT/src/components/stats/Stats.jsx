function Stats({ habits }) {

  const total = habits.length;

  const completed = habits.filter(h => h.completed).length;

  const active = total - completed;

  const percentage = total === 0
    ? 0
    : Math.round((completed / total) * 100);

  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4 m-6">

      {/* Total */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow">
        <h3 className="text-gray-500">Total</h3>
        <p className="text-2xl font-bold">{total}</p>
      </div>

      {/* Completed */}
      <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-2xl shadow">
        <h3 className="text-gray-600 dark:text-gray-300">Completed</h3>
        <p className="text-2xl font-bold text-green-600">{completed}</p>
      </div>

      {/* Active */}
      <div className="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-2xl shadow">
        <h3 className="text-gray-600 dark:text-gray-300">Active</h3>
        <p className="text-2xl font-bold text-yellow-600">{active}</p>
      </div>

      {/* Progress */}
      <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-2xl shadow">
        <h3 className="text-gray-600 dark:text-gray-300">Progress</h3>
        <p className="text-2xl font-bold text-purple-600">
          {percentage}%
        </p>
      </div>

    </section>
  );
}

export default Stats;