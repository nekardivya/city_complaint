export function getCurrentUser() {
  const storedUser = localStorage.getItem("cityComplaintUser");

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    localStorage.removeItem("cityComplaintUser");
    return null;
  }
}

export function isAdminUser(user) {
  return user?.role === "admin";
}
