function Feedback({ feedback }) {

  if (!feedback) return null;

  return (
    <div>

      <h2>Strengths</h2>
      <ul>
        {feedback.strengths?.map((s, i) => <li key={i}>{s}</li>)}
      </ul>

      <h2>Red Flags</h2>
      <ul>
        {feedback.red_flags?.map((r, i) => <li key={i}>{r}</li>)}
      </ul>

      <h2>Suggestions</h2>
      <ul>
        {feedback.suggestions?.map((s, i) => <li key={i}>{s}</li>)}
      </ul>

    </div>
  );
}

export default Feedback;
