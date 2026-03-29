"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import InputGroup from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import { Mail, Lock } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        identifier: email,
        password: password,
        loginType: "email-password",
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch (err: any) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-3xl border border-gray-200 shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <h1 className={cn(integralCF.className, "text-4xl text-center mb-2 uppercase")}>
            Admin Login
          </h1>
          <p className="text-gray-500 text-sm">Enter your credentials to access the dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">
              Email Address
            </label>
            <InputGroup className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden focus-within:border-black transition-colors">
              <InputGroup.Text className="pl-4">
                <Mail className="h-5 w-5 opacity-40" />
              </InputGroup.Text>
              <InputGroup.Input
                type="email"
                placeholder="admin@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-transparent py-4"
              />
            </InputGroup>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">
              Password
            </label>
            <InputGroup className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden focus-within:border-black transition-colors">
              <InputGroup.Text className="pl-4">
                <Lock className="h-5 w-5 opacity-40" />
              </InputGroup.Text>
              <InputGroup.Input
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-transparent py-4"
              />
            </InputGroup>
          </div>

          {error && (
            <p className="text-red-500 text-sm font-medium text-center bg-red-50 py-2 rounded-lg border border-red-100">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-full text-base py-7 font-bold shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
          >
            {loading ? "Logging in..." : "Login to Dashboard"}
          </Button>
        </form>
      </div>
    </main>
  );
}
