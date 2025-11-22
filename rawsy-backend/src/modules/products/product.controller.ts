import { Request, Response } from "express";
import Product from "./product.model";
import { notifyWishlistUsers } from "../../services/notification.service";
/**
 * -------------------------------
 *  CREATE PRODUCT (Supplier only)
 * -------------------------------
 */
export const createProduct = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { name, description, category, price, unit, stock, negotiable } = req.body;

    if (!name || !category || !price || !unit || stock == null) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const product = await Product.create({
      supplier: user.id,
      name,
      description,
      category,
      price,
      unit,
      stock,
      negotiable: negotiable ?? false // default false
    });

    return res.json({ message: "Product created successfully", product });

  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};


/**
 * -------------------------------
 *  GET PRODUCT BY ID (Public)
 * -------------------------------
 */
export const getProductById: any = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id)
      .populate("supplier", "name companyName phone averageRating verifiedSupplier");

    if (!product) return res.status(404).json({ error: "Product not found" });

    return res.json(product);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};


/**
 * -------------------------------
 *  GET ALL PRODUCTS (Public)
 * -------------------------------
 */
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find()
      .populate("supplier", "name companyName phone averageRating verifiedSupplier");

    return res.json(products);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};


/**
 * -------------------------------
 *  GET MY PRODUCTS (Supplier Only)
 * -------------------------------
 */
export const getMyProducts = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const products = await Product.find({ supplier: user.id });

    return res.json(products);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};


/**
 * -------------------------------
 *  UPDATE PRODUCT (Supplier-Only)
 * -------------------------------
 */
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const productId = req.params.id;

    // fetch existing product first (so we can compare)
    const oldProduct: any = await Product.findById(productId);
    if (!oldProduct) return res.status(404).json({ error: "Product not found" });

    // ownership
    if (oldProduct.supplier.toString() !== user.id) {
      return res.status(403).json({ error: "You cannot update this product" });
    }

    // allowed updates (same as before)
    const allowedFields = ["name", "description", "category", "price", "unit", "stock", "negotiable"];
    const data: any = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) data[key] = req.body[key];
    }

    // perform update and get the new doc
    const updated = await Product.findByIdAndUpdate(productId, data, { new: true }).lean();

    // Compare old vs new and trigger wishlist notifications
    try {
      if (!updated) throw new Error("Updated product not found");
      // price drop
      if (typeof oldProduct.price === "number" && typeof updated.price === "number") {
        if (updated.price < oldProduct.price) {
          await notifyWishlistUsers(updated, {
            type: "price_drop",
            oldPrice: oldProduct.price,
            newPrice: updated.price
          });
        }
      }

      // back in stock (0 -> >0)
      const oldStock = typeof oldProduct.stock === "number" ? oldProduct.stock : null;
      const newStock = typeof updated.stock === "number" ? updated.stock : null;
      if ((oldStock === 0 || oldStock === null) && newStock && newStock > 0) {
        await notifyWishlistUsers(updated, { type: "back_in_stock" });
      }
    } catch (notifyErr) {
      console.warn("Wishlist notification failed (non-fatal):", notifyErr);
    }

    return res.json({
      message: "Product updated successfully",
      product: updated
    });

  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};


/**
 * -------------------------------
 *  DELETE PRODUCT (Supplier Only)
 * -------------------------------
 */
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    if (product.supplier.toString() !== user.id) {
      return res.status(403).json({ error: "You cannot delete this product" });
    }

    await Product.findByIdAndDelete(productId);

    return res.json({ message: "Product deleted successfully" });

  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};


/**
 * -------------------------------
 *  TOP RATED PRODUCTS
 * -------------------------------
 */
export const getTopRatedProducts = async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 10;

    const products = await Product.find()
      .sort({ averageRating: -1, reviewCount: -1 })
      .limit(limit)
      .select("name category price unit images thumbnail supplier stock averageRating reviewCount")
      .populate("supplier", "name companyName verifiedSupplier");

    return res.json({ products });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};


/**
 * -------------------------------
 *  SEARCH & FILTER PRODUCTS
 * -------------------------------
 */
export const searchProducts = async (req: Request, res: Response) => {
  try {
    const {
      q,
      category,
      negotiable,
      minPrice,
      maxPrice,
      supplierRating,
      verifiedSupplier,
      inStock,
      nearLat,
      nearLng,
      maxDistance = 15, // km default
      page = 1,
      limit = 12
    } = req.query;

    const filter: any = {};

    // 🔍 Keyword search
    if (q) filter.name = { $regex: q as string, $options: "i" };

    if (category) filter.category = category;
    if (negotiable === "true") filter.negotiable = true;

    // 💰 Price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // 📦 Only products with stock > 0
    if (inStock === "true") filter.stock = { $gt: 0 };

    // ⭐ Supplier filters (rating + verified)
    const supplierFilter: any = {};
    if (supplierRating) supplierFilter.averageRating = { $gte: Number(supplierRating) };
    if (verifiedSupplier === "true") supplierFilter.verifiedSupplier = true;

    const skip = (Number(page) - 1) * Number(limit);

    /**
     * 🚗 Nearby supplier filter logic
     * We cannot filter distance inside Mongo populate,
     * so we populate then filter manually.
     */
    let products = await Product.find(filter)
      .populate({
        path: "supplier",
        select: "name companyName averageRating verifiedSupplier businessLocation",
        match: supplierFilter
      })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // Remove products with no supplier match
    products = products.filter((p: any) => p.supplier);

    // 📍 Filter by distance if provided
    if (nearLat && nearLng) {
      const buyerLat = Number(nearLat);
      const buyerLng = Number(nearLng);

      products = products.filter((p: any) => {
        const coords = p?.supplier?.businessLocation?.coordinates;
        if (!coords?.lat || !coords?.lng) return false;

        const dist = getDistanceKm(buyerLat, buyerLng, coords.lat, coords.lng);
        return dist <= Number(maxDistance);
      });
    }

    return res.json({
      page: Number(page),
      total: products.length,
      pages: Math.ceil(products.length / Number(limit)),
      products
    });

  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// 🧮 Haversine distance formula
const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth radius km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};


