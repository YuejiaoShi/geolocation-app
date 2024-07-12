import { useState, useEffect } from "react";

const useLocationDetails = (lat, lng) => {
  const [location, setLocation] = useState({
    country: "",
    city: "",
    postcode: "",
  });

  useEffect(() => {
    const fetchLocationData = async () => {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`;
      try {
        const response = await fetch(url);
        const data = await response.json();
        setLocation({
          country: data.address.country,
          city: data.address.city || data.address.town || "N/A",
          postcode: data.address.postcode || "N/A",
        });
      } catch (error) {
        console.error("Error fetching location data:", error);
      }
    };

    fetchLocationData();
  }, [lat, lng]);

  return {
    country: location.country,
    city: location.city,
    postcode: location.postcode,
  };
};

export default useLocationDetails;
