export function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getRefundStatusColor(status: string) {
    switch (status) {
        case "pending":
            return "text-yellow-500";
        case "approved":
            return "text-green-500";
        case "denied":
            return "text-red-500";
        default:
            return "text-gray-500";
    }
}
