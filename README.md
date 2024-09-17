This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

# Getting Started
#### 1. run npm install

#### 2. create a .env.local folder in the root directory and paste the code
```

```

#### 3. Run the development server:
open first terminal and run 
npm run dev


#### 4. open second terminal and run
npx ts-node server.ts
(the server.ts has socketio integration)





### overview of mongodb schema
```
📦 Database 
├── 📁 users
│   ├── userId: ObjectId
│   ├── name: String
│   ├── email: String
│   ├── birthday: String
│   ├── about: String
│   ├── bio: String
│   ├── occupation: String
│   └── profilePicurl: String (cloudinary)
│
├── 📁 documents
│   ├── _Id: ObjectId
│   ├── userId: ObjectId (reference to users)
│   ├── title: String
│   ├── content: String
│   ├── isPublic: Date
│   └── createdAt: Date
│
├── 📁 files
│   ├── fileId: ObjectId
│   ├── userId: ObjectId (reference to users)
│   ├── name: String
│   ├── url: String (cloudinary)
│   ├── folder: ObjectId (reference to folders)
│   └── uploadedAt: Date
 |
├── 📁 folders
│   ├── folderId: ObjectId
│   ├── name: String
│   ├── userId: ObjectId (reference to users)
│   └── createdAt: Date
│
├── 📁 emails
│   ├── _id: ObjectId
│   ├── userId: ObjectId (reference to users)
│   ├── emails: Array[]
                 ├── ObjectId
                 ├── email: String
                 ├── verified: bool
                 ├── addedAt: Date
                 ├── messages: Array[]
                                   ├── ObjectId  
                                   ├── sendersemail
                                   ├── sendersid
                                   ├── receiversemail
                                   ├── sentAt
                                   ├──read
                                   ├── issentbyme
├── 📁 contacts
│   ├── _id: ObjectId
│   ├── userId: ObjectId (reference to users)
│   ├── contacts: Array[]
                 ├── Name
                 ├── Phone
                 ├── Email
                 ├── _id
│   └── createdAt: Date
 |
├── 📁 tasks
│   ├── taskId: ObjectId
│   ├── userId: ObjectId (reference to users)
│   ├── tasks: Array[]
                ├──title
                ├──isdone
                ├──_id
│   └── createdAt: Date
│   └── updatedAt: Date
│
├── 📁 notes
│   ├── noteId: ObjectId
│   ├── userId: ObjectId (reference to users)
│   ├── notes: Array[]
                ├──title
                ├──content
                ├──labels
                ├──createdAt
                ├──_id

│
├── 📁 resources
│   ├──_Id: ObjectId
│   ├── name: String
│   ├── userId: ObjectId (reference to users)
│   └── createdAt: Date
│   └── type: String
│   └── address: String
│   └── latitude
│   └── longitude
│   └── openinghours
│   └── rating
│   └── description
│   └── image
 |
├── 📁 events
│   ├── _Id: ObjectId
│   ├── name: String
│   ├── userId: ObjectId (reference to users)
│   └── createdAt: Date
│
 |
├── 📁 chats   (socketio)
│   ├── chatId: ObjectId
│   ├── _id: String
│   ├── participants: Array[2] ObjectId (reference to users)
│   └── messages: Array[]
                      ├── senderId
                      ├── receiverId
                      ├── text
                      ├── isRead
                      ├── _id
                      ├── createdAt

```
