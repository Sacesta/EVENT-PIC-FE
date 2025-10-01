// Auto-translation utility for dynamic backend data
// This translates common English words/phrases to Hebrew

const translationMap: Record<string, string> = {
  // Event Categories
  'birthday': 'יום הולדת',
  'wedding': 'חתונה',
  'corporate': 'ארגוני',
  'conference': 'כנס',
  'workshop': 'סדנה',
  'concert': 'קונצרט',
  'festival': 'פסטיבל',
  'graduation': 'סיום לימודים',
  'anniversary': 'יום נישואין',
  'baby-shower': 'מסיבת תינוק',
  'baby shower': 'מסיבת תינוק',
  'networking': 'נטוורקינג',
  'charity': 'צדקה',
  'party': 'מסיבה',
  'celebration': 'חגיגה',
  'seminar': 'סמינר',
  'exhibition': 'תערוכה',
  'gala': 'גאלה',
  'fundraiser': 'גיוס כספים',
  'reunion': 'מפגש',
  'other': 'אחר',
  
  // Service titles
  'music': 'מוזיקה',
  'musical': 'מוזיקלי',
  'music services': 'שירותי מוזיקה',
  'classical music': 'מוזיקה קלאסית',
  'classical': 'קלאסי',
  'photography': 'צילום',
  'photographer': 'צלם',
  'photo': 'תמונה',
  'photos': 'תמונות',
  'videography': 'צילום וידאו',
  'videographer': 'צלם וידאו',
  'video': 'וידאו',
  'catering': 'קייטרינג',
  'caterer': 'קייטרינג',
  'food': 'אוכל',
  'decoration': 'קישוט',
  'decorations': 'קישוטים',
  'decorator': 'מעצב',
  'flowers': 'פרחים',
  'florist': 'פרחים',
  'transportation': 'הסעות',
  'transport': 'הסעה',
  'security': 'אבטחה',
  'lighting': 'תאורה',
  'lights': 'תאורה',
  'sound': 'הגברה',
  'audio': 'אודיו',
  'furniture': 'ריהוט',
  'tents': 'אוהלים',
  'tent': 'אוהל',
  'dj': 'תקליטן',
  'band': 'להקה',
  'entertainment': 'בידור',
  'makeup': 'איפור',
  'hair': 'שיער',
  'styling': 'עיצוב',
  
  // Package names
  'basic': 'בסיסי',
  'standard': 'רגיל',
  'premium': 'פרימיום',
  'deluxe': 'דלוקס',
  'package': 'חבילה',
  'plan': 'תוכנית',
  'vip': 'VIP',
  'general': 'כללי',
  'early bird': 'מוקדם',
  'regular': 'רגיל',
  
  // Status words
  'draft': 'טיוטה',
  'published': 'פורסם',
  'pending': 'ממתין',
  'approved': 'מאושר',
  'rejected': 'נדחה',
  'cancelled': 'בוטל',
  'completed': 'הושלם',
  'active': 'פעיל',
  'inactive': 'לא פעיל',
  'confirmed': 'מאושר',
  'upcoming': 'קרוב',
  'past': 'עבר',
  'ongoing': 'מתמשך',
  
  // Ticket related
  'ticket': 'כרטיס',
  'tickets': 'כרטיסים',
  'admission': 'כניסה',
  'entry': 'כניסה',
  'pass': 'כרטיס כניסה',
  'free': 'חינם',
  'paid': 'בתשלום',
  'available': 'זמין',
  'sold out': 'אזל המלאי',
  'limited': 'מוגבל',
  
  // Location related
  'location': 'מקום',
  'address': 'כתובת',
  'city': 'עיר',
  'venue': 'מקום',
  'hall': 'אולם',
  'garden': 'גן',
  'outdoor': 'חוץ',
  'indoor': 'פנים',
  'online': 'מקוון',
  'virtual': 'וירטואלי',
  'street': 'רחוב',
  'avenue': 'שדרה',
  'road': 'כביש',
  
  // Common words
  'service': 'שירות',
  'services': 'שירותים',
  'professional': 'מקצועי',
  'expert': 'מומחה',
  'quality': 'איכות',
  'best': 'הטוב ביותר',
  'top': 'מוביל',
  'affordable': 'במחיר סביר',
  'luxury': 'יוקרה',
  'good': 'טוב',
  'great': 'מעולה',
  'excellent': 'מצוין',
  'amazing': 'מדהים',
  'special': 'מיוחד',
  'unique': 'ייחודי',
  'exclusive': 'בלעדי',
  'popular': 'פופולרי',
  'featured': 'מומלץ',
  'new': 'חדש',
  'hot': 'חם',
  'trending': 'טרנדי',
  
  // Event description words
  'event': 'אירוע',
  'events': 'אירועים',
  'organizer': 'מארגן',
  'producer': 'מפיק',
  'host': 'מארח',
  'guest': 'אורח',
  'guests': 'אורחים',
  'attendee': 'משתתף',
  'attendees': 'משתתפים',
  'participant': 'משתתף',
  'participants': 'משתתפים',
  'speaker': 'דובר',
  'speakers': 'דוברים',
  'performer': 'מבצע',
  'performers': 'מבצעים',
  
  // Time related
  'date': 'תאריך',
  'time': 'שעה',
  'duration': 'משך',
  'start': 'התחלה',
  'end': 'סיום',
  'day': 'יום',
  'night': 'לילה',
  'morning': 'בוקר',
  'afternoon': 'אחר הצהריים',
  'evening': 'ערב',
  'hour': 'שעה',
  'hours': 'שעות',
  'minute': 'דקה',
  'minutes': 'דקות',
  
  // Action words
  'to': 'ל',
  'capture': 'ללכוד',
  'moments': 'רגעים',
  'is': 'הוא',
  'are': 'הם',
  'the': 'ה',
  'and': 'ו',
  'with': 'עם',
  'for': 'עבור',
  'at': 'ב',
  'in': 'ב',
  'on': 'על',
  'by': 'על ידי',
  'from': 'מ',
  
  // Pricing related
  'price': 'מחיר',
  'cost': 'עלות',
  'budget': 'תקציב',
  'per hour': 'לשעה',
  'per day': 'ליום',
  'per person': 'לאדם',
  'fixed': 'קבוע',
  'flexible': 'גמיש',
  'negotiable': 'ניתן למשא ומתן',
  'starting from': 'החל מ',
  
  // Supplier related
  'supplier': 'ספק',
  'suppliers': 'ספקים',
  'vendor': 'ספק',
  'vendors': 'ספקים',
  'provider': 'ספק',
  'providers': 'ספקים',
  'company': 'חברה',
  'business': 'עסק',
  
  // Cities (if needed)
  'ahmedabad': 'אחמדאבאד',
  'mumbai': 'מומבאי',
  'delhi': 'דלהי',
  'bangalore': 'בנגלור',
  'tel aviv': 'תל אביב',
  'jerusalem': 'ירושלים',
  'haifa': 'חיפה',
  'beer sheva': 'באר שבע',
  'netanya': 'נתניה',
  'ramat gan': 'רמת גן'
};

