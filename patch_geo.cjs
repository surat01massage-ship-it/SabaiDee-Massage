const fs = require('fs');
let content = fs.readFileSync('src/components/CustomerPanel.tsx', 'utf8');

const targetStr = `  // Set initial location from current location or user object
  useEffect(() => {
    let isMounted = true;
    
    // Try to get current location first
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (isMounted) {
            setCustomerLat(position.coords.latitude);
            setCustomerLng(position.coords.longitude);
            // Reverse geocode to get address text for the search box
            fetch(\`https://nominatim.openstreetmap.org/reverse?format=json&lat=\${position.coords.latitude}&lon=\${position.coords.longitude}\`)
              .then(res => res.json())
              .then(data => {
                if (data && data.display_name && isMounted) {
                  setAddressSearchQuery(data.display_name);
                }
              })
              .catch(e => console.error("Reverse geocoding error:", e));
          }
        },
        (error) => {
          console.warn("Geolocation error:", error);
          // Fallback to user profile coordinates
          if (currentUser && isMounted) {
            setCustomerLat(currentUser.Latitude || 13.7563);
            setCustomerLng(currentUser.Longitude || 100.5018);
          }
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else if (currentUser && isMounted) {
      setCustomerLat(currentUser.Latitude || 13.7563);
      setCustomerLng(currentUser.Longitude || 100.5018);
    }

    return () => { isMounted = false; };
  }, [currentUser]);`;

const replacement = `  // Set initial location from current location or user object
  useEffect(() => {
    if (currentUser) {
      // Default to the mock user's address location so they are always in range for testing
      setCustomerLat(currentUser.Latitude || 13.7563);
      setCustomerLng(currentUser.Longitude || 100.5018);
    }
  }, [currentUser]);
  
  // Optional: Function to use real GPS location if needed
  const handleUseGPS = () => {
    if (navigator.geolocation) {
      onShowToast("กำลังหาตำแหน่งปัจจุบัน...", "info");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCustomerLat(position.coords.latitude);
          setCustomerLng(position.coords.longitude);
          onShowToast("อัปเดตตำแหน่งจาก GPS แล้ว", "success");
        },
        (error) => {
          console.warn("Geolocation error:", error);
          onShowToast("ไม่สามารถดึงตำแหน่ง GPS ได้", "error");
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  };`;

content = content.replace(targetStr, replacement);
fs.writeFileSync('src/components/CustomerPanel.tsx', content);
