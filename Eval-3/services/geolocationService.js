const axios = require('axios');

const getGeolocationData = async (ip) => {
    try {
        // Check if the IP is localhost
        if (ip === '::1' || ip === '127.0.0.1') {
            return {
                ip: ip,
                city: 'Local Development',
                region: 'Development Environment',
                country: 'Local',
                loc: '0,0',
                org: 'Local Network',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            };
        }

        // Use ipinfo.io API to get geolocation data
        const response = await axios.get(`https://ipinfo.io/${ip}/json`);
        return response.data;
    } catch (error) {
        console.error('Error fetching geolocation data:', error);
        // Return fallback data in case of error
        return {
            ip: ip,
            city: 'Unknown',
            region: 'Unknown',
            country: 'Unknown',
            loc: '0,0',
            org: 'Unknown',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }
};

module.exports = {
    getGeolocationData
}; 