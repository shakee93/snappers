// api/emailNotify.js
export default async function handler(req: any, res: any) {
    console.log('Received request:', req.body);

    if (req.method === 'POST') {
        const { xoo_wl_user_email, _xoo_wl_product_id, xoo_wl_required_qty } = req.body;

        // Prepare the request body for the external API
        const body = new URLSearchParams({
            "xoo_wl_user_email": xoo_wl_user_email,
            "_xoo_wl_product_id": _xoo_wl_product_id,
            "xoo_wl_required_qty": xoo_wl_required_qty,
        }).toString();

        try {
            // Sending the request to the external API
            const response = await fetch("http://newtitan.local/wp-json/api/gq_mobile/v1/handle_waitlist_form_submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Accept": "application/json",
                },
                body: body,
                credentials: "include", // Include credentials if needed
            });

            // Check if the response is OK (status in the range 200-299)
            if (response.ok) {
                const data = await response.json(); // Parse the JSON response
                console.log("Response from external API:", data);

                // Return success response to the client
                return res.status(200).json({ success: true, data });
            } else {
                const errorData = await response.json(); // Get error details
                console.error("Error from external API:", errorData);

                // Return error response to the client
                return res.status(response.status).json({ success: false, error: errorData });
            }
        } catch (error) {
            console.error("Fetch error:", error);

            // Return error response to the client
            return res.status(500).json({ success: false, error: "Internal server error" });
        }
    } else {
        // Handle other request methods
        return res.status(405).json({ error: "Method not allowed" });
    }
}
