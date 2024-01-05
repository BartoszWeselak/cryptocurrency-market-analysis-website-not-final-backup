import { signIn } from "next-auth/react";
import { useState } from "react";
import { api } from "~/utils/api";

export default function Register() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const user = api.currency.createUser.useMutation({
    onSuccess: () => {
      void signIn("credentials");
    },
  });
  const handleRegister = () => {
    user.mutate({ email, password });
  };

  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleRegister}>Resgister</button>
    </div>
  );
}
