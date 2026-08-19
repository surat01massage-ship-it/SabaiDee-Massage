const fs = require('fs');
let content = fs.readFileSync('src/components/StaffPanel.tsx', 'utf8');

const targetStr = `  // Simulate automatic GPS updater if online (Available: ON)
  useEffect(() => {
    if (!staff || staff.Available !== 'ON') return;

    const gpsTimer = setInterval(() => {
      // Small simulated drift representing massage staff driving/traveling slightly in Bangkok (approx. 0.0005 deviation)
      const deltaLat = (Math.random() - 0.5) * 0.001;
      const deltaLng = (Math.random() - 0.5) * 0.001;
      const newLat = staff.CurrentLatitude + deltaLat;
      const newLng = staff.CurrentLongitude + deltaLng;

      fetch('/api/staff/location', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId: staff.StaffID,
          latitude: newLat,
          longitude: newLng
        })
      }).then(() => {
        // Soft refresh local staff details
        const updated = { ...staff, CurrentLatitude: newLat, CurrentLongitude: newLng };
        onUpdateStaffData(updated);
        console.log("Simulated Staff GPS ping sent: ", newLat, newLng);
      }).catch(e => console.error(e));

    }, 15000); // Send GPS signal every 15 seconds (reduced from 30s for demo interactivity)

    return () => clearInterval(gpsTimer);
  }, [staff?.Available, staff?.StaffID]);`;

const replacement = `  // Real GPS updater if online (Available: ON)
  useEffect(() => {
    if (!staff || staff.Available !== 'ON') return;

    const updateLocationToServer = (lat: number, lng: number) => {
      fetch('/api/staff/location', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId: staff.StaffID,
          latitude: lat,
          longitude: lng
        })
      }).then(() => {
        const updated = { ...staff, CurrentLatitude: lat, CurrentLongitude: lng };
        onUpdateStaffData(updated);
      }).catch(console.error);
    };

    // 1. Force location check right now
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => updateLocationToServer(pos.coords.latitude, pos.coords.longitude),
        (err) => console.error("Staff GPS init error:", err),
        { enableHighAccuracy: true }
      );
    }

    // 2. Poll every 15s to update real location
    const gpsTimer = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => updateLocationToServer(pos.coords.latitude, pos.coords.longitude),
          (err) => console.error("Staff GPS poll error:", err),
          { enableHighAccuracy: true }
        );
      }
    }, 15000);

    return () => clearInterval(gpsTimer);
  }, [staff?.Available, staff?.StaffID]);`;

content = content.replace(targetStr, replacement);
fs.writeFileSync('src/components/StaffPanel.tsx', content);
