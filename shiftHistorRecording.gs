
var SHIFT_SPREADSHEET_URL = '';
var SHIFT_HISTORY_URL = '';
var AGGREGATE_SHEET_NAME = "term01";


var NUM_MAX_OPERATORS_INTEGRATED = 4;

function checkMember(person){
  var members = {'nickname':'firstName.familyName', }

  if(members[person]!= null){
    return members[person];
  }
  else{
    return false;
  }
}


function fetchPassList(sheet,numMaxColumn, numMaxMember){

  var numMaxRow = 1+ (1+numMaxMember)*8;
  var tmpPassList = sheet.getRange(1,1,numMaxRow,numMaxColumn).getValues();
  var passList = []

  for(var columnIndex=0; columnIndex < numMaxColumn;columnIndex++){
    
    var tmpSeriesPass = [];

    for(var rowIndex=0; rowIndex<numMaxRow; rowIndex++){
      if(typeof(tmpPassList[rowIndex][columnIndex])== "object"){
        tmpSeriesPass.push(tmpPassList[rowIndex][columnIndex]);
      }
    }
    if(!tmpSeriesPass.length){
      continue;
    }
    passList.push(tmpSeriesPass);
    //Logger.log(tmpSeriesPass);
  }
  
  return passList;
}


function createPassAvailabilityList(sheet,numMaxColumn, numMaxMember){

  var numMaxRow = 1+ (1+numMaxMember)*8;
  var tmpPassList = sheet.getRange(1,1,numMaxRow,numMaxColumn).getValues();
  var passJudgeList = []

  for(var columnIndex=0; columnIndex < numMaxColumn;columnIndex++){
    
    var tmpSeriesPass = [];
    var tmpJudge = [];
    var loopContinueBoolean = false;

    
    for(var rowIndex=0; rowIndex<numMaxRow; rowIndex++){
      loopContinueBoolean = false;
      if(typeof(tmpPassList[rowIndex][columnIndex])== "object"){
        
        for(var k=0; k<numMaxMember; k++){
          if(checkMember(tmpPassList[rowIndex-1+k][columnIndex+1])!==false){
            tmpJudge.push(true);
            loopContinueBoolean = true;
            break;
          }
        }        
        if(loopContinueBoolean == false){
          tmpJudge.push(false);
        }            
        
      }
    }
    if(!tmpJudge.length){
      continue;
    }
    passJudgeList.push(tmpJudge)
  }
  //Logger.log(passJudgeList);
  return passJudgeList
}


function fetchShiftList(sheet,numMaxColumn,numMaxMember){
  
  var numMaxRow = 1+ (1+numMaxMember)*8;
  var tmpShiftList =sheet.getRange(1,1,numMaxRow,numMaxColumn).getValues();
  var shiftList = [];

  for(var columnIndex=0; columnIndex < numMaxColumn;columnIndex++){
    var tmpOneDay = [];
    var tmpOnePass = [];

    if(columnIndex%2 == 0){
      continue;
    }

    for(var rowIndex=1; rowIndex<numMaxRow; rowIndex++){
    
      if(checkMember(tmpShiftList[rowIndex][columnIndex]) !== false){
        tmpOnePass.push(tmpShiftList[rowIndex][columnIndex]);//push(checkMember(tmpShiftList[rowIndex][columnIndex]))
      }
      
      if(rowIndex%(numMaxMember+1) == 0){
        tmpOneDay.push(tmpOnePass);
        tmpOnePass = [];
      }  

      if(!tmpOnePass.length){
        continue;
      }    
    }
    shiftList.push(tmpOneDay);
  }
  Logger.log(shiftList);
  return shiftList;
}

function searchMemberColumn(sheet,shiftMembers){
  var lastColumn = sheet.getLastColumn()
  
  var memberList = Array.prototype.concat.apply([], sheet.getRange(1,1,1,lastColumn).getValues());
  
  
  var tmp = [];
  for(var i=0; i<shiftMembers.length; i++){
    
    for(var j=0; j<memberList.length; j++){
      if(shiftMembers[i] == memberList[j]){

        tmp.push(j+1);
        break;
      }
      else if(j == memberList.length-1){
        sheet.insertColumnsAfter(1+j,1);
        sheet.getRange(1,2+j).setValue(shiftMembers[i]);
        memberList.push(shiftMembers[i]);
        tmp.push(j+2);
        j++;
      }
    }
    
  }
  //Logger.log(shiftMembers);
  //Logger.log(tmp);
  return tmp;
}


