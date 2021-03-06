require("dotenv").config() // allows to define env varibles in .env file

const env = process.env.NODE_ENV || "development"

const config = {
  ENV: env,
  MAILGUN_API_KEY: process.env.MAILGUN_API_KEY,
  MAILGUN_DOMAIN: process.env.MAILGUN_DOMAIN
}

switch (env) {
  case "development":
    config.PORT = parseInt(process.env.DEV_APP_PORT, 10) || 3100
    config.MONGODB_URI =
      process.env.DEV_MONGODB_URI || "mongodb://localhost:27017/goodspot"
    break

  case "test":
    config.PORT = parseInt(process.env.TEST_APP_PORT, 10) || 3101
    config.MONGODB_URI =
      process.env.TEST_MONGODB_URI || "mongodb://localhost:27017/goodspot-test"
    break

  case "production":
    config.PORT = parseInt(process.env.PORT, 10)
    config.MONGODB_URI = process.env.MONGODB_URI
    break

  default:
    console.error(
      `${env} is not a recognized NODE_ENV (only development, test and production are accepted)`
    )
}

module.exports = config
