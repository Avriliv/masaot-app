import defaultPlantImage from '../assets/images/default-plant.jpg';
import defaultAnimalImage from '../assets/images/default-animal.jpg';

export const plants = [
  {
    id: 1,
    name: 'כלנית מצויה',
    latinName: 'Anemone coronaria',
    image: defaultPlantImage,
    isProtected: true,
    isPoisonous: false,
    season: ['winter', 'spring'],
    locations: ['צפון', 'מרכז'],
    description: 'פרח אדום נפוץ בחורף ובאביב, מוגן על פי חוק. הכלנית היא מהפרחים היפים והמוכרים בישראל, פורחת בעיקר בין ינואר למרץ.',
    warning: null,
    commonTrails: ['שביל הכלניות', 'הר מירון', 'פארק אדמית']
  },
  {
    id: 2,
    name: 'חצב מצוי',
    latinName: 'Urginea maritima',
    image: defaultPlantImage,
    isProtected: false,
    isPoisonous: true,
    season: ['autumn'],
    locations: ['כל הארץ'],
    description: 'צמח בצל גבוה עם פריחה לבנה בסתיו. החצב נחשב למבשר הסתיו בישראל, פורח באוגוסט-ספטמבר.',
    warning: 'הצמח רעיל! אין לגעת או לאכול',
    commonTrails: ['שביל ישראל', 'הרי ירושלים']
  },
  {
    id: 3,
    name: 'רקפת מצויה',
    latinName: 'Cyclamen persicum',
    image: defaultPlantImage,
    isProtected: true,
    isPoisonous: false,
    season: ['winter', 'spring'],
    locations: ['צפון', 'מרכז', 'הרים'],
    description: 'פרח מוגן בעל פרחים ורודים-סגולים עדינים. הרקפת היא אחד מסמלי הצמחים של ישראל.',
    warning: null,
    commonTrails: ['נחל אורן', 'הר מירון', 'הר הכרמל']
  },
  {
    id: 4,
    name: 'נרקיס מצוי',
    latinName: 'Narcissus tazetta',
    image: defaultPlantImage,
    isProtected: true,
    isPoisonous: true,
    season: ['winter'],
    locations: ['צפון', 'עמקים'],
    description: 'פרח חורף מוגן בעל ריח נעים. פורח בחודשי החורף בעמקים ובמישור החוף.',
    warning: 'הבצל רעיל - אין לאכול!',
    commonTrails: ['עמק הנרקיסים רמת הנדיב', 'נחל תבור']
  },
  {
    id: 5,
    name: 'צבעוני ההרים',
    latinName: 'Tulipa agenensis',
    image: defaultPlantImage,
    isProtected: true,
    isPoisonous: false,
    season: ['spring'],
    locations: ['צפון', 'הרים'],
    description: 'פרח אדום מרהיב הפורח באביב. נדיר יחסית ומוגן על פי חוק.',
    warning: null,
    commonTrails: ['הר מירון', 'הר גילבוע']
  },
  {
    id: 6,
    name: 'אירוס הארגמן',
    latinName: 'Iris atropurpurea',
    image: defaultPlantImage,
    isProtected: true,
    isPoisonous: false,
    season: ['winter', 'spring'],
    locations: ['מישור החוף'],
    description: 'אירוס נדיר ומוגן הפורח בסגול כהה. אנדמי לישראל ונמצא בסכנת הכחדה.',
    warning: 'צמח בסכנת הכחדה - אסור לקטוף!',
    commonTrails: ['פארק השרון', 'חולות ניצנים']
  },
  {
    id: 7,
    name: 'תורמוס ההרים',
    latinName: 'Lupinus pilosus',
    image: defaultPlantImage,
    isProtected: false,
    isPoisonous: false,
    season: ['winter', 'spring'],
    locations: ['צפון', 'מרכז', 'הרים'],
    description: 'פרח כחול-סגול יפהפה הגדל בקבוצות. פורח בחורף ובאביב.',
    warning: null,
    commonTrails: ['הר מירון', 'רמת הגולן', 'הרי יהודה']
  }
];

