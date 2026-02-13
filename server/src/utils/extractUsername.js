export const extractUsername = (url) => {
  return url.replace("https://github.com/", "").trim();
};
