# 🎯 Quick Reference - Role-Based Dashboard System

## 🚀 Start Here

```bash
npm run dev
# Server: http://localhost:3000
```

---

## 🔐 Test Credentials (Copy & Paste)

### Admin
```
Email:    admin@cloudnerves.com
Password: admin1234
```

### Manager
```
Email:    manager@cloudnerves.com
Password: manager1234
```

### Student
```
Email:    student@cloudnerves.com
Password: student1234
```

---

## 📊 What Each Dashboard Does

| Role | Dashboard | Color | Can Do |
|------|-----------|-------|--------|
| Admin | ⚙️ Admin Panel | Red | Create/delete users, see all users, assign roles |
| Manager | 🛠️ Manager Panel | Yellow | View students, see stats, manage enrollment |
| Student | 📚 Student Panel | Purple | View profile, balance, transactions |

---

## 📁 Important Files

```
components/DashboardPage.jsx ........ All 3 dashboards (900 lines)
app/api/admin/users/ ............... Create/delete users
app/api/manager/students/ ......... Get all students
lib/useGetCurrentUser.js .......... Auth + role detection
lib/mongodb.js ................... Database connection
```

---

## 🧪 Quick Test (5 minutes)

1. **Start server:** `npm run dev`
2. **Login as admin:** admin@cloudnerves.com / admin1234
3. **Click "+ Add User"** to create a test user
4. **Logout** and login as manager
5. **See students** in manager dashboard
6. **Logout** and login as student
7. **View profile** in student dashboard

✅ Done!

---

## 💡 Key Features

✅ Role-based access control (admin, manager, student)
✅ User management (create, update, delete)
✅ MongoDB integration with roles
✅ Firebase authentication
✅ Responsive dashboards with Tailwind CSS
✅ Real-time API endpoints
✅ Connection pooling for performance
✅ All JavaScript (no TypeScript)

---

## 🔧 Admin Actions

| Action | How |
|--------|-----|
| Create User | Click "+ Add User" button |
| Delete User | Click "Delete" in users table |
| View All Users | See table on admin dashboard |
| See Stats | Cards at top: Total, Managers, Students |

---

## 🔍 Manager Actions

| Action | How |
|--------|-----|
| View Students | See list on manager dashboard |
| Check Stats | Cards at top: Total, Active, Enrollment % |
| Send Message | Click "Message" button on student card |
| View Details | Click "View" button on student card |

---

## 👤 Student Actions

| Action | How |
|--------|-----|
| View Profile | See name, email on dashboard |
| Check Balance | Card shows: $450.00 |
| See Transactions | Recent transactions list |
| View Status | Badge shows: Verified Identity |

---

## 🐛 Troubleshooting

| Problem | Fix |
|---------|-----|
| Wrong dashboard | Logout → Clear cookies → Login again |
| Can't create users | Ensure logged in as admin |
| API returns error | Check server logs: `tail -50 /tmp/dev.log` |
| Slow to load | Wait 2-3 seconds, check network tab |
| Users not appearing | Refresh page, check MongoDB |

---

## 📞 Help

- **Logs:** `tail -50 /tmp/dev.log`
- **Docs:** Read markdown files (ROLE_BASED_SYSTEM.md, TEST_GUIDE.md)
- **API Test:** `curl http://localhost:3000/api/admin/users | jq .`
- **Database:** Check MongoDB Atlas web console

---

## ✨ All Dashboards Included

✅ Admin - Full system control
✅ Manager - Student management
✅ Student - Personal profile

**Ready to test!** 🚀
