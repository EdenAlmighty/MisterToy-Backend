import mongodb from 'mongodb'
const { ObjectId } = mongodb

import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'

async function query(filterBy = { txt: '', inStock: '' }, sortBy = { by: '', asc: 1 }) {
    try {
        // console.log('sortBy', sortBy);
        let criteria = {
            name: { $regex: filterBy.txt, $options: 'i' }
        };

        if (filterBy.inStock !== 'all' && filterBy.inStock !== 'all' && filterBy.inStock !== '') {
            criteria.inStock = { $eq: JSON.parse(filterBy.inStock) };
            console.log('criteria.inStock', criteria.inStock);
        }

        if (filterBy.labels && filterBy.labels.length > 0) {
            criteria.labels = { $all: filterBy.labels };
        }

        const collection = await dbService.getCollection('toy')
        const sortOption = { [sortBy.type || 'name']: +sortBy.asc || 1 };

        const toys = await collection.find(criteria).sort(sortOption).toArray()

        return toys
    } catch (err) {
        logger.error('cannot find toys', err)
        throw err
    }
}

async function getById(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        var toy = collection.findOne({ _id: new ObjectId(toyId) })
        // toy.createdAt = new Object(toy._id.getTimestamp())
        return toy
    } catch (err) {
        logger.error(`while finding toy ${toyId}`, err)
        throw err
    }
}

async function remove(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.deleteOne({ _id: new ObjectId(toyId) })
    } catch (err) {
        logger.error(`cannot remove toy ${toyId}`, err)
        throw err
    }
}

async function add(toy) {
    try {
        console.log(toy);
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
            reviews: toy.reviews
        }
        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: new ObjectId(toy._id) }, { $set: toyToSave })
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
        await collection.updateOne({ _id: new ObjectId(toyId) }, { $push: { msgs: msg } })
        return msg
    } catch (err) {
        logger.error(`cannot add toy msg ${toyId}`, err)
        throw err
    }
}

async function removeToyMsg(toyId, msgId) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: new ObjectId(toyId) }, { $pull: { msgs: { id: msgId } } })
        return msgId
    } catch (err) {
        logger.error(`cannot remove toy msg ${toyId}`, err)
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
    removeToyMsg,
}
