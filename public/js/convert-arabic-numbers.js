/**
 * سكريبت لتحويل الأرقام العربية إلى إنجليزية في المتصفح
 * يمكن تشغيله في console المتصفح أو إضافته كـ bookmarklet
 */

// دالة تحويل الأرقام العربية إلى إنجليزية
function convertArabicToEnglishNumbers(text) {
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  let result = text;
  for (let i = 0; i < arabicNumbers.length; i++) {
    result = result.replace(new RegExp(arabicNumbers[i], 'g'), englishNumbers[i]);
  }
  return result;
}

// دالة تحويل النص المحدد
function convertSpecificText() {
  // البحث عن جميع عناصر النص في الصفحة
  const allElements = document.querySelectorAll('*');
  let changesCount = 0;

  allElements.forEach(element => {
    // تحويل النص المباشر للعنصر
    if (element.childNodes) {
      element.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          const originalText = node.textContent;
          let newText = originalText;

          // تحويل "يوليو ٢٠٢٥" إلى "يوليو 2025"
          newText = newText.replace(/يوليو ٢٠٢٥/g, 'يوليو 2025');
          
          // تحويل "٢٨٩ مشاهدة" إلى "289 مشاهدة"
          newText = newText.replace(/٢٨٩ مشاهدة/g, '289 مشاهدة');
          
          // تحويل أي أرقام عربية أخرى
          newText = convertArabicToEnglishNumbers(newText);

          if (newText !== originalText) {
            node.textContent = newText;
            changesCount++;
            console.log(`تم التحويل: "${originalText}" → "${newText}"`);
          }
        }
      });
    }

    // تحويل النصوص في الخصائص المهمة
    const attributes = ['title', 'alt', 'placeholder', 'aria-label'];
    attributes.forEach(attr => {
      if (element.hasAttribute(attr)) {
        const originalValue = element.getAttribute(attr);
        let newValue = originalValue;

        newValue = newValue.replace(/يوليو ٢٠٢٥/g, 'يوليو 2025');
        newValue = newValue.replace(/٢٨٩ مشاهدة/g, '289 مشاهدة');
        newValue = convertArabicToEnglishNumbers(newValue);

        if (newValue !== originalValue) {
          element.setAttribute(attr, newValue);
          changesCount++;
          console.log(`تم تحويل الخاصية ${attr}: "${originalValue}" → "${newValue}"`);
        }
      }
    });
  });

  console.log(`✅ تم الانتهاء! تم إجراء ${changesCount} تغيير`);
  
  if (changesCount === 0) {
    console.log('ℹ️ لم يتم العثور على أرقام عربية للتحويل');
  }

  return changesCount;
}

// دالة للبحث عن النص المحدد في الصفحة
function findSpecificText() {
  const searchTerms = ['علي سالم', 'يوليو ٢٠٢٥', '289 مشاهدة', '٢٨٩ مشاهدة'];
  const results = [];

  searchTerms.forEach(term => {
    const elements = document.querySelectorAll('*');
    elements.forEach(element => {
      if (element.textContent && element.textContent.includes(term)) {
        results.push({
          term: term,
          element: element,
          text: element.textContent.trim()
        });
      }
    });
  });

  if (results.length > 0) {
    console.log('🔍 تم العثور على النصوص التالية:');
    results.forEach((result, index) => {
      console.log(`${index + 1}. المصطلح: "${result.term}"`);
      console.log(`   العنصر:`, result.element);
      console.log(`   النص الكامل: "${result.text}"`);
      console.log('---');
    });
  } else {
    console.log('❌ لم يتم العثور على النصوص المحددة في الصفحة');
  }

  return results;
}

// دالة لتشغيل التحويل التلقائي
function autoConvert() {
  console.log('🚀 بدء التحويل التلقائي...');
  
  // البحث أولاً
  const foundTexts = findSpecificText();
  
  // ثم التحويل
  const changes = convertSpecificText();
  
  return {
    foundTexts: foundTexts.length,
    changes: changes
  };
}

// تشغيل التحويل عند تحميل الصفحة
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoConvert);
} else {
  autoConvert();
}

// إضافة دوال للنافذة العامة للاستخدام في console
window.convertArabicNumbers = convertSpecificText;
window.findArabicText = findSpecificText;
window.autoConvertNumbers = autoConvert;

console.log(`
🔧 سكريبت تحويل الأرقام العربية جاهز!

الدوال المتاحة:
- convertArabicNumbers() - تحويل جميع الأرقام العربية في الصفحة
- findArabicText() - البحث عن النصوص المحددة
- autoConvertNumbers() - تشغيل التحويل التلقائي

مثال للاستخدام:
convertArabicNumbers();
`);
