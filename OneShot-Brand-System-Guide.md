# OneShot Brand System Guide (v1)

This is the canonical source of truth for OneShot's current brand system. It is optimized for high school athletes, mobile-first recruiting UX, and fast handoff to developers and social creators.

## 🎨 Color Palette

| Name | HEX | Usage |
|------|-----|-------|
| Night Blue | #0a1128 | Primary background |
| Neon Ice Blue | #00c2ff | Call-to-action highlights |
| Signal Orange | #ff6b35 | Warnings / power accents |
| Bone White | #f9f9f9 | Text on dark |
| Smoke Grey | #e0e0e0 | Secondary UI backgrounds |

## 🖋 Typography

| Use Case | Font | Style |
|----------|------|-------|
| Headings | Montserrat Bold | Uppercase, tight letter spacing |
| UI Body Text | Inter / Roboto | Regular, readable, mobile-friendly |
| Buttons | Montserrat SemiBold | All caps, short action verbs |

## 📏 Spacing & Layout

- Use `max-w-md mx-auto` for central content cards
- Standard padding: `p-4` or `p-6`
- Card radius: `rounded-2xl`
- Consistent vertical rhythm: `space-y-4`

## 🧱 Components (Base Tokens)

### Buttons

- **Primary**: Neon Ice Blue background, white text, hover: Signal Orange
- **Secondary**: Transparent w/ white border, hover: Neon Ice Blue
- **Sizes**: `h-10 px-4`, `text-sm` or `base`

### Input Fields

- **Background**: #f9f9f9
- **Border**: 1px solid #e0e0e0
- **Padding**: `px-4 py-2`, radius: `rounded-lg`

### Profile Card Example (Public)

```jsx
<div className="bg-white shadow-md rounded-2xl p-4 max-w-md mx-auto">
  <img src={profileImageUrl} className="w-24 h-24 object-cover rounded-full mx-auto mb-4" />
  <h1 className="text-xl font-bold text-center">{firstName} {lastName}</h1>
  <p className="text-sm text-gray-600 text-center">{sport} • Class of {gradYear}</p>
  <p className="mt-2 text-center text-gray-700">{bio}</p>
</div>
```

## 🔊 Voice & Messaging

| Trait | Voice Sample |
|-------|-------------|
| Confident | "One link. One shot. Let it fly." |
| Athlete-first | "Built for ballers. Not browsers." |
| Informal + Direct | "Drop your film. Lock in." |

Avoid: recruiter-first language, startup jargon, or passive voice.

## 🧪 Dev Handoff Notes for Claude

- All color tokens and spacing should be applied using Tailwind CSS
- Use `useQuery` for data fetching
- For profile rendering, pass a `PublicProfile` object with only public-safe fields
- Responsive first: mobile layouts should be tested before desktop

## 🔁 Status

This guide is current as of May 2025. Any changes must be logged via a changelog commit and verified by Eric. 