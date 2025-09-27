# Lawyer CRM API Documentation

## Overview
The Lawyer CRM API provides endpoints for managing clients, cases, documents, and other entities related to law practices.

## Authentication
All API endpoints require authentication via JWT tokens. Use the `/auth/login` endpoint to obtain an access token.

### Endpoints
- **POST /auth/login**
  - Authenticate a user and obtain access and refresh tokens.
  - **Request Body:**
    ```json
    {
      "username": "user@example.com",
      "password": "password"
    }
    ```
  - **Response:**
    ```json
    {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "token_type": "bearer"
    }
    ```

- **POST /auth/register**
  - Register a new user.
  - **Request Body:**
    ```json
    {
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "lawyer",
      "password": "password"
    }
    ```
  - **Response:**
    ```json
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "lawyer",
      "created_at": "2023-10-01T12:34:56Z",
      "updated_at": "2023-10-01T12:34:56Z"
    }
    ```

- **GET /auth/me**
  - Get the currently authenticated user.
  - **Response:**
    ```json
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "lawyer",
      "created_at": "2023-10-01T12:34:56Z",
      "updated_at": "2023-10-01T12:34:56Z"
    }
    ```

- **POST /auth/refresh**
  - Refresh the access token using the refresh token.
  - **Request Body:**
    ```json
    {
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```
  - **Response:**
    ```json
    {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "token_type": "bearer"
    }
    ```

## Clients
- **GET /clients**
  - Get a list of clients.
  - **Response:**
    ```json
    [
      {
        "id": 1,
        "first_name": "Іван",
        "last_name": "Петренко",
        "email": "ivan@example.com",
        "phone": "+380991112233",
        "address": "Київ, вул. Малинська, 123",
        "created_at": "2023-10-01T12:34:56Z",
        "updated_at": "2023-10-01T12:34:56Z"
      }
    ]
    ```

- **POST /clients**
  - Create a new client.
  - **Request Body:**
    ```json
    {
      "first_name": "Іван",
      "last_name": "Петренко",
      "email": "ivan@example.com",
      "phone": "+380991112233",
      "address": "Київ, вул. Малинська, 123"
    }
    ```
  - **Response:**
    ```json
    {
      "id": 1,
      "first_name": "Іван",
      "last_name": "Петренко",
      "email": "ivan@example.com",
      "phone": "+380991112233",
      "address": "Київ, вул. Малинська, 123",
      "created_at": "2023-10-01T12:34:56Z",
      "updated_at": "2023-10-01T12:34:56Z"
    }
    ```

- **GET /clients/{client_id}**
  - Get a specific client by ID.
  - **Response:**
    ```json
    {
      "id": 1,
      "first_name": "Іван",
      "last_name": "Петренко",
      "email": "ivan@example.com",
      "phone": "+380991112233",
      "address": "Київ, вул. Малинська, 123",
      "created_at": "2023-10-01T12:34:56Z",
      "updated_at": "2023-10-01T12:34:56Z"
    }
    ```

- **PUT /clients/{client_id}**
  - Update a specific client by ID.
  - **Request Body:**
    ```json
    {
      "email": "ivan_new@example.com",
      "address": "Київ, вул. Нова, 456"
    }
    ```
  - **Response:**
    ```json
    {
      "id": 1,
      "first_name": "Іван",
      "last_name": "Петренко",
      "email": "ivan_new@example.com",
      "phone": "+380991112233",
      "address": "Київ, вул. Нова, 456",
      "created_at": "2023-10-01T12:34:56Z",
      "updated_at": "2023-10-02T12:34:56Z"
    }
    ```

- **DELETE /clients/{client_id}**
  - Delete a specific client by ID.
  - **Response:**
    ```json
    {
      "message": "Client deleted successfully"
    }
    ```