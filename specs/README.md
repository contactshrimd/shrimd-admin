# ShriMD Admin Portal Specification

This specification defines the behavior and responsibilities of the ShriMD Admin Portal.

The admin portal provides a controlled interface for:
- Support teams
- Operations teams
- Clinical operations

The admin portal must:
- Never directly access Firestore
- Only interact via backend APIs
- Enforce role-based access control (RBAC)
- Log all actions for audit purposes

This system must comply with HIPAA "minimum necessary access" principles.