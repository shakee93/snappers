"use client";
import React, { useState } from "react";
import EmailTemplate from "@/components/ui/Email/EmailTemplate";

const Page = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append("email", "123");
            formData.append("name", "123");

            const response = await fetch("/api/email", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const result: any = await response.json();
            setData(result);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="container mx-auto p-4">
            <button
                onClick={fetchData}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-300"
                disabled={loading}
            >
                {loading ? "Loading..." : "Fetch Data"}
            </button>
            {/* <EmailTemplate {...fakeData} /> */}

            <div className="mt-4">
                <h2 className="text-lg font-semibold">Response:</h2>
                <pre className="bg-gray-100 p-4 rounded">
                    {error && <p className="text-red-500">{error}</p>}
                    {data && <code>{JSON.stringify(data, null, 2)}</code>}
                </pre>
            </div>
    
        </div>
    );
};

export default Page;
