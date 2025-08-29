# Promo Maker Setup Guide

## Environment Variables

To use the image generation features, you need to set up your OpenAI API key:

1. **Get an OpenAI API Key:**
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Copy the key

2. **Create Environment File:**
   Create a `.env.local` file in the root directory with:
   ```
   OPENAI_API_KEY=your_actual_api_key_here
   ```

3. **Restart Development Server:**
   After adding the environment variable, restart your development server:
   ```bash
   npm run dev
   ```

## Troubleshooting

### "No composition available" Error
This usually means:
- OpenAI API key is missing or invalid
- API rate limits exceeded
- Content policy violation in your description

### Check Console Logs
Open browser developer tools (F12) and check the Console tab for detailed error messages.

### Test API Endpoints
You can test the APIs directly:
- Copy generation: `POST /api/copy`
- Prompt generation: `POST /api/prompt-generation`
- Image generation: `POST /api/image-generation`

## Features
- Generate promotional images with AI-powered backgrounds
- Multiple aspect ratios (1:1, 4:5, 9:16)
- Customizable themes and colors
- Product photo integration
- Logo placement
- Professional copy generation

