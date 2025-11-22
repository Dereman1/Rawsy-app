import { firebaseAdmin } from "../config/firebase.config";
import Notification from "../modules/notifications/notification.model";
import User from "../modules/auth/auth.model";
import { userInfo } from "os";
/**
 * 🔔 SEND PUSH NOTIFICATION TO DEVICE(s)
 */
export const sendPushNotification = async (
  deviceTokens: string[],
  title: string,
  body: string,
  data: Record<string, any> = {}
) => {
  try {
    if (!deviceTokens || deviceTokens.length === 0) return;

    const message = {
      notification: { title, body },
      data: { ...data },
      tokens: deviceTokens,
    };

    await firebaseAdmin.messaging().sendEachForMulticast(message);
  } catch (err) {
    console.error("🔥 Push Notification Error:", err);
  }
};

/**
 * 💾 SAVE NOTIFICATION IN DATABASE
 */
export const saveNotification = async (
  userId: string,
  type:
    | "order_placed"
    | "order_confirmed"
    | "order_rejected"
    | "order_cancelled"
    | "order_in_transit"
    | "order_delivered"
    | "payment_completed"
    | "quote_requested"
    | "quote_countered"
    | "quote_accepted"
    | "quote_rejected"
    | "quote_cancelled"
    | "quote_buyer_accepted"
    | "quote_converted"
    | "discount_started"
    | "back_in_stock"
    | "price_drop"
    | "ticket_created"
    | "ticket_resolved"
    | "ticket_replied"
    | "message",
  title: string,
  message: string,
  data: Record<string, any> = {}
) => {
  try {
    await Notification.create({
      user: userId,
      type,
      title,
      message,
      data,
    });
  } catch (err) {
    console.error("🔥 Save Notification Error:", err);
  }
};

/**
 * 🔔 Save + Push Helper
 */
export const notifyUser = async (
  user: any,
  type:
    | "order_placed"
    | "order_confirmed"
    | "order_in_transit"
    | "order_rejected"
    | "order_cancelled"
    | "order_in_transit"
    | "order_delivered"
    | "payment_completed"
    | "quote_requested"
    | "quote_countered"
    | "quote_accepted"
    | "quote_rejected"
    | "quote_cancelled"
    | "quote_buyer_accepted"
    | "quote_converted"
    | "message",
  title: string,
  message: string,
  data: Record<string, any> = {}
) => {
  if (!user) return;

  // Save DB notification
  await saveNotification(String(user._id), type, title, message, data);

  // If user has push tokens → send push
  if (Array.isArray(user.deviceTokens) && user.deviceTokens.length > 0) {
    await sendPushNotification(user.deviceTokens, title, message, data);
  }
};
export const notifyWishlistUsers = async (
  product: any,
  change: { type: "price_drop" | "back_in_stock"; oldPrice?: number; newPrice?: number }
) => {
  try {
    // find users who have this product in wishlist
    const user = await User.find({ wishlist: product._id }).select("deviceTokens name email");

    if (!user || user.length === 0) return;

    const title = change.type === "price_drop"
      ? `Price drop: ${product.name}`
      : `Back in stock: ${product.name}`;

    const message =
      change.type === "price_drop"
        ? `${product.name} price dropped from ${change.oldPrice} to ${change.newPrice}`
        : `${product.name} is back in stock`;

    const data = {
      productId: product._id.toString(),
      type: change.type,
      ...(change.oldPrice ? { oldPrice: String(change.oldPrice) } : {}),
      ...(change.newPrice ? { newPrice: String(change.newPrice) } : {})
    };

    // Save DB notification per user
    const ops = user.map((u: any) =>
      Notification.create({
        user: u._id,
        type: change.type,
        title,
        message,
        data
      })
    );
    await Promise.all(ops);

    // Push notifications for users who have device tokens
    const tokens: string[] = [];
    user.forEach((u: any) => {
      if (Array.isArray(u.deviceTokens) && u.deviceTokens.length) {
        tokens.push(...u.deviceTokens);
      }
    });

    if (tokens.length > 0) {
      // reuse your sendPushNotification
      await sendPushNotification(tokens, title, message, data);
    }

  } catch (err) {
    console.error("notifyWishlistUsers error:", err);
  }
};