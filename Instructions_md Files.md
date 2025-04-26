# My Info Section Rebuild Plan

## Overview

This document outlines the plan to rebuild the "My Info" section on the internal profile page using the `ProfileInlineEditField` component to replace the current legacy inputs. This upgrade will provide a consistent user experience, proper saving feedback, and ensure data synchronization with the public profile.

## Current Issues Analysis

After reviewing the codebase, I've identified several issues with the current implementation:

1. **Inconsistent UX**: The "My Info" section is using standard form inputs inside an accordion, which breaks the pattern of inline editing used elsewhere.
2. **Missing Save Feedback**: The current implementation lacks proper loading states and success confirmations.
3. **Field Mapping Inconsistencies**: Some fields have different naming conventions between frontend and API (e.g., `phoneNumber` vs. `phone`).
4. **Endpoint Confusion**: Some fields should update via `/api/profile` while others need `/api/account/update`.
5. **No Visual Feedback**: Users don't get visual confirmation when their changes are saved.

## Fields to Rebuild

Here is a breakdown of the fields in the "My Info" section and their corresponding API endpoints:

### User Account Data (`/api/account/update` endpoint)
- **Email**: Updates the user's email address
- **Phone Number**: Updates the user's phone number

### Profile Data (`/api/profile` endpoint)
- **Jersey Number**: Updates profile.jerseyNumber
- **Position**: Updates profile.position
- **School**: Updates profile.school
- **Graduation Year**: Updates profile.graduationYear
- **Twitter Handle**: Updates profile.twitterHandle

## Implementation Plan

### 1. Files to Edit

**Primary file for editing:**
- `client/src/pages/profile-new.tsx`

**Supporting files to reference:**
- `client/src/components/ProfileInlineEditField.tsx`
- `client/src/pages/profile-page.tsx` (contains working examples of inline edit fields)

### 2. Code Changes

#### Step 1: Remove the Legacy Accordion Structure

Replace the current accordion implementation with a new clean layout that matches the "Profile" tab's design language:

```jsx
{/* My Info Section - Always visible, inline editable */}
<div className="bg-white rounded-xl shadow overflow-hidden mb-4">
  <div className="px-5 py-4 border-b border-gray-100">
    <h3 className="font-medium text-lg text-gray-900">My Info</h3>
  </div>
  
  <div className="px-5 divide-y divide-gray-50">
    {/* Inline edit fields will go here */}
  </div>
</div>
```

#### Step 2: Add Inline Edit Fields with Proper API Connections

For each field, implement a `ProfileInlineEditField` component with appropriate props:

```jsx
{/* Email */}
<ProfileInlineEditField 
  label="Email"
  value={formState.email}
  onSave={(value) => updateAccount.mutate({ email: value })}
  inputType="email"
  isLoading={updateAccount.isPending}
  tooltip="Your email for recruiting communications"
/>

{/* Phone */}
<ProfileInlineEditField 
  label="Phone"
  value={formState.phoneNumber}
  onSave={(value) => updateAccount.mutate({ phone: value })}
  inputType="tel"
  isLoading={updateAccount.isPending}
/>

{/* Twitter */}
<ProfileInlineEditField 
  label="Twitter"
  value={formState.twitterHandle || ''}
  onSave={(value) => updateProfile.mutate({ twitterHandle: value })}
  isLoading={updateProfile.isPending}
  tooltip="Your Twitter/X handle without the @ symbol"
/>

{/* Jersey Number */}
<ProfileInlineEditField 
  label="Jersey Number"
  value={formState.jerseyNumber || ''}
  onSave={(value) => updateProfile.mutate({ jerseyNumber: value })}
  isLoading={updateProfile.isPending}
/>

{/* Position */}
<ProfileInlineEditField 
  label="Position"
  value={formState.position || ''}
  onSave={(value) => updateProfile.mutate({ position: value })}
  isLoading={updateProfile.isPending}
/>

{/* School */}
<ProfileInlineEditField 
  label="School"
  value={formState.school || ''}
  onSave={(value) => updateProfile.mutate({ school: value })}
  isLoading={updateProfile.isPending}
/>

{/* Graduation Year */}
<ProfileInlineEditField 
  label="Graduation Year"
  value={formState.graduationYear?.toString() || ''}
  onSave={(value) => updateProfile.mutate({ graduationYear: parseInt(value) || null })}
  inputType="number"
  isLoading={updateProfile.isPending}
/>
```