/**
 * Auto-translate English text to Hebrew
 * @param text - The English text to translate
 * @param currentLanguage - Current app language ('en' or 'he')
 * @returns Translated text if language is Hebrew, original text otherwise
 */
export const autoTranslate = (text: string, currentLanguage: string): string => {
  // Only translate if current language is Hebrew
  if (currentLanguage !== 'he' || !text) {
    return text;
  }

  const lowerText = text.toLowerCase().trim();
  
  // Direct match
  if (translationMap[lowerText]) {
    return translationMap[lowerText];
  }
  
  // Try to find partial matches for compound words
  let translated = text;
  Object.entries(translationMap).forEach(([english, hebrew]) => {
    const regex = new RegExp(`\\b${english}\\b`, 'gi');
    translated = translated.replace(regex, hebrew);
  });
  
  // If translation occurred, return it; otherwise return original
  return translated !== text ? translated : text;
};

/**
 * Translate service category from backend
 * @param category - Category code from backend (e.g., 'music', 'photography')
 * @param currentLanguage - Current app language
 * @returns Translated category name
 */
export const translateCategory = (category: string, currentLanguage: string): string => {
  if (currentLanguage !== 'he') {
    return category;
  }
  
  const categoryMap: Record<string, string> = {
    'photography': 'צילום',
    'videography': 'צילום וידאו',
    'catering': 'קייטרינג',
    'music': 'מוזיקה',
    'decoration': 'קישוט',
    'transportation': 'הסעות',
    'security': 'אבטחה',
    'lighting': 'תאורה',
    'sound': 'הגברה',
    'furniture': 'ריהוט',
    'tents': 'אוהלים',
    'other': 'אחר'
  };
  
  return categoryMap[category.toLowerCase()] || category;
};
