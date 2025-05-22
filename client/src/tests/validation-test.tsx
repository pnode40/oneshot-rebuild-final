import { z } from 'zod';

// Import the same schema from CreateProfileForm.tsx
const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  highSchool: z.string().min(1, "High school is required"),
  position: z.string().min(1, "Position is required"),
  height: z.string().min(1, "Height is required"),
  weight: z.coerce.number().min(1, "Weight is required"),
  gpa: z.coerce.number().min(0).max(4.0).optional(),
  highlightLinks: z.string().optional(),
  visibility: z.enum(["public", "private"]).default("private")
});

// Test various edge cases
function testValidation() {
  const testCases = [
    {
      name: "Empty required fields",
      data: {
        name: '',
        highSchool: '',
        position: '',
        height: '',
        weight: 0,
        gpa: undefined,
        highlightLinks: '',
        visibility: 'private' as const
      },
      expectError: true
    },
    {
      name: "Invalid GPA (above 4.0)",
      data: {
        name: 'Test User',
        highSchool: 'Test High',
        position: 'QB',
        height: '6\'2"',
        weight: 185,
        gpa: 4.5,
        highlightLinks: '',
        visibility: 'private' as const
      },
      expectError: true
    },
    {
      name: "Invalid weight (negative)",
      data: {
        name: 'Test User',
        highSchool: 'Test High',
        position: 'QB',
        height: '6\'2"',
        weight: -10,
        gpa: 3.5,
        highlightLinks: '',
        visibility: 'private' as const
      },
      expectError: true
    },
    {
      name: "Valid data",
      data: {
        name: 'Test User',
        highSchool: 'Test High',
        position: 'QB',
        height: '6\'2"',
        weight: 185,
        gpa: 3.5,
        highlightLinks: '',
        visibility: 'private' as const
      },
      expectError: false
    }
  ];

  testCases.forEach(testCase => {
    console.log(`\nTesting: ${testCase.name}`);
    try {
      const result = profileSchema.parse(testCase.data);
      console.log('Validation passed:', result);
      if (testCase.expectError) {
        console.log('❌ Test failed: Expected validation error but none occurred');
      } else {
        console.log('✅ Test passed: Validation passed as expected');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log('Validation errors:', error.errors);
        if (!testCase.expectError) {
          console.log('❌ Test failed: Unexpected validation error');
        } else {
          console.log('✅ Test passed: Validation error occurred as expected');
        }
      } else {
        console.log('Unexpected error:', error);
      }
    }
  });
}

testValidation(); 