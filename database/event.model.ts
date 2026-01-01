import { Schema, model, models, Document, Model } from "mongoose";

/**
 * Core shape of an Event document (excluding Mongoose metadata).
 */
export interface EventAttrs {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // ISO date string (YYYY-MM-DD)
  time: string; // 24-hour time string (HH:MM)
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
}

/**
 * Event document as stored in MongoDB, including timestamps.
 */
export interface EventDocument extends EventAttrs, Document {
  createdAt: Date;
  updatedAt: Date;
}

// Use Mongoose's Model<EventDocument> directly instead of a redundant EventModel interface.

/**
 * Helper to ensure required string fields are non-empty after trimming.
 */
const nonEmptyString = (value: string): boolean => value.trim().length > 0;

/**
 * Normalize a string into a URL-safe slug.
 */
const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove non-alphanumeric chars
    .replace(/\s+/g, "-") // collapse whitespace to single dashes
    .replace(/-+/g, "-"); // collapse multiple dashes

/**
 * Normalize date string to ISO format (YYYY-MM-DD) and validate.
 */
const normalizeDate = (value: string): string => {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid event date. Please provide a valid date value.");
  }

  // Store only the calendar date component in ISO (YYYY-MM-DD).
  return parsed.toISOString().slice(0, 10);
};

/**
 * Normalize time string to 24-hour HH:MM format and validate.
 */
const normalizeTime = (value: string): string => {
  const trimmed = value.trim();

  // Accept HH:MM or HH:MM:SS in 24-hour format.
  const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);

  if (!match) {
    throw new Error(
      "Invalid event time. Expected format HH:MM or HH:MM:SS (24-hour)."
    );
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error("Invalid event time. Hour must be 0-23 and minutes 0-59.");
  }

  // Always store as HH:MM in 24-hour format.
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

const eventSchema = new Schema<EventDocument, Model<EventDocument>>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: nonEmptyString,
        message: "Event title is required.",
      },
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: nonEmptyString,
        message: "Event description is required.",
      },
    },
    overview: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: nonEmptyString,
        message: "Event overview is required.",
      },
    },
    image: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: nonEmptyString,
        message: "Event image is required.",
      },
    },
    venue: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: nonEmptyString,
        message: "Event venue is required.",
      },
    },
    location: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: nonEmptyString,
        message: "Event location is required.",
      },
    },
    date: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: nonEmptyString,
        message: "Event date is required.",
      },
    },
    time: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: nonEmptyString,
        message: "Event time is required.",
      },
    },
    mode: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: nonEmptyString,
        message: "Event mode is required.",
      },
    },
    audience: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: nonEmptyString,
        message: "Event audience is required.",
      },
    },
    agenda: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]): boolean =>
          Array.isArray(value) &&
          value.length > 0 &&
          value.every((item) => nonEmptyString(item)),
        message: "Event agenda must contain at least one non-empty item.",
      },
    },
    organizer: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: nonEmptyString,
        message: "Event organizer is required.",
      },
    },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]): boolean =>
          Array.isArray(value) &&
          value.length > 0 &&
          value.every((item) => nonEmptyString(item)),
        message: "Event tags must contain at least one non-empty tag.",
      },
    },
  },
  {
    timestamps: true,
    // Ensure that only defined paths are saved, protecting against accidental extra fields.
    strict: true,
  }
);

// Unique index on slug for fast lookups and to enforce uniqueness at the database level.
eventSchema.index({ slug: 1 }, { unique: true });

/**
 * Pre-save hook used to:
 * - Generate a URL-safe slug from the title (only when title changes or slug is missing).
 * - Normalize the date to ISO format (YYYY-MM-DD).
 * - Normalize the time to a consistent 24-hour HH:MM format.
 */
eventSchema.pre<EventDocument>("save", async function () {
  // Only regenerate slug when the title changes or slug is not set.
  if ((this.isModified("title") || !this.slug) && nonEmptyString(this.title)) {
    this.slug = slugify(this.title);
  }

  try {
    this.date = normalizeDate(this.date);
    this.time = normalizeTime(this.time);
  } catch (error) {
    throw error as Error;
  }
});

export const Event: Model<EventDocument> =
  (models.Event as Model<EventDocument>) ||
  model<EventDocument>("Event", eventSchema);
