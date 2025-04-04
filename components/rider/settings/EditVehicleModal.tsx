"use client";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem } from "@heroui/react";

export default function EditVehicleModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader>🚗 Edit Vehicle Information</ModalHeader>
        <ModalBody className="space-y-4">
          <Select label="Vehicle Type">
            <SelectItem key="motorcycle">Motorcycle</SelectItem>
            <SelectItem key="car">Car</SelectItem>
            <SelectItem key="bicycle">Bicycle</SelectItem>
          </Select>
          <Input label="Plate Number" placeholder="Enter plate number" />
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onPress={onClose}>Cancel</Button>
          <Button color="primary">Save</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
