"use client";

import { useVendorRegister } from "./VendorRegisterContext";
import { Check } from "lucide-react"; // ✅ Lucide Check icon

export default function FormStepper() {
  const { step } = useVendorRegister();
  const steps = ["Account", "Restaurant", "Location", "Settings"];

  return (
    <div className="w-full max-w-4xl mx-auto mb-10">
      {/* Title and subtitle */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Register Your Restaurant</h1>
        <p className="text-gray-500 mt-2">
          Join thousands of successful restaurants on our platform. Complete the form below to get started.
        </p>
      </div>

      {/* Step Circles */}
      <div className="flex items-center justify-between relative">
        {steps.map((label, index) => (
          <div key={index} className="flex flex-col items-center text-center flex-1">
            <div className={`w-10 h-10 flex items-center justify-center rounded-full mb-2
              ${step > index ? "bg-green-500" : step === index + 1 ? "bg-green-500" : "bg-gray-300"}
              text-white font-bold transition duration-300`}
            >
              {step > index ? (
                <Check className="h-5 w-5" />
              ) : (
                index + 1
              )}
            </div>
            <p className={`text-sm ${step >= index + 1 ? "text-green-600 font-semibold" : "text-gray-400"}`}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="relative mt-4">
        <div className="absolute w-full h-1 bg-gray-200 rounded-full"></div>
        <div
          className="h-1 bg-green-500 rounded-full transition-all duration-300"
          style={{ width: `${(step - 1) / (steps.length - 1) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}
