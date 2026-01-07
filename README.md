How to Run the Application

    The application can be started locally using Docker:
    After you git clone the project and cd into it....run:
    docker compose up --build

    This starts:
    A Node.js API container
    A MongoDB container

    The API is available at:
    http://localhost:3000


    A health check endpoint is available at:
    GET /health

    see more about api's on
    API_FLOW_ANALYSIS.md



    No local MongoDB installation is required.

Approximate Time Spent

    Core API design & implementation: ~1 hours
    Concurrency / leasing logic refinement: ~45 minutes
    Validation, error handling, and Dockerization: ~45 minutes
    Documenting: ~30 minutes
    Double-check: ~30 minutes

    Total: approximately ~3:30 hours

Key Design Decisions & Thought Process
    Command Queue Model
    Each device has its own logical FIFO queue
    FIFO is enforced using createdAt ordering
    Commands transition through explicit states:
    PENDING → LEASED → SUCCEEDED / FAILED

    This avoids ambiguity and makes command lifecycle easy to reason about.

Leasing & Concurrency

    Leasing is implemented using MongoDB’s atomic findOneAndUpdate
    This guarantees that under concurrent polls, the same command is never delivered twice
    Lease expiration allows commands to become eligible again if a device crashes or does not report completion

Logical Expiration (TTL)

    Commands may have a logical expiration timestamp
    Expired commands are explicitly excluded from polling queries
    No automatic database deletion is relied upon

    This avoids non-deterministic behavior associated with MongoDB TTL cleanup.

Idempotent Scheduling

    Scheduling supports an optional Idempotency-Key header
    If the same request is retried with the same key, the existing command is returned
    This prevents duplicate commands during retries caused by network or client failures

Error Handling

    Input validation is performed using express-validator
    Runtime errors are logged to a dedicated MongoDB collection
    Startup errors (e.g. database connection failures) are logged to stdout and cause the process to exit

Where AI Helped

    AI was used as a productivity and reasoning aid, specifically for:
    Reviewing concurrency and leasing patterns
    Catching edge cases around atomic updates
    Sanity-checking architectural decisions
    Documentation 
    
    All design decisions and final code were reviewed and understood before being accepted.