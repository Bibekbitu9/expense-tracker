/**
 * Monthly Expense Intelligence — Google Apps Script Backend
 * 
 * SETUP:
 * 1. Go to script.google.com → New Project
 * 2. Paste this entire code
 * 3. Deploy → New Deployment → Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy the Web App URL → paste into .env.local
 */

const SHEET_ID = '1cFOQIC-XHaBBl0NTcns07wqUVTc7C6z2suhZVszqwX0';
const SHEET_NAME = 'Expenses';

function getOrCreateSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Date', 'Category', 'Amount', 'Paid By', 'Note', 'Month', 'Year']);
    
    // Format header row
    const headerRange = sheet.getRange(1, 1, 1, 7);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4F46E5');
    headerRange.setFontColor('#FFFFFF');
    
    // Set column widths
    sheet.setColumnWidth(1, 120);
    sheet.setColumnWidth(2, 200);
    sheet.setColumnWidth(3, 100);
    sheet.setColumnWidth(4, 100);
    sheet.setColumnWidth(5, 250);
    sheet.setColumnWidth(6, 80);
    sheet.setColumnWidth(7, 80);
  } else {
    // Check if Paid By exists. If not, append it to the end of headers.
    const lastCol = sheet.getLastColumn();
    if (lastCol > 0) {
      const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
      const hasPaidBy = headers.some(h => String(h).trim().toLowerCase() === 'paid by');
      
      if (!hasPaidBy) {
        sheet.getRange(1, lastCol + 1).setValue('Paid By')
             .setFontWeight('bold')
             .setBackground('#4F46E5')
             .setFontColor('#FFFFFF');
        sheet.setColumnWidth(lastCol + 1, 100);
      }
    }
  }
  
  return sheet;
}

function doPost(e) {
  try {
    Logger.log('doPost called');
    
    if (!e || !e.postData || !e.postData.contents) {
      Logger.log('Error: No post data received');
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, message: 'No data received' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    Logger.log('Raw data: ' + e.postData.contents);
    const data = JSON.parse(e.postData.contents);
    
    // Validate required fields
    if (!data.date || !data.category || !data.amount || !data.paidBy) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, message: 'Missing required fields: date, category, amount, paidBy' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const sheet = getOrCreateSheet();
    
    const date = new Date(data.date);
    if (isNaN(date.getTime())) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, message: 'Invalid date format: ' + data.date }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    // Format date as DD/MM/YYYY
    const formattedDate = Utilities.formatDate(date, Session.getScriptTimeZone(), 'dd/MM/yyyy');
    
    // Construct row based on dynamic headers
    const lastCol = sheet.getLastColumn();
    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    
    const rowData = new Array(lastCol).fill('');
    
    headers.forEach((header, index) => {
      const h = String(header).trim().toLowerCase();
      if (h === 'date') rowData[index] = formattedDate;
      else if (h === 'category') rowData[index] = data.category;
      else if (h === 'amount') rowData[index] = parseFloat(data.amount);
      else if (h === 'paid by') rowData[index] = data.paidBy;
      else if (h === 'note') rowData[index] = data.note || '';
      else if (h === 'month') rowData[index] = month;
      else if (h === 'year') rowData[index] = year;
    });
    
    sheet.appendRow(rowData);
    
    Logger.log('Expense added: ' + formattedDate + ' | ' + data.category + ' | ' + data.amount + ' | ' + data.paidBy);
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Expense added successfully' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: 'Server error: ' + error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (action === 'fetch') {
      const sheet = getOrCreateSheet();
      const data = sheet.getDataRange().getValues();
      
      if (data.length <= 1) {
        return ContentService
          .createTextOutput(JSON.stringify({ success: true, data: [] }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      const headers = data[0];
      const rows = data.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header.toLowerCase()] = row[index];
        });
        return obj;
      });
      
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, data: rows }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: 'Invalid action' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
