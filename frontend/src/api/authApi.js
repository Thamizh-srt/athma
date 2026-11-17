import client from "./client";

// Maps camelCase form values -> snake_case keys expected by Laravel.
const toRegisterPayload = (v) => ({
  full_name: v.fullName,
  age: v.age || null,
  gender: v.gender || null,
  phone: v.phone,
  email: v.email,
  address: v.address,
  city: v.city,
  state: v.state,
  pincode: v.pincode,
  location: v.location,
  marital_status: v.maritalStatus || null,
  education: v.education || null,
  occupation: v.occupation || null,
  referred_by: v.referredBy || null,
  password: v.password,
  password_confirmation: v.confirmPassword,
  consent: v.consent,
});

export const authApi = {
  register: (values) => client.post("/auth/register", toRegisterPayload(values)),
  login: ({ email, password }) => client.post("/auth/login", { email, password }),
  logout: () => client.post("/auth/logout"),
  me: () => client.get("/auth/me"),
};
