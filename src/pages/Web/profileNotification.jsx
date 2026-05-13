import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Card, ListGroup, Row, Col, Container } from "react-bootstrap";
import { Switch, Typography, Box, Divider, Stack } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
const ProfileNotification = () => {
  const [enableAuth, setEnableAuth] = useState(false);
  const [otpAuth, setOtpAuth] = useState(true);
  const [emailAuth, setEmailAuth] = useState(false);

  return (
    <>
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 600, mb: 1, fontSize: 20 }}
      >
        Common
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontSize: 18 }}>
          General Notification
        </Typography>
        <Switch
          checked={enableAuth}
          onChange={() => setEnableAuth(!enableAuth)}
          color="primary"
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        {" "}
        <Typography variant="subtitle1" sx={{ fontSize: 18 }}>
          Sound
        </Typography>
        <Switch
          checked={otpAuth}
          onChange={() => setOtpAuth(!otpAuth)}
          color="primary"
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontSize: 18 }}>
          Vibrate
        </Typography>
        <Switch
          checked={emailAuth}
          onChange={() => setEmailAuth(!emailAuth)}
          color="primary"
        />
      </Box>

      <Divider sx={{ my: 2, border: "1px solid #434343" }} />

      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 600, mb: 1, fontSize: 20 }}
      >
        System & services update
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontSize: 18 }}>
          App updates
        </Typography>
        <Switch
          checked={enableAuth}
          onChange={() => setEnableAuth(!enableAuth)}
          color="primary"
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        {" "}
        <Typography variant="subtitle1" sx={{ fontSize: 18 }}>
          Bill Reminder
        </Typography>
        <Switch
          checked={otpAuth}
          onChange={() => setOtpAuth(!otpAuth)}
          color="primary"
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontSize: 18 }}>
          Promotion
        </Typography>
        <Switch
          checked={emailAuth}
          onChange={() => setEmailAuth(!emailAuth)}
          color="primary"
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontSize: 18 }}>
          Discount Available
        </Typography>
        <Switch
          checked={emailAuth}
          onChange={() => setEmailAuth(!emailAuth)}
          color="primary"
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontSize: 18 }}>
          Payment Request
        </Typography>
        <Switch
          checked={emailAuth}
          onChange={() => setEmailAuth(!emailAuth)}
          color="primary"
        />
      </Box>
    </>
  );
};

export default ProfileNotification;
