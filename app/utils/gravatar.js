// utils/gravatar.js
import md5 from "blueimp-md5";

export function getGravatarUrl(email, size = 80) {
  const trimmedEmail = email.trim().toLowerCase();
  const hash = md5(trimmedEmail);
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
}
