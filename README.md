# Goodspot

yarn <!-- install packages -->

yarn run seed <!-- seed -->

yarn start <!-- start production server -->

yarn run dev <!-- start dev server (with nodemon)-->

yarn test <!-- run tests -->
you can run only the test you want with --grep yourKeyWord

yarn run testCover <!-- run test with cover -->

A mailgun API and domain is needed to use mail (for signup and password recovery)
It should be in a .env file :
MAILGUN_API_KEY = "your api key"
MAILGUN_DOMAIN = "your domain"

You can also choose your port and mongoDB uri with the env variables:
DEV_APP_PORT
DEV_MONGODB_URI

TEST_APP_PORT
TEST_MONGODB_URI

in production :
PROD_MONGODB_URI
