import mongoose, { Document, Model } from "mongoose";

export interface IInventory {
    name: string;
    num_items: number;
    hidden: boolean;
}

export interface IInventoryDocument extends IInventory, Document {
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new mongoose.Schema<IInventoryDocument>(
  {
    name: {
        type: String,
        required: true,
    },
    num_items: {
        type: Number,
        required: true,
    },
    hidden: {
        type: Boolean,
        required: true,
    }
  },
  {
    // Automatically add 'createdAt' and 'updatedAt' fields to the document
    timestamps: true,
  }
);

const Inventory: Model<IInventoryDocument> =
  mongoose.models?.Inventory || mongoose.model("Inventory", eventSchema);

export default Inventory;