#### Step 3: Update Mutation Functions

Ensure the mutation functions properly handle loading states and provide feedback:

```jsx
// Update account mutation
const updateAccount = useMutation({
  mutationFn: async (accountData: any) => {
    console.log("Updating account with:", accountData);
    return apiRequest('PATCH', '/api/account/update', accountData);
  },
  onSuccess: (data) => {
    console.log("Account update successful:", data);
    queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
    queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    
    toast({
      title: "Account updated",
      description: "Your account information has been updated successfully.",
    });
  },
  onError: (error) => {
    console.error("Account update error:", error);
    toast({
      title: "Error updating account",
      description: "There was a problem updating your account information. Please try again.",
      variant: "destructive",
    });
  },
});

// Update profile mutation
const updateProfile = useMutation({
  mutationFn: async (profileData: any) => {
    console.log("Updating profile with:", profileData);
    return apiRequest('PATCH', '/api/profile', profileData);
  },
  onSuccess: (data) => {
    console.log("Profile update successful:", data);
    queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
    
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully.",
    });
  },
  onError: (error) => {
    console.error("Profile update error:", error);
    toast({
      title: "Error updating profile",
      description: "There was a problem updating your profile. Please try again.",
      variant: "destructive",
    });
  },
});
```

### 3. UI/UX Expectations

The rebuilt "My Info" section should follow these UX principles:

1. **Default View**: Fields appear as static text with an "edit" pencil icon that appears on hover.
2. **Edit Mode**: Clicking the pencil converts the field into an input with save/cancel buttons.
3. **Loading State**: While saving, the field should display a subtle loading indicator.
4. **Feedback**: 
   - **Visual**: Successfully saved fields should briefly highlight with a green checkmark.
   - **Toast**: A toast notification should confirm successful saves.
5. **Keyboard Accessibility**: Enter saves, Escape cancels the edit.
6. **Field Tooltips**: Where appropriate, add tooltips to explain field purpose.

### 4. Data Flow

For each field, the data flow should be:

1. User edits a field and clicks save
2. Field enters loading state
3. Data is sent to the appropriate API endpoint
4. On success:
   - Field shows success animation
   - Toast notification appears
   - Cache is invalidated to refresh data
5. On error:
   - Error toast notification appears
   - Field reverts to previous value

## Testing Plan

### Manual Testing Checklist

#### Account Fields
- [ ] Email field updates via `/api/account/update` and shows in public profile
- [ ] Phone field updates via `/api/account/update` and shows correctly if made public

#### Profile Fields
- [ ] Jersey Number updates via `/api/profile` and shows in public profile
- [ ] Position updates via `/api/profile` and shows in public profile
- [ ] School updates via `/api/profile` and shows in public profile
- [ ] Graduation Year updates via `/api/profile` and shows in public profile
- [ ] Twitter Handle updates via `/api/profile` and shows in public profile

#### UI Behaviors
- [ ] Edit mode activates on clicking the pencil icon
- [ ] Loading state shows while saving
- [ ] Success animation plays after successful save
- [ ] Toast notification appears after successful save
- [ ] Fields validate before submitting (e.g., email format, number fields)
- [ ] Public profile shows updated information after save

#### Error Handling
- [ ] Invalid inputs show appropriate error messages
- [ ] Error toast appears if save fails
- [ ] Fields revert to previous value on save failure

## Implementation Notes

1. **State Management**: Use the existing `formState` to track current values.
2. **Field Validation**: For simplicity, rely on browser's native validation for input types.
3. **API Field Mapping**: Be careful with field name mappings (e.g., `phoneNumber` in the UI maps to `phone` in the API).
4. **Empty Values**: Handle `null`/`undefined` values gracefully to avoid "undefined" displaying in fields.
5. **Loading States**: Connect the `isPending` state from mutations to the `isLoading` prop of the field.

## Future Enhancements (Potential Next Steps)

1. Add custom validation for specific fields (e.g., graduation year range, phone number format)
2. Improve field-specific input components (e.g., position selector dropdown)
3. Add "reset all" or "cancel all" functionality if multiple fields are being edited
4. Add field-specific error handling for better user feedback