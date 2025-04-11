"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

interface DeleteConfirmModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  title?: string;
  description?: string;
}

export default function DeleteConfirmModal({
  open,
  onConfirm,
  onCancel,
  loading = false,
  title = "Confirm Deletion",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
}: DeleteConfirmModalProps) {
  return (
    <Modal isOpen={open} onClose={onCancel} size="md">
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody>
          <p className="text-gray-600">{description}</p>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button color="danger" onPress={onConfirm} isLoading={loading}>
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
