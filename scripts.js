function sairModal1(){
    let modal = document.querySelector('.modal-overlay')
    modal.addEventListener('click', e=>{ 
        if(e.target.id == 'modal-escuro1'){
            modal.classList.remove('active');
    
    }})
    
}
function sairModal2(){
    let modal = document.querySelector('.modal-overlay-es')
    modal.addEventListener('click', e=>{ if(e.target.id == 'modal-escuro2'){
        modal.classList.remove('active');
        
    }
    document.querySelector('#data-table2 tbody.income1')
        .classList.add('inactive');
        document.querySelector('#data-table2 tbody.expense1')
        .classList.add('inactive');
        })
    
}



const Modal= {
    open(){//abrir modal: Adicionar a class active ao modal
        document.querySelector('.modal-overlay')
        .classList.add('active');
    },
    close(){//fechar o modal: remover a class active do modal
        document.querySelector('.modal-overlay')
        .classList.remove('active');
    }
}


const Storage ={
    get(){
        return JSON.parse(localStorage.getItem("dev.finances:transactions"))
        || []
    },
    set(transactions){
        localStorage.setItem("dev.finances:transactions",
         JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction){
        Transaction.all.push(transaction)
        
        App.reload()
    },
    
    remove(index){
        Transaction.all.splice(index, 1)

        App.reload()
        
    },
    incomes(){//somar as entradas
        let income = 0;
        Transaction.all.forEach(transaction=>{
            if( transaction.amount  > 0){
                income += transaction.amount;   
            }
        })
        return income;
        
    },
    expenses(){//somar as saídas
        let expense = 0;
        Transaction.all.forEach(transaction=>{
            if( transaction.amount<0){
                expense += transaction.amount;
            }
        })
        return expense;
    },
    total(){// entradas-saída
        return Transaction.incomes() +  Transaction.expenses();},

    totalColor(){
        
        if((Transaction.incomes() + Transaction.expenses())<0){
            let negativo =document.querySelector('#negativado');
            negativo.classList.add('negativo');
            negativo.classList.add('saida');
        } else{
            let negativo =document.querySelector('#negativado');
            negativo.classList.remove('negativo');
            negativo.classList.remove('saida');
    }}
}


const DOM = {

    transactionsContainer: document.querySelector('#data-table tbody'),
    arrayIncome:[],
    arrayExpense:[],

    addTransaction(transaction, index){
    
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index= index
        DOM.transactionsContainer.appendChild(tr)
    },
    innerHTMLTransaction(transaction, index){
        
        
        const CSSclass = transaction.amount > 0 ? "income" : "expense";

        const amount= Utils.formatCurrency(transaction.amount)

        const html1 = `
        
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
    `;
    const html2=`<td><img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transação">
    </td>`;
    const html = html1+html2;
 
    if(CSSclass=='income'){
        DOM.arrayIncome.push(html)
        gerarIncome(DOM.arrayIncome);
    }else{
        DOM.arrayExpense.push(html)
        gerarExpense(DOM.arrayExpense);
    }
    
    return html
    },
    updateBalance(){
        document.getElementById('incomeDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.incomes()),
        document.getElementById('expenseDisplay')
        .innerHTML = Utils.formatCurrency (Transaction.expenses()),
        document.getElementById('totalDisplay')
        .innerHTML = Utils.formatCurrency (Transaction.total())
    },
    clearTransactions(){
        DOM.transactionsContainer.innerHTML="";
        DOM.arrayIncome =[];
        DOM.arrayExpense =[];
        
    },

}
function gerarIncome(arrayIncome) {
    let lista = document.querySelector('#data-table2 tbody.income1');
    lista.innerHTML = "";

    arrayIncome.forEach(n => {
        let item = document.createElement('tr');
        item.innerHTML = n;
        lista.appendChild(item);
    });
}
function gerarExpense(arrayExpense) {
    let lista = document.querySelector('#data-table2 tbody.expense1');
    lista.innerHTML='';

    arrayExpense.forEach(n=>{
        let item = document.createElement('tr');
        item.innerHTML = n;
        lista.appendChild(item);
    })

}
const ModalEntrada= {
    open(){//abrir modal: Adicionar a class active ao modal
        document.querySelector('.modal-overlay-es')
        .classList.add('active');
        document.querySelector('#data-table2 tbody.income1')
        .classList.remove('inactive');
        
    },
}
const ModalSaida= {
    open(){//abrir modal: Adicionar a class active ao modal
        document.querySelector('.modal-overlay-es')
        .classList.add('active');
        document.querySelector('#data-table2 tbody.expense1')
        .classList.remove('inactive');
    
    },
}

const Utils = {
    formatAmount(value){
        value= value*100;
        return Math.round(value);
    },
    formatDate(date){
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },
    formatCurrency(value){
        const signal = Number(value) < 0 ? '-' : ''

        value= String(value).replace(/\D/g,"")

        value= Number(value)/100

        value = value.toLocaleString("pt-BR",{
            style:"currency",
            currency:"BRL"
        })

        return signal + value
    }


}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues(){
        return{
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value

        }
    },

    formatValues(){
        let {description, amount, date} = Form.getValues()
        
        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)
        
        return{
            description,
            amount,
            date
        }
    },
    validateField(){
        const {description, amount, date} = Form.getValues()
        
        if(description.trim()==="" ||
        amount.trim()===""||
        date.trim()===""){
            throw new Error('Por favor, prencha todos os campos')
        }
    },
    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },
  
    submit(event){
        event.preventDefault()

        try {
        Form.validateField()

        const transaction= Form.formatValues()
        
        Transaction.add(transaction)

        Form.clearFields()

        Modal.close()

        //Form.formatValues()
            
        } catch (error) {
            alert(error.message)
        }
    
    }
}



const App={
    init(){
        
        Transaction.all.forEach(DOM.addTransaction)
        
        DOM.updateBalance()
        Transaction.totalColor()
        Storage.set(Transaction.all)
    },
    reload(){
        
        DOM.clearTransactions()
        App.init()

    }
}

App.init()


