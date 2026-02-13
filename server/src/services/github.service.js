import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = "https://api.github.com";

const headers = {
  Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
};

export const getUserProfile = async (username) => {
  const { data } = await axios.get(`${BASE_URL}/users/${username}`, { headers });
  return data;
};

export const getUserRepos = async (username) => {
  const { data } = await axios.get(
    `${BASE_URL}/users/${username}/repos?per_page=100`,
    { headers }
  );
  return data;
};

export const getRepoReadme = async (owner, repo) => {
  try {
    const { data } = await axios.get(
      `${BASE_URL}/repos/${owner}/${repo}/readme`,
      { headers }
    );
    return data;
  } catch {
    return null;
  }
};

export const getRepoCommits = async (owner, repo) => {
  try {
    const { data } = await axios.get(
      `${BASE_URL}/repos/${owner}/${repo}/commits?per_page=100`,
      { headers }
    );
    return data;
  } catch {
    return [];
  }
};

export const getRepoLanguages = async (owner, repo) => {
  const { data } = await axios.get(
    `${BASE_URL}/repos/${owner}/${repo}/languages`,
    { headers }
  );
  return data;
};
