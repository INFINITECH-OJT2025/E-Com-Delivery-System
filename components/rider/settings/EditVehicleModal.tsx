"use client";

import { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Spinner,
  addToast,
} from "@heroui/react";
import { riderProfileService } from "@/services/riderProfileService";

export default function EditVehicleModal({
  isOpen,
  onClose,
  rider,
  onUpdate, // ✅ optional callback to update parent state
}: {
  isOpen: boolean;
  onClose: () => void;
  rider?: {
    vehicle_type?: string;
    plate_number?: string;
  };
  onUpdate?: (updatedData: any) => void;
}) {
  const [vehicleType, setVehicleType] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (rider) {
      setVehicleType(rider.vehicle_type || "");
      setPlateNumber(rider.plate_number || "");
    }
  }, [rider]);

  const handleSave = async () => {
    if (!vehicleType || !plateNumber) {
      addToast({
        title: "Missing Fields",
        description: "Please provide both vehicle type and plate number.",
        color: "danger",
      });
      return;
    }

    setLoading(true);
    const res = await riderProfileService.updateVehicle({
      vehicle_type: vehicleType,
      plate_number: plateNumber,
    });

    if (res.status === "success") {
      addToast({
        title: "✅ Updated",
        description: "Vehicle information has been updated.",
        color: "success",
      });

      if (onUpdate) {
        onUpdate({ vehicle_type: vehicleType, plate_number: plateNumber });
      }

      onClose();
    } else {
      addToast({
        title: "Error",
        description: res.message || "Failed to update vehicle info.",
        color: "danger",
      });
    }
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} hideCloseButton={true}>
      <ModalContent>
      <ModalHeader className="p-4 border-b bg-primary text-white text-center shadow-sm rounded-t-xl relative">
  <h3 className="text-lg font-bold">  🚗 Edit Vehicle Information</h3>

  <button
  onClick={onClose} // Corrected the function name to match the prop
  className="absolute right-4 top-4 text-white text-sm hover:opacity-80"
>
  ✖
</button>

</ModalHeader>
        <ModalBody className="space-y-2 pt-6">
          <Select
            label="Vehicle Type"
            selectedKeys={[vehicleType]}
            onSelectionChange={(keys) => setVehicleType(Array.from(keys)[0] as string)}
          >
            <SelectItem key="motorcycle">Motorcycle</SelectItem>
            <SelectItem key="car">Car</SelectItem>
            <SelectItem key="bicycle">Bicycle</SelectItem>
          </Select>
          <Input
            label="Plate Number"
            placeholder="Enter plate number"
            value={plateNumber}
            onChange={(e) => setPlateNumber(e.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onPress={onClose} isDisabled={loading}>
            Cancel
          </Button>
          <Button color="primary" onPress={handleSave} isDisabled={loading}>
            {loading ? "Saving ..." : "Save"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
