const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.ObjectId,
            ref: 'product',
            required: [true, "Purchase must belong to a product"],
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, "Purchase must belong to a User"],
        },
        price: {
            type: Number,
            required: [true, 'Purchase must have a price']
        },
        createdAt: {
            type: Date,
            default: Date.now()
        },
        paid: {
            type: Boolean,
            default: true
        }
    });


const Purchase = mongoose.model("Purchase", purchaseSchema);
module.exports = Purchase;
