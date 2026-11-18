const base = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };

export const LockIcon = () => (<svg {...base}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>);
export const MailIcon = () => (<svg {...base}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></svg>);
export const EyeIcon = () => (<svg {...base}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>);
export const EyeOffIcon = () => (<svg {...base}><path d="M9.9 4.2A10 10 0 0 1 12 4c6.5 0 10 8 10 8a17 17 0 0 1-3.2 4.2M6.6 6.6A17 17 0 0 0 2 12s3.5 8 10 8a10 10 0 0 0 5.4-1.6" /><path d="m2 2 20 20M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>);
export const ArrowIcon = () => (<svg {...base}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
export const ShieldIcon = () => (<svg {...base}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>);

// ---- admin icons (accept an optional size) ----
const mk = (children) =>
  function Icon({ size = 18 }) {
    return <svg {...base} width={size} height={size}>{children}</svg>;
  };

export const GridIcon = mk(<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></>);
export const UsersIcon = mk(<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>);
export const HelpIcon = mk(<><circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></>);
export const FileIcon = mk(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h5" /></>);
export const PulseIcon = mk(<path d="M22 12h-4l-3 9L9 3l-3 9H2" />);
export const LogoutIcon = mk(<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />);
export const SearchIcon = mk(<><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>);
export const ChevronRightIcon = mk(<path d="m9 18 6-6-6-6" />);
export const ChevronLeftIcon = mk(<path d="m15 18-6-6 6-6" />);
export const ClipboardIcon = mk(<><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="m9 14 2 2 4-4" /></>);
export const MenuIcon = mk(<path d="M3 6h18M3 12h18M3 18h18" />);
export const PhoneIcon = mk(<><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.2 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.84.58 2.8.7a2 2 0 0 1 1.73 2.03Z" /></>);
export const BriefcaseIcon = mk(<><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" /></>);
export const CalendarIcon = mk(<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>);
export const PinIcon = mk(<><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>);
export const AlertIcon = mk(<><path d="m10.3 3.9-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3.1l-8-14a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></>);
export const CheckCircleIcon = mk(<><circle cx="12" cy="12" r="10" /><path d="m8 12 2.5 2.5L16 9" /></>);
export const ListIcon = mk(<><path d="M9 6h11M9 12h11M9 18h11" /><path d="M4 6h.01M4 12h.01M4 18h.01" /></>);
export const MinusCircleIcon = mk(<><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /></>);
export const BoltIcon = mk(<path d="m13 2-3 8h7l-6 12 2-9H6l7-11Z" />);
export const SlidersIcon = mk(<><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" /><path d="M2 14h4M10 8h4M18 16h4" /></>);
export const TargetIcon = mk(<><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>);
export const UserIcon = mk(<><circle cx="12" cy="8" r="4" /><path d="M5 21a7 7 0 0 1 14 0" /></>);
export const ArrowDownIcon = mk(<><path d="M12 5v14M19 12l-7 7-7-7" /></>);
export const ArrowUpIcon = mk(<><path d="M12 19V5M5 12l7-7 7 7" /></>);
