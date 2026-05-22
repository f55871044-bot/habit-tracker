import { useState } from "react";

function AddHabitModal({ onClose, onAdd }) {

  const [title, setTitle] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (title.trim() === "") return;

    onAdd(title);
    setTitle("");
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-[90%] max-w-md shadow-xl">

        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          Add New Habit ✨
        </h2>

        <form onSubmit={handleSubmit}>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter habit name..."
            className="w-full p-3 border rounded-xl mb-4 outline-none dark:bg-gray-700 dark:text-white"
          />

          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-xl"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
            >
              Add Habit
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default AddHabitModal;