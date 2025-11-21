# 🎯 Role-Based Meal Request System - Testing Guide

## Test Users

### 1. Admin Account
- **Email**: admin@cloudnerves.com
- **Password**: admin1234
- **Role**: admin
- **Access**: Full system access - manage all requests and users

### 2. Manager Account
- **Email**: manager@cloudnerves.com
- **Password**: manager1234
- **Role**: manager
- **Access**: View and approve/deny student meal requests

### 3. Student Account
- **Email**: student@cloudnerves.com
- **Password**: student1234
- **Role**: student
- **Access**: Request meal tokens (breakfast, lunch, dinner)

---

## Testing Workflow

### Step 1: Test Student Flow
```
1. Login with student@cloudnerves.com / student1234
2. You should see "Student Dashboard" with 3 buttons:
   - Breakfast 🌅
   - Lunch 🍽️
   - Dinner 🌙
3. Click "Breakfast" button
4. You'll get a token like: B-1234
5. Button changes to "✓ Requested" (disabled)
6. Request appears in "Your Requests" section
7. Status shows "pending" ⏳
```

### Step 2: Test Manager Flow
```
1. Login with manager@cloudnerves.com / manager1234
2. You should see "Manager Dashboard"
3. Shows stats:
   - Total Requests
   - Pending count
   - Accepted count
   - Denied count
4. See table with all pending requests from students
5. Click "Accept" button → Request status changes to "accepted" ✓
6. Or click "Deny" button → Request status changes to "denied" ✗
7. Use tabs to filter: All, Pending, Accepted, Denied
```

### Step 3: Test Admin Flow
```
1. Login with admin@cloudnerves.com / admin1234
2. You should see "Admin Dashboard"
3. Shows comprehensive stats:
   - All requests (Pending, Accepted, Denied)
   - All users count with role breakdown
4. Two tabs: "Meal Requests" and "Users"
5. Meal Requests tab:
   - See all requests from all students
   - Filter by status
   - Approve or deny pending requests
6. Users tab:
   - See all users with their email, name, role
   - Can delete users
```

---

## Database Collections

### 1. `users` collection
```json
{
  "_id": ObjectId,
  "uid": "firebase-uid",
  "email": "user@example.com",
  "displayName": "User Name",
  "photoURL": "",
  "phoneNumber": "",
  "role": "admin|manager|student",
  "createdAt": Date,
  "updatedAt": Date
}
```

### 2. `mealRequests` collection
```json
{
  "_id": ObjectId,
  "studentId": "firebase-uid",
  "studentName": "Student Name",
  "mealType": "breakfast|lunch|dinner",
  "tokenId": "B-1234",
  "status": "pending|accepted|denied",
  "requestedAt": Date,
  "updatedAt": Date
}
```

---

## API Endpoints

### Meal Request Endpoints

#### POST /api/meal-requests
Create new meal request
```bash
curl -X POST http://localhost:3000/api/meal-requests \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "uid123",
    "studentName": "John Doe",
    "mealType": "breakfast"
  }'
```

#### GET /api/meal-requests
List meal requests (with filters)
```bash
# Get all requests
curl http://localhost:3000/api/meal-requests

# Get pending requests
curl http://localhost:3000/api/meal-requests?status=pending

# Get by student
curl http://localhost:3000/api/meal-requests?studentId=uid123

# Get by meal type
curl http://localhost:3000/api/meal-requests?mealType=breakfast
```

#### PUT /api/meal-requests/[requestId]
Update request status
```bash
curl -X PUT http://localhost:3000/api/meal-requests/123456 \
  -H "Content-Type: application/json" \
  -d '{"status": "accepted"}'
```

---

## Key Features

✅ **Student Dashboard**
- Request meals (breakfast, lunch, dinner)
- Each button generates a unique token
- Prevents duplicate requests for same meal on same day
- View request history with status
- Real-time status updates

✅ **Manager Dashboard**
- See all pending student requests
- Accept or deny requests with one click
- View request statistics
- Filter requests by status
- Auto-refresh every 5 seconds

✅ **Admin Dashboard**
- Full system overview
- Statistics on requests and users
- View all meal requests
- View all users with roles
- Delete users (admin/manager/student)
- Approve/deny requests
- Two-tab interface for requests and users

✅ **Role-Based Access**
- Each user only sees their dashboard
- Students cannot see manager/admin features
- Managers cannot see admin features
- Admins see everything

✅ **Token Generation**
- Breakfast: B-XXXX (last 4 digits of timestamp)
- Lunch: L-XXXX
- Dinner: D-XXXX
- Unique per request

---

## Common Issues & Solutions

### Issue: "User role not found"
**Solution**: Make sure user is created with correct role in MongoDB

### Issue: Can't request second meal
**Solution**: Each student can only request one breakfast, one lunch, one dinner per day

### Issue: Request not appearing in manager dashboard
**Solution**: Refresh the page (auto-refreshes every 5 seconds anyway)

### Issue: Status not updating
**Solution**: Click Accept/Deny button again or check MongoDB directly

---

## Quick Test Checklist

- [ ] Student can login and see 3 meal buttons
- [ ] Clicking button generates token (B/L/D-XXXX)
- [ ] Button becomes disabled after request
- [ ] Manager sees pending requests
- [ ] Manager can accept requests
- [ ] Manager can deny requests
- [ ] Admin sees all requests and users
- [ ] Admin can manage users
- [ ] Request status updates in real-time
- [ ] Students can't request same meal twice per day

---

## MongoDB Verification

To verify data in MongoDB Atlas:

1. Go to MongoDB Atlas Dashboard
2. Navigate to: cluster0 → Collections
3. Select: cloudnerves database
4. Check collections:
   - `users` - Should have 3 test users
   - `mealRequests` - Should have requests created during testing

---

## Next Steps

1. Test all three user roles
2. Try requesting meals as student
3. Approve/deny as manager
4. View and manage as admin
5. Verify data appears in MongoDB
6. Test all filters and searches
