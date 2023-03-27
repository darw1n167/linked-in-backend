import dotenv from "dotenv";
import express from "express";
import { Redis } from "ioredis";
import cors from "cors";
import cookieParser from "cookie-parser";
import postgres from "postgres";
import corsOptions from "./config/corsOptions.js";
import registerController from "./middleware/registerController.js";
import loginController from "./middleware/loginController.js";
import validation from "./middleware/validation.js";
import authorization from "./middleware/authorization.js";
import refreshTokenController from "./middleware/refreshTokenController.js";
import logoutController from "./middleware/logoutController.js";
import cacheController from "./utils/cacheController.js";

dotenv.config();
const PORT = process.env.PORT;
const sql = postgres(process.env.DATABASE_URL);
export const cache = new Redis(process.env.REDIS_URL);
export const DEFAULT_CACHE_EXPIRATION = 3600;
const app = express();

// Middleware - Cross-Origin Resource Sharing
app.use(cors(corsOptions));
// Middleware - json data
app.use(express.json());
// Middleware - cookies
app.use(cookieParser());

// Serves static files
// app.use(express.static("../iceberg/dist")); // TODO: Adjust for production build folder

//Routes
app.route("/register").post(validation, registerController);

app.route("/login").post(validation, loginController);

app.route("/refresh").get(refreshTokenController);

app.route("/logout").get(logoutController);

// PRIVATE ROUTES - requires authorization via middleware using jwt tokens
app.route("/profile").get(authorization, async (req, res) => {
  try {
    // const { id } = req.params;
    const profile = await cacheController(`1`, async () => {
      const data = await sql`SELECT * FROM profiles `;
      console.log(data);
      return data;
    });
    res.json(profile);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "server error" });
  }
});

app.route("/company").get(authorization, async (req, res) => {
  try {
    const data = await sql`SELECT * FROM organizations;`;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "server error" });
  }
});

app.route("/connections").get(authorization, async (req, res) => {
  try {
    const data = await sql`SELECT * FROM poss_connections`;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.route("/viewed").get(authorization, async (req, res) => {
  try {
    const data = await sql`SELECT * FROM people_viewed`;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.route("/mutualconnections").get(authorization, async (req, res) => {
  try {
    const data = await sql`SELECT * FROM mutual_connections`;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.route("/experience").get(authorization, async (req, res) => {
  try {
    const result = await sql`SELECT * FROM organizations;`;
    res.json(result);
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.route("/skills").get(authorization, async (req, res) => {
  try {
    const data =
      await sql`SELECT * FROM skills JOIN organizations ON skills.org_ref = organizations.org_id`;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "server error" });
  }
});

// Server listen
app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});
