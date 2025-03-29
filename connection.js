require("dotenv").config();
const mongoose = require("mongoose");
const logger = require("pino")({ module: "mongodb" });

const env = process.env;

async function connect() {
  try {
    mongoose.connection.on("connected", function () {
      logger.info("MongoDB: Connected");
    });

    mongoose.connection.on("error", function (err) {
      logger.error("MongoDB: " + err);
    });

    mongoose.connection.on("disconnected", function () {
      logger.warn("MongoDB: Disconnected");
    });

    ["SIGINT", "SIGTERM", "SIGQUIT"].forEach((signal) =>
      process.on(signal, () => {
        mongoose.connection.close();
        logger.info("MongoDB: Connection closed through app termination");
        process.exit(0);
      })
    );

    let uri;
    if (process.env.NODE_ENV === "dev") {
      uri = `mongodb://${env.MONGODB_USER}:${env.MONGODB_PASSWORD}@${env.MONGODB_HOST}`;
    } else {
      uri = `mongodb+srv://${env.MONGODB_USER}:${env.MONGODB_PASSWORD}@${env.MONGODB_HOST}/${env.MONGODB_DB}?retryWrites=true&w=majority`;
    }

    await mongoose.connect(uri, {
      useUnifiedTopology: true, // Use the new URL parser by default
    });

    logger.info("MongoDB: Connection established successfully");
  } catch (error) {
    logger.error("MongoDB: Connection error - " + error.message);
    throw error; // Rethrow the error for higher-level handling
  }
}

module.exports = connect();
