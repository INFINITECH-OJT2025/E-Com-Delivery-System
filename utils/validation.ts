export type ValidationErrors = {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
};

export const validateEmail = (email: string): string => {
    if (!email.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email.";
    return "";
};

export const validatePassword = (password: string): string => {
    if (password.length < 4) return "Password must be at least 4 characters.";
    if (!/[A-Z]/.test(password)) return "Password must include at least 1 uppercase letter.";
    if (!/[^a-zA-Z0-9]/.test(password)) return "Password must include at least 1 symbol.";
    return "";
};

export const validatePhone = (phone: string): string => {
    if (!phone.trim()) return "Phone number is required.";
    if (!/^\d{10,15}$/.test(phone)) return "Enter a valid phone number (10-15 digits).";
    return "";
};

export const validateConfirmPassword = (password: string, confirmPassword: string): string => {
    return password !== confirmPassword ? "Passwords do not match." : "";
};
