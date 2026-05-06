# Superadmin Dashboard Completion & User Deactivation Fix
## Approved Plan Implementation Steps

### 1. Create/Update TODO.md [COMPLETED]
### 2. Make Dashboard Stats Clickable [COMPLETED]
- Edit `frontend/src/pages/superadmin/Dashboard.jsx`:
  * Import `useNavigate` from 'react-router-dom'.
  * Add `const navigate = useNavigate();`
  * Update statsCards array with `onClick` handlers:
    - Total Students → `navigate('/admin/students')`
    - Total Faculty → `navigate('/admin/faculty')` 
    - Total Admins → `navigate('/superadmin/users')`
    - Total Courses → `navigate('/superadmin/academic/courses')` or placeholder
  * Add `cursor-pointer hover:scale-105 transition-transform` to card classes.

### 3. Enhance Recent Activity Section [COMPLETED]
- Added recent users list in Dashboard.jsx.

### 4. Verify/Fix Deactivation Flow [Already Working]
- Test `/api/auth/users/${id}/toggle` → User.isActive flips.
- Test login blocked for inactive users.
- Update stats to optionally filter active only (add ?active=true to API calls).

### 5. Backend Improvements (Optional Sync) [COMPLETED]
- Added populate('user', 'isActive') in getFaculty and getStudents.

### 6. Update Sidebar [COMPLETED]
- Add Faculty/Student links under superadmin nav pointing to /admin/faculty & /admin/students.

### 7. Testing
```
cd frontend && npm run dev
cd backend && npm start
```
- Login superadmin.
- Click stats → navigate correctly.
- Toggle user inactive → can't login.
- Stats update correctly.

### 8. Completion
- `attempt_completion`
