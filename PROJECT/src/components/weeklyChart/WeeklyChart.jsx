import { useState, useEffect, useRef, useMemo } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const DAY_NAMES_SUN_START = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const DAY_ORDER = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

const EMPTY_DAYS = () => ({
  Mon: 0,
  Tue: 0,
  Wed: 0,
  Thu: 0,
  Fri: 0,
  Sat: 0,
  Sun: 0,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** ISO week number */
function getISOWeek(date = new Date()) {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );

  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));

  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));

  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

/** Current week key */
function currentWeekKey(date = new Date()) {
  return `${date.getFullYear()}-W${String(getISOWeek(date)).padStart(2, "0")}`;
}

/** Monday of current week */
function getMondayOfWeek(date = new Date()) {
  const d = new Date(date);

  const day = d.getDay();

  const diff = day === 0 ? -6 : 1 - day;

  d.setDate(d.getDate() + diff);

  d.setHours(0, 0, 0, 0);

  return d;
}

/** Date format */
function fmtDate(date) {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

/** Day label from date */
function dayLabelFromDate(dateStr, todayLabel) {
  if (!dateStr) return todayLabel;

  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) return todayLabel;

  return DAY_NAMES_SUN_START[date.getDay()];
}

// ─── LocalStorage ─────────────────────────────────────────────────────────────

const LS_KEY = "weeklyChart_history";

function loadHistory() {
  try {
    const stored = localStorage.getItem(LS_KEY);

    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveHistory(data) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save weekly history:", err);
  }
}

// ─── Weekly Reset Hook ────────────────────────────────────────────────────────

