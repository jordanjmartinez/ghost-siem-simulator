import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const DARK_GRAY = "#374151";

const getGradeAndColor = (accuracy) => {
  if (accuracy >= 90) return { grade: "A", color: "#16a34a", feedback: "👻 You're crushing it!" };
  if (accuracy >= 80) return { grade: "B", color: "#22c55e", feedback: "👻 Great work — keep it up!" };
  if (accuracy >= 70) return { grade: "C", color: "#eab308", feedback: "👻 Not bad! Let’s aim higher!" };
  if (accuracy >= 60) return { grade: "D", color: "#ea580c", feedback: "👻 You're close! Just a little more focus!" };
  return { grade: "F", color: "#dc2626", feedback: "👻 It's okay — every analyst starts somewhere!" };
};

const PerformanceGrade = ({ report }) => {
  const accuracy = parseFloat(report.accuracy);
  const { grade, color: ringColor, feedback } = getGradeAndColor(accuracy);

  const data = [
    { name: "Accuracy", value: accuracy },
    { name: "Remaining", value: 100 - accuracy },
  ];

  return (
    <div className="bg-[#1c2128] p-6 rounded-2xl h-full w-full border border-gray-700 shadow-md">
      <h2 className="text-xl font-semibold text-white text-center mb-4 font-mono">
        Performance Grade
      </h2>

      <div className="relative w-48 h-48 mx-auto border-dashed border-2 border-gray-700 rounded-full p-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(value) => [`${value.toFixed(2)}%`, "Accuracy"]}
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "none",
                borderRadius: "6px",
                color: "#fff",
                fontSize: "0.875rem",
              }}
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
            />
            <Pie
              data={data}
              innerRadius="70%"
              outerRadius="100%"
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              <Cell fill={ringColor} />
              <Cell fill={DARK_GRAY} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Grade */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl font-bold text-white">{grade}</span>
        </div>
      </div>

      {/* Caption-style Accuracy and Ghost feedback */}
      <div className="mt-6 text-center text-sm font-mono text-gray-300 space-y-1">
        <p>
          Accuracy:{" "}
          <span className="text-white font-semibold">{accuracy.toFixed(2)}%</span>
        </p>
        <p className="text-gray-400 italic text-sm flex items-center justify-center gap-1">
          {feedback}
        </p>
      </div>
    </div>
  );
};

export default PerformanceGrade;
