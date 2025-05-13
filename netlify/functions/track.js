exports.handler = async (event) => {
    // Log all received data
    console.log("📡 RECEIVED DATA:", {
        query: event.queryStringParameters,
        ip: event.headers['x-nf-client-connection-ip'], // Netlify provides real IP
        userAgent: event.headers['user-agent'],
        referer: event.headers['referer']
    });

    return {
        statusCode: 200,
        body: JSON.stringify({
            status: "success",
            data: event.queryStringParameters,
            netlifyIp: event.headers['x-nf-client-connection-ip'] // More accurate than client-reported IP
        })
    };
};
