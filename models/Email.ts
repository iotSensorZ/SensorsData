import mongoose, { Document, Schema } from 'mongoose';

interface Message {
  _id: mongoose.Types.ObjectId;
  subject: string;
  body: string;
  senderEmail: string;
  receiverEmail: string;
  sentAt: Date;
  read: boolean;
  isSentByMe: boolean;
}

interface EmailObject {
  email: string;
  verified: boolean;
  addedAt: Date;
  messages: Message[];
}

interface EmailDocument extends Document {
  userId: string;
  emails: EmailObject[];
  email?: string; // Optional field for email being added or updated
}

const emailSchema = new Schema<EmailDocument>({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  emails: {
    type: [
      {
        email: { type: String, required: true },
        verified: { type: Boolean, default: false },
        addedAt: { type: Date, default: Date.now },
        messages: [
          {
            _id: { type: Schema.Types.ObjectId, required: true },
            subject: { type: String, required: true },
            body: { type: String, required: true },
            senderEmail: { type: String, required: true },
            receiverEmail: { type: String, required: true },
            sentAt: { type: Date, required: true },
            read: { type: Boolean, default: false },
            isSentByMe: { type: Boolean, required: true }
          }
        ]
      }
    ],
    default: []
  }
});

emailSchema.pre('save', function (next) {
  const doc = this as EmailDocument;

  if (doc.isNew) {
    // If it's a new document, add the logged-in user's email first
    if (doc.email) {
      doc.emails.unshift({
        email: doc.email,
        verified: true,
        addedAt: new Date(),
        messages: []
      });
    }
  } else {
    if (doc.email) {
      const existingEmailIndex = doc.emails.findIndex(e => e.email === doc.email);
      
      if (existingEmailIndex === -1) {
        doc.emails.unshift({
          email: doc.email,
          verified: true,
          addedAt: new Date(),
          messages: []
        });
      } else if (existingEmailIndex !== 0) {
        const [emailToMove] = doc.emails.splice(existingEmailIndex, 1);
        doc.emails.unshift(emailToMove);
      }
    }
  }
  next();
});

export const Email = mongoose.models.Email || mongoose.model<EmailDocument>('Email', emailSchema);
