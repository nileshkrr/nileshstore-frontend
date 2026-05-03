import { useParams } from "react-router-dom";
import { useState } from "react";
import { resetPassword } from "../api";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    try {
      await resetPassword(token, password);
      alert("Password reset successful");
    } catch {
      alert("Error resetting password");
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>
      <input
        type="password"
        placeholder="New password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleSubmit}>Reset</button>
    </div>
  );
}