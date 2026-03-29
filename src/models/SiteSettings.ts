import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISiteSettings extends Document {
  siteName: string;
  siteDescription: string;
  contact: {
    address: string;
    email: string;
    phone: string;
  };
  socialLinks: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    github?: string;
  };
  currency: {
    code: string;
    symbol: string;
    locale: string;
  };
  footerLinks: {
    id: number;
    title: string;
    children: {
      id: number;
      label: string;
      url: string;
    }[];
  }[];
  paymentBadges: {
    id: number;
    srcUrl: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const siteSettingsSchema = new Schema<ISiteSettings>(
  {
    siteName: { type: String, required: true, default: 'StoreName' },
    siteDescription: { type: String, required: true },
    contact: {
      address: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    socialLinks: {
      twitter: String,
      facebook: String,
      instagram: String,
      github: String,
    },
    currency: {
      code: { type: String, default: 'INR' },
      symbol: { type: String, default: '₹' },
      locale: { type: String, default: 'en-IN' },
    },
    footerLinks: [
      {
        id: Number,
        title: String,
        children: [
          {
            id: Number,
            label: String,
            url: String,
          },
        ],
      },
    ],
    paymentBadges: [
      {
        id: Number,
        srcUrl: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const SiteSettings: Model<ISiteSettings> = mongoose.models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', siteSettingsSchema);

export default SiteSettings;
