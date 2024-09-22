This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

# Getting Started
#### 1. git pull
#### 2. run npm install

#### 3. create a .env.local folder in the root directory and paste the code

#### 4. Run the development server:
open first terminal and run 
npm run dev


#### 5. open second terminal and run
npx ts-node server.ts
(the server.ts has socketio integration)



## Quick tour
##### User Flow
- New Users: Upon accessing the application, new users will be redirected to the Login/Register page.

- Returning Users: If a login session is detected, users will be redirected to the Dashboard.

- My Profile
User Details: Access your user details say bio,profilepic,address,contact,etc and ensure they are up-to-date.

- Folder Storage\
Create Folders: Users can enter a folder name to create new folders.\
File Management: Each folder can have files added to it, ensuring organized storage.

- Write Report\
Quill Editor: Utilize the integrated Quill editor for rich text report writing.\
Keyboard Shortcuts: Common shortcuts like Ctrl + X, Y, and Z are supported for efficient editing.\
Report Listing: Submitted reports will be listed in the Reports section.\
The visibility option for the report is in progress.

- Map Resources\
Interactive Map: Hover over and click to view resource details.\
Resource Management: Navigate to settings to add, edit, or delete resources.

- Calendar Events\
Event Management: Add events to your calendar seamlessly.

- Inbox\
Email Management: Users can manage multiple email addresses in the left pane.\
Send Email: Click the "Send Email" button to compose and send emails.

- Messaging\
Chat Functionality: Users can chat with others through the messaging feature.

- Contacts\
Import Contacts: Users need to export their contacts from Google Contacts and upload them to the app.\
Contact Management: Extracted contacts can be edited or deleted.

- Notes and Tasks\
Individual Features: Notes and tasks are separate features for better organization.




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
