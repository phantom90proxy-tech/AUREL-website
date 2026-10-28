import type { ButtonHTMLAttributes } from "react";
export function Button({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`button ${className}`} {...props} />;
}
export function ToastNotification({ message }: { message: string }) {
  return (
    <div role="status" className={`toast ${message ? "visible" : ""}`}>
      {message}
    </div>
  );
}