export function useWeeklyReset() {
  const nowKey = currentWeekKey();

  const [isNewWeek, setIsNewWeek] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("currentWeekKey");

      if (stored && stored !== nowKey) {
        setIsNewWeek(true);
      } else {
        setIsNewWeek(false);
      }

      localStorage.setItem("currentWeekKey", nowKey);
    } catch (err) {
      console.error("Weekly reset error:", err);
    }
  }, [nowKey]);

  return {
    weekKey: nowKey,
    isNewWeek,
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────

function WeeklyChart({ habits = [] }) {
  const todayLabel = DAY_NAMES_SUN_START[new Date().getDay()];

  const weekKey = currentWeekKey();

  const monday = getMondayOfWeek();

  const sunday = new Date(monday);

  sunday.setDate(monday.getDate() + 6);

  // ─── State
  const [history, setHistory] = useState(() => loadHistory());

  const [animKey, setAnimKey] = useState(0);

  const prevWeekKey = useRef(weekKey);

  // ─── Save history
  useEffect(() => {
    saveHistory(history);
  }, [history]);

  // ─── Detect new week
  useEffect(() => {
    if (prevWeekKey.current !== weekKey) {
      prevWeekKey.current = weekKey;

      setAnimKey((prev) => prev + 1);
    }
  }, [weekKey]);

  // ─── Current week calculations
  const currentDays = useMemo(() => {
    const result = EMPTY_DAYS();

    habits.forEach((habit) => {
      if (!habit?.completed) return;

      const completedDate =
        habit.completed_at ||
        habit.updated_at ||
        habit.created_at;

      const day = dayLabelFromDate(completedDate, todayLabel);

      if (result[day] !== undefined) {
        result[day] += 1;
      }
    });

    return result;
  }, [habits, todayLabel]);

  // ─── Merge saved data
  const days = useMemo(() => {
    const savedThisWeek = history[weekKey]?.days || EMPTY_DAYS();

    const merged = EMPTY_DAYS();

    DAY_ORDER.forEach((day) => {
      merged[day] = Math.max(
        currentDays[day],
        savedThisWeek[day] || 0
      );
    });

    return merged;
  }, [currentDays, history, weekKey]);

  // ─── Save weekly snapshot safely
  useEffect(() => {
    const vals = DAY_ORDER.map((d) => days[d]);

    const total = vals.reduce((a, b) => a + b, 0);

    const active = vals.filter((v) => v > 0).length;

    setHistory((prev) => {
      const existing = prev[weekKey];

      if (
        existing &&
        JSON.stringify(existing.days) === JSON.stringify(days)
      ) {
        return prev;
      }

      return {
        ...prev,
        [weekKey]: {
          days: { ...days },
          totalCompleted: total,
          activeDays: active,
        },
      };
    });
  }, [days, weekKey]);

  // ─── Stats
  const vals = DAY_ORDER.map((d) => days[d]);

  const maxVal = Math.max(...vals, 1);

  const totalCompleted = vals.reduce((a, b) => a + b, 0);

  const totalHabits = habits.length;

  const bestIdx = vals.indexOf(Math.max(...vals));

  const bestDay = vals[bestIdx] > 0 ? DAY_ORDER[bestIdx] : null;

  const activeDays = vals.filter((v) => v > 0).length;

  const consistency = Math.round((activeDays / 7) * 100);

  // ─── Past weeks
  const pastWeeks = useMemo(() => {
    return Object.entries(history)
      .filter(([k]) => k !== weekKey)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 4);
  }, [history, weekKey]);

  // ─── Longest streak
  const longestStreak = useMemo(() => {
    const allWeeks = [
      ...pastWeeks,
      [
        weekKey,
        {
          days,
          totalCompleted,
          activeDays,
        },
      ],
    ];

    return allWeeks.reduce((best, [, w]) => {
      const d =
        w.activeDays ||
        Object.values(w.days || {}).filter((v) => v > 0).length;

      return Math.max(best, d);
    }, 0);
  }, [
    pastWeeks,
    weekKey,
    days,
    totalCompleted,
    activeDays,
  ]);

  return (
    <section className="m-4 bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800">

      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <h2 className="text-2xl font-bold dark:text-white tracking-tight">
            Weekly Progress
          </h2>

          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {fmtDate(monday)} – {fmtDate(sunday)}
            &nbsp;·&nbsp;
            Week {getISOWeek()}
          </p>
        </div>

        {bestDay && (
          <span className="text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-3 py-1.5 rounded-full flex items-center gap-1 shrink-0">
            ⭐ Best: {bestDay}
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-5">

        <StatCard
          value={totalCompleted}
          label="Completed"
          color="text-purple-600 dark:text-purple-400"
          bg="bg-purple-50 dark:bg-purple-900/20"
        />

        <StatCard
          value={bestDay || "–"}
          label="Best Day"
          color="text-amber-600 dark:text-amber-400"
          bg="bg-amber-50 dark:bg-amber-900/20"
        />

        <StatCard
          value={`${consistency}%`}
          label="Consistency"
          color="text-emerald-600 dark:text-emerald-400"
          bg="bg-emerald-50 dark:bg-emerald-900/20"
          tooltip="Active days / 7 × 100"
        />

        <StatCard
          value={`${longestStreak}d`}
          label="Best Streak"
          color="text-rose-500 dark:text-rose-400"
          bg="bg-rose-50 dark:bg-rose-900/20"
          tooltip="Highest active days in any week"
        />
      </div>

      {/* Consistency */}
      <ConsistencyBar
        percent={consistency}
        activeDays={activeDays}
      />

      {/* Chart */}
      <div
        key={animKey}
        className="flex items-end justify-between gap-2 mt-5"
        style={{ height: "180px" }}
      >
        {DAY_ORDER.map((day) => (
          <Bar
            key={day}
            label={day}
            count={days[day]}
            maxVal={maxVal}
            isToday={day === todayLabel}
            isBest={bestDay === day && days[day] > 0}
            totalHabits={totalHabits}
          />
        ))}
      </div>

      {/* Summary */}
      {totalCompleted > 0 && (
        <p className="mt-3 text-xs text-center text-gray-400 dark:text-gray-500">
          {activeDays === 7
            ? "🎉 Perfect week!"
            : `${activeDays} active days · ${7 - activeDays} remaining`}
          {bestDay &&
            ` · Best day: ${bestDay} (${days[bestDay]} complete)`}
        </p>
      )}

      {/* History */}
      {pastWeeks.length > 0 && (
        <PastWeeksPanel pastWeeks={pastWeeks} />
      )}
    </section>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  value,
  label,
  color,
  bg,
  tooltip,
}) {
  return (
    <div
      className={`${bg} rounded-2xl p-3 text-center relative group cursor-default`}
      title={tooltip || ""}
    >
      <p className={`text-xl font-bold ${color}`}>
        {value}
      </p>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">
        {label}
      </p>

      {tooltip && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
          {tooltip}
        </span>
      )}
    </div>
  );
}

// ─── Consistency Bar ──────────────────────────────────────────────────────────

function ConsistencyBar({ percent, activeDays }) {
  const color =
    percent >= 80
      ? "bg-emerald-500"
      : percent >= 50
      ? "bg-amber-400"
      : "bg-rose-400";

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          Weekly consistency
        </span>

        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
          {activeDays}/7 days · {percent}%
        </span>
      </div>

      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

// ─── Bar ──────────────────────────────────────────────────────────────────────

function Bar({
  label,
  count,
  maxVal,
  isToday,
  isBest,
  totalHabits,
}) {
  const heightPercent =
    count > 0
      ? Math.max((count / maxVal) * 100, 8)
      : 0;

  const barClass = isBest
    ? "bg-gradient-to-t from-amber-400 to-yellow-300"
    : isToday
    ? "bg-gradient-to-t from-indigo-500 to-purple-400"
    : "bg-gradient-to-t from-purple-300 to-purple-200 dark:from-purple-700 dark:to-purple-600";

  const countColor = isBest
    ? "text-amber-600 dark:text-amber-400"
    : isToday
    ? "text-indigo-600 dark:text-indigo-400"
    : "text-purple-500 dark:text-purple-400";

  const labelColor = isBest
    ? "text-amber-600 dark:text-amber-400 font-bold"
    : isToday
    ? "text-purple-600 dark:text-purple-400 font-bold"
    : "text-gray-400 dark:text-gray-500";

  const pct =
    totalHabits > 0
      ? Math.round((count / totalHabits) * 100)
      : 0;

  return (
    <div className="flex-1 flex flex-col items-center h-full justify-end group relative">

      {/* Tooltip */}
      {count > 0 && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 dark:bg-gray-700 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
          {count} habits · {pct}%
        </div>
      )}

      {/* Count */}
      {count > 0 && (
        <span className={`text-xs font-bold mb-1 ${countColor}`}>
          {count}
        </span>
      )}

      {/* Bar */}
      <div
        className={`w-full rounded-t-xl transition-all duration-700 ease-out hover:scale-105 ${barClass}`}
        style={{
          height: count > 0 ? `${heightPercent}%` : "3px",
          opacity: count > 0 ? 1 : 0.15,
        }}
      />

      {/* Label */}
      <p className={`mt-2 text-xs ${labelColor}`}>
        {label}
        {isBest ? " ⭐" : ""}
      </p>

      {/* Today dot */}
      {isToday && (
        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1" />
      )}
    </div>
  );
}

// ─── Past Weeks ───────────────────────────────────────────────────────────────

function PastWeeksPanel({ pastWeeks }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-5 border-t border-gray-100 dark:border-gray-800 pt-4">

      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors w-full"
      >
        <span className="font-medium">
          {open ? "▲" : "▼"} Past weeks ({pastWeeks.length})
        </span>
      </button>

      {open && (
        <div className="mt-3 space-y-2">

          {pastWeeks.map(([key, weekData]) => {
            const d = weekData.days || EMPTY_DAYS();

            const total =
              weekData.totalCompleted ||
              Object.values(d).reduce((a, b) => a + b, 0);

            const active =
              weekData.activeDays ||
              Object.values(d).filter((v) => v > 0).length;

            const best =
              Object.entries(d).sort((a, b) => b[1] - a[1])[0];

            const bestDayLabel =
              best?.[1] > 0 ? best[0] : "–";

            const cons = Math.round((active / 7) * 100);

            return (
              <div
                key={key}
                className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-xl px-3 py-2 text-xs"
              >
                <span className="text-gray-500 dark:text-gray-400 font-mono">
                  {key}
                </span>

                <span className="text-gray-600 dark:text-gray-300">
                  {total} done
                </span>

                <span className="text-amber-600 dark:text-amber-400">
                  ⭐ {bestDayLabel}
                </span>

                <span
                  className={`font-semibold ${
                    cons >= 80
                      ? "text-emerald-600"
                      : cons >= 50
                      ? "text-amber-600"
                      : "text-rose-500"
                  }`}
                >
                  {cons}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default WeeklyChart;