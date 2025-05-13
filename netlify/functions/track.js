exports.handler = async (event) => {
    // Log all received data (visible in Netlify dashboard)
    console.log("📡 RECEIVED DATA:", {
        query: event.queryStringParameters,
        ip: event.headers['x-nf-client-connection-ip'],
        userAgent: event.headers['user-agent']
    });

    return {
        statusCode: 200,
        body: JSON.stringify({
            status: "success",
            data: event.queryStringParameters,
            ip: event.headers['x-nf-client-connection-ip']
        })
    };
};
