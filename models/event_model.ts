import mongoose, { Document, Model } from "mongoose";

export interface IEvents {
    name: string,
    description: string,
    date_event: Date,
}

export interface IEventsDocument extends IEvents, Document {
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new mongoose.Schema<IEventsDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    date_event: {
      type: Date,
      required: true,
    }
  },
  {
    // Automatically add 'createdAt' and 'updatedAt' fields to the document
    timestamps: true,
  }
);

const Events = (mongoose.models?.Events as Model<IEventsDocument>) || 
  mongoose.model<IEventsDocument>("Events", eventSchema);

export default Events;