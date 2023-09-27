const Product = require("../models/productModel");
const Purchase = require("../models/purchaseModel");


exports.getAllProducts = async (req, res, next) => {

    const products = await Product.find();

    return res.status(200).json({
        message: "success", products,
    });
}

exports.getProduct = async (req, res,) => {

    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                status: "failed", message: "product not found"
            })
        }

        return res.status(200).json({
            message: "success", product,
        });
    } catch (err) {
        return res.status(500).json({
            status: 'failed',
            message: "Internal server error"
        })
    }


};

exports.createProduct = async (req, res, next) => {
    let product = req.body;
    product.id = undefined;
    const newProduct = await Product.create(product);

    return res.status(201).json({
        message: "success", data: newProduct
    });
};

