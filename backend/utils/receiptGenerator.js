const generateReceipt = (transaction) => {
  const { productName, quantity, totalPrice, timestamp } = transaction;

  const receipt = `
    Receipt
    --------------------
    Product Name: ${productName}
    Quantity: ${quantity}
    Total Price: $${totalPrice.toFixed(2)}
    Date: ${new Date(timestamp).toLocaleString()}
    --------------------
    Thank you for your purchase!
  `;

  return receipt;
};

const printReceipt = (receipt) => {
  const newWindow = window.open('', '', 'width=600,height=400');
  newWindow.document.write('<pre>' + receipt + '</pre>');
  newWindow.document.close();
  newWindow.print();
};

module.exports = {
  generateReceipt,
  printReceipt
};