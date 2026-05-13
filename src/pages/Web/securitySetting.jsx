import React, { useEffect, useState, useCallback } from "react";
import { ListGroup } from "react-bootstrap";
import { Switch, Typography, Box, Divider } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import axiosInstance from "../../components/axiosInstance";
import { useOutletContext } from "react-router-dom";

const SecuritySettings = () => {
  const { snackbar } = useOutletContext();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    is2FAEnabled: false,
    deviceDetails: [],
  });

  const getSessionData = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`users/security-setting`);
      if (response?.data) {
        setData(
          response.data.data || { is2FAEnabled: false, deviceDetails: [] }
        );
      }
    } catch (error) {
      snackbar.error(
        error?.response?.data?.message || "Error fetching security settings"
      );
    }
  }, [snackbar]);

  const toggle2FA = async () => {
    setLoading(true);
    try {
      // Toggle based on current data state
      const newStatus = !data.is2FAEnabled;

      const response = await axiosInstance.post("users/enable-disable-2fa", {
        status: newStatus ? "enable" : "disable",
      });

      if (response?.data) {
        // Update local state with the response data
        setData((prev) => ({
          ...prev,
          is2FAEnabled: response.data.data?.is2FAEnabled ?? newStatus,
        }));
        snackbar.success(response.data.message);
      }
    } catch (error) {
      snackbar.error(
        error?.response?.data?.message || "Error updating 2FA settings"
      );
      // Re-fetch to ensure UI is in sync with server
      await getSessionData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSessionData();
  }, [getSessionData]);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontSize: 18 }}>
          Authenticate via OTP
        </Typography>
        <Switch
          checked={data.is2FAEnabled}
          onChange={toggle2FA}
          disabled={loading}
          color="primary"
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 600, mb: 2, fontSize: 20 }}
      >
        Active Sessions
      </Typography>

      <ListGroup className="border-0">
        {data.deviceDetails?.map((session, index) => (
          <ListGroup.Item
            key={session._id}
            className="d-flex justify-content-between align-items-center"
            style={{
              border: "none",
              padding: "10px 0",
              background: "transparent",
            }}
          >
            <Box className="d-flex flex-column align-items-start align-items-lg-center gap-3">
              <Box className="d-flex flex-row justify-content-between align-items-center gap-3 w-100">
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 600, fontSize: 18 }}
                >
                  {session.deviceName}
                </Typography>
                <div className="d-block d-lg-none">
                  {session.isLoggedIn ? (
                    <CheckCircleIcon color="success" />
                  ) : (
                    <RadioButtonUncheckedIcon sx={{ color: "lightgray" }} />
                  )}
                </div>
              </Box>

              <Typography variant="body2" sx={{ color: "gray", fontSize: 18 }}>
                (Logged in at {new Date(session.createdAt).toLocaleString()})
              </Typography>
            </Box>
            <div className="d-none d-lg-block">
              {session.isLoggedIn ? (
                <CheckCircleIcon color="success" />
              ) : (
                <RadioButtonUncheckedIcon sx={{ color: "lightgray" }} />
              )}
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </>
  );
};

export default SecuritySettings;
