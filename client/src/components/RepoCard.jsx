function RepoCard({ repo }) {

  return (
    <div style={{ border: "1px solid gray", margin: 10, padding: 10 }}>
      <h3>{repo.name}</h3>
      <p>⭐ Stars: {repo.stars}</p>
      <p>📘 README: {repo.hasReadme ? "Yes" : "No"}</p>
      <p>📦 Commits: {repo.commitCount}</p>
      <p>💻 Languages: {repo.languages.join(", ")}</p>
    </div>
  );
}

export default RepoCard;
    