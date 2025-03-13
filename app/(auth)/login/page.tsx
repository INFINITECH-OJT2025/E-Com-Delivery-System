"use client";

import { useState } from "react";
import { useVendorAuth } from "@/context/VendorAuthContext";
import { Button, Card, CardBody, Input } from "@heroui/react";
import { addToast } from "@heroui/toast";

export default function VendorLogin() {
  const { login } = useVendorAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      addToast({ title: "Login Successful", description: "Welcome back!", color: "success" });
    } catch {
      addToast({ title: "Login Failed", description: "Invalid credentials", color: "danger" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <CardBody>
          <h2 className="text-2xl font-bold text-center mb-4">Vendor Login</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div>
              <Input type="password" name="password" value={formData.password} onChange={handleChange} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
