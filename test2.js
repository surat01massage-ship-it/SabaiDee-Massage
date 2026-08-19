const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};
console.log("Customer to SFT001: " + getDistance(13.7563, 100.5018, 13.779743, 100.544773));
console.log("Customer to SFT002: " + getDistance(13.7563, 100.5018, 13.803455, 100.569421));
console.log("Customer to SFT003: " + getDistance(13.7563, 100.5018, 13.776123, 100.575892));
