# 🚀 Quick Start - Test the Role-Based System

## ✅ What's Ready

Your CloudNerves application now has a complete role-based dashboard system with:

✅ **Three test user accounts** created in MongoDB
✅ **Three distinct dashboards** (Admin, Manager, Student)
✅ **Role-based routing** - Users see their appropriate dashboard
✅ **User management APIs** - Create, read, update, delete users
✅ **All in JavaScript** - No TypeScript complications

---

## 🧪 Test Accounts

Copy and paste these credentials to test:

### 1️⃣ Admin Dashboard
```
Email:    admin@cloudnerves.com
Password: admin1234
```
**Can:** Create users, delete users, see all users, assign roles

### 2️⃣ Manager Dashboard
```
Email:    manager@cloudnerves.com
Password: manager1234
```
**Can:** View students, track enrollment, manage student information

### 3️⃣ Student Dashboard
```
Email:    student@cloudnerves.com
Password: student1234
```
**Can:** View profile, check balance, see transactions

---

## 🎮 How to Test

### Step 1: Start the App
```bash
cd /home/rafi/cloudnerves/cloudnerves
npm run dev
```
Server runs at: http://localhost:3000

### Step 2: Test Admin Workflow

1. Go to http://localhost:3000/login
2. Enter credentials:
   - Email: `admin@cloudnerves.com`
   - Password: `admin1234`
3. Click "Sign In"
4. **You should see the Admin Dashboard** with:
   - Red/Orange themed header
   - Stats showing 8 total users
   - Table of all users
   - "Add User" button to create new users
   - Delete buttons on each user row

### Step 3: Create a Test User (Admin)

1. Click the **+ Add User** button
2. Fill in the form:
   - Name: `Test Student`
   - Email: `test.student@example.com`
   - Password: `test1234`
   - Role: `Student`
3. Click **Create**
4. User should appear in the table immediately

### Step 4: Test Manager Workflow

1. Click **Logout** button
2. Go back to http://localhost:3000/login
3. Enter credentials:
   - Email: `manager@cloudnerves.com`
   - Password: `manager1234`
4. Click "Sign In"
5. **You should see the Manager Dashboard** with:
   - Yellow/Orange themed header
   - Student list showing all students
   - Stats: Total Students, Active, Enrollment Rate
   - View and Message buttons for each student

### Step 5: Test Student Workflow

1. Click **Logout** button
2. Go back to http://localhost:3000/login
3. Enter credentials:
   - Email: `student@cloudnerves.com`
   - Password: `student1234`
4. Click "Sign In"
5. **You should see the Student Dashboard** with:
   - Purple/Blue themed header
   - Welcome message "Welcome Back!"
   - Stats: Verified Identity, Meal Balance ($450), Transactions (12)
   - Recent Transactions list

---

## 📱 What Each Dashboard Shows

### Admin Dashboard ⚙️
```
┌─────────────────────────────────────┐
│  ⚙️ Admin Panel          [Logout]    │
├─────────────────────────────────────┤
│                                     │
│  Admin Dashboard                    │
│  Manage all users, roles, settings  │
│                                     │
│  [👥 Total Users: 8]               │
│  [🛠️ Managers: 1]                   │
│  [📚 Students: 1]                   │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ All Users      [+ Add User]     ││
│  ├─────────────────────────────────┤│
│  │ Name | Email | Role | Delete   ││
│  │ Admin User | admin@... | admin ││
│  │ Manager User | manager@... | m ││
│  │ Student User | student@... | s ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

### Manager Dashboard 🛠️
```
┌─────────────────────────────────────┐
│  🛠️ Manager Panel       [Logout]    │
├─────────────────────────────────────┤
│                                     │
│  Manager Dashboard                  │
│  Manage and track your students     │
│                                     │
│  [📚 Total Students: 1]             │
│  [✓ Active: 1]                      │
│  [📊 Enrollment Rate: 100%]         │
│                                     │
│  Your Students:                     │
│  ┌─────────────────────────────────┐│
│  │ Student User                    ││
│  │ student@cloudnerves.com         ││
│  │ [View] [Message]                ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

### Student Dashboard 📚
```
┌─────────────────────────────────────┐
│  CloudNerves            [Logout]     │
├─────────────────────────────────────┤
│                                     │
│  Welcome Back!                      │
│  Tokenless Campus Dining            │
│                                     │
│  [✓ Verified] [$ $450.00] [📊 12]  │
│                                     │
│  Recent Transactions:               │
│  • Dining Hall: -$5.50              │
│  • Account Credit: +$50.00          │
│  • Cafeteria Payment: -$8.25        │
│                                     │
└─────────────────────────────────────┘
```

