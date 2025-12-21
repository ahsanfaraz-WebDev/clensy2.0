import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload a single image to Cloudinary
async function uploadToCloudinary(imagePath) {
  try {
    // Read the file as a buffer
    const fileBuffer = await fs.readFile(imagePath);
    
    // Convert buffer to base64
    const base64Image = fileBuffer.toString('base64');
    const dataURI = `data:image/${path.extname(imagePath).slice(1)};base64,${base64Image}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'website-images',
      use_filename: true,
      unique_filename: true,
      resource_type: 'auto' // This will automatically detect the resource type
    });
    
    return result.secure_url;
  } catch (error) {
    console.error(`Error uploading ${imagePath}:`, error);
    return null;
  }
}

// Function to find all image files in the public folder
async function findImageFiles() {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const patterns = imageExtensions.map(ext => `../public/**/*.${ext}`);
  
  const files = await Promise.all(
    patterns.map(pattern => glob(pattern, { ignore: ['node_modules/**'] }))
  );
  
  return files.flat();
}

// Function to update file references in the codebase
async function updateFileReferences(oldPath, newUrl) {
  // Only search in specific project directories, excluding node_modules
  const projectDirs = [
    '../app/**/*.{js,jsx,ts,tsx}',
    '../components/**/*.{js,jsx,ts,tsx}',
    '../pages/**/*.{js,jsx,ts,tsx}',
    '../styles/**/*.{css,scss}',
    '../public/**/*.{html,json}',
    '../**/*.json'
  ];

  const ignorePatterns = [
    '**/node_modules/**',
    '**/uploadCloudinaryScript/**',
    '**/.next/**',
    '**/dist/**',
    '**/build/**'
  ];

  const files = await Promise.all(
    projectDirs.map(pattern => 
      glob(pattern, { 
        ignore: ignorePatterns,
        absolute: true // Get absolute paths
      })
    )
  );

  const flatFiles = files.flat();
  console.log(`Found ${flatFiles.length} project files to update`);

  for (const file of flatFiles) {
    try {
      // Skip if file is in node_modules
      if (file.includes('node_modules')) {
        continue;
      }

      let content = await fs.readFile(file, 'utf8');
      const relativePath = path.relative(path.join(process.cwd(), '..'), oldPath).replace(/\\/g, '/');
      
      // For JSON files, we need to handle both string and object formats
      if (file.endsWith('.json')) {
        try {
          const jsonContent = JSON.parse(content);
          let modified = false;

          // Function to recursively update image paths in JSON
          const updateJsonPaths = (obj) => {
            if (typeof obj !== 'object' || obj === null) return;
            
            Object.keys(obj).forEach(key => {
              if (typeof obj[key] === 'string' && obj[key].includes(relativePath)) {
                obj[key] = obj[key].replace(relativePath, newUrl);
                modified = true;
              } else if (typeof obj[key] === 'object') {
                updateJsonPaths(obj[key]);
              }
            });
          };

          updateJsonPaths(jsonContent);
          
          if (modified) {
            const newContent = JSON.stringify(jsonContent, null, 2);
            await fs.writeFile(file, newContent, 'utf8');
            console.log(`Updated JSON references in ${file}`);
          }
        } catch (jsonError) {
          // Only log errors for non-node_modules files
          if (!file.includes('node_modules')) {
            console.error(`Error parsing JSON file ${file}:`, jsonError);
          }
        }
      } else {
        // For non-JSON files, use regex replacement
        const newContent = content.replace(
          new RegExp(`["']${relativePath}["']`, 'g'),
          `"${newUrl}"`
        );
        
        if (newContent !== content) {
          await fs.writeFile(file, newContent, 'utf8');
          console.log(`Updated references in ${file}`);
        }
      }
    } catch (error) {
      // Only log errors for non-node_modules files
      if (!file.includes('node_modules')) {
        console.error(`Error updating ${file}:`, error);
      }
    }
  }
}

// Main function to process all images
async function processImages() {
  try {
    console.log('Finding image files in public folder...');
    const imageFiles = await findImageFiles();
    console.log(`Found ${imageFiles.length} image files`);

    for (const imagePath of imageFiles) {
      console.log(`Processing ${imagePath}...`);
      const cloudinaryUrl = await uploadToCloudinary(imagePath);
      
      if (cloudinaryUrl) {
        console.log(`Successfully uploaded to: ${cloudinaryUrl}`);
        await updateFileReferences(imagePath, cloudinaryUrl);
      }
    }

    console.log('All images processed successfully!');
  } catch (error) {
    console.error('Error processing images:', error);
  }
}

// Run the script
processImages(); 