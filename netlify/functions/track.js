exports.handler = async (event) => {
    try {
        // 1. Decode the tracking data
        const rawData = event.queryStringParameters.d;
        const trackingData = JSON.parse(Buffer.from(rawData, 'base64').toString());
        
        // 2. Add server-side verified data
        trackingData.serverVerified = {
            ip: event.headers['x-nf-client-connection-ip'],
            country: event.headers['x-nf-ip-country'],
            city: event.headers['x-nf-ip-city'],
            asn: event.headers['x-nf-ip-asn']
        };

        // 3. Log the complete data
        console.log("📡 Tracking Data:", trackingData);

        // 4. Return success response
        return {
            statusCode: 200,
            body: JSON.stringify({
                status: "success",
                message: "Data logged successfully"
            })
        };
    } catch (error) {
        // 5. Handle errors gracefully
        console.error("❌ Error:", error);
        return {
            statusCode: 200, // Still return 200 to prevent breaking the redirect
            body: JSON.stringify({
                status: "error",
                message: "Data logging failed but PDF will still load"
            })
        };
    }
};
