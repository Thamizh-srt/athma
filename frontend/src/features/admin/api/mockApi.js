// Fake data so the UI works before the Laravel API exists.
// Mock login -> admin@gmail.com / admin123
const delay = (value, ms = 350) => new Promise((resolve) => setTimeout(() => resolve(value), ms));
const fail = (status, message) => Promise.reject({ response: { status, data: { message } } });
const daysAgo = (n) => new Date(Date.now() - n * 864e5).toISOString();
const minsAgo = (n) => new Date(Date.now() - n * 6e4).toISOString();

export const login = ({ email, password }) =>
  email === "admin@gmail.com" && password === "admin123"
    ? delay({ token: "mock-admin-token", admin: { name: "Admin", email } })
    : fail(401, "Invalid email or password");

export const logout = () => delay(null, 100);

export const getOverview = () =>
  delay({
    stats: { assessments_week: 351, assessments_change: 12, patients: 1042, patients_month: 28, high_risk: 14, high_risk_waiting: 5 },
    by_day: [
      { day: "Mon", count: 42 }, { day: "Tue", count: 58 }, { day: "Wed", count: 51 }, { day: "Thu", count: 73 },
      { day: "Fri", count: 66 }, { day: "Sat", count: 34 }, { day: "Sun", count: 27 },
    ],
    risk: { low: 542, moderate: 344, high: 156 },
    activity: [
      { id: 1, name: "Priya R", action: "completed the EPI assessment", risk: "moderate", created_at: minsAgo(12) },
      { id: 2, name: "Arun Kumar", action: "completed the MHI-38 inventory", risk: "high", created_at: minsAgo(55) },
      { id: 3, name: "Divya S", action: "registered on the platform", risk: "low", created_at: minsAgo(190) },
      { id: 4, name: "Karthik M", action: "completed the BEIS-10 scale", risk: "low", created_at: minsAgo(400) },
    ],
  });

const PATIENTS = [
  ["Aarav N", 24, "Male", "9000000001", "aarav@example.com", "Chennai", "Tamil Nadu", 0, true],
  ["Karan", 27, "Male", "9000000002", "karan@example.com", "Chennai", "Tamil Nadu", 1, true],
  ["Vikram", 27, "Male", "9000000003", "vikram@example.com", "Chennai", "TN", 7, true],
  ["Mind Test Co", 26, "Male", "9000000004", "dev@example.com", "Nungambakkam", "TN", 20, true],
  ["Rohan D", 27, "Male", "9000000005", "rohan@example.com", "Chennai", "Tamil Nadu", 27, true],
  ["Ramesh Kumar", 28, "Male", "9000000006", "ramesh@example.com", "Chennai", "Tamil Nadu", 27, true],
  ["SK", null, null, "9000000007", "sk@example.com", "Trichy", "TN", 27, false],
].map(([full_name, age, gender, phone, email, city, state, ago, signed], i) => ({
  id: i + 1, full_name, age, gender, phone, email, city, state, created_at: daysAgo(ago), declaration_signed: signed,
}));

export const getPatients = () => delay(PATIENTS);

const QUIZZES = [
  { id: 1, title: "Brief Emotional Intelligence Scale (BEIS-10)", category: "Emotional Intelligence", description: "Self-report scale to measure emotional intelligence.", status: "active", questions_count: 10, created_at: "2026-10-15" },
  { id: 2, title: "Mental Health Inventory (MHI-38)", category: "Mental Health", description: "Measures mental health over the past month.", status: "active", questions_count: 38, created_at: "2026-10-15" },
  { id: 3, title: "SCARED Rating Scale", category: "Anxiety (Child/Parent)", description: "Screen for childhood anxiety disorders. Parent and child versions.", status: "active", questions_count: 41, created_at: "2026-10-15" },
  { id: 4, title: "Indian Scale for Assessment of Autism", category: "Intellectual Disability", description: "Assessment by NIMH, Secunderabad (Ministry of Social Justice & Empowerment, Govt. of India).", status: "active", questions_count: 40, created_at: "2026-10-15" },
];

export const getQuizzes = () => delay(QUIZZES);

const LIKERT = [
  { value: 1, label: { en: "Strongly Disagree", ta: "முற்றிலும் உடன்படவில்லை" } },
  { value: 2, label: { en: "Disagree", ta: "உடன்படவில்லை" } },
  { value: 3, label: { en: "Neither Agree nor Disagree", ta: "உடன்படவும் இல்லை மறுக்கவும் இல்லை" } },
  { value: 4, label: { en: "Agree", ta: "உடன்படுகிறேன்" } },
  { value: 5, label: { en: "Strongly Agree", ta: "முழுமையாக உடன்படுகிறேன்" } },
];

// Tamil exists for the first five only; the UI falls back to English.
const BEIS = [
  ["I know why my emotions change", "என் உணர்வுகள் ஏன் மாறுகின்றன என்பது எனக்குத் தெரியும்"],
  ["I easily recognise my emotions as I experience them", "நான் உணரும்போதே என் உணர்வுகளை எளிதாக அடையாளம் காண்கிறேன்"],
  ["I can tell how people are feeling by listening to the tone of their voice", "குரலின் தொனியைக் கேட்டு மற்றவர்கள் எப்படி உணர்கிறார்கள் என்பதை என்னால் சொல்ல முடியும்"],
  ["By looking at their facial expressions, I recognise the emotions people are experiencing", "முகபாவனைகளைப் பார்த்து மக்கள் அனுபவிக்கும் உணர்வுகளை நான் அடையாளம் காண்கிறேன்"],
  ["I seek out activities that make me happy", "எனக்கு மகிழ்ச்சி தரும் செயல்களை நான் தேடிச் செல்கிறேன்"],
  ["I have control over my emotions"],
  ["I arrange events others enjoy"],
  ["I help other people feel better when they are down"],
  ["When I am in a positive mood, I am able to come up with new ideas"],
  ["I use good moods to help myself keep trying in the face of obstacles"],
];

export const getQuiz = (id) => {
  const quiz = QUIZZES.find((q) => q.id === Number(id));
  if (!quiz) return fail(404, "Quiz not found");
  const questions =
    quiz.id === 1
      ? BEIS.map(([en, ta], i) => ({ id: i + 1, order: i + 1, type: "likert", text: { en, ta: ta || en }, options: LIKERT }))
      : []; // other quizzes: questions come from the real API
  return delay({ ...quiz, questions });
};

export const getAttemptReport = (id) =>
  /^ATT-\d+-\d+$/i.test(id)
    ? delay({ attempt_id: id.toUpperCase(), total_score: 32, max_score: 50, level: "moderate" })
    : fail(404, "Attempt not found");
