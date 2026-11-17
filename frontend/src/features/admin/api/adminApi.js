import client from "@/api/client";

// const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
// const loadMock = () => import("./mockApi"); // only downloaded when mock mode is on

const get = (url, params) => client.get(url, { params }).then((r) => r.data);

// route(mockFnName, realFn) -> function that picks mock or real at call time
const route = (name, real) => (...args) => real(...args);

export const adminApi = {
  login: route("login", (c) => client.post("/admin/auth/login", c).then((r) => r.data)),
  logout: route("logout", () => client.post("/admin/auth/logout")),
  getOverview: route("getOverview", () => get("/admin/overview")),
  getPatients: route("getPatients", () => get("/admin/patients")),
  getQuizzes: route("getQuizzes", () => get("/admin/quizzes")),
  getQuiz: route("getQuiz", (id) => get(`/admin/quizzes/${id}`)),
  getAttemptReport: route("getAttemptReport", (id) => get(`/admin/attempts/${id}/report`)),
};
