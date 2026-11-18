
const get = (url, params) =>
  client.get(url, { params }).then((r) => r.data);

const post = (url, data) =>
  client.post(url, data).then((r) => r.data);

export const adminApi = {
  login: (credentials) => post("/admin/auth/login", credentials),
  logout: () => post("/admin/auth/logout", {}),
  getOverview: () => get("/admin/overview"),
  getPatients: (params) => get("/admin/patients", params),
  getPatient: (id) => get(`/admin/patients/${id}`),
  getPatientAssessments: (id) =>
    get(`/admin/patients/${id}/assessments`),
  getPatientAssessment: (id, categoryId) =>
    get(`/admin/patients/${id}/assessments/${categoryId}`),
  getQuizzes: (params) => get("/admin/quizzes", params),
  getQuiz: (id) => get(`/admin/quizzes/${id}`),
  getAttemptReport: (id) => get(`/admin/attempts/${id}/report`),
};
