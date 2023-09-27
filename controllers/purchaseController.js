const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const Product = require("../models/productModel");
const Purchase = require("./../models/purchaseModel");
const User = require("../models/userModel");


exports.getCheckoutSession = async (req, res, next) => {
    //1 Get currently purchased course
    const course = await Product.findById(req.params.courseID);

    //2 Create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        customer_email: req.user.email,
        client_reference_id: req.params.courseID,
        success_url: process.env.PAYMENT_SUCCESS_URL,
        cancel_url: process.env.PAYMENT_SUCCESS_URL,
        line_items: [
            {
                name: `${course.title}`,
                description: `${course.summary}`,
                images: [`${course.courseImage.url}`],
                amount: course.price * 100,
                currency: "inr",
                // price: process.env.PRICE_ID,
                quantity: 1,
            },
        ],
    });
    if (!session) {
        return next(new AppError("something went wrong", 500));
    }

    //3 send it to client
    res.status(200).json({
        status: "success",
        session,
    });
}

const purchased = async (session) => {
    const course = session.client_reference_id;
    const user = (await User.findOne({email: session.customer_email})).id;
    const price = session.amount_total / 100;
    await Purchase.create({course, user, price});
};

exports.webhookController = async (req, res, next) => {
    const signature = req.headers["stripe-signature"];
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, signature, secret);
    } catch (e) {
        return res.status(400).json(`Webhook error: ${e.message}`);
    }

    if (event.type === "checkout.session.completed") {
        purchased(event.data.object);
    }
    res.sendStatus(200);
};
