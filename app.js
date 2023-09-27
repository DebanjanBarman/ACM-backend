const express = require("express");
const cors = require("cors");

const productRouter = require("./routes/productRoutes");
const userRouter = require("./routes/userRoutes");
const purchaseRouter = require('./routes/purchaseRoutes')
const {webhookController} = require('./controllers/purchaseController')


const app = express();

//Stripe Webhook
app.post('/stripe-webhook', express.raw({type: 'application/json'}), webhookController);

//Global Middleware
app.use(express.json({limit: "100kb"}));
app.use(cors({origin: "*"}));

// Routes
app.use("/api/products", productRouter);
app.use("/api/users", userRouter);
app.use("/api/purchases", purchaseRouter);


app.all("*", (req, res) => {
    res.status(404).json({
        status: "failed",
        message: `Can't find ${req.originalUrl} on the server`
    })
});

module.exports = app;
