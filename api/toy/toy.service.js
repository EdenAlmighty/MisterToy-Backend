import mongodb from 'mongodb'
const { ObjectId } = mongodb

import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'

async function query(filterBy = { txt: '', maxPrice: 'Infinity', inStock: true }, sort = { by: 'price', asc: 'true' }) {
    console.log(filterBy);
    try {
        let criteria = {
            name: { $regex: filterBy.txt, $options: 'i' }
        }
        if (filterBy.inStock) {
            criteria.inStock = JSON.parse(filterBy.inStock)
        }
        // if (filterBy.labels.length){
        //     criteria.labels = { $in: filterBy.labels}
        // }
        let sortDirection = sort.asc === 'true' || sort.asc === true ? 1 : -1;
        let sortField = sort.by; // Assuming 'price' or any other valid field name

        const collection = await dbService.getCollection('toy')
        const toys = await collection.find(criteria).sort({ [sortField]: sortDirection }).toArray();
        return toys
    } catch (err) {
        logger.error('cannot find toys', err)
        throw err
    }
}

// async function query({ filterBy = { txt: '', maxPrice: 'Infinity' }, sort = { by: 'price', asc: 'true' } }) {
//     console.log(filterBy, sort);
//     try {
//         const collection = await dbService.getCollection('toy');
//         let criteria = {
//             name: { $regex: filterBy.txt, $options: 'i' }
//         };

//         // Apply inStock and maxPrice filters
//         if (filterBy.inStock !== undefined) {
//             criteria.inStock = JSON.parse(filterBy.inStock);
//         }
//         if (filterBy.maxPrice !== 'Infinity') {
//             criteria.price = { $lte: parseFloat(filterBy.maxPrice) };
//         }

//         // Sorting logic adjustment
//         let sortDirection = sort.asc === 'true' || sort.asc === true ? 1 : -1;
//         let sortField = sort.by; // Assuming 'price' or any other valid field name

//         // Perform the query, sort, convert to array, and store in toys variable
//         const toys = await collection.find(criteria).sort({ [sortField]: sortDirection }).toArray();
//         console.log('toys', toys); // Correct logging of fetched toys
//         return toys; // Return the result of the query
//     } catch (err) {
//         logger.error('cannot find toys', err);
//         throw err;
//     }
// }

async function getById(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        var toy = collection.findOne({ _id: ObjectId(toyId) })
        return toy
    } catch (err) {
        logger.error(`while finding toy ${toyId}`, err)
        throw err
    }
}

async function remove(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.deleteOne({ _id: ObjectId(toyId) })
    } catch (err) {
        logger.error(`cannot remove toy ${toyId}`, err)
        throw err
    }
}

async function add(toy) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.insertOne(toy)
        return toy
    } catch (err) {
        logger.error('cannot insert toy', err)
        throw err
    }
}

async function update(toy) {
    try {
        const toyToSave = {
            name: toy.name,
            price: toy.price,
            labels: toy.labels,
            // importance: toy.importance
        }
        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: ObjectId(toy._id) }, { $set: toyToSave })
        return toy
    } catch (err) {
        logger.error(`cannot update toy ${toy._id}`, err)
        throw err
    }
}

async function addToyMsg(toyId, msg) {
    try {
        msg.id = utilService.makeId()
        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: ObjectId(toyId) }, { $push: { msgs: msg } })
        return msg
    } catch (err) {
        logger.error(`cannot add toy msg ${toyId}`, err)
        throw err
    }
}

async function removeToyMsg(toyId, msgId) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: ObjectId(toyId) }, { $pull: { msgs: { id: msgId } } })
        return msgId
    } catch (err) {
        logger.error(`cannot add toy msg ${toyId}`, err)
        throw err
    }
}

export const toyService = {
    remove,
    query,
    getById,
    add,
    update,
    addToyMsg,
    removeToyMsg
}
