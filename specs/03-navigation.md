# Navigation

## Main Routes

- Dashboard
- Patient Search
- Patient Detail
- Audit Logs
- Workflow Commands
- Refill Queue
- Subscriptions

---

## Flow

Login → Dashboard → Search → Patient Detail

Operations users can also navigate to Audit Logs and Workflow Commands when their role allows it.

---

## Access Control

Routes must be restricted by role.

- Audit Logs: `admin`, `clinical_ops`; export is `admin` only
- Workflow Commands: `admin`, `clinical_ops`
- Support agents see patient support routes only
