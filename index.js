const invoices = require('./invoice.json');

const tariffs = {
  tragedy: 40000,
  comedy: 30000
};

const format = new Intl.NumberFormat(
  "ru-RU",
  {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 2,
  }).format

class Wallet {
  constructor({ customer, amount, volumeCredits }) {
    this._customer = customer;
    this._amount = amount;
    this._volumeCredits = volumeCredits;
  }
  get customer() {
    return this._customer;
  }

  get amount() {
    return this._amount;
  }

  set amount(val) {
    this._amount = val;
  }

  get volumeCredits() {
    return this._volumeCredits;
  }

  set volumeCredits(val) {
    this._volumeCredits = val;
  }
}

function calculatePerformance(performance) {
  switch (performance.type) {
    case "tragedy":
      return {
        totalAmount: performance.audience > 30 ?
          tariffs.tragedy + 1000 * (performance.audience - 30) :
          tariffs.tragedy,
        volumeCredits: Math.max(performance.audience - 30, 0),
      };
    case "comedy":
      return {
        totalAmount: performance.audience > 20 ?
          tariffs.comedy + 500 * (performance.audience - 20) + 300 * performance.audience :
          tariffs.comedy + 300 * performance.audience,
        volumeCredits: Math.max(performance.audience - 20, 0),
      }
    default:
      throw new Error(`Неизвестный тип: ${performance.type}`);
  }
}

function printResult(invoiceList) {
  const result = [];

  invoiceList.forEach(({ customer, performance }, index) => {
    let comedyCounter = 0;

    const wallet = new Wallet({
      customer,
      amount: 0,
      volumeCredits: 0,
    });

    result.push(`
      Счет для ${wallet.customer}
    `);

    performance.forEach((perf) => {
      const {
        totalAmount,
        volumeCredits,
      } = calculatePerformance(perf);
    

    if (perf.type === "comedy") comedyCounter++;

    wallet.amount = wallet.amount + totalAmount;
    wallet.volumeCredits = comedyCounter === 10 ?
      wallet.volumeCredits + volumeCredits + Math.floor(perf.audience / 5) :
      wallet.volumeCredits + volumeCredits;

      if (comedyCounter === 10) comedyCounter = 0;

      result[index] += `
        ${perf.playId}: ${format(totalAmount / 100)}
        (${perf.audience} мест)
      `;
    })

    result[index] += `
      Итого с вас ${format(wallet.amount / 100)}
      Вы заработали ${wallet.volumeCredits} бонусов 
    `;
  })

  result.forEach((invoice) => console.log(invoice));
}

printResult(invoices);