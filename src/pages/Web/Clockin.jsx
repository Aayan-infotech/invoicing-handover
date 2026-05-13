import React, { useState, useEffect } from "react";
import GoogleMapReact from "google-map-react";
import axiosInstance from "../../components/axiosInstance";
import { useOutletContext } from "react-router-dom";

// Marker component with accuracy circle
const LocationMarker = ({ lat, lng, accuracy, isTracking }) => (
  <div style={{ position: "relative" }}>
    {/* Accuracy circle - the blue translucent area */}
    {accuracy && (
      <div
        style={{
          position: "absolute",
          width: `${Math.min(accuracy, 200)}px`,
          height: `${Math.min(accuracy, 200)}px`,
          borderRadius: "50%",
          backgroundColor: "rgba(66, 133, 244, 0.15)",
          border: "2px solid rgba(66, 133, 244, 0.4)",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
    )}
    {/* Main marker pin - the blue dot in center */}
    <div
      style={{
        position: "absolute",
        width: "20px",
        height: "20px",
        borderRadius: "50%",
        backgroundColor: "#4285f4",
        border: "3px solid white",
        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        transform: "translate(-50%, -50%)",
        zIndex: 2,
        animation: isTracking ? "pulse 2s infinite" : "none",
      }}
    />
  </div>
);

// Route point component
const RoutePoint = ({ lat, lng }) => (
  <div
    style={{
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      backgroundColor: "#4285f4",
      border: "2px solid white",
      transform: "translate(-50%, -50%)",
      zIndex: 1,
    }}
  />
);

const ClockIn = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [route, setRoute] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
  const [zoom, setZoom] = useState(2);
  const { snackbar } = useOutletContext();

  const [clockData, setClockData] = useState({
    clockInTime: null,
    clockOutTime: null,
    totalHours: null,
    isClockedIn: false,
    userId: null,
    _id: null,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleLocationError = (error) => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        setError("User denied the request for Geolocation.");
        break;
      case error.POSITION_UNAVAILABLE:
        setError("Location information is unavailable.");
        break;
      case error.TIMEOUT:
        setError("The request to get user location timed out.");
        break;
      case error.UNKNOWN_ERROR:
        setError("An unknown error occurred.");
        break;
      default:
        setError("An error occurred while getting location.");
    }
    setIsTracking(false);
  };

  // Format time to readable format
  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Calculate total hours worked
  const calculateTotalHours = (clockInTime, clockOutTime = new Date()) => {
    if (!clockInTime) return "0H";

    const start = new Date(clockInTime);
    const end = clockOutTime ? new Date(clockOutTime) : new Date();
    const diffMs = end - start;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${diffHours}H/${diffMinutes}M`;
  };

  // Get clocking details from API
  const getClockedInData = async () => {
    try {
      const response = await axiosInstance.get("projects/get-clocking-details");
      if (response.data.success) {
        const data = response.data.data;
        setClockData({
          clockInTime: data.clockInTime,
          clockOutTime: data.clockOutTime,
          totalHours: calculateTotalHours(data.clockInTime, data.clockOutTime),
          isClockedIn: data.isClockedIn,
          userId: data.userId,
          _id: data._id,
        });
      }
    } catch (error) {
      console.error("Error fetching clock data:", error);
      // Don't show error for initial load, it might be normal if no clock-in exists
    }
  };

  // Start tracking automatically when component mounts
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setIsTracking(true);

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy, speed, heading } =
          position.coords;
        const newLocation = {
          lat: latitude,
          lng: longitude,
          accuracy: accuracy,
          speed: speed,
          heading: heading,
          timestamp: new Date().toLocaleTimeString(),
        };

        setLocation(newLocation);
        setMapCenter({ lat: latitude, lng: longitude });
        setZoom(15);

        setRoute((prevRoute) => [
          ...prevRoute,
          { lat: latitude, lng: longitude },
        ]);
      },
      (error) => {
        handleLocationError(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    setWatchId(id);

    // Load initial clock data
    getClockedInData();

    // Cleanup on unmount
    return () => {
      if (id) {
        navigator.geolocation.clearWatch(id);
      }
    };
  }, []);

  const handleClockIn = async () => {
    if (!location) {
      snackbar.error("Please wait for location to be available.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.post("projects/clock-in", {
        latitude: location.lat,
        longitude: location.lng,
      });

      if (response.data.success) {
        snackbar.success(response.data.message || "Clock-in successful");
        // Update local state with new clock-in data
        const data = response.data.data;
        setClockData({
          clockInTime: data.clockInTime,
          clockOutTime: data.clockOutTime,
          totalHours: calculateTotalHours(data.clockInTime, data.clockOutTime),
          isClockedIn: data.isClockedIn,
          userId: data.userId,
          _id: data._id,
        });
      }
    } catch (error) {
      snackbar.error(
        error.response?.data?.message || "Clock-in failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!location) {
      snackbar.error("Please wait for location to be available.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.post("projects/clock-out", {
        latitude: location.lat,
        longitude: location.lng,
      });

      if (response.data.success) {
        snackbar.success(response.data.message || "Clock-out successful");
        // Refresh clock data after clock-out
        await getClockedInData();
      }
    } catch (error) {
      snackbar.error(
        error.response?.data?.message || "Clock-out failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Update total hours in real-time when clocked in
  useEffect(() => {
    let interval;
    if (clockData.isClockedIn && clockData.clockInTime) {
      interval = setInterval(() => {
        setClockData((prev) => ({
          ...prev,
          totalHours: calculateTotalHours(prev.clockInTime),
        }));
      }, 60000); // Update every minute
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [clockData.isClockedIn, clockData.clockInTime]);

  return (
    <>
      <div
        className="d-flex flex-column container mt-4"
        style={{
          width: "100%",
          height: "calc(100vh - 40vh)",
        }}
      >
        <style>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(66, 133, 244, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(66, 133, 244, 0);
          }
        }
      `}</style>

        {error && (
          <div
            style={{
              padding: "15px",
              backgroundColor: "#fce8e6",
              color: "#d93025",
              textAlign: "center",
              fontWeight: "500",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ flex: 1, position: "relative" }}>
          <GoogleMapReact
            bootstrapURLKeys={{
              key: import.meta.env.VITE_GOOGLE_MAP_KEY || "",
              libraries: ["geometry", "places"],
            }}
            center={mapCenter}
            zoom={zoom}
            yesIWantToUseGoogleMapApiInternals
            onGoogleApiLoaded={({ map, maps }) => {
              // Map and maps instances available here
            }}
            options={{
              fullscreenControl: true,
              streetViewControl: false,
              mapTypeControl: true,
              zoomControl: true,
            }}
          >
            {location && (
              <LocationMarker
                lat={location.lat}
                lng={location.lng}
                accuracy={location.accuracy}
                isTracking={isTracking}
              />
            )}

            {route.map((point, index) => (
              <RoutePoint key={index} lat={point.lat} lng={point.lng} />
            ))}
          </GoogleMapReact>
        </div>
      </div>

      <div className="container">
        <div className="card bg-shift rounded-4 mt-4">
          <div className="card-body p-3">
            <div className="d-flex flex-row justify-content-between align-items-center gap-4">
              <div className="d-flex flex-row gap-2 align-items-center">
                <span className="fs-6">
                  {clockData.isClockedIn ? "Started Work At" : "Last Worked"}
                </span>
                <h3 className="fs-2 mb-0">
                  {clockData.clockInTime
                    ? formatTime(clockData.clockInTime)
                    : new Date().toDateString()}
                </h3>
              </div>

              <div className="d-flex flex-row gap-2 align-items-center">
                {/* <span className="fs-6">Shift</span>
                <h3 className="fs-2 mb-0">{clockData.totalHours || "0H/0H"}</h3> */}

                {clockData.isClockedIn ? (
                  <button
                    className="btn btn-clockout py-3"
                    style={{
                      minWidth: "300px",
                      backgroundColor: "#dc3545",
                      color: "white",
                    }}
                    onClick={handleClockOut}
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : "Clock-out"}
                    <i className="bi bi-arrow-right ms-2"></i>
                  </button>
                ) : (
                  <button
                    className="btn btn-clockin py-3"
                    style={{
                      minWidth: "300px",
                    }}
                    onClick={handleClockIn}
                    disabled={isLoading || !location}
                  >
                    {isLoading ? "Processing..." : "Clock-in"}
                    <i className="bi bi-arrow-right ms-2"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClockIn;
