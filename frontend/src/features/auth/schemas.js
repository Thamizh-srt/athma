import { z } from "zod";

const optionalText = z.string().trim().max(100).optional();

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    fullName: z
      .string().trim()
      .min(2, "Enter your full name")
      .max(100)
      .regex(/^[A-Za-z .'-]+$/, "Name can only contain letters and spaces"),
    age: z
      .string().trim().optional()
      .refine((v) => !v || (/^\d{1,3}$/.test(v) && +v >= 1 && +v <= 120), "Enter a valid age (1–120)"),
    gender: z.string().optional(),
    phone: z
      .string().trim()
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
    email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
    address: z.string().trim().min(10, "Enter your full address").max(255),
    city: z.string().trim().min(2, "City is required").max(60),
    state: z.string().trim().min(2, "State is required").max(60),
    pincode: z.string().trim().regex(/^\d{6}$/, "Enter a 6-digit pincode"),
    location: z.string().trim().min(2, "District/Area is required").max(80),
    maritalStatus: z.string().optional(),
    education: optionalText,
    occupation: optionalText,
    referredBy: optionalText,
    password: z.string().min(6, "Password must be at least 6 characters").max(64),
    confirmPassword: z.string().min(1, "Please re-enter your password"),
    consent: z.literal(true, { errorMap: () => ({ message: "Please confirm to continue" }) }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
