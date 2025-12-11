// ملف مساعد لإنشاء Supabase Storage client
// سيستخدم للتعامل مع رفع الصور

import { createClient } from '@supabase/supabase-js';

// المتغيرات من Environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// دالة رفع صورة
export async function uploadImage(file, path) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { data, error } = await supabase.storage.from('cars-images').upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    // الحصول على URL العام
    const { data: publicUrlData } = supabase.storage.from('cars-images').getPublicUrl(filePath);

    return {
      url: publicUrlData.publicUrl,
      path: filePath,
      success: true,
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// دالة حذف صورة
export async function deleteImage(path) {
  try {
    const { error } = await supabase.storage.from('cars-images').remove([path]);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error deleting image:', error);
    return { success: false, error: error.message };
  }
}

// دالة رفع صور متعددة
export async function uploadMultipleImages(files, path) {
  const uploads = await Promise.all(files.map((file) => uploadImage(file, path)));

  return uploads;
}
