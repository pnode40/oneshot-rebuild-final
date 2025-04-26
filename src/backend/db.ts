// src/backend/db.ts

export const getDbClient = async () => {
    // Temporary mock DB client
    return {
      users: {
        async findOne(query: { email: string }) {
          // This would normally hit a real database
          return null; // Always pretend user does not exist for now
        },
        async insertOne(user: any) {
          // This would normally insert into a real database
          return {
            insertedId: 'mock-user-id', // Always return a mock ID
          };
        },
      },
    };
  };
  