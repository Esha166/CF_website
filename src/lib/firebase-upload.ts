import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { compressImage } from "./image-compress";

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function compressUploadFile(file: File): Promise<File> {
  if (!/^image\/(jpeg|jpg|png|webp)$/i.test(file.type)) {
    return file;
  }

  const dataUrl = await readFileAsDataURL(file);
  const compressedDataUrl = await compressImage(dataUrl, 1600, 1600, 0.8);
  const response = await fetch(compressedDataUrl);
  const blob = await response.blob();

  // compressImage() targets WebP but falls back to JPEG if the browser
  // can't encode WebP, so the output extension/type must match whichever
  // it actually produced rather than being hardcoded.
  const isWebp = compressedDataUrl.startsWith("data:image/webp");
  const extension = isWebp ? "webp" : "jpg";
  const mimeType = isWebp ? "image/webp" : "image/jpeg";

  return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.${extension}`, {
    type: mimeType,
    lastModified: file.lastModified,
  });
}

/**
 * Uploads an image file to Firebase Storage under the specified folder.
 * If Firebase Storage is not initialized or the upload fails, it falls back
 * to reading the file as base64 and compressing it.
 *
 * @param file The file to upload
 * @param folder The target folder in storage (e.g. "blogs", "courses")
 */
export async function uploadImage(file: File, folder: string = "images"): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("Image upload is only supported in the browser.");
  }

  try {
    if (!storage) {
      throw new Error("Firebase Storage is not initialized.");
    }

    const uploadFile = await compressUploadFile(file);
    const fileExtension = uploadFile.name.split(".").pop() || "jpg";
    const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
    const storageRef = ref(storage, `${folder}/${uniqueFilename}`);

    const snapshot = await uploadBytes(storageRef, uploadFile);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.warn("Firebase Storage upload failed, falling back to a browser image preview:", error);
    try {
      const dataUrl = await readFileAsDataURL(file);
      return await compressImage(dataUrl);
    } catch (fallbackError) {
      console.error("Image upload fallback also failed:", fallbackError);
      throw fallbackError;
    }
  }
}

/**
 * Uploads a generic file (e.g. PDF) to Firebase Storage under the specified folder.
 *
 * @param file The file to upload
 * @param folder The target folder in storage (e.g. "mous", "documents")
 */
export async function uploadFile(file: File, folder: string = "files"): Promise<string> {
  if (!storage) {
    throw new Error("Firebase Storage is not initialized.");
  }
  const fileExtension = file.name.split(".").pop() || "bin";
  const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
  const storageRef = ref(storage, `${folder}/${uniqueFilename}`);

  const snapshot = await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(snapshot.ref);
  return downloadUrl;
}

/**
 * Uploads a file and returns the storage path instead of a public download URL.
 * Use this when you want to store the reference in Firestore and resolve it later
 * through your own viewing flow.
 */
export async function uploadFilePath(file: File, folder: string = "files"): Promise<string> {
  if (!storage) {
    throw new Error("Firebase Storage is not initialized.");
  }
  const fileExtension = file.name.split(".").pop() || "bin";
  const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
  const storageRef = ref(storage, `${folder}/${uniqueFilename}`);
  await uploadBytes(storageRef, file);
  return storageRef.fullPath;
}
