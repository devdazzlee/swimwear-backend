import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import Stripe from "stripe";
import { SiteStatus } from "./Models/toogle.js";

const app = express();
const port = 8000;

const corsOptions = {
  origin: ["https://swimwear-rouge.vercel.app", "http://localhost:3000" , "http://localhost:3001/" , "https://dashboard-p679.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Initialize Stripe with your secret key
// IMPORTANT: Replace these with your actual Stripe keys from your Stripe dashboard
// For testing: Use test keys (sk_test_...)
// For production: Use live keys (sk_live_...)

// Use environment variable for security
const stripeSecretKey =
  "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";
const stripe = new Stripe(stripeSecretKey);

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(bodyParser.json());
app.use(express.json());

app.options("*", cors());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ahmed.radiantcortex@gmail.com",
    pass: "mreljejirzhndetb",
  },
});

app.get("/", (req, res) => {
  res.send("Server Start Successfully!!!");
});

// Test Stripe connection
app.get("/api/test-stripe", async (req, res) => {
  try {
    console.log("Testing Stripe connection...");
    const account = await stripe.accounts.retrieve();
    console.log("Stripe connection successful");
    res.json({
      success: true,
      message: "Stripe connection successful",
      accountId: account.id,
    });
  } catch (error) {
    console.error("Stripe connection failed:", error);
    res.status(500).json({
      success: false,
      error: "Stripe connection failed",
      details: error.message,
    });
  }
});

app.post("/api/messages", (req, res) => {
  const { name, email, phone, date, message } = req.body;
  console.log(name);
  console.log(email);
  console.log(phone);
  console.log(date);
  console.log(message);

  // Validate input
  if (!name || !email || !phone || !date || !message) {
    return res
      .status(400)
      .json({ error: "Please provide all required fields." });
  }

  const mailOptions = {
    from: "ahmed.radiantcortex@gmail.com",
    to: "contact@amzvistas.com", // Replace with the recipient's email
    subject: "Your Exclusive Invitation Inside",
    html: `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              color: #333;
            }

            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #fff;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }

            h1 {
              color: #007BFF;
            }

            p {
              line-height: 1.6;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Contact Client</h1>

            <h2>Contact Information:</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone Number:</strong> ${phone}</p>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
          </div>
        </body>
      </html>
    `,
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error:", error);
      return res.status(500).send(error.toString());
    }

    console.log("Email sent:", info.response);
    res.status(200).json({ message: "Message successfully sent." });
  });
});

// Stripe payment endpoint
app.post("/api/create-payment-intent", async (req, res) => {
  try {
    console.log("Received payment request:", req.body);
    const { amount, currency = "usd" } = req.body;

    if (!amount || amount <= 0) {
      console.log("Invalid amount received:", amount);
      return res.status(400).json({ error: "Invalid amount" });
    }

    console.log(
      "Creating payment intent for amount:",
      amount,
      "currency:",
      currency
    );

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log("Payment intent created successfully:", paymentIntent.id);
    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    console.error("Error details:", {
      type: error.type,
      message: error.message,
      code: error.code,
    });
    res.status(500).json({
      error: "Failed to create payment intent",
      details: error.message,
    });
  }
});

// GET current site status
app.get("/api/site-status", async (req, res) => {
  try {
    let doc = await SiteStatus.findById("siteStatus");
    if (!doc) {
      doc = await SiteStatus.create({ _id: "siteStatus", isLive: true });
    }
    res.json({ isLive: doc.isLive });
  } catch (error) {
    console.error("Error fetching site status:", error);
    res.status(500).json({ error: "Failed to fetch site status" });
  }
});

// POST to update site status
app.post("/api/site-status", async (req, res) => {
  try {
    const { live } = req.body;
    if (typeof live !== "boolean") {
      return res.status(400).json({ success: false, message: "Invalid value" });
    }
    await SiteStatus.findByIdAndUpdate(
      "siteStatus",
      { isLive: live },
      { upsert: true }
    );
    res.json({ success: true, isLive: live });
  } catch (error) {
    console.error("Error updating site status:", error);
    res.status(500).json({ error: "Failed to update site status" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