function sortColumn(sheet){
  lastRow = sheet.getLastRow();
  lastColumn = sheet.getLastColumn();
  
  var shiftSumPerPerson = Array.prototype.concat.apply([],sheet.getRange(2,2,1,lastColumn).getValues());
 
  sheet.getRange(3,2,lastRow-3,lastColumn-1).setNumberFormat("#");

  for(var i=0; i<shiftSumPerPerson.length; i++){
    
    for(var j=i+1; j<shiftSumPerPerson.length-1; j++){
      tmpList = [];
      tmp = "";
    
      if(shiftSumPerPerson[i] > shiftSumPerPerson[j]){
        tmpList = sheet.getRange(3,i+2,lastRow-2,1).getValues();
       
    
  
        sheet.getRange(3,i+2,lastRow-2,1).setValues(sheet.getRange(3,j+2,lastRow-2,1).getValues());
        sheet.getRange(3,j+2,lastRow-2,1).setValues(tmpList);
        sheet.getRange(3,2,lastRow-3,lastColumn-1).setNumberFormat("#");

        tmpName = sheet.getRange(1,i+2).getValue();
        sheet.getRange(1,i+2).setValue(sheet.getRange(1,j+2).getValue());
        sheet.getRange(1,j+2).setValue(tmpName);

        tmp = shiftSumPerPerson[i];
        shiftSumPerPerson[i] = shiftSumPerPerson[j];
        shiftSumPerPerson[j] = tmp;
      
      }

    }

  }

}


function transpose2D(array){
  var numRow = array.length;
  var numCol = array[0].length;
  var newArray = [];
  for(var i=0; i<numCol; i++){
    var tmp = [];
    for(var j=0; j<numRow; j++){
      tmp.push(array[j][i]);
    }
    newArray.push(tmp);
  }
  return newArray;
}

function displaySheetUpdate(){
  var ss = SpreadsheetApp.openByUrl(SHIFT_HISTORY_URL);
  var aggregateSheet = ss.getSheetByName(AGGREGATE_SHEET_NAME);
  var displaySheet = ss.getSheetByName("閲覧用");
  var lastColumn = aggregateSheet.getMaxColumns();
   
  var historyData = aggregateSheet.getRange(1,1,2,lastColumn).getValues()
  var transposedData = transpose2D(historyData);
  Logger.log(transposedData);
  displaySheet.clear()
  displaySheet.getRange(1,1,transposedData.length,2).setValues(transposedData);

};


function main() {
  var ss = SpreadsheetApp.openByUrl(SHIFT_SPREADSHEET_URL);
  var sheet = ss.getSheetByName("全体");
  var numMaxColumn = sheet.getMaxColumns();


  var passList = fetchPassList(sheet,numMaxColumn, NUM_MAX_OPERATORS_INTEGRATED);
  var passJudgeList = createPassAvailabilityList(sheet,numMaxColumn, NUM_MAX_OPERATORS_INTEGRATED);
  Logger.log(passJudgeList);
  var shiftOperators = fetchShiftList(sheet,numMaxColumn, NUM_MAX_OPERATORS_INTEGRATED);
  Logger.log(shiftOperators);
  //Logger.log(passList);
  //Logger.log(passJudgeList);

  var ss2 = SpreadsheetApp.openByUrl(SHIFT_HISTORY_URL);
  var sheet2 = ss2.getSheetByName(AGGREGATE_SHEET_NAME);
  var lastRow = sheet2.getLastRow();
  Logger.log(lastRow);
  

  var j = 0;  
  var passGroupIndex = 0;
  for(passGroupIndex = 0; passGroupIndex < passList.length; passGroupIndex++ ){
    

    for(var i=0; i< passJudgeList[passGroupIndex].length; i++){
      if(passJudgeList[passGroupIndex][i]==true){
        
        
        sheet2.getRange(1+lastRow+j,1).setValue(passList[passGroupIndex][i]);
        

        var memberColumns = searchMemberColumn(sheet2,shiftOperators[passGroupIndex][i]);
      

        for(var eachMember=0; eachMember < memberColumns.length; eachMember++){
          
          sheet2.getRange(1+lastRow+j, memberColumns[eachMember]).setNumberFormat("#");
          sheet2.getRange(1+lastRow+j, memberColumns[eachMember]).setValue(1);
        }
        
        j++;
      }
      
    }


  }

  lastRow = sheet2.getLastRow();
  lastColumn = sheet2.getLastColumn();
  for(var i=2; i<=lastColumn; i++){
    sheet2.getRange(2,i).setFormulaR1C1("=sum(R[1]C:R["+ lastRow +"]C)");
  }
  
  sortColumn(sheet2);

  displaySheetUpdate(ss2);

}


function doGet() {
  var value = ScriptApp.getService().getUrl();
  Logger.log(value);
  var html = HtmlService.createTemplateFromFile('test');
  html.btn= value;
  return html.evaluate();
}
