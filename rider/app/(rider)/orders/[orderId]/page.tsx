"use client";

import { useRouter } from "next/navigation"; // Import the useRouter hook
import RiderOrderFlow from "@/components/RiderOrderFlow";
import { Button } from "@heroui/react"; // Import your Button component (assuming you're using HeroUI)

const RiderDashboard = () => {
  const router = useRouter(); // Initialize the router

  const handleBackClick = () => {
    router.back(); // This will take the user back to the previous page
  };

  return (
    <div >
      {/* Back Button */}
      <Button variant="light" color="primary"  onPress={handleBackClick}       className="p-0 m-0 font-normal e data-[hover=true]:bg-transparent active:bg-transparent ml-2"
 >
        &larr; Back
      </Button>

      {/* RiderOrderFlow Component */}
      <RiderOrderFlow />
    </div>
  );
};

export default RiderDashboard;
