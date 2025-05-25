# Video Link API Documentation

This document outlines the endpoints for managing video links in the OneShot Recruiting Platform.

## API Base URL

All endpoints are prefixed with: `/api/experimental/athlete`

## Authentication

All endpoints require JWT authentication. Include the JWT token in the `Authorization` header using the Bearer scheme:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Add Video Link

**Endpoint:** `POST /:athleteProfileId/videos`

**Description:** Add a new video link to an athlete profile

**Authentication:** Required (Profile Owner or Admin)

**URL Parameters:**
- `athleteProfileId`: The ID of the athlete profile

**Request Body:**
```json
{
  "title": "My Championship Game",
  "url": "https://www.youtube.com/watch?v=12345",
  "description": "Highlights from the state championship game",
  "mediaType": "highlight_video"
}
```

**Media Types:**
- `highlight_video`: Highlight reel showcasing best plays
- `game_film`: Complete game footage
- `training_clip`: Training or practice footage

**Response:**
```json
{
  "success": true,
  "message": "Video link added successfully",
  "data": {
    "id": 1,
    "athleteProfileUserId": 123,
    "title": "My Championship Game",
    "description": "Highlights from the state championship game",
    "videoUrl": "https://www.youtube.com/watch?v=12345",
    "mediaType": "highlight_video",
    "isFeatured": false,
    "isPublic": true,
    "createdAt": "2023-10-15T14:30:00.000Z",
    "updatedAt": "2023-10-15T14:30:00.000Z"
  },
  "statusCode": 201
}
```

### 2. Get All Video Links

**Endpoint:** `GET /:athleteProfileId/videos`

**Description:** Retrieve all video links for an athlete profile

**Authentication:** Required (Profile Owner or Admin)

**URL Parameters:**
- `athleteProfileId`: The ID of the athlete profile

**Response:**
```json
{
  "success": true,
  "message": "Video links retrieved successfully",
  "data": [
    {
      "id": 1,
      "athleteProfileUserId": 123,
      "title": "My Championship Game",
      "description": "Highlights from the state championship game",
      "videoUrl": "https://www.youtube.com/watch?v=12345",
      "mediaType": "highlight_video",
      "isFeatured": false,
      "isPublic": true,
      "createdAt": "2023-10-15T14:30:00.000Z",
      "updatedAt": "2023-10-15T14:30:00.000Z"
    }
  ],
  "statusCode": 200
}
```

### 3. Get Single Video Link

**Endpoint:** `GET /:athleteProfileId/videos/:videoId`

**Description:** Retrieve a specific video link

**Authentication:** Required (Profile Owner or Admin)

**URL Parameters:**
- `athleteProfileId`: The ID of the athlete profile
- `videoId`: The ID of the video link

**Response:**
```json
{
  "success": true,
  "message": "Video retrieved successfully",
  "data": {
    "id": 1,
    "athleteProfileUserId": 123,
    "title": "My Championship Game",
    "description": "Highlights from the state championship game",
    "videoUrl": "https://www.youtube.com/watch?v=12345",
    "mediaType": "highlight_video",
    "isFeatured": false,
    "isPublic": true,
    "createdAt": "2023-10-15T14:30:00.000Z",
    "updatedAt": "2023-10-15T14:30:00.000Z"
  },
  "statusCode": 200
}
```

### 4. Update Video Link

**Endpoint:** `PUT /:athleteProfileId/videos/:videoId`

**Description:** Update a video link

**Authentication:** Required (Profile Owner or Admin)

**URL Parameters:**
- `athleteProfileId`: The ID of the athlete profile
- `videoId`: The ID of the video link

**Request Body:**
```json
{
  "title": "Updated Championship Game",
  "description": "Updated highlights from state championship game",
  "url": "https://www.youtube.com/watch?v=updated",
  "mediaType": "game_film"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Video updated successfully",
  "data": {
    "id": 1,
    "athleteProfileUserId": 123,
    "title": "Updated Championship Game",
    "description": "Updated highlights from state championship game",
    "videoUrl": "https://www.youtube.com/watch?v=updated",
    "mediaType": "game_film",
    "isFeatured": false,
    "isPublic": true,
    "createdAt": "2023-10-15T14:30:00.000Z",
    "updatedAt": "2023-10-15T15:45:00.000Z"
  },
  "statusCode": 200
}
```

### 5. Delete Video Link

**Endpoint:** `DELETE /:athleteProfileId/videos/:videoId`

**Description:** Delete a video link

**Authentication:** Required (Profile Owner or Admin)

**URL Parameters:**
- `athleteProfileId`: The ID of the athlete profile
- `videoId`: The ID of the video link

**Response:**
```json
{
  "success": true,
  "message": "Video deleted successfully",
  "statusCode": 200
}
```

## Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information",
  "statusCode": 400
}
```

Common error status codes:
- `400`: Bad Request (validation error)
- `401`: Unauthorized (missing or invalid authentication)
- `403`: Forbidden (authenticated but not authorized)
- `404`: Not Found (resource doesn't exist)
- `500`: Internal Server Error

## Validation

Request validation is performed using Zod schemas. Common validation requirements:

- `title`: Required string
- `url`: Required valid URL string
- `mediaType`: Required enum ('highlight_video', 'game_film', 'training_clip')
- `description`: Optional string 