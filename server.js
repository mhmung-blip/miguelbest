const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// Only allow destinations you explicitly add here.
const ALLOWED_HOSTS = [
  "example.com",
  "api.example.com"
];

app.use(express.static("public"));

app.get("/proxy", async (req, res) => {
  try {
    const target = req.query.url;

    if (!target) {
      return res.status(400).json({
        error: "Missing ?url="
      });
    }

    const url = new URL(target);

    if (!["http:", "https:"].includes(url.protocol)) {
      return res.status(400).json({
        error: "Only HTTP and HTTPS URLs are allowed."
      });
    }

    if (!ALLOWED_HOSTS.includes(url.hostname)) {
      return res.status(403).json({
        error: "This domain is not allowed."
      });
    }

    const response = await fetch(url);

    const contentType = response.headers.get("content-type");
    if (contentType) {
      res.set("content-type", contentType);
    }

    res.status(response.status);
    res.send(Buffer.from(await response.arrayBuffer()));

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Proxy request failed."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});
