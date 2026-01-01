import { Schema, model, models, Document, Model, Types } from 'mongoose';
import { Event } from './event.model';

/**
 * Core shape of a Booking document (excluding Mongoose metadata).
 */
export interface BookingAttrs {
  eventId: Types.ObjectId;
  email: string;
}

/**
 * Booking document as stored in MongoDB, including timestamps.
 */
export interface BookingDocument extends BookingAttrs, Document {
  createdAt: Date;
  updatedAt: Date;
}

export type BookingModel = Model<BookingDocument>;

/**
 * Simple email validator to ensure a reasonably well-formed email address.
 */
const isValidEmail = (value: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value.trim());
};

const bookingSchema = new Schema<BookingDocument, BookingModel>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: isValidEmail,
        message: 'Booking email must be a valid email address.',
      },
    },
  },
  {
    timestamps: true,
    strict: true,
  },
);

// Index on eventId to speed up queries that filter by event.
bookingSchema.index({ eventId: 1 });

/**
 * Pre-save hook used to validate the booking:
 * - Ensures the referenced eventId points to an existing Event document.
 * - Re-validates the email format before persisting.
 */
bookingSchema.pre<BookingDocument>('save', async function () {
  try {
    if (!isValidEmail(this.email)) {
      throw new Error('Invalid email format for booking.');
    }

    const eventExists = await Event.exists({ _id: this.eventId });

    if (!eventExists) {
      throw new Error('Cannot create booking: referenced event does not exist.');
    }
  } catch (error) {
    throw error as Error;
  }
});

export const Booking: BookingModel =
  (models.Booking as BookingModel) || model<BookingDocument, BookingModel>('Booking', bookingSchema);
