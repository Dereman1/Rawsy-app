import { Schema, model } from "mongoose";

const ProductSchema = new Schema(
  {
    supplier: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    name: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },

    price: { type: Number, required: true },
    unit: { type: String, required: true }, // kg, ton, liter, etc.
    stock: { type: Number, required: true },
     discount: {
  percentage: { type: Number, default: 0 }, // e.g., 20%
  active: { type: Boolean, default: false },
  expiresAt: { type: Date, default: null }
},
    // 🌤️ Cloudinary image URL (final saved URL)
    image: { type: String, default: null },

    // 🖼️ Optional future support for multiple photos (not active yet)
    images: { type: [String], default: [] },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    },
    rating: {
  average: { type: Number, default: 0 },
  count: { type: Number, default: 0 }
},
negotiable: { type: Boolean, default: false }
  }, 
  { timestamps: true }
);
ProductSchema.virtual('finalPrice').get(function () {
  if (this.discount?.active && this.discount.percentage > 0) {
    return this.price - (this.price * this.discount.percentage) / 100;
  }
  return this.price;
});
ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

export default model("Product", ProductSchema);
