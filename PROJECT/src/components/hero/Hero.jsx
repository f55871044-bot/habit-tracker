function Hero() {
  return (
    <section className="m-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 text-white">
      <h2 className="text-4xl font-bold">Good Morning 👋</h2>
      <p className="mt-3 text-purple-100">
        Track your habits and stay productive every day.
      </p>

      <button className="mt-6 bg-white text-purple-700 px-6 py-3 rounded-2xl font-semibold">
        + Add Habit
      </button>
    </section>
  );
}
export default Hero;