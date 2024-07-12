import React, { useState, useEffect } from "react";
import useGeolocation from "./useGeolocation";
import useLocationDetails from "./useLocationDetails";
import "./App.css";

export default function App() {
  const [mapImageUrl, setMapImageUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [generatedUrl, setGeneratedUrl] = useState("");
  const {
    isLoading,
    position: { lat, lng },
    error,
    getPosition,
  } = useGeolocation();

  const { country, city, postcode } = useLocationDetails(lat, lng);

  useEffect(() => {
    if (lat && lng) {
      const mapUrl = `https://maps.openstreetmap.org/export/embed.html?bbox=${
        lng - 0.01
      },${lat - 0.01},${lng + 0.01},${
        lat + 0.01
      }&layer=mapnik&marker=${lat},${lng}`;
      setMapImageUrl(mapUrl);
    }
  }, [lat, lng]);

  useEffect(() => {
    const generateSearchUrl = () => {
      const baseUrl = "https://nominatim.openstreetmap.org/search.php";
      const params = {
        city: city,
        street: searchQuery,
        country: country,
        // postalcode: postcode,
        "accept-language": "en",
        format: "jsonv2",
      };

      const queryString = Object.keys(params)
        .map((key) => `${key}=${params[key]}`)
        .filter((value) => value !== "=")
        .join("&");

      const finalUrl = `${baseUrl}?${queryString}`;
      setGeneratedUrl(finalUrl);
    };

    generateSearchUrl();
  }, [searchQuery, country, city, postcode]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    const fetchNearbyPlaces = async () => {
      if (!generatedUrl) return;
      try {
        const response = await fetch(generatedUrl);
        const data = await response.json();
        setNearbyPlaces(data);
      } catch (error) {
        console.error("Error fetching nearby places:", error);
      }
    };

    fetchNearbyPlaces();
  }, [generatedUrl]);

  return (
    <div>
      <h1>Geolocation App</h1>
      <button onClick={getPosition} disabled={isLoading}>
        {isLoading ? "Getting your position..." : "Get my position"}
      </button>
      {error && <p>Error: {error}</p>}

      {!isLoading && lat && (
        <>
          <div>
            <h2>Your Location Details</h2>
          </div>
          <div>
            <p>Country: {country}</p>
            <p>City: {city}</p>
            <p>Postcode: {postcode}</p>
          </div>
          {/* <p>
            Generated URL:{" "}
            <a href={generatedUrl} target="_blank" rel="noopener noreferrer">
              {generatedUrl}
            </a>
          </p> */}
          <p class="gps">
            Your GPS position:{" "}
            <a
              target="_blank"
              rel="noreferrer"
              href={`https://www.openstreetmap.org/#map=16/${lat}/${lng}`}
            >
              {lat}, {lng}
            </a>
          </p>
          <p>
            <iframe
              width="400"
              height="250"
              frameBorder="0"
              scrolling="no"
              marginHeight="0"
              marginWidth="0"
              src={mapImageUrl}
              title="Map"
            ></iframe>
          </p>

          <p>
            Search for nearby places:
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Enter a place / streets (e.g. KFC, IKEA, Nordborggade)"
            />
          </p>
        </>
      )}
      {searchQuery && (
        <>
          <h2>Nearby Places</h2>
          <ul>
            {Array.isArray(nearbyPlaces) && nearbyPlaces.length > 0 ? (
              nearbyPlaces.map((place) => (
                <li key={place.place_id}>
                  <strong>{place.name}</strong>
                  <br />
                  {place.display_name}
                  <br />
                  <a
                    href={`https://www.openstreetmap.org/#map=16/${place.lat}/${place.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Map
                  </a>
                </li>
              ))
            ) : (
              <li>No nearby places found.</li>
            )}
          </ul>
        </>
      )}
    </div>
  );
}
