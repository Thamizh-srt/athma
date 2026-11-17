import { forwardRef, useState } from "react";
import Field from "./Field";
import { EyeIcon, EyeOffIcon, LockIcon } from "./icons";

const PasswordField = forwardRef(function PasswordField(props, ref) {
  const [visible, setVisible] = useState(false);

  return (
    <Field
      ref={ref}
      type={visible ? "text" : "password"}
      icon={<LockIcon />}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="flex cursor-pointer p-1.5 text-muted hover:text-navy"
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      }
      {...props}
    />
  );
});

export default PasswordField;
