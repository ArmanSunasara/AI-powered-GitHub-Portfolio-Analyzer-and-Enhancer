import { useState } from "react";

function InputForm({ onAnalyze }) {

  const [url, setUrl] = useState("");

  return (
    <div>
      <input
        type="text"
        placeholder="Enter GitHub Profile URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <button onClick={() => onAnalyze(url)}>
        Analyze
      </button>
    </div>
  );
}

export default InputForm;
