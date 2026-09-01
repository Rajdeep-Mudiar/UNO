# Security & Fair Play Model

## Server-Authoritative Design Principles

1. **Zero Client Trust**:
   - Turn verification, card ownership, color matching, and draw penalties are computed on the backend server engine.
   - The server rejects any invalid or out-of-order action.

2. **State Masking (Anti-X-Ray / Anti-Cheat)**:
   - Opponents' cards are stripped from the payload prior to network transmission (`sanitizeGameStateForPlayer`).
   - Draw piles are kept server-side; clients only receive top discard card and total card counts.

3. **Input Sanitization & Validation**:
   - All room names, chat messages, and user profile inputs are sanitized and validated with Zod schemas.
   - SQL injection prevention through Prisma parameterized queries.

4. **Rate Limiting & Abuse Detection**:
   - Socket event rate limiters prevent flood/spam attacks.
   - Suspicious behavior and impossible card plays trigger automated audit logs.
