const dotenv = require("dotenv");
const mongoose = require("mongoose");

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION shutting down')
    console.log(err.name, err.message, err)
    process.exit(1)
})

dotenv.config({path: "./config.env"});

const app = require("./app");

const DB = process.env.DATABASE;

console.log(DB);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log("DB connection successful");
    })
    .catch((err) => {
        console.log(err)
        console.log("DB connection failed");
    });

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Listening to port ${PORT}`);
});

process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION shutting down')
    console.log(err.name, err.message)
    server.close(() => {
        process.exit(1)
    })
})
