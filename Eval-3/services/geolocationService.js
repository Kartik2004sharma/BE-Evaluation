const axios = require('axios');

const getGeolocationData = async (ip) => {
    try {
        // Use IPStack API to get geolocation data
        // If it's localhost, we'll query IPStack for the public IP
        const publicIpResponse = await axios.get('https://api.ipify.org?format=json');
        const publicIp = publicIpResponse.data.ip;
        
        const response = await axios.get(`http://api.ipstack.com/${publicIp}?access_key=${process.env.IPSTACK_API_KEY}`);
        
        return {
            ip: publicIp,
            city: response.data.city || 'Unknown',
            region: response.data.region_name || 'Unknown',
            country: response.data.country_name || 'Unknown',
            loc: `${response.data.latitude || 0},${response.data.longitude || 0}`,
            org: response.data.connection?.isp || 'Unknown',
            timezone: response.data.time_zone?.id || Intl.DateTimeFormat().resolvedOptions().timeZone
        };
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