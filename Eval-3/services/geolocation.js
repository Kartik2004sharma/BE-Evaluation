const axios = require('axios');

class GeolocationService {
    constructor() {
        this.apiKey = process.env.IPSTACK_API_KEY;
        this.baseUrl = 'http://api.ipstack.com';
    }

    async getLocation() {
        try {
            // First try browser geolocation
            if (navigator.geolocation) {
                return new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(
                        async (position) => {
                            const { latitude, longitude } = position.coords;
                            const location = await this.reverseGeocode(latitude, longitude);
                            resolve(location);
                        },
                        async (error) => {
                            console.error('Browser geolocation error:', error);
                            // Fallback to IP-based location
                            const location = await this.getLocationByIP();
                            resolve(location);
                        }
                    );
                });
            } else {
                // Fallback to IP-based location
                return await this.getLocationByIP();
            }
        } catch (error) {
            console.error('Geolocation error:', error);
            return null;
        }
    }

    async getLocationByIP() {
        try {
            const response = await axios.get(`${this.baseUrl}/check?access_key=${this.apiKey}`);
            return {
                city: response.data.city,
                region: response.data.region_name,
                country: response.data.country_name,
                latitude: response.data.latitude,
                longitude: response.data.longitude
            };
        } catch (error) {
            console.error('IP-based location error:', error);
            return null;
        }
    }

    async reverseGeocode(latitude, longitude) {
        try {
            const response = await axios.get(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            return {
                city: response.data.address.city || response.data.address.town,
                region: response.data.address.state,
                country: response.data.address.country,
                latitude,
                longitude
            };
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            return null;
        }
    }
}

module.exports = new GeolocationService(); 