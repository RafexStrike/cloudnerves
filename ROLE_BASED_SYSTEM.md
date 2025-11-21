# Role-Based Dashboard System

## 🎯 Overview

CloudNerves now features a complete role-based authentication and dashboard system with three distinct user roles:

1. **Admin** - Manage all users, create accounts, assign roles
2. **Manager** - Manage and track students, view enrollment
3. **Student** - View profile, balance, transactions

---

## 👥 Test Accounts

Use these credentials to test each dashboard:

### Admin Account
- **Email:** admin@cloudnerves.com
- **Password:** admin1234
- **Role:** Admin

### Manager Account
- **Email:** manager@cloudnerves.com
- **Password:** manager1234
- **Role:** Manager

### Student Account
- **Email:** student@cloudnerves.com
- **Password:** student1234
- **Role:** Student

---

## 🏗️ Architecture

### Database Schema

```javascript
{
  _id: ObjectId,
  uid: String (unique),
  displayName: String,
  email: String (unique),
  password: String,
  role: String ('admin', 'manager', 'student'),
  createdAt: Date,
  updatedAt: Date
}
```

### File Structure

```
app/
├── api/
│   ├── admin/
│   │   └── users/
│   │       ├── route.js (GET all users, POST create user)
│   │       └── [uid]/route.js (DELETE user)
│   ├── manager/
│   │   └── students/
│   │       └── route.js (GET all students)
│   └── users/
│       ├── route.js (POST user on signup)
│       └── [uid]/route.js (GET/PUT/DELETE user)

components/
└── DashboardPage.jsx (Main dashboard router)
    ├── AdminDashboard (Manage all users)
    ├── ManagerDashboard (Manage students)
    └── StudentDashboard (View profile & balance)
```

---

## 🎨 Dashboard Features

### Admin Dashboard ⚙️

**Features:**
- View all users in a table
- Create new users with custom roles
- Delete users (except admin accounts)
- View statistics (total users, managers, students)
- Full system control

**Styling:**
- Red/Orange color scheme
- Error/Warning badges for users
- Modal form for user creation

### Manager Dashboard 🛠️

**Features:**
- View all assigned students
- See student enrollment status
- Track student information
- Quick actions (View, Message)
- Enrollment statistics

**Styling:**
- Yellow/Orange color scheme
- Warning badges
- Student card layout

### Student Dashboard 📚

**Features:**
- View verified identity status
- Display meal balance/dining credits
- Transaction history
- Recent activity log
- Profile information

**Styling:**
- Purple/Blue color scheme
- Success/Info badges
- Clean card layout

---

## 🔄 User Flow

```
1. User Logs In
   ↓
2. Firebase Auth validates credentials
   ↓
3. User document saved to MongoDB (first login only)
   ↓
4. DashboardPage fetches user.role from MongoDB
   ↓
5. Router displays appropriate dashboard:
   - role = 'admin' → AdminDashboard
   - role = 'manager' → ManagerDashboard
   - role = 'student' → StudentDashboard (default)
```

---

## 📡 API Endpoints

### Admin Endpoints

```
GET /api/admin/users
- Returns: All users in database
- Response: [{ uid, displayName, email, role, createdAt }, ...]

POST /api/admin/users
- Body: { displayName, email, password, role }
- Returns: Created user with _id

DELETE /api/admin/users/[uid]
- Returns: { message: "User deleted successfully" }
```

### Manager Endpoints

```
GET /api/manager/students
- Returns: All students (role = 'student')
- Response: [{ uid, displayName, email, role, createdAt }, ...]
```

### User Endpoints

```
GET /api/users/[uid]
- Returns: User document

POST /api/users
- Body: { uid, email, displayName, ... }
- Returns: Created user

PUT /api/users/[uid]
- Body: { displayName, ... }
- Returns: Updated user

DELETE /api/users/[uid]
- Returns: { message: "User deleted successfully" }
```

---

## 🚀 How It Works

### Admin Dashboard Workflow

