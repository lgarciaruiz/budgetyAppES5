//BUDGET CONTROLLER Module
var budgetController = (function(){
    
    var Expense = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        };
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };

    //Data structure for income
    var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var data = {
        allItems: {
            exp: [],
            inc: [],
        },
        totals: {
            exp: 0,
            inc: 0,
        },
        budget: 0,
        percentage: -1,
    };

    var calculateTotal = function (type){
        var sum = 0;
        data.allItems[type].forEach(function(current){
            sum += current.value;
        });
        data.totals[type] = sum;
    };

    return {
        addItem: function(type,des,val){
            var newItem, ID;

            if (data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else {
                ID = 0;
            };
            if (type === 'exp'){
                newItem = new Expense(ID,des,val);       
            } else if (type === 'inc'){
                newItem = new Income(ID,des,val);
            };
            
            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: function(type, id){
            var ids, index;
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index, 1);
            };
        },

        //public method to calculate budget
        calculateBudget: function(){
            calculateTotal('exp');
            calculateTotal('inc');
            data.budget = data.totals.inc - data.totals.exp;
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            };
        },

        //public method to clacluate percentages
        calculatePercentages: function(){
            data.allItems.exp.forEach(function(current){
                current.calcPercentage(data.totals.inc);
            });
        },

        //public method to return all percenatages in an array
        getPercentages: function(){
            var allPercentages;

            allPercentages = data.allItems.exp.map(function(current){
                return current.getPercentage();
            });

            return allPercentages;
        },

        //public getter function that will return the data properties
        getBudget: function() {
            return {
                budget: data.budget,
                percentage: data.percentage,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
            };
        },

        //method used for testing only
        testing: function(){
            console.log(data);           
        },
    };

})();


//UI CONTROLLER Module
var UIController = (function(){

    //This is the object containg list of classes/id's
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    
        //public method to format numbers in UI
        var formatNumber = function(num, type){
            var numSplit, int, dec;
            num = Math.abs(num);
            num = num.toFixed(2);
            numSplit = num.split('.');

            int = numSplit[0];
            dec = numSplit[1];
            if(int.length > 3){
                int = int.substr(0,int.length - 3) + ',' + int.substr(int.length - 3,int.length-1);
            };
            return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
        };

        var nodeListForEach = function(list, callbackFunction){
            for (var i = 0; i < list.length; i++){
                callbackFunction(list[i],i);
            };
        };

    return {
        getInput: function(){
            return{
                type: document.querySelector(DOMstrings.inputType).value, //will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
            };
        },

        addListItem: function(obj, type){
            var html, newHTML, element;

            if (type === 'inc'){
                 element = DOMstrings.incomeContainer;
                 html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp'){
                element = DOMstrings.expenseContainer;
                 html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div>'
            };

            //replace the placeholder text with some actual data
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formatNumber(obj.value,type));

            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },

        //public method to remove item from UI
        deleteListItem: function(selectorID,) {
            //select element by id
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        //method to clear fields
        clearFields: function(){
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, index, array) {
                current.value = '';
            });
            //move curser to the first query selector which in this case is the description field
            fieldsArr[0].focus();
        },

        //Function to have access to the DOM strings in other modules (controllers)
        getDOMstrings: function(){
            return DOMstrings;
        },
        
        displayBudget: function(obj){
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,obj.budget > 0 ? 'inc' : 'exp');
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp,'exp');

            if(obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '----';
            };
        },
        
        //public method to add percentage to appropriate row in UI
        displayPercentages: function(percentages){
            var fields;
            
            fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);

            //loop over percentages and add it to the UI if greater than zero
            nodeListForEach(fields,function(current,index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                }else{
                    current.textContent = '---';
                };
            });

        },

        //public method to display current month and year in UI
        displayMonth: function() {
            var year, now, month;
            //@date
            now = new Date();
            //var christmas = new Date(2015, 11, 25);
            year = now.getFullYear();
            month = now.toLocaleDateString('default', {month: 'long'});
            document.querySelector(DOMstrings.dateLabel).textContent = month + ' ' + year;
        },

        //public method to change input description bar depending on inc or exp
        changeType: function (){
            var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            nodeListForEach(fields,function(cur){
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },
    };

})();




//GLOBAL APP CONTROLLER module; 
var controller = (function(budgetCtrl, UICtrl){
    var setupEventListeners = function(){
            
        //Access UIController dom strings
        var DOM = UIController.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        //Add an event listener for a keypress; 
        document.addEventListener('keypress',function(event){
            //console.log('TEST:' + event);    
            //check if the event keycode is equal to 13 (enter key); also added which property for older browsers
            if (event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            };
        });
        //add event listenter to the parent element of all the elements we're interested in
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UIController.changeType);
    };

    var updateBudget = function (){
        
        //1. Calculate the budget
        budgetController.calculateBudget();
        //2. Return budget
        var budget = budgetController.getBudget();
        //3. Display the budget on the UI
        UIController.displayBudget(budget);
    };

    //update percentages
    var updatePercentages = function() {
        //1. calculate percentages
        budgetController.calculatePercentages();
        //2. read percentages from the budget controller
        var percentages = budgetController.getPercentages();
        //3. update the UI with the new percentages
        //console.log(percentages);
        UIController.displayPercentages(percentages);       
    };

    //Add new item in app
    var ctrlAddItem = function(){
        var input, newItem;
        //1. Get the field input data
        //Using public getInput method from UIController that returns an object
        input = UIController.getInput();
        //check to make sure the input data is not false
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            //console.log(input);
            //2. Add the item to the budget controller using the properties int the getInput method 
            newItem = budgetController.addItem(input.type, input.description, input.value);
            //3. Add the item to the UI
            UIController.addListItem(newItem,input.type);
            //4. Clear the fields
            UIController.clearFields();
            //5. Caluculate and update budget
            updateBudget();
            //6. update percentages
            updatePercentages();
        };
        
    };

    //delete an item in app; pass in the event object because we want to know the target element; @DOMtraversing
    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

       //get the items needed to delete the row from the app that was clicked to delete
        if(itemID){
            //split method splits a srting into an array by the argument passed in
            splitID = itemID.split('-');
            //get item type
            type = splitID[0];
            //get item id
            ID = parseInt(splitID[1]);
            //console.log(typeof ID);
            
            //1. delete the Item from data structure
            budgetController.deleteItem(type,ID);
            //2. delete item from UI;requires selector ID (element ID)
            UIController.deleteListItem(itemID);
            //3. Update and show new budget
            updateBudget();
            //4. update percentages
            updatePercentages();
        };
        
    };

    //setup a public init function that gets returned from an object to start the eventlisterners function
    return {
        init: function(){
            //console.log('TEST: app has started');
            setupEventListeners();
            UIController.displayBudget({
                budget: 0,
                percentage: 0,
                totalInc: 0,
                totalExp: 0,
            });
            //display month
            UIController.displayMonth();
        },
    };

})(budgetController,UIController);

controller.init();
