API Flow Analysis

This document describes the three core APIs of the system, their responsibilities, and the correct execution order for all supported use cases.
The goal is to make the system behavior explicit and unambiguous, especially under retries, concurrency, and failure scenarios.

The system exposes three APIs, each corresponding to a distinct role.

    | API                  | Role                    | Who Calls It  |
    | -------------------- | ----------------------- | ------------- |
    | **Schedule Command** | Enqueue work            | Control Panel |
    | **Poll Command**     | Fetch & lease work      | Device Agent  |
    | **Complete Command** | Report execution result | Device Agent  |



1 Schedule Command API
POST /devices/:deviceId/commands

Purpose
Creates a new command for a device
Optionally enforces idempotency to avoid duplicates


2 Poll Command API
POST /devices/:deviceId/commands/poll

Purpose
Allows a device to request its next command
Atomically leases exactly one eligible command

Key behaviors
Returns the oldest eligible command
Transitions command to LEASED
Sets leaseExpiresAt = now + leaseDuration
Returns 204 No Content if nothing is available

Ensures the same command is never delivered twice concurrently

3️ Complete Command API
POST /commands/:commandId/complete

Purpose
Reports the result of executing a leased command

Key behaviors
Only valid if:
    Command is LEASED
    Lease has not expired

Transitions command to SUCCEEDED or FAILED

Rejects invalid or expired completions (409 Conflict)


====================================================================
====================================================================


Use Cases & API Order (Summarized)

1) Normal Command Execution
    Order:
    - Schedule Command
    - Poll Command
    - Complete Command
    Outcome:
    - Command transitions PENDING → LEASED → SUCCEEDED/FAILED

2) No Available Commands
    Order:
    - Poll Command
    Outcome:
    - 204 No Content, no state change

3) FIFO Ordering
    Order:
    - Schedule multiple commands
    - Poll repeatedly
    Outcome:
    - Oldest command returned first (FIFO per device)

4) Lease Expiry & Retry
    Order:
    - Schedule Command
    - Poll Command
    - Wait for lease expiry
    - Poll again
    Outcome:
    - Command becomes eligible again and is re-leased

5) Invalid Completion
    Order:
    - Poll Command
    - Let lease expire
    - Complete Command
    Outcome:
    - 409 Conflict, state unchanged

6) Idempotent Scheduling
    sample curl:
    curl -X POST http://localhost:3000/devices/d_idem/commands \
    -H "Content-Type: application/json" \
    -H "Idempotency-Key: test-key-123" \
    -d '{ "type": "PING", params:{...}}'

    Order:
    - Schedule with Idempotency-Key
    - Retry same request
    Outcome:
    - Same command returned, no duplicate created

7) Logical Command Expiration
    Order:
    - Schedule Command
    - Wait past expiration
    - Poll Command
    Outcome:
    - Command ignored, treated as invalid

8) Device Isolation
    Order:
    - Schedule commands for multiple devices
    - Poll per device
    Outcome:
    - Each device sees only its own FIFO queue
