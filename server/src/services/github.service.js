import axios from "axios";

const BASE_URL = "https://api.github.com";

export const getUserProfile = async (username) => {
  const { data } = await axios.get(`${BASE_URL}/users/${username}`);
  return data;
};

export const getUserRepos = async (username) => {
  const { data } = await axios.get(`${BASE_URL}/users/${username}/repos`);
  return data;
};
