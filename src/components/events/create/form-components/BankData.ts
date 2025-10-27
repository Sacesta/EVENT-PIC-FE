// Israeli Bank Data
// Format: Bank Code | Bank Name | Branch Code | Branch Name | Address | City

export interface BankBranch {
  bankCode: string;
  bankName: string;
  branchCode: string;
  branchName: string;
  address: string;
  city: string;
}

export const ISRAELI_BANKS_DATA: BankBranch[] = [
  { bankCode: "3", bankName: "בנק אש ישראל בע\"מ", branchCode: "1", branchName: "ישראל", address: "החרש 20", city: "תל אביב -יפו" },
  { bankCode: "3", bankName: "בנק אש ישראל בע\"מ", branchCode: "900", branchName: "תפעולי", address: "החרש 20", city: "תל אביב -יפו" },
  { bankCode: "4", bankName: "בנק יהב לעובדי המדינה בע\"מ", branchCode: "7", branchName: "מלחה ירושלים", address: "אגודת הספורט בית\"ר 1 קניון עזריאלי מלחה ירושלים", city: "ירושלים" },
  { bankCode: "4", bankName: "בנק יהב לעובדי המדינה בע\"מ", branchCode: "44", branchName: "הלל יפה חדרה", address: "דרך השלום 1 בית החולים הלל יפה", city: "חדרה" },
  { bankCode: "10", bankName: "בנק לאומי לישראל בע\"מ", branchCode: "601", branchName: "פפר", address: "מונטיפיורי 31 קומה 1", city: "תל אביב -יפו" },
  { bankCode: "10", bankName: "בנק לאומי לישראל בע\"מ", branchCode: "801", branchName: "יפו", address: "מרזוק ועזר 11", city: "תל אביב -יפו" },
  { bankCode: "10", bankName: "בנק לאומי לישראל בע\"מ", branchCode: "851", branchName: "רמת גן", address: "ביאליק 22", city: "רמת גן" },
  { bankCode: "10", bankName: "בנק לאומי לישראל בע\"מ", branchCode: "902", branchName: "המלך ג'ורג'", address: "המלך ג'ורג' 22", city: "ירושלים" },
  { bankCode: "10", bankName: "בנק לאומי לישראל בע\"מ", branchCode: "924", branchName: "באר שבע", address: "יצחק רגר 11 דרך הנשיאים 11, מגדל שבע", city: "באר שבע" },
  { bankCode: "10", bankName: "בנק לאומי לישראל בע\"מ", branchCode: "932", branchName: "אשדוד", address: "שבי ציון 3 מרכז מסחרי א'", city: "אשדוד" },
  { bankCode: "10", bankName: "בנק לאומי לישראל בע\"מ", branchCode: "940", branchName: "פתח תקוה", address: "יצחק רבין 1 בנין גלובל טאוורס", city: "פתח תקווה" },
  { bankCode: "10", bankName: "בנק לאומי לישראל בע\"מ", branchCode: "952", branchName: "נתניה", address: "שטמפפר 9", city: "נתניה" },
  { bankCode: "11", bankName: "בנק דיסקונט לישראל בע\"מ", branchCode: "10", branchName: "ראשי ת\"א", address: "יהודה הלוי 27", city: "תל אביב -יפו" },
  { bankCode: "11", bankName: "בנק דיסקונט לישראל בע\"מ", branchCode: "42", branchName: "נתניה", address: "סמילנסקי 6", city: "נתניה" },
  { bankCode: "11", bankName: "בנק דיסקונט לישראל בע\"מ", branchCode: "94", branchName: "באר שבע", address: "שד' דוד טוביהו 125", city: "באר שבע" },
  { bankCode: "11", bankName: "בנק דיסקונט לישראל בע\"מ", branchCode: "159", branchName: "מרכז ירושלים", address: "יפו 103", city: "ירושלים" },
  { bankCode: "12", bankName: "בנק הפועלים בע\"מ", branchCode: "170", branchName: "הסניף הראשי", address: "רוטשילד 50", city: "תל אביב -יפו" },
  { bankCode: "12", bankName: "בנק הפועלים בע\"מ", branchCode: "612", branchName: "נתניה", address: "הרצל 32", city: "נתניה" },
  { bankCode: "12", bankName: "בנק הפועלים בע\"מ", branchCode: "613", branchName: "רמת גן", address: "ביאליק 32", city: "רמת גן" },
  { bankCode: "12", bankName: "בנק הפועלים בע\"מ", branchCode: "631", branchName: "באר שבע", address: "העצמאות 40", city: "באר שבע" },
  { bankCode: "12", bankName: "בנק הפועלים בע\"מ", branchCode: "634", branchName: "ראשון לציון", address: "רוטשילד 13", city: "ראשון לציון" },
  { bankCode: "12", bankName: "בנק הפועלים בע\"מ", branchCode: "690", branchName: "ירושלים, ראשי", address: "המלך ג'ורג' 16", city: "ירושלים" },
  { bankCode: "13", bankName: "בנק אגוד לישראל בע\"מ", branchCode: "51", branchName: "ירושלים ראשי", address: "בן יהודה 1", city: "ירושלים" },
  { bankCode: "13", bankName: "בנק אגוד לישראל בע\"מ", branchCode: "63", branchName: "תל אביב ראשי", address: "אחוזת בית 6", city: "תל אביב -יפו" },
  { bankCode: "14", bankName: "בנק אוצר החייל בע\"מ", branchCode: "357", branchName: "הסניף המרכזי", address: "שד' רוטשילד 42", city: "תל אביב -יפו" },
  { bankCode: "14", bankName: "בנק אוצר החייל בע\"מ", branchCode: "363", branchName: "באר שבע", address: "בן צבי 9", city: "באר שבע" },
  { bankCode: "14", bankName: "בנק אוצר החייל בע\"מ", branchCode: "369", branchName: "ירושלים", address: "הלל 10", city: "ירושלים" },
  { bankCode: "17", bankName: "בנק מרכנתיל דיסקונט בע\"מ", branchCode: "607", branchName: "מרכז מומחים-חולון", address: "דיסקונט 1", city: "ראשון לציון" },
];

// Get unique banks with formatted display
export const getUniqueBanks = (): Array<{code: string; name: string; displayName: string}> => {
  const bankMap = new Map<string, string>();
  ISRAELI_BANKS_DATA.forEach(branch => {
    if (!bankMap.has(branch.bankCode)) {
      bankMap.set(branch.bankCode, branch.bankName);
    }
  });
  return Array.from(bankMap.entries()).map(([code, name]) => ({
    code,
    name,
    displayName: `${code} - ${name}`
  }));
};

// Get branches for a specific bank with formatted display
export const getBranchesForBank = (bankCode: string): Array<{code: string; name: string; address: string; city: string; displayName: string}> => {
  return ISRAELI_BANKS_DATA
    .filter(branch => branch.bankCode === bankCode)
    .map(branch => ({
      code: branch.branchCode,
      name: branch.branchName,
      address: branch.address,
      city: branch.city,
      displayName: `${branch.branchCode} - ${branch.branchName} - ${branch.city}`
    }));
};
