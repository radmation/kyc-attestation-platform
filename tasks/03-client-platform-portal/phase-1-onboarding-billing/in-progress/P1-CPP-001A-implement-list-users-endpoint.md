- **Priority**: P1 (Critical Blocker for MVP)
- **Estimate**: S (1-2 days)
- **Type**: Feature Implementation (Backend)
- **Dependencies**: `P0-INF-001-authentication-authorization-system.md`
- **Blocks**: `P1-CPP-002A-frontend-backend-integration.md`
- **Description**: Implement the backend functionality to list users, which is a critical missing piece required by the client-facing dashboard. This involves creating a GET endpoint and properly structuring the UsersModule.
- **AI-Friendly Instructions**:
  - **Goal**: Create a secure endpoint that allows an authenticated client administrator to retrieve a list of all users belonging to their client account.
  - **Backend Implementation**:
    1.  **Create `users.controller.ts`**:
        - **File Location**: `apps/backend/src/modules/users/presentation/controllers/users.controller.ts`
        - **Endpoint**: Implement a `GET /` method (`/api/v1/users`).
        - **Authentication**: This endpoint must be protected. Use the `@UseGuards(JwtAuthGuard)` decorator.
        - **Authorization**: Only users with the role of `CLIENT_ADMIN` should be able to access this. Use `@Roles('CLIENT_ADMIN')`.
        - **Logic**: The controller should retrieve the `clientId` from the authenticated user's JWT payload. It will then query the database to find all users associated with that `clientId`.
        - **Response**: Return an array of user objects. **Crucially, omit the `password` field** and other sensitive data from the response.

    2.  **Update `users.module.ts`**:
        - **File Location**: `apps/backend/src/modules/users/users.module.ts`
        - **Action**: Remove the `TODO` comments. Import and declare the new `UsersController` in the `controllers` array.

    3.  **Refine `user.controller.ts` in Auth Module**:
        - **File Location**: `apps/backend/src/modules/auth/presentation/controllers/user.controller.ts`
        - **Action**: Rename this controller to `auth.controller.ts` and update its route from `@Controller('users')` to `@Controller('auth')`. This is a logical cleanup to separate user *management* from user *authentication*.
        - The `createUser` endpoint should now be at `POST /api/v1/auth/register` or similar. Update the route accordingly.

    4.  **Testing**:
        - Write unit tests for the new `UsersController` to ensure:
          - It returns a 401 Unauthorized error for unauthenticated requests.
          - It returns a 403 Forbidden error for authenticated users who are not `CLIENT_ADMIN`.
          - It returns a 200 OK with the correct list of users for an authorized `CLIENT_ADMIN`.
          - The returned user objects do not contain the password hash. - **Started**: Sat Sep 13 17:15:34 PDT 2025
- **Last Update**: Sat Sep 13 17:15:34 PDT 2025 - Started implementation
