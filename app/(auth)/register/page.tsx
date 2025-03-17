"use client";

import { useState } from "react";
import { Button, Card, CardBody, Input, Select, SelectItem, Spinner } from "@heroui/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { RiderAuthService } from "@/services/riderAuthService"; // Import the RiderAuthService
import { addToast } from "@heroui/react";


export default function RiderRegister() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone_number: "",
    vehicle_type: "",
    plate_number: "",
    profile_image: null as File | null,
    license_image: null as File | null,
  });

  const [preview, setPreview] = useState({
    profile: "",
    license: "",
  });

  const [loading, setLoading] = useState(false);

  // Handle Input Changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle File Uploads (Profile & License)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files || files.length === 0) return;

    const file = files[0];
    setFormData((prev) => ({ ...prev, [name]: file }));

    // Show Image Preview
    setPreview((prev) => ({
      ...prev,
      [name === "profile_image" ? "profile" : "license"]: URL.createObjectURL(file),
    }));
  };

  // Submit Form
  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = new FormData();
      Object.keys(formData).forEach((key) => {
        const value = formData[key as keyof typeof formData];
        if (value) form.append(key, value);
      });

      const response = await RiderAuthService.register(form);
      if (response.status === "success") {
        addToast({
          title: "🎉 Registration Successful",
          description: "Check your email for verification.",
          color: "success",
          timeout: 5000,
        });

        setTimeout(() => router.push("/dashboard"), 2000); // Redirect after 2s
      } else {
        addToast({
          title: "⚠️ Registration Failed",
          description: response.message || "Something went wrong. Please try again.",
          color: "danger",
          timeout: 5000,
        });
      }
    } catch (error) {
      addToast({
        title: "❌ Error",
        description: "An error occurred. Try again later.",
        color: "danger",
        timeout: 5000,
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-primary p-4">
      
      {/* Logo Section */}
      <div className="mb-4">
        <Image src="/images/delivery-panda.png" alt="E-Com Delivery" width={120} height={120} className="rounded-full shadow-md bg-white" />
      </div>

      {/* Rider Registration Card */}
      <Card className="w-full max-w-md p-6 bg-white shadow-lg rounded-2xl">
        <h2 className="text-2xl font-bold text-center text-primary">Become a Rider</h2>
        <p className="text-gray-500 text-center mb-4">Sign up to start delivering with us</p>

        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <Input label="Full Name" type="text" name="name" placeholder="Enter full name" value={formData.name} onChange={handleChange} isRequired />

            <Input label="Email" type="email" name="email" placeholder="Enter email" value={formData.email} onChange={handleChange} isRequired />

            <Input label="Password" type="password" name="password" placeholder="Enter password" value={formData.password} onChange={handleChange} isRequired />

            <Input label="Confirm Password" type="password" name="password_confirmation" placeholder="Re-enter password" value={formData.password_confirmation} onChange={handleChange} isRequired />

            <Input label="Phone Number" type="text" name="phone_number" placeholder="09XXXXXXXXX" value={formData.phone_number} onChange={handleChange} isRequired />

            <Select
  label="Vehicle Type"
  selectedKeys={new Set([formData.vehicle_type])} // Ensure selected value is properly tracked
  onSelectionChange={(keys) => {
    const selectedValue = Array.from(keys)[0]; // Convert Set to array and get first value
    setFormData((prev) => ({ ...prev, vehicle_type: selectedValue as string }));
  }}
  isRequired
>
  <SelectItem key="motorcycle" value="motorcycle">Motorcycle</SelectItem>
  <SelectItem key="bicycle" value="bicycle">Bicycle</SelectItem>
  <SelectItem key="car" value="car">Car</SelectItem>
</Select>


            <Input label="Plate Number (Optional)" type="text" name="plate_number" placeholder="Enter plate number" value={formData.plate_number} onChange={handleChange} />

            {/* Profile Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
              <Input type="file" name="profile_image" accept="image/*" onChange={handleFileChange} isRequired />
              {preview.profile && <img src={preview.profile} alt="Profile Preview" className="mt-2 h-16 w-16 object-cover rounded-full border" />}
            </div>

            {/* Driver’s License Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Driver’s License</label>
              <Input type="file" name="license_image" accept="image/*" onChange={handleFileChange} isRequired />
              {preview.license && <img src={preview.license} alt="License Preview" className="mt-2 h-20 w-32 object-cover rounded-lg border" />}
            </div>

            {/* Terms & Conditions */}
            <p className="text-gray-500 text-center text-sm mt-2">
              By signing up you agree to our{" "}
              <a href="#" className="text-secondary font-medium">Terms & Conditions</a> and{" "}
              <a href="#" className="text-secondary font-medium">Privacy Policy</a>.
            </p>

            {/* Register Button */}
            <Button type="submit" color="primary" className="w-full" isDisabled={loading}>
              {loading ? <Spinner size="sm" /> : "Register"}
            </Button>

          </form>
        </CardBody>
      </Card>
    </div>
  );
}
