# Javascript/TypeScript Coding Challenge #

### Task ###

Create a Javascript/TypeScript library with Node.js that will manage virtual bank accounts. The library should support making a deposit to an account, making a withdrawal from an account and transferring money between accounts. Use Postgres database and a library that you are comfortable with for persistence.

Use Case: Customer pays for a haircut by cash and leaves a tip, haircut money should go to the shop's cash account and the tip should go into the barber's cash account. Barber and shop could see their cash balances. When a customer requests a refund then the balance is taken out from the accounts.

A library should allow:

* Making a deposit to an account
* Making a withdrawal from an account
* Making a transfer between two accounts
* Making a refund of a previous transaction
* Getting the account balance
* Showing a history of transactions for an account