export const animals = [
  {
    id: 1,
    name: 'שועל מצוי',
    latinName: 'Vulpes vulpes',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Red_Fox_%28Vulpes_vulpes%29_%284%29.jpg/1280px-Red_Fox_%28Vulpes_vulpes%29_%284%29.jpg',
    activity: ['night', 'dawn', 'dusk'],
    danger: 'low',
    locations: ['כל הארץ'],
    behavior: 'נמנע ממגע עם בני אדם, פעיל בעיקר בלילה. ניזון ממכרסמים, חרקים ופירות.',
    safetyTips: ['לא להאכיל', 'לשמור מרחק', 'לא להתקרב לגורים', 'להרחיק מזון מהאוהל בלילה']
  },
  {
    id: 2,
    name: 'יעל נובי',
    latinName: 'Capra nubiana',
    image: defaultAnimalImage,
    activity: ['day'],
    danger: 'low',
    locations: ['מדבר יהודה', 'הנגב', 'אילת'],
    behavior: 'חי בלהקות, מטפס על צוקים. היעלים מותאמים היטב לחיים במדבר ובמצוקים.',
    safetyTips: ['לשמור מרחק', 'לא להאכיל', 'לא להתקרב לצעירים', 'לא להפריע בזמן שתייה']
  },
  {
    id: 3,
    name: 'צבי ישראלי',
    latinName: 'Gazella gazella',
    image: defaultAnimalImage,
    activity: ['dawn', 'dusk'],
    danger: 'none',
    locations: ['צפון', 'מרכז', 'דרום'],
    behavior: 'חי בקבוצות קטנות, פעיל בעיקר בשעות הבוקר המוקדמות ולפני השקיעה.',
    safetyTips: ['לשמור מרחק', 'לא להאכיל', 'להביא כובע ומסנן קרינה', 'לא לרדוף']
  },
  {
    id: 4,
    name: 'דרבן מצוי',
    latinName: 'Hystrix indica',
    image: defaultAnimalImage,
    activity: ['night'],
    danger: 'low',
    locations: ['כל הארץ'],
    behavior: 'פעיל בלילה, ניזון מצמחים ושורשים. מתגונן באמצעות קוצים.',
    safetyTips: ['להתרחק מיד אם רואים', 'לא להאיר בפנס', 'לא לנסות ללטף', 'להרחיק כלבים']
  },
  {
    id: 5,
    name: 'חוגלת סלעים',
    latinName: 'Alectoris chukar',
    image: defaultAnimalImage,
    activity: ['day'],
    danger: 'none',
    locations: ['הרים', 'מדבר'],
    behavior: 'ציפור קרקע החיה בלהקות, ניזונה מזרעים וחרקים.',
    safetyTips: ['לשמור מרחק', 'לא להאכיל', 'לא להפריע לקינון']
  },
  {
    id: 6,
    name: 'נשר מקראי',
    latinName: 'Gyps fulvus',
    image: defaultAnimalImage,
    activity: ['day'],
    danger: 'none',
    locations: ['מדבר יהודה', 'נגב', 'גליל'],
    behavior: 'עוף דורס גדול, מרשים במיוחד. דואה בגובה רב ומקנן במצוקים.',
    safetyTips: ['לא להתקרב לקינים', 'לא להאכיל', 'לשמור על שקט באזורי קינון']
  },
  {
    id: 7,
    name: 'צב יבשה מצוי',
    latinName: 'Testudo graeca',
    image: defaultAnimalImage,
    activity: ['day'],
    danger: 'none',
    locations: ['כל הארץ'],
    behavior: 'פעיל בעיקר בבוקר ואחר הצהריים. ניזון מצמחים.',
    safetyTips: ['לא להרים או להזיז', 'לא להאכיל', 'לא לקחת הביתה - מוגן על פי חוק']
  }
];

export const seasonalInfo = {
  waterfalls: [
    {
      id: 1,
      name: 'מפל התנור',
      status: 'active',
      lastUpdate: '2024-12-29',
      bestSeason: ['winter', 'spring'],
      tips: ['מומלץ להגיע אחרי גשם', 'יש להצטייד בנעלי הליכה בתוך המים']
    },
    {
      id: 2,
      name: 'מפל עין גדי',
      status: 'active',
      lastUpdate: '2024-12-29',
      bestSeason: ['all'],
      tips: ['מומלץ להגיע בשעות הבוקר', 'להצטייד במים רבים', 'ניתן לטבול במים']
    },
    {
      id: 3,
      name: 'מפלי סער',
      status: 'active',
      lastUpdate: '2024-12-29',
      bestSeason: ['winter', 'spring'],
      tips: ['יש לבדוק מזג אוויר לפני ההגעה', 'זהירות מהחלקה על סלעים רטובים']
    }
  ],
  seasonalTips: {
    winter: [
      'להצטייד בביגוד חם ואטום למים',
      'לבדוק תחזית גשמים לפני היציאה',
      'להיזהר משיטפונות בנחלים',
      'לקחת שכבות ביגוד נוספות',
      'להצטייד בפנס תקין'
    ],
    spring: [
      'להצטייד במים רבים',
      'להיזהר מזוחלים מתעוררים',
      'זמן טוב לצפות בפריחה',
      'להביא כובע ומסנן קרינה',
      'לצאת מוקדם לטיולים ארוכים'
    ],
    summer: [
      'לטייל בשעות הבוקר המוקדמות',
      'להצטייד בהרבה מים (לפחות 3 ליטר לאדם)',
      'להימנע מטיולים בשעות החמות',
      'חובה כובע רחב שוליים',
      'להכיר נקודות מילוי מים במסלול'
    ],
    autumn: [
      'עונה מצוינת לטיולים ארוכים',
      'להיערך לשינויי מזג אוויר',
      'לבדוק תחזית לפני היציאה',
      'להצטייד בפנס לשעות החשיכה המוקדמות',
      'זמן טוב לצפות בנדידת ציפורים'
    ]
  }
};
