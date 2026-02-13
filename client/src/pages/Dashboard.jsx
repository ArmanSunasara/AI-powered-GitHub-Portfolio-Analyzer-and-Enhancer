import { useState } from "react";
import axios from "axios";

export default function Dashboard() {

  const [url, setUrl] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);
    const res = await axios.post("http://localhost:5000/api/github/analyze", { url });
    setData(res.data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen p-10">

      <h1 className="text-4xl font-bold mb-6 text-center">
        GitHub Portfolio Analyzer
      </h1>

      {/* INPUT */}
      <div className="flex gap-4 justify-center mb-10">
        <input
          className="px-4 py-3 w-[400px] rounded bg-slate-800"
          placeholder="Enter GitHub URL"
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          onClick={analyze}
          className="bg-blue-600 px-6 py-3 rounded font-semibold hover:bg-blue-700"
        >
          Analyze
        </button>
      </div>

      {loading && <p className="text-center">Analyzing...</p>}

      {data && (
        <>
          {/* SCORE */}
          <div className="text-center mb-10">
            <h2 className="text-2xl mb-2">Portfolio Score</h2>
            <div className="text-6xl font-bold text-blue-500">
              {data.score}
            </div>
          </div>

          {/* AI FEEDBACK */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">

            <div className="bg-slate-800 p-6 rounded">
              <h3 className="text-xl mb-4 text-green-400">Strengths</h3>
              <ul>
                {data.aiFeedback?.strengths?.map((s, i) => (
                  <li key={i}>✅ {s}</li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-800 p-6 rounded">
              <h3 className="text-xl mb-4 text-red-400">Red Flags</h3>
              <ul>
                {data.aiFeedback?.red_flags?.map((r, i) => (
                  <li key={i}>❌ {r}</li>
                ))}
              </ul>
            </div>

          </div>

          {/* SUGGESTIONS */}
          <div className="bg-slate-800 p-6 rounded mb-10">
            <h3 className="text-xl mb-4 text-blue-400">Action Plan</h3>
            <ul>
              {data.aiFeedback?.suggestions?.map((s, i) => (
                <li key={i}>🚀 {s}</li>
              ))}
            </ul>
          </div>

          {/* REPOS */}
          <div className="grid md:grid-cols-2 gap-6">
            {data.repoAnalysis.map((repo, i) => (
              <div key={i} className="bg-slate-800 p-5 rounded">
                <h3 className="text-lg font-bold">{repo.name}</h3>
                <p>⭐ {repo.stars}</p>
                <p>📦 Commits: {repo.commitCount}</p>
                <p>📘 README: {repo.hasReadme ? "Yes" : "No"}</p>
                <p>💻 {repo.languages.join(", ")}</p>
              </div>
            ))}
          </div>

        </>
      )}

    </div>
  );
}
