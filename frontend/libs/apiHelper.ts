export const apiHelper = {
    async handleResponse(response) {
        const contentType = response.headers.get("content-type");

        let responseData;
        if (contentType && contentType.includes("application/json")) {
            responseData = await response.json();
        } else {
            responseData = await response.text();
        }

        // ✅ Ensure `data` is properly structured and avoid nesting issues
        if (!response.ok) {
            console.error("API Error:", responseData);
            return { 
                success: false, 
                message: responseData?.message || "Something went wrong", 
                data: responseData?.data || null 
            };
        }

        return { 
            success: true, 
            data: responseData.data || responseData, // ✅ Prevents nested `data`
            message: responseData.message || "Success"
        };
    },
};
