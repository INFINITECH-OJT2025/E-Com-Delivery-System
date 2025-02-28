"use client";

import React from "react";
import { Modal, Form, Input, Button, Card } from "@heroui/react";

export default function EmailModal({ isOpen, onClose }) {
    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} placement="bottom">
            <Card className="w-full max-w-md p-6 bg-white rounded-t-xl shadow-lg max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold text-center text-primary">What's your email?</h2>
                <p className="text-gray-500 text-center mb-4">We’ll check if you have an account</p>

                <Form className="space-y-4">
                    <Input isRequired label="Email" name="email" type="email" placeholder="Enter your email" />
                    <Button className="w-full bg-secondary text-white mt-2">Continue</Button>
                </Form>
            </Card>
        </Modal>
    );
}
