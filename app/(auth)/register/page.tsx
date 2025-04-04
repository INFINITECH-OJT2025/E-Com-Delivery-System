"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RiderAuthService } from "@/services/riderAuthService";
import { addToast, Button, Card, CardBody, Form, Input, Select, SelectItem, Spinner } from "@heroui/react";
import TermsModal from "@/components/TermsModal";
import { useRef } from "react";

export default function RiderRegisterLogic() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const profileInputRef = useRef(null);
  const licenseInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone_number: "",
    vehicle_type: "",
    plate_number: "",
    profile_image: null,
    license_image: null,
  });

  const [preview, setPreview] = useState({ profile: "", license: "" });

  const emailValid = useMemo(() => {
    if (!formData.email) return false;
    return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email);
  }, [formData.email]);

  const passwordMatch = formData.password === formData.password_confirmation;

  const validateStep = () => {
    if (step === 1) {
      return (
        formData.name &&
        emailValid &&
        formData.password &&
        passwordMatch
      );
    }
    if (step === 2) {
      return formData.phone_number && formData.vehicle_type && formData.plate_number;
    }
    if (step === 3) {

      return formData.profile_image !== null  && formData.license_image !== null ;
    }
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (!files?.[0]) return;
    const file = files[0];
    setFormData((prev) => ({ ...prev, [name]: file }));
    
    setPreview((prev) => ({
      ...prev,
      [name === "profile_image" ? "profile" : "license"]: URL.createObjectURL(file),
    }));
    console.log("Form Data", formData);

  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) form.append(key, value);
      });
  
      const response = await RiderAuthService.register(form);
  
      if (response.status === "success") {
        addToast({
          title: "🎉 Success",
          description: "Check email for verification.",
          color: "success",
        });
        setTimeout(() => router.push("/login"), 2000);
      } else if (response.data && typeof response.data === "object") {
        const messages = Object.entries(response.data)
          .map(([field, msgs]) => msgs.join(", "))
          .join("\n");
  
        addToast({
          title: "⚠ Validation Error",
          description: messages,
          color: "danger",
        });
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      const apiErrors = error?.response?.data?.data;
      if (apiErrors) {
        const messages = Object.entries(apiErrors)
          .map(([field, msgs]) => msgs.join(", "))
          .join("\n");
  
        addToast({
          title: "⚠ Validation Error",
          description: messages,
          color: "danger",
        });
      } else {
        addToast({
          title: "❌ Error",
          description: "Something went wrong. Please try again.",
          color: "danger",
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  


return (<>
  <div
    className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center p-4"
    style={{ backgroundImage: "url('/images/blob-scene-haikei-2.svg')" }}
  >
    <Card className="w-full max-w-md p-0 overflow-hidden rounded-2xl shadow-lg ">
      <CardBody className="p-6 bg-white">
        <h3 className="text-xl font-bold text-center text-primary mb-2">
          E-Com Delivery <strong className="text-red-500">Rider</strong>
        </h3>

        <div className="flex justify-center mb-4">
          <img
            src="/images/delivery-panda.png"
            alt="Rider Logo"
            className="w-40 h-40 object-fill"
          />
        </div>

        <p className="text-center text-gray-500 mb-4">Become a rider</p>
        <p className="text-center text-gray-500 mb-4 text-sm">Step {step} of 3</p>

        <Form validationBehavior="aria" onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <>
              <Input
                isRequired
                label="Full Name"
                name="name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={handleChange}
              />
              <Input
                isRequired
                label="Email"
                name="email"
                type="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
                validate={(value) =>
                  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)
                    ? null
                    : "Please enter a valid email"
                }
              />
              <Input
                isRequired
                label="Password"
                name="password"
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                validate={(val) =>
                  val.length >= 6 ? null : "Password must be at least 6 characters"
                }
              />
              <Input
                isRequired
                label="Confirm Password"
                name="password_confirmation"
                type="password"
                placeholder="Re-enter password"
                value={formData.password_confirmation}
                onChange={handleChange}
                validate={(val) =>
                  val !== formData.password ? "Passwords do not match" : null
                }
              />
            </>
          )}

          {step === 2 && (
            <>
              <Input
                isRequired
                label="Phone Number"
                name="phone_number"
                placeholder="09XXXXXXXXX"
                value={formData.phone_number}
                onChange={handleChange}
                validate={(val) =>
                  /^09\d{9}$/.test(val) ? null : "Enter valid PH number (e.g., 09XXXXXXXXX)"
                }
              />
              <Select
                isRequired
                label="Vehicle Type"
                selectedKeys={new Set([formData.vehicle_type])}
                onSelectionChange={(keys) =>
                  setFormData((prev) => ({ ...prev, vehicle_type: Array.from(keys)[0] }))
                }
              >
                <SelectItem key="motorcycle">Motorcycle</SelectItem>
                <SelectItem key="bicycle">Bicycle</SelectItem>
                <SelectItem key="car">Car</SelectItem>
              </Select>
              <Input
               isRequired
                label="Plate Number"
                name="plate_number"
                placeholder="Enter plate number"
                value={formData.plate_number}
                onChange={handleChange}
              />
            </>
          )}

          {step === 3 && (
            <>
             <div className="w-full">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Profile Image
  </label>
  <Input
    ref={profileInputRef}
    isRequired
    type="file"
    name="profile_image"
    accept="image/*"
    onChange={handleFileChange}
  />
  {preview.profile && (
    <div className="mt-2 flex items-center gap-4">
      <img
        src={preview.profile}
        alt="Profile"
        className="h-16 w-16 rounded-full border"
      />
      <button
        type="button"
        onClick={() => {
          setFormData((prev) => ({ ...prev, profile_image: null }));
          setPreview((prev) => ({ ...prev, profile: "" }));
          profileInputRef.current.value = ""; // ✅ Clear input value
        }}
        className="text-sm text-red-500 hover:underline"
      >
        Remove
      </button>
    </div>
  )}
</div>

<div className="w-full">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Driver’s License
  </label>
  <Input
    ref={licenseInputRef}
    isRequired
    type="file"
    name="license_image"
    accept="image/*"
    onChange={handleFileChange}
  />
  {preview.license && (
    <div className="mt-2 flex items-center gap-4">
      <img
        src={preview.license}
        alt="License"
        className="h-20 w-32 rounded border"
      />
      <button
        type="button"
        onClick={() => {
          setFormData((prev) => ({ ...prev, license_image: null }));
          setPreview((prev) => ({ ...prev, license: "" }));
          licenseInputRef.current.value = ""; // ✅ Clear input value
        }}
        className="text-sm text-red-500 hover:underline"
      >
        Remove
      </button>
    </div>
  )}
</div>



              <p className="text-sm text-gray-500 text-center mt-2">
                By signing up you agree to our{" "}
                <button
                  type="button"
                  onClick={() => setShowTerms(true)}
                  className="text-secondary hover:underline"
                >
                  Terms and Conditions
                </button>
              </p>
            </>
          )}

          {step < 3 ? (
         <Button
         type="button"
         color="primary"
         className="w-full"
         onClick={(e) => {
           e.preventDefault(); // ✅ Stop any submit behavior
           if (validateStep()) setStep(step + 1);
           else {
             addToast({
               title: "⚠️ Validation",
               description: "Please complete the required fields.",
               color: "warning",
             });
           }
         }}
       >
         Next →
       </Button>
         
          ) : (
            <Button
              type="submit"
              color="primary"
              className="w-full"
              isDisabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </Button>
          )}

          {step > 1 && (
            <Button
              type="button"
              variant="ghost"
              className="w-full text-gray-500"
              onPress={() => setStep(step - 1)}
            >
              ← Back
            </Button>
          )}


        </Form>          <p className="text-gray-500 text-center text-sm mt-4">
            Already registered?{" "}
            <a href="/login" className="text-secondary font-medium">
              Sign in
            </a>
          </p>
      </CardBody>
    </Card>

    <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
  </div></>
);
}