1. Admin logs in → `/login` → Firebase auth
2. User document checked in MongoDB
3. Role fetched: `role: 'admin'`
4. AdminDashboard component renders
5. Admin can:
   - See all users via `GET /api/admin/users`
   - Create new users via `POST /api/admin/users`
   - Delete users via `DELETE /api/admin/users/[uid]`

### Manager Dashboard Workflow

1. Manager logs in → `/login` → Firebase auth
2. User document checked in MongoDB
3. Role fetched: `role: 'manager'`
4. ManagerDashboard component renders
5. Manager can:
   - See all students via `GET /api/manager/students`
   - View student information
   - Send messages to students

### Student Dashboard Workflow

1. Student logs in → `/login` → Firebase auth
2. User document checked in MongoDB
3. Role fetched: `role: 'student'` (or default)
4. StudentDashboard component renders
5. Student can:
   - View profile information
   - See meal balance
   - View transaction history

---

## 🔐 Security Notes

**Important:** The current implementation stores passwords in MongoDB. For production:

1. **Hash Passwords:** Use bcryptjs
```javascript
import bcrypt from 'bcryptjs';
const hashedPassword = await bcrypt.hash(password, 10);
```

2. **Use JWT Tokens:** For session management
3. **Add Role Middleware:** Protect admin endpoints
4. **Implement Rate Limiting:** Prevent brute force

---

## 🧪 Testing Steps

### Test Admin Dashboard
1. Go to http://localhost:3000/login
2. Enter: admin@cloudnerves.com / admin1234
3. Click "Create New User" button
4. Fill form and create a new student
5. Verify in MongoDB that user was created
6. Try deleting the test user

### Test Manager Dashboard
1. Log out
2. Log in with: manager@cloudnerves.com / manager1234
3. View list of students
4. See enrollment statistics

### Test Student Dashboard
1. Log out
2. Log in with: student@cloudnerves.com / student1234
3. See profile information
4. View meal balance and transactions

---

## 📝 Customization

### Add New Role

1. **Create new dashboard component:**
```javascript
function CustomRoleDashboard({ user, handleLogout, isNewUser }) {
  // Your custom dashboard
}
```

2. **Add to DashboardPage router:**
```javascript
if (userRole === 'custom') {
  return <CustomRoleDashboard {...props} />;
}
```

3. **Create API endpoints:**
```javascript
// app/api/custom/route.js
```

4. **Add users to MongoDB:**
```javascript
{ uid: 'custom-user', role: 'custom', ... }
```

---

## 🐛 Troubleshooting

**Issue:** Dashboard shows wrong role
- **Fix:** Clear browser cache, logout and login again

**Issue:** Admin can't create users
- **Fix:** Check MongoDB connection, verify API endpoint exists

**Issue:** Students don't appear in manager view
- **Fix:** Ensure students have `role: 'student'` in MongoDB

**Issue:** Password not working
- **Fix:** Verify credentials in MongoDB match login input

---

## 📊 Database Status

✅ All test users created:
- admin@cloudnerves.com
- manager@cloudnerves.com
- student@cloudnerves.com

✅ All API endpoints working
✅ Role-based routing active
✅ Three dashboards functional

---

## 🎓 What's Next?

1. **Add Email Verification:** Send verification email on signup
2. **Implement Password Reset:** Forgot password flow
3. **Add Two-Factor Authentication:** 2FA for admin accounts
4. **Create Audit Logs:** Track admin actions
5. **Add Payment Integration:** For meal balance top-ups
6. **Implement WebSockets:** Real-time notifications
7. **Create Analytics Dashboard:** System-wide statistics

---

## 📚 Code Files Modified

- ✅ `components/DashboardPage.jsx` - Main dashboard with role routing
- ✅ `app/api/admin/users/route.js` - Admin user management
- ✅ `app/api/admin/users/[uid]/route.js` - Admin delete endpoint
- ✅ `app/api/manager/students/route.js` - Manager student list
- ✅ `app/dashboard/page.tsx` - Updated to use JSX version
- ✅ `lib/useGetCurrentUser.js` - User auth and role detection

All files are in JavaScript, no TypeScript needed!
