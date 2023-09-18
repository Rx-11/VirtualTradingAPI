const Stock = require('../models/Stocks')
const User = require('../models/User')
const asyncHandler = require('express-async-handler')


// @desc Get all stocks 
// @route GET /stocks
// @access Private
const getAllStocks = asyncHandler(async (req, res) => {
    // Get all stocks from MongoDB
    const stocks = await Stock.find().lean()

    // If no notes 
    if (!stocks?.length) {
        return res.status(400).json({ message: 'No stocks found' })
    }

    // Add username to each note before sending the response 
    // See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE 
    // You could also do this with a for...of loop
    const stocksWithUser = await Promise.all(stocks.map(async (stock) => {
        const user = await User.findById(stock.user).lean().exec()
        return { ...stock, username: user.username }
    }))

    res.json(stocksWithUser)
})


// @desc Create new stock
// @route POST /stock
// @access Private
const createNewStocks = asyncHandler(async (req, res) => {
    const { user, name, quantity, price } = req.body

    // Confirm data
    if (!user || !name || !quantity || !price) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const user1 = await User.findById(user).exec()
    // Check for duplicate title
    const duplicate = await Stock.findOne({$and:[{name},{user}] }).exec()

    if (duplicate) {
        // stock.user = user
        // stock.name = name
        // stock.price = ((stock.price * stock.quantity ) + (price * quantity))/(stock.quantity + quantity)
        // stock.quantity = stock.quantity + quantity
        // const updatedStock = await stock.save()
        // console.log(String(duplicate._id))
        // updateStocks(duplicate,res)
        // const qwe = String(duplicate._id)
          updateStocks(req, res);
        //return res.status(409).json({ message: 'Duplicate Stock' })

    }
    else{
        if(Number(quantity)>0){
    if(Number(quantity)*Number(price)<=Number(user1.balance)){
        user1.balance = Number(user1.balance) - Number(quantity)*Number(price)
        const stock = await Stock.create({ user, name, quantity, price })
        const updatedUser = await user1.save()

    if (stock) { // Created 
        return res.status(201).json({ message: 'New Stock purchased' })
    } else {
        return res.status(400).json({ message: 'Invalid Stock data received' })
    }
    }
    else{
        return res.status(400).json({ message: 'Insufficient Balance' })
    }}
    else{
        return res.status(400).json({ message: 'Cannot buy negative quantity' })
    }
    }
    // Create and store the new user 
    
})

// @desc Update a stock
// @route PATCH /stock
// @access Private
const updateStocks = asyncHandler(async (req, res) => {
    

    const {  user, name, quantity, price } = req.body
    // console.log(req.body)

    // Confirm data
    if (  !user || !name || !Math.abs(quantity) || !price) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Confirm note exists to update
     const stock1 = await Stock.findOne({$and:[{name},{user}] }).exec()
    
    
     const stock = await Stock.findById(stock1._id).exec()
    
    
    // console.log(stock)
    

    

    if (!stock) {
        return res.status(400).json({ message: 'Stock not found' })
    }

    const user1 = await User.findById(stock.user).exec()
    if (!user1) {
        return res.status(400).json({ message: 'User not found' });
    }

    // Check for duplicate title
    // const duplicate = await Stock.findOne({ name }).lean().exec()

    // // Allow renaming of the original note 
    // if (duplicate && duplicate?._id.toString() !== id) {
    //     return res.status(409).json({ message: 'Duplicate stock name' })
    // }

    if(Number(stock.quantity)+Number(quantity)<0){
        return res.status(400).json({ message: 'Insufficient stock quantity in account' })

    }

    

    if(Number(quantity)<0){
        // const user1 = await User.findById(stock.user).lean().exec()
        user1.relprofit = user1.relprofit + (Number(stock.price) - Number(price)) * (Number(quantity))
        // user1.balance = Number(user1.balance) - (Number(quantity)*Number(price))
        
    }

    if(Number(quantity)>0){
        if(Number(quantity)*Number(price)>user1.balance){
            return res.status(400).json({ message: 'Insufficient balance in account' })
        }
        
            
        
    }
    if(Number(stock.quantity)+Number(quantity)==0){
        deleteStocks(req,res)
        //return res.status(400).json({ message: 'Insufficient stock quantity in account' })

    }



    // if(Number(stock.quantity)+Number(quantity)==0){
    //     const result = await stock.deleteOne()
    //     res.json(`'${result.name}' completely sold`)
    // }
    else{
    stock.user = user
    stock.name = name
    user1.balance = Number(user1.balance) - (Number(quantity)*Number(price))
    if(quantity>0){
    // stock.price = (((Number(stock.price) * Number(stock.quantity) ) + (Number(price) * Number( quantity)))/(Number(stock.quantity) + Number(quantity)))
    const totalPrice = ((Number(stock.price) * Number(stock.quantity)) + (Number(price) * Number(quantity))) / (Number(stock.quantity) + Number(quantity));
    stock.price = parseFloat(totalPrice.toFixed(2));}
    else{
        stock.price = stock.price
    }
    stock.quantity = Number(stock.quantity) + Number(quantity);
    
    
    const updatedStock = await stock.save()
    const updatedUser = await user1.save()

    res.json(`'${updatedStock.name}' '${updatedUser.username}' updated`)}
})

// @desc Delete a Stock
// @route DELETE /Stock
// @access Private
const deleteStocks = asyncHandler(async (req, res) => {
    const { name, user, price } = req.body

    // Confirm data
    if (!name || !user) {
        return res.status(400).json({ message: 'All fields required' })
    }

    // Confirm note exists to delete 
    const stock = await Stock.findOne({$and: [{name},{user}]}).exec()
    const user1 = await User.findById(user).exec()
    if (!stock) {
        return res.status(400).json({ message: 'Stock not found' })
    }

    user1.balance = Number(user1.balance) + Number(stock.quantity)*Number(price)
    user1.relprofit = Number(user1.relprofit) + (Number(stock.price)-Number(price))*(-Number(stock.quantity)) 
    await user1.save()
    const result = await stock.deleteOne()

    const reply = `Stock '${result.name}' with ID ${result._id} deleted`

    res.json(reply)
})

module.exports = {
    getAllStocks,
    createNewStocks,
    updateStocks,
    deleteStocks
}