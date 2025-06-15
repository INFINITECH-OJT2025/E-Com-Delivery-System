"use client";

import { Input } from "@heroui/react";
import { useState } from "react";
import { useVendorRegister } from "./VendorRegisterContext";
import { Eye, EyeOff } from "lucide-react"; // ✅ Lucide icons

interface Props {
  fieldErrors: Record<string, string>;
}

export default function StepAccount({ fieldErrors }: Props) {
  // ✅ properly accepts props
  const { formData, updateFormData } = useVendorRegister();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-8">
      {/* Section Title */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">Account Information</h2>
        <p className="text-sm text-gray-500">
          Create your account to get started. This information will be used to
          log in to your vendor dashboard.
        </p>
      </div>

      {/* Fields */}
      <div className="space-y-6">
        {/* Full Name + Phone Number */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Full Name"
            labelPlacement="outside"
            placeholder="John Smith"
            value={formData.name}
            onValueChange={(val) => updateFormData("name", val)}
            isRequired
            isInvalid={!!fieldErrors.name} // ✅ this is missing in your code
            errorMessage={fieldErrors.name}
          />
          <Input
            label="Phone Number"
            labelPlacement="outside"
            placeholder="+1 (555) 123-4567"
            value={formData.phone_number}
            onValueChange={(val) => updateFormData("phone_number", val)}
            isRequired
            isInvalid={!!fieldErrors.name} // ✅ this is missing in your code
            errorMessage={fieldErrors.phone_number}
          />
        </div>

        {/* Email */}
        <Input
          label="Email Address"
          labelPlacement="outside"
          placeholder="john@example.com"
          type="email"
          value={formData.email}
          onValueChange={(val) => updateFormData("email", val)}
          isRequired
          isInvalid={!!fieldErrors.name} // ✅ this is missing in your code
          errorMessage={fieldErrors.email}
        />

        {/* Password + Confirm Password */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Password"
            labelPlacement="outside"
            placeholder="Enter password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onValueChange={(val) => updateFormData("password", val)}
            isRequired
            isInvalid={!!fieldErrors.name} // ✅ this is missing in your code
            errorMessage={fieldErrors.password}
            endContent={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500 focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            }
          />
          <Input
            label="Confirm Password"
            labelPlacement="outside"
            placeholder="Re-enter password"
            type={showPassword ? "text" : "password"}
            value={formData.password_confirmation}
            onValueChange={(val) =>
              updateFormData("password_confirmation", val)
            }
            isRequired
            isInvalid={!!fieldErrors.name} // ✅ this is missing in your code
            errorMessage={fieldErrors.password_confirmation}
          />
        </div>
      </div>
    </div>
  );
}
