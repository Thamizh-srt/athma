import client from "@/api/client";

const get = (url) => client.get(url).then((response) => response.data);

export const assessmentApi = {
  getCatalog: () => get("/assessments"),
  getAssessment: (id) => get(`/assessments/${id}`),
  saveAnswers: (id, answers) => client.put(`/assessments/${id}/answers`, { answers }),
  submitAssessment: (id) => client.post(`/assessments/${id}/submit`).then((response) => response.data),
};