---

## 🔍 Behind the Scenes

### How Role Detection Works

```javascript
// When user logs in:
1. Firebase Auth validates credentials
2. User saved to MongoDB (first login only)
3. DashboardPage fetches user.role:
   - GET /api/users/{uid}
   - Returns: { role: "admin" | "manager" | "student" }
4. Dashboard router shows appropriate component:
   - Admin → AdminDashboard
   - Manager → ManagerDashboard
   - Student → StudentDashboard
```

### File Structure
```
src/
├── components/
│   └── DashboardPage.jsx ← Main dashboard router
├── app/
│   ├── api/
│   │   ├── admin/users/route.js ← Get all users, create users
│   │   ├── manager/students/route.js ← Get all students
│   │   └── users/[uid]/route.js ← Get user by ID
│   └── dashboard/
│       └── page.tsx ← Calls DashboardPage.jsx
└── lib/
    └── useGetCurrentUser.js ← Fetches user role
```

---

## 🛠️ API Endpoints Available

### Admin Only
```bash
# Get all users
curl http://localhost:3000/api/admin/users

# Create new user
curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "New User",
    "email": "new@example.com",
    "password": "pass123",
    "role": "student"
  }'

# Delete user
curl -X DELETE http://localhost:3000/api/admin/users/[uid]
```

### Manager Only
```bash
# Get all students
curl http://localhost:3000/api/manager/students
```

### All Users
```bash
# Get user by ID
curl http://localhost:3000/api/users/[uid]

# Update user
curl -X PUT http://localhost:3000/api/users/[uid] \
  -d '{ "displayName": "Updated Name" }'

# Delete user
curl -X DELETE http://localhost:3000/api/users/[uid]
```

---

## ✨ Key Features Implemented

✅ **Role-Based Access Control**
- Admin: Full system control
- Manager: Student management
- Student: View own profile

✅ **User Management**
- Create users with custom roles
- Delete users (admin only)
- Update user information
- View all users (admin only)

✅ **Dashboard Customization**
- Each role has unique UI theme
- Admin: Red/Error colors
- Manager: Yellow/Warning colors
- Student: Purple/Primary colors

✅ **Real-Time Data**
- User count updates in admin dashboard
- Student list updates in manager dashboard
- Role-based routing on login

✅ **Security**
- Only admins can create/delete users
- Role stored in MongoDB
- Users can only see their dashboard type

---

## 🎯 Next Steps

### For Testing
1. Test creating a new user as admin
2. Logout and login as that new user
3. Verify they see the student dashboard
4. Try managing users as manager (should show only student data)

### For Production
1. **Hash passwords** - Use bcryptjs
2. **Add JWT tokens** - For session security
3. **Implement rate limiting** - Prevent brute force
4. **Add audit logs** - Track admin actions
5. **Email verification** - Verify new accounts
6. **Two-factor authentication** - Extra security

---

## 🐛 Troubleshooting

**Q: I see a blank dashboard**
- A: Wait 2-3 seconds for the page to load
- A: Check browser console for errors (F12)
- A: Make sure you're logged in

**Q: I created a user but it doesn't show**
- A: Refresh the page
- A: Check browser console for errors
- A: Verify MongoDB is running

**Q: I can't login**
- A: Check email and password match exactly (case-sensitive)
- A: Clear browser cookies/cache
- A: Make sure MongoDB has the users

**Q: Wrong dashboard appears**
- A: Logout completely (clear session)
- A: Close browser tab and reopen
- A: Check user role in MongoDB: `db.users.findOne({email: "..."})`

---

## 📞 Support

If you have issues:

1. **Check the logs:**
   ```bash
   tail -50 /tmp/dev.log
   ```

2. **Check MongoDB:**
   ```bash
   mongosh "mongodb+srv://..." --username ... --password ...
   use cloudnerves
   db.users.find()
   ```

3. **Check Network:**
   - Open Developer Tools (F12)
   - Go to Network tab
   - Try logging in
   - Look for failed requests

---

## 🎓 Learn More

- See `ROLE_BASED_SYSTEM.md` for architecture details
- See `USE_HOOK_DOCS.md` for auth hook documentation
- See `MONGODB_SETUP.md` for database setup

**Happy Testing! 🚀**
