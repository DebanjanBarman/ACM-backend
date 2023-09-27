const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    title: {
        type: String, required: [true, "Product title is required"],
    },
    rating: {
        rate: {
            type: Number, required: "Rating is required",
        },
        count: {
            type: Number, required: "Rating Count is required",
        },
    },

    image: {
        type: String, required: "Image is required"
    },
    category: {
        type: String, required: "Category is required",
    },
    description: {
        type: String, required: "Description is required"
    },
    price: {
        type: Number, required: "Price is required",
    }
}, {
    toJSON: {virtuals: true}, toObject: {virtuals: true},
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
