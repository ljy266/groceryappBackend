const express = require('express');
const router = express.Router();
const GroItem = require('../models/groItem')
const Store = require('../models/store')

//Routes
router.get('/', (req, res) => {
    const data = {
        Message: 'testing succeed, end points work!'
    }
    res.json(data)
})
//////////////////////////////////////////////////////////////////////////////////////////////
router.get('/all', (req, res) => {
    GroItem.find({})
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            console.log('Error Message:  ', error)
        })
})
//////////////////////////////////////////////////////////////////////////////////////////////

router.get('/item', (req, res) => {
    // console.log(GroItem.findOne({"name": "mango"}).limit(1), "new")
    const temp = req.query.answer
    searchResult = new RegExp(temp, 'i')
    const array = []
    const array2 = []

    GroItem.find({ "name": searchResult }).then((data) => {
        data.map((i) => {
            const nameType = i.type + i.name
            if (!array.includes(nameType)) {
                array.push(nameType)
                array2.push(i)
            }
        })

        const finalArray = array2.map((i) => ({
            "name": i.type + " " + i.name,
            "image": i.picUrl,
            "description": i.description
        }))
        console.log(finalArray)
        // res.set('Access-Control-Allow-Origin','*') //added cors server side solution
        res.setHeader("Access-Control-Allow-Origin", "*")
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Max-Age", "1800");
        res.setHeader("Access-Control-Allow-Headers", "content-type");
        res.setHeader("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, PATCH, OPTIONS");
        res.json(finalArray)
    })
        .catch((error) => {
            console.log('Error Message:  ', error)
        })
})

//////////////////////////////////////////////////////////////////////////////////////////////

router.get('/store', async (req, res) => {
    let finalReturn1 = {} //grocery item info
    let finalReturn2 = {} //store info
    const groceryListItems = req.query.answer //list of items
    const organicListItems = []
    const nonOrganicListItems = []
    groceryListItems.map((groceryItem) => {
        // console.log (JSON.parse(groceryItem), "This is the groceryitem list:  ")
        const nameType = JSON.parse(groceryItem).name.split(' ')
        nameType[0].toLowerCase() === "organic" ? organicListItems.push(nameType[1]) : nonOrganicListItems.push(nameType[1])
    })

    // console.log(nonOrganicListItems, "this is non organic item")
    // console.log(organicListItems, "this is organic item")
    const array = [0, 0, 0, 0, 0, 0, 0, 0]
    // $or {$and {type = organic, name in organicListItems} , {type = non-organic, name in nonOrganicListItems}}

    //   $or: [ $and:[{"type": "organic", "name":{ $in: organicListItems }}], $and:[{"type": "non-organic", "name":{ $in: nonOrganicListItems }}]]
    //   $and: [ { $or: [{title: regex },{description: regex}] }, {category: value.category}, {city:value.city} ]
    //   $or: [ {$and: [{type: "organic"}, {name:{ $in: organicListItems }}]} ,   {   $and: [{type: "non-organic"}, {name:{ $in: nonOrganicListItems }}]  }  ]
    let globalUltimateFind
    await GroItem.find({ $or: [{ $and: [{ type: "Organic" }, { name: { $in: organicListItems } }] }, { $and: [{ type: "Non-Organic" }, { name: { $in: nonOrganicListItems } }] }] })
        .then((ultimateFind) => {
            ultimateFind.map((ary) => {
                array[ary.shopId - 1] = array[ary.shopId - 1] + parseFloat(ary.price)
            })
            // console.log(array)
            globalUltimateFind = ultimateFind
        })
        .catch((error) => {
            console.log('Error Message:  ', error)
        })


    const minIndexStoreId = array.indexOf(Math.min(...array)) + 1
    const min = Math.min(...array)


    const trueUltimateFind = globalUltimateFind.filter((item) => {
        return parseInt(item.shopId) === minIndexStoreId
    })

    console.log(trueUltimateFind)

    Store.find({ shopID: minIndexStoreId })
        .then((tempData3) => {
            const responseData = [{
                "name": tempData3[0].storeName,
                "picture": tempData3[0].image,
                "description": tempData3[0].description,
                "storeHours": tempData3[0].storeHours,
                "total": min,
                "groceries":
                    trueUltimateFind.map((i) => ({
                        "name": i.type + " " + i.name,
                        "image": i.picUrl,
                        "price": i.price
                    }))

            }]
            // res.setHeader('Access-Control-Allow-Origin','*') //added cors server side solution
            res.setHeader("Access-Control-Allow-Origin", "*")
            res.setHeader("Access-Control-Allow-Credentials", "true");
            res.setHeader("Access-Control-Max-Age", "1800");
            res.setHeader("Access-Control-Allow-Headers", "content-type");
            res.setHeader("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, PATCH, OPTIONS");
            res.json(responseData)
        })
        .catch((error) => {
            console.log('Error Message:  ', error)
        })

})

//////////////////////////////////////////////////////////////////////////////////////////////

module.exports = router;