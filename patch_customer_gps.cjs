const fs = require('fs');
let content = fs.readFileSync('src/components/CustomerPanel.tsx', 'utf8');

const target = `  // Set initial location from current location or user object
  useEffect(() => {
    if (currentUser) {
      // Default to the mock user's address location so they are always in range for testing
      setCustomerLat(currentUser.Latitude || 13.743122);
      setCustomerLng(currentUser.Longitude || 100.588421);
      if (currentUser.Address) {
        setCustomerAddress(currentUser.Address);
      }
    }
  }, [currentUser]);`;

const replacement = `  // Set initial location from current location or user object
  useEffect(() => {
    if (currentUser) {
      // Set to mock data temporarily until GPS loads
      setCustomerLat(currentUser.Latitude || 13.743122);
      setCustomerLng(currentUser.Longitude || 100.588421);
      if (currentUser.Address) {
        setCustomerAddress(currentUser.Address);
      }
      
      // Auto-fetch real location on mount
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCustomerLat(position.coords.latitude);
            setCustomerLng(position.coords.longitude);
            handleReverseGeocode(position.coords.latitude, position.coords.longitude);
          },
          (error) => {
            console.error("Auto GPS error:", error);
          },
          { enableHighAccuracy: true }
        );
      }
    }
  }, [currentUser]);`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/CustomerPanel.tsx', content);
