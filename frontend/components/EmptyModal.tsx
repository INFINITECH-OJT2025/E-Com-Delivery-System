import { Modal } from "@heroui/react";

export default function EmptyModal({ isOpen, onClose }) {
    return (
        <Modal open={isOpen} onClose={onClose} title="Filters">
            <p>Filter options will go here</p>
        </Modal>
    );
}
