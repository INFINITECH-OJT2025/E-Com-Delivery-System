"use client";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@heroui/react";

export default function ChangePasswordModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader>🔒 Change Password</ModalHeader>
        <ModalBody className="space-y-4">
          <Input label="Current Password" type="password" />
          <Input label="New Password" type="password" />
          <Input label="Confirm New Password" type="password" />
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onPress={onClose}>Cancel</Button>
          <Button color="primary">Update</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
