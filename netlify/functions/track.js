exports.handler = async (event) => {
    try {
        // Decode the tracking data
        const rawData = event.queryStringParameters.d;
        const trackingData = JSON.parse(Buffer.from(rawData, 'base64').toString());
        
        // Add Netlify's verified network data
        trackingData.serverSide = {
            confirmedIP: event.headers['x-nf-client-connection-ip'],
            country: event.headers['x-nf-ip-country'],
            city: event.headers['x-nf-ip-city'],
            asn: event.headers['x-nf-ip-asn']
        };

        // Log complete data (view in Netlify Dashboard > Functions > Logs)
        console.log("🇮🇳 COMPLETE TRACKING DATA:", trackingData);

        return {
            statusCode: 200,
            body: JSON.stringify({
                status: "success",
                body: JSON.stringify({ status: "logged" }
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "processing failed",
                details: error.message
            })
        };
    }
};
