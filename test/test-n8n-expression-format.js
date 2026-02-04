/**
 * בדיקת מה ש-n8n expression מייצר
 * סימולציה של הביטוי: 972{{ $json.M_phone }}
 */

// סימולציה של מה ש-n8n עושה עם הביטוי
const testCases = [
  {
    name: 'ביטוי n8n: 972{{ $json.M_phone }}',
    input: '525904030', // M_phone מהתמונה
    expression: '972{{ $json.M_phone }}',
    expected: '<phone from env>'
  },
  {
    name: 'ביטוי n8n: 972{{ $json.M_phone }} (כמספר)',
    input: 525904030, // M_phone כמספר
    expression: '972{{ $json.M_phone }}',
    expected: '<phone from env>'
  },
  {
    name: 'ביטוי n8n: {{ $json.M_phone }} (ללא 972)',
    input: '525904030',
    expression: '{{ $json.M_phone }}',
    expected: '525904030'
  }
];

// סימולציה של ה-value expression מהקוד
function simulateN8nValueExpression(inputValue) {
  console.log('\n' + '═'.repeat(70));
  console.log('🔍 סימולציה של ה-value expression מהקוד');
  console.log('═'.repeat(70));
  console.log(`Input value: ${JSON.stringify(inputValue)}`);
  console.log(`Input type: ${typeof inputValue}`);
  console.log(`Is array: ${Array.isArray(inputValue)}`);
  
  // זה מה שה-value expression עושה:
  try {
    // 1. בדיקה אם יש ערך
    if (!inputValue) {
      throw new Error('CRITICAL SAFETY: Phone number is required. Empty userList would delete ALL users.');
    }
    
    // 2. המרה למערך
    const arr = Array.isArray(inputValue) ? inputValue : [inputValue];
    console.log(`\nAfter converting to array: ${JSON.stringify(arr)}`);
    
    // 3. סינון ערכים ריקים
    const valid = arr.filter(v => v && typeof v === 'string' && v.trim() !== '');
    console.log(`After filtering: ${JSON.stringify(valid)}`);
    
    if (valid.length === 0) {
      throw new Error('CRITICAL SAFETY: Phone number is required.');
    }
    
    // 4. פורמט מספרי טלפון
    const formatted = valid.map(phone => {
      let clean = String(phone).trim().replace(/[\s\-\(\)]/g, '');
      console.log(`\nProcessing phone: ${phone}`);
      console.log(`  After trim/replace: ${clean}`);
      
      if (clean.startsWith('0')) {
        clean = '972' + clean.substring(1);
        console.log(`  After 0->972 conversion: ${clean}`);
      }
      
      if (!clean.startsWith('972') && !clean.startsWith('+972')) {
        clean = '972' + clean;
        console.log(`  After adding 972: ${clean}`);
      }
      
      clean = clean.replace('+', '');
      console.log(`  Final: ${clean}`);
      
      return clean;
    });
    
    console.log(`\n✅ Final formatted array: ${JSON.stringify(formatted)}`);
    return formatted;
    
  } catch (error) {
    console.log(`\n❌ Error: ${error.message}`);
    throw error;
  }
}

// בדיקת מה קורה עם הביטוי של n8n
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║     בדיקת ביטויי n8n והשפעתם על ה-value expression          ║');
console.log('╚══════════════════════════════════════════════════════════════╝');

testCases.forEach((testCase, index) => {
  console.log(`\n\n${'═'.repeat(70)}`);
  console.log(`📋 Test Case ${index + 1}: ${testCase.name}`);
  console.log('═'.repeat(70));
  
  // סימולציה של מה ש-n8n עושה עם הביטוי
  let n8nResult;
  try {
    // n8n מחליף את {{ $json.M_phone }} בערך
    if (testCase.expression.includes('{{ $json.M_phone }}')) {
      const phoneValue = String(testCase.input);
      n8nResult = testCase.expression.replace('{{ $json.M_phone }}', phoneValue);
    } else {
      n8nResult = testCase.input;
    }
    
    console.log(`\n📤 n8n expression result: ${n8nResult}`);
    console.log(`Expected: ${testCase.expected}`);
    console.log(`Match: ${n8nResult === testCase.expected ? '✅' : '❌'}`);
    
    // עכשיו נבדוק מה ה-value expression עושה עם זה
    console.log(`\n📥 Input to value expression: ${JSON.stringify(n8nResult)}`);
    const formatted = simulateN8nValueExpression(n8nResult);
    
    console.log(`\n✅ Final result for API: ${JSON.stringify({ userList: formatted })}`);
    
  } catch (error) {
    console.log(`\n❌ Test failed: ${error.message}`);
  }
});

// בדיקה מיוחדת: מה קורה אם n8n שולח את הערך ישירות (ללא expression)
console.log('\n\n' + '═'.repeat(70));
console.log('📋 בדיקה מיוחדת: מה קורה אם n8n שולח את הערך ישירות');
console.log('═'.repeat(70));

const directValue = process.env.PHONE || process.env.PAL_PHONE || ''; // from env
console.log(`\nDirect value from n8n expression: ${directValue}`);
const formattedDirect = simulateN8nValueExpression(directValue);
console.log(`\n✅ Final result: ${JSON.stringify({ userList: formattedDirect })}`);

// בדיקה: מה קורה אם n8n שולח מספר (לא string)
console.log('\n\n' + '═'.repeat(70));
console.log('📋 בדיקה: מה קורה אם n8n שולח מספר (לא string)');
console.log('═'.repeat(70));

const numericValue = directValue ? parseInt(directValue, 10) : 0;
console.log(`\nNumeric value: ${numericValue}`);
const formattedNumeric = simulateN8nValueExpression(numericValue);
console.log(`\n✅ Final result: ${JSON.stringify({ userList: formattedNumeric })}`);
