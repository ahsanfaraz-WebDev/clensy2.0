# Cloudinary Image Upload Script

This script helps you upload all website images to Cloudinary and update their references in your codebase.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the `uploadCloudinaryScript` directory with your Cloudinary credentials:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Usage

1. Make sure you have your Cloudinary credentials in the `.env` file
2. Run the script:
```bash
npm start
```

The script will:
1. Find all image files in your project (jpg, jpeg, png, gif, webp)
2. Upload each image to Cloudinary
3. Update all references to these images in your codebase with the new Cloudinary URLs

## Features

- Automatically finds all image files in your project
- Uploads images to Cloudinary with unique filenames
- Updates references in all relevant files (js, jsx, ts, tsx, html, css, json)
- Maintains original filenames in Cloudinary
- Organizes images in a 'website-images' folder on Cloudinary
- Provides detailed logging of the process

## Notes

- The script ignores the `node_modules` and `uploadCloudinaryScript` directories
- Make sure to backup your project before running the script
- The script will only update string references to image paths
- All uploaded images will be stored in the 'website-images' folder on your Cloudinary account 