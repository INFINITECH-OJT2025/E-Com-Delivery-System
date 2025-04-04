"use client";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@heroui/react";

export default function UploadDocumentsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader>📄 Upload Rider Documents</ModalHeader>
        <ModalBody className="space-y-4">
          <Input type="file" label="Upload License" />
          <Input type="file" label="Upload OR/CR" />
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onPress={onClose}>Cancel</Button>
          <Button color="primary">Submit</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
