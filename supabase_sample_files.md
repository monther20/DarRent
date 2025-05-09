# Supabase Storage Files Guide

This guide explains how to prepare and upload sample files to your Supabase storage buckets to match the database records created by the SQL scripts.

## Required Files

### 1. Profile Pictures

Create a folder structure in your local machine:

```
/sample_files/profile-pictures/
```

Download or create 20 profile pictures and name them according to the user IDs in the database:

- ahmed_khan.jpg
- fatima_ali.jpg
- omar_hassan.jpg
- layla_mahmoud.jpg
- mohammad_abbas.jpg
- sarah_talal.jpg
- khalid_nasser.jpg
- nora_saeed.jpg
- yusuf_malik.jpg
- aisha_faisal.jpg
- rashid_abdullah.jpg
- maryam_zain.jpg
- tariq_ahmed.jpg
- hana_majid.jpg
- fadi_khalil.jpg
- dana_salem.jpg
- karim_jamil.jpg
- lina_kareem.jpg
- samir_hadi.jpg
- rania_tamer.jpg

### 2. Property Images

Create a folder structure:

```
/sample_files/property-images/
```

Download or create property images for each property in these categories:

- Main images (prop1_main.jpg, prop2_main.jpg, etc.)
- Room images (living rooms, bedrooms, kitchens, bathrooms)
- Exterior images (for villas, houses)
- Special feature images (pools, gardens, views)

You'll need approximately 37 images based on the SQL data.

### 3. Rental Contracts

Create a folder structure:

```
/sample_files/contracts/
```

Create 10 sample PDF contracts named:

- contract1.pdf
- contract2.pdf
- contract3.pdf
- contract4.pdf
- contract5.pdf
- contract6.pdf
- contract7.pdf
- contract8.pdf
- contract9.pdf
- contract10.pdf

You can use templates from legal websites or create basic contracts with rental terms, signatures, and property details.

### 4. Maintenance Attachments

Create a folder structure:

```
/sample_files/maintenance-attachments/
```

Create or download 15 files including:

- Photos of maintenance issues (leaks, broken items, etc.)
- Videos of maintenance issues
- Audio recordings

Name them according to the SQL data:

- mreq1_leak1.jpg
- mreq1_leak2.jpg
- mreq1_fixed.jpg
- mreq2_ac.jpg
- mreq2_thermostat.jpg
- mreq3_lock.jpg
- mreq4_heater.jpg
- mreq4_element.jpg
- mreq5_lights.jpg
- mreq5_video.mp4
- mreq6_garage.jpg
- mreq6_video.mp4
- mreq7_tile.jpg
- mreq8_pump.jpg
- mreq8_audio.mp3

### 5. Verification Documents

Create a folder structure:

```
/sample_files/verification-documents/
```

Create 20 sample documents (10 ID cards and 10 proof of address documents):

- l1_id.jpg
- l1_proof.jpg
- l2_id.jpg
- l2_proof.jpg
- l3_id.jpg
- l3_proof.jpg
- l4_id.jpg
- l4_proof.jpg
- r1_id.jpg
- r1_proof.jpg
- r2_id.jpg
- r2_proof.jpg
- etc.

## Uploading Files to Supabase Storage

### Option 1: Using the Supabase Dashboard

1. Open your Supabase project dashboard
2. Navigate to the Storage section
3. For each bucket, click "Upload" and select the corresponding files
4. Maintain the folder structure within each bucket

### Option 2: Using the Supabase JavaScript Client

Create a script to upload all files:

```javascript
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_SERVICE_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to upload a file
async function uploadFile(bucketName, filePath, fileName) {
  const fileBuffer = fs.readFileSync(filePath);
  const { data, error } = await supabase.storage.from(bucketName).upload(fileName, fileBuffer, {
    contentType: getContentType(filePath),
    upsert: true,
  });

  if (error) {
    console.error(`Error uploading ${fileName}:`, error);
  } else {
    console.log(`Uploaded ${fileName} successfully`);
  }
}

// Helper to determine content type
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.pdf':
      return 'application/pdf';
    case '.mp4':
      return 'video/mp4';
    case '.mp3':
      return 'audio/mpeg';
    default:
      return 'application/octet-stream';
  }
}

// Execute uploads for each bucket
async function uploadAllFiles() {
  // Profile pictures
  const profilePicsDir = './sample_files/profile-pictures/';
  const profilePics = fs.readdirSync(profilePicsDir);
  for (const file of profilePics) {
    await uploadFile('profile-pictures', path.join(profilePicsDir, file), file);
  }

  // Property images
  const propertyImagesDir = './sample_files/property-images/';
  const propertyImages = fs.readdirSync(propertyImagesDir);
  for (const file of propertyImages) {
    await uploadFile('property-images', path.join(propertyImagesDir, file), file);
  }

  // Contracts
  const contractsDir = './sample_files/contracts/';
  const contracts = fs.readdirSync(contractsDir);
  for (const file of contracts) {
    await uploadFile('contracts', path.join(contractsDir, file), file);
  }

  // Maintenance attachments
  const maintenanceDir = './sample_files/maintenance-attachments/';
  const maintenanceFiles = fs.readdirSync(maintenanceDir);
  for (const file of maintenanceFiles) {
    await uploadFile('maintenance-attachments', path.join(maintenanceDir, file), file);
  }

  // Verification documents
  const verificationDir = './sample_files/verification-documents/';
  const verificationFiles = fs.readdirSync(verificationDir);
  for (const file of verificationFiles) {
    await uploadFile('verification-documents', path.join(verificationDir, file), file);
  }
}

uploadAllFiles();
```

## Resources for Sample Files

1. Profile Pictures:

   - [Unsplash](https://unsplash.com/s/photos/portrait)
   - [Generated Photos](https://generated.photos/)

2. Property Images:

   - [Unsplash Real Estate](https://unsplash.com/collections/4525208/real-estate)
   - [Pexels Real Estate](https://www.pexels.com/search/real%20estate/)

3. Contract Templates:

   - [LawDepot](https://www.lawdepot.com/contracts/residential-lease/)
   - [Template.net](https://www.template.net/business/contracts/rental-agreement/)

4. Maintenance Issues:
   - [Home Repair Photos](https://www.istockphoto.com/photos/home-repair)
   - [Plumbing Issues Photos](https://www.istockphoto.com/photos/plumbing-leak)
