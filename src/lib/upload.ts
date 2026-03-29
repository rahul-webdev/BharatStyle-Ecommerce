import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Saves a file to the public/uploads directory
 * @param file The file to save
 * @returns The relative path to the file (starting with /uploads)
 */
export async function saveFileLocally(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create a unique filename
  const extension = path.extname(file.name);
  const fileName = `${uuidv4()}${extension}`;
  
  // Define the relative and absolute paths
  const relativePath = `/uploads/${fileName}`;
  const absolutePath = path.join(process.cwd(), 'public', 'uploads', fileName);

  // Ensure the directory exists (though we already created it)
  await mkdir(path.dirname(absolutePath), { recursive: true });

  // Write the file
  await writeFile(absolutePath, buffer);

  return relativePath;
}
