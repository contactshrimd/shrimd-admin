# Roles and Permissions

## Roles

### Support Agent
- View patient status
- View limited patient info
- Resend notifications
- Cannot inspect audit logs or workflow command queues

---

### Admin
- Full patient visibility
- Trigger workflow actions
- View and export audit logs
- View workflow command summaries

---

### Clinical Ops
- View prescriptions
- Monitor provider workflows
- View audit logs
- View workflow command summaries

---

## Rules

- Use least privilege principle
- Role enforced via Firebase custom claims
- Backend validates all permissions
