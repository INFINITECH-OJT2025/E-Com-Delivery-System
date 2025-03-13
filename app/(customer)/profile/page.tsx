"use client";

import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Switch, Button } from "@heroui/react"; // ✅ Import Hero UI Components
import ProfileCard from "@/components/ProfileCard";
import ProfileMenu from "@/components/ProfileMenu";
import LogoutButton from "@/components/LogoutButton";
import { useUser } from "@/context/userContext"; // ✅ Get User Data from Context

export default function ProfilePage() {
    const { user, fetchUser } = useUser(); // ✅ Get user & fetchUser function from context
    const [loading, setLoading] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false); // ✅ State for Settings Modal
    const [notificationsEnabled, setNotificationsEnabled] = useState(false); // ✅ Toggle for Notifications

    useEffect(() => {
        const loadUser = async () => {
            await fetchUser(); // ✅ Fetch user from API
            setLoading(false);
        };
        loadUser();
    }, []);

    // ✅ Handle Toggle Change
    const handleToggleNotifications = () => {
        setNotificationsEnabled(!notificationsEnabled);

        // ✅ Check if browser supports notifications
        if ("Notification" in window) {
            if (!notificationsEnabled) {
                Notification.requestPermission().then((permission) => {
                    if (permission === "granted") {
                        new Notification("Notifications Enabled", {
                            body: "You will receive updates from the site.",
                        });
                    }
                });
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* ✅ Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white shadow-md">
                <h1 className="text-lg font-bold">Account</h1>
                <button onClick={() => setIsSettingsOpen(true)}>
                    <Settings className="w-6 h-6 text-gray-500" />
                </button>
            </div>

            {/* ✅ Show Spinner if Loading */}
            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <Spinner size="lg" className="text-primary" />
                </div>
            ) : (
                <>
                    {/* ✅ Pass user as a prop to keep ProfileCard.tsx clean */}
                    <ProfileCard user={user} />

                    {/* ✅ Profile Menu (Perks & General) */}
                    <ProfileMenu />

                    {/* ✅ Logout Button */}
                    <LogoutButton />
                </>
            )}

            {/* ✅ Settings Modal */}
            <Modal isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} size="sm">
                <ModalContent>
                    <ModalHeader className="text-center text-primary font-bold text-xl">Settings</ModalHeader>

                    <ModalBody className="p-6">
                        {/* ✅ Notification Toggle */}
                        <div className="flex items-center justify-between">
                            <span className="text-gray-700">Enable Notifications</span>
                            <Switch 
                                checked={notificationsEnabled} 
                                onChange={handleToggleNotifications} 
                            />
                        </div>
                    </ModalBody>

                    <ModalFooter className="p-4 border-t flex justify-end">
                        <Button variant="light" onPress={() => setIsSettingsOpen(false)}>Close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}
