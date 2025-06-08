"use client";
import { createClient } from "@/utils/supabase/client";

export default function Login() {
  const handleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithPassword({
      email: "user@example.com",
      password: "password",
    });
  };
  return <button onClick={handleLogin}>Login</button>;
}
