import { useState } from "react";
import { forgotPassword } from "../api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const handleSubmit = async () => {
    try {
      await forgotPassword(email);
      alert("Email sent!");
    } catch (err) {
      alert("Error sending email");
    }
  };

  return (
    <div>
      <h2>Forgot Password</h2>
      <input
        type="email"
        placeholder="Enter email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleSubmit}>Send Reset Link</button>
    </div>
  );
}