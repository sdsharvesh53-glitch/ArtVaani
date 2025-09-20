# **App Name**: Craftopia

## Core Features:

- User Authentication: Enable user registration and login using email/password, Google, and phone number with OTP. After a new user signs in for the first time, redirect them to a profile setup page where they provide name, city, and phone number.
- Artisan Role Management: Allow users to switch to an 'Artisan' role by submitting details about their craft and experience. Grant access to the Artisan Dashboard upon approval, store roles in Firebase
- AI Product Listing Generator: Generate product titles, descriptions, hashtags, and suggested prices (in INR) based on product photos and descriptions using the Gemini Vision and Text tool.
- Storytelling Assistant: Transcribe artisan's voice recordings about their craft into text, polish it into a structured cultural story using the Gemini tool, and allow saving to product records.
- Cultural Insights Explorer: Provide detailed write-ups about crafts' history, origin, and techniques using Gemini based on user input.
- Artisan Identity Verification: Verify artisan identity by comparing live photo backgrounds with declared city using AI, and GPS location matches artisan’s declared city. Mark verified artisans with a badge.
- Product Display and Cart: Showcase products in a grid layout with details and allow buyers to add them to a shopping cart that persists across browsing sessions. No backend is required for the shopping cart.

## Style Guidelines:

- Primary color: Terracotta (#D18247) evokes warmth and earthiness.
- Background color: Beige (#F2EED9) provides a neutral, comforting base.
- Accent color: Mustard Yellow (#FFC733) adds a vibrant highlight.
- Headings: 'Caveat', sans-serif. Note: currently only Google Fonts are supported.
- Body: 'Poppins', serif. Note: currently only Google Fonts are supported.
- Cards: Light beige (#F7F4ED) for content containers.
- Borders: Light grayish-beige (#D6D1C2) to separate sections.