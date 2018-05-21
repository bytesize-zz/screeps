/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.transporter');
 * mod.thing === 'a thing'; // true
 */
require('tools') 

var controllerContainer = '5af6fde89249541374528d4b'
var controllerContainer2 = '5af6e9df7ab95e2cfc0e490f'
var controllerContainer3 = '5afa293773003b27aff2b5a7'

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min; 
}

function get_random_source(creep){
    // If we heaven't choosen a source to refuel, get one
    if (!creep.memory.refuel_source){
        var container = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType === STRUCTURE_CONTAINER) 
                    && (structure.store[RESOURCE_ENERGY] >= creep.carryCapacity/2)
                    && (structure.id !== controllerContainer)  // don't refill at controllerContainer
                    && (structure.id !== controllerContainer2)
                    && (structure.id !== controllerContainer3))
            }});

        i = getRndInteger(0, container.length)
        if(container[i]) creep.memory.refuel_source = container[i].id
        else{
            var storage = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType === STRUCTURE_STORAGE))
                 }});
            //console.log(storage[0])
            if(storage[0]) creep.memory.refuel_source = storage[0].id
        }
    }else{
        // If the source got drained, bevor we got there, delete it
        var container = Game.getObjectById(creep.memory.refuel_source)
        if (container.store[RESOURCE_ENERGY] < 100) delete creep.memory.refuel_source
    }
    return creep.memory.refuel_source
}

function get_refuel_target(creep){
    var towerPercent = 0.5
    var controllerPercent = 0.75
    
    if(!creep.memory.refuel_target){
        var closestTarget = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity) ||
                        (structure.structureType === STRUCTURE_CONTAINER && (structure.id === controllerContainer || structure.id === controllerContainer2|| structure.id === controllerContainer3) &&
                            structure.store[RESOURCE_ENERGY] < structure.storeCapacity * controllerPercent) ||
                        (structure.structureType === STRUCTURE_TOWER && structure.energy < structure.energyCapacity * towerPercent);}});

        //console.log("Closest Target: " + closestTarget)
        if (closestTarget){
            if ((closestTarget.structureType === STRUCTURE_CONTAINER ) && creep.room.energyAvailable < creep.room.energyCapacityAvailable){

                var priorityTargets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                         return (structure.structureType === STRUCTURE_EXTENSION ||
                                structure.structureType === STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity;}});

                if(priorityTargets.length > 0){
                    creep.memory.refuel_target = priorityTargets[0].id
                    //console.log("Priority Target: " + priorityTargets[0])
                }
            } else creep.memory.refuel_target = closestTarget.id
        } else {
            var storage = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType === STRUCTURE_STORAGE})

            if(storage[0]) creep.memory.refuel_target = storage[0].id
        }
    }else{
        // If the target got filled, before we got there, delete it
        var target = Game.getObjectById(creep.memory.refuel_target)
        if(target){

            if((target.structureType === STRUCTURE_CONTAINER) && (target.store[RESOURCE_ENERGY] >= target.storeCapacity))
                delete creep.memory.refuel_target
            else if (target.energy >= target.energyCapacity) delete creep.memory.refuel_target
        } else delete creep.memory.refuel_target
    }

    return creep.memory.refuel_target
}

function checkForDroppedResource(creep){
    creep.memory.found = false
    creep.memory.dropped_resource = 0
    var break_point = 200
    if(creep.carry.energy < creep.carryCapacity-break_point){
        var dropped_resources = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 4)

        if(dropped_resources.length > 0){
            if(dropped_resources[0] && dropped_resources[0].energy >= break_point) {
                //console.log("Dropped Energy: " + dropped_resources[0].energy)
                creep.say("energy " + dropped_resources[0].energy)
                creep.memory.found = true
                if(creep.pickup(dropped_resources[0]) === ERR_NOT_IN_RANGE){
                    creep.moveTo(dropped_resources[0], {visualizePathStyle: {stroke: '#ff0000'}});
                }
            }
        } // Nothing found
    } // creep cargo full
    return creep.memory.found
}

function getDroppedResources(creep){
    dropped_resource = Game.getObjectById(creep.memory.dropped_resource)
    if (!dropped_resource){
        delete creep.memory.dropped_resource
        dropped_resource = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES)
        if(dropped_resource) creep.memory.dropped_resource = dropped_resource.id
    }
}

function getRefuelTarget(creep){
    var towerPercent = 0.5
    var controllerPercent = 0.75

    refuelTarget = Game.getObjectById(creep.memory.refuel_target)

    if(!creep.memory.refuel_target) {
        var closestTarget = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity) ||
                    (structure.structureType === STRUCTURE_CONTAINER && (structure.id === controllerContainer || structure.id === controllerContainer2 || structure.id === controllerContainer3) &&
                        structure.store[RESOURCE_ENERGY] < structure.storeCapacity * controllerPercent) ||
                    (structure.structureType === STRUCTURE_TOWER && structure.energy < structure.energyCapacity * towerPercent);
            }
        });

        if (closestTarget) {
            if ((closestTarget.structureType === STRUCTURE_CONTAINER) && creep.room.energyAvailable < creep.room.energyCapacityAvailable) {

                var priorityTargets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType === STRUCTURE_EXTENSION ||
                            structure.structureType === STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity;
                    }
                });

                if (priorityTargets.length > 0) {
                    creep.memory.refuel_target = priorityTargets[0].id
                    //console.log("Priority Target: " + priorityTargets[0])
                }
            } else creep.memory.refuel_target = closestTarget.id
        } else {
            var storage = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType === STRUCTURE_STORAGE
            })

            if (storage[0]) creep.memory.refuel_target = storage[0].id
        }
    }else{
        // If the target got filled, before we got there, delete it
        var target = Game.getObjectById(creep.memory.refuel_target)
        if(target){
            if((target.structureType === STRUCTURE_CONTAINER) && (target.store[RESOURCE_ENERGY] >= target.storeCapacity))
                delete creep.memory.refuel_target
            else if (target.energy >= target.energyCapacity) delete creep.memory.refuel_target
        }
    }
}

function getRefuelSource(creep){
    cc = ['5af6fde89249541374528d4b', '5af6e9df7ab95e2cfc0e490f', '5afa293773003b27aff2b5a7']
    refuelSource = Game.getObjectById(creep.memory.refuel_source)

    if(!creep.memory.refuel_source){
        var source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType === STRUCTURE_CONTAINER)
                    && (structure.store[RESOURCE_ENERGY] > creep.carryCapacity/2)
                    && (structure.id !== controllerContainer)  // don't refill at controllerContainer
                    && (structure.id !== controllerContainer2)
                    && (structure.id !== controllerContainer3))
            }});

        //console.log(source)
        if(source) creep.memory.refuel_source = source.id
        else{
            var storage = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType === STRUCTURE_STORAGE))
                }});
            if(storage[0]) creep.memory.refuel_source = storage[0].id
        }
    }else{
        // If the source got drained, bevor we got there, delete it
        container = Game.getObjectById(creep.memory.refuel_source)
        if (container.store[RESOURCE_ENERGY] < 100) delete creep.memory.refuel_source
    }
    return creep.memory.refuel_source
}

function decideNextMove(creep){
    creepCarryCapacity = creep.carryCapacity
    creepCarry = _.sum(creep.carry)
    creepFreeSpace = creepCarryCapacity - creepCarry
    droppedResource = Game.getObjectById(creep.memory.dropped_resource)
    refuelSource = Game.getObjectById(creep.memory.refuel_source)
    refuelTarget = Game.getObjectById(creep.memory.refuel_target)
    droppedModifier = 2;                 //dropped Resources are more important, because they fade
    droppedValue = 0
    sourceValue = 0
    targetValue = 0

    //console.log("nextMove: "+creep.memory.next_move+" Source: "+refuelSource +" Target: "+refuelTarget +" Dropped: "+droppedResource )

    if(droppedResource  && creepFreeSpace > 0){
        droppedResourceRange = creep.pos.getRangeTo(droppedResource)
        //console.log(droppedResource)
        droppedValue = sigmoid(droppedResource.amount/creepFreeSpace)*(creepFreeSpace/creepCarryCapacity) * droppedModifier/droppedResourceRange
        //console.log("Dropped Value: " + droppedValue + " | Range: " + droppedResourceRange)
        if(!creep.memory.next_move) {
            creep.memory.next_move = "looting"
            creep.memory.next_move_value = droppedValue
        }else if(creep.memory.next_move_value < droppedValue) {
            creep.memory.next_move = "looting"
            creep.memory.next_move_value = droppedValue
        }
    }

    if(refuelTarget){
        refuelTargetRange = creep.pos.getRangeTo(refuelTarget)
        //console.log(refuelTarget)
        if(refuelTarget.structureType === STRUCTURE_EXTENSION || refuelTarget.structureType === STRUCTURE_SPAWN|| refuelTarget.structureType === STRUCTURE_TOWER)
            targetValue = sigmoid(creepCarry/(refuelTarget.energyCapacity-refuelTarget.energy)) * ((refuelTarget.energyCapacity-refuelTarget.energy)/refuelTarget.energyCapacity)/refuelTargetRange
        else targetValue = sigmoid(creepCarry/(refuelTarget.storeCapacity-_.sum(refuelTarget.store))) * ((refuelTarget.storeCapacity-_.sum(refuelTarget.store))/refuelTarget.storeCapacity)/refuelTargetRange
        //console.log("Target: " + refuelTarget + " Target Value: " + targetValue + " | Range: " + refuelTargetRange)
        //console.log(_.sum(refuelTarget.store))
        if(!creep.memory.next_move) {
            creep.memory.next_move = "target"
            creep.memory.next_move_value = targetValue
        }else if(creep.memory.next_move_value < targetValue) {
            creep.memory.next_move = "target"
            creep.memory.next_move_value = targetValue
        }
    }

    if(refuelSource && creepFreeSpace > 0){
        refuelSourceRange = creep.pos.getRangeTo(refuelSource)
        //console.log(refuelSource)
        sourceValue = sigmoid(refuelSource.store[RESOURCE_ENERGY]/creepFreeSpace)*(creepFreeSpace/creepCarryCapacity)/refuelSourceRange
        //console.log("Source Value: " + sourceValue + " | Range: " + refuelSourceRange)
        //creep.say(sigmoid(refuelSource.store[RESOURCE_ENERGY]/creepFreeSpace)*(creepCarryCapacity/creepFreeSpace))
        if(!(creep.memory.next_move)) {
            creep.memory.next_move = "source"
            creep.memory.next_move_value = sourceValue
        }else if(creep.memory.next_move_value < sourceValue) {
            creep.memory.next_move = "source"
            creep.memory.next_move_value = sourceValue
        }
    }

    if(_.sum(creep.carry) - creep.carry[RESOURCE_ENERGY] > creep.carryCapacity/4){}

    //console.log("Loot: " + droppedValue + " | Target: " + targetValue + " | Source: " + sourceValue + " Target: " + refuelTarget)
    //creep.say(targetValue)
    creep.say(creep.memory.next_move)
    //console.log(refuelTargetRange)
}

function sigmoid(x){
    //console.log(Math.tanh(x))
    return Math.tanh(x)
}



function atPosition(creep, target){
    if(!(creep.pos.isNearTo(target))){
        creep.moveTo(target, {visualizePathStyle: {stroke: '#efff04'}});
        return false
    }else return true
}

function inTargetRoom(creep){
    if(creep.room.name !== creep.memory.target_room) {
        creep.moveTo(Game.flags[creep.memory.target_room], {visualizePathStyle: {stroke: '#0811ff'}});
        return false
    }else return true
}

function noEnemys(creep){
    enemys = creep.room.find(FIND_HOSTILE_CREEPS)

    if(enemys.length > 0) {
        return false
    } else return true
}

var roleTransporter = {
    /** @param {Creep} creep **/
       /*run: function(creep) {
            getDroppedResources(creep)
            //getRefuelSource(creep)
            getRefuelTarget(creep)
            decideNextMove(creep)

            if(!creep.memory.target_room) creep.memory.target_room = creep.memory.work_room;
            else
            if (creep.memory.resource === undefined) resource = 0;
            else resource = creep.memory.resource;

                if (creep.carry.energy === 0){
                    if(inTargetRoom(creep)) {
                        // Tank is empty, delete last refuel target and get source
                        delete creep.memory.refuel_target

                        //var container = get_random_source(creep)
                        var container = getRefuelSource(creep)

                        if (!container) checkForDroppedResource(creep) //creep.moveTo(Game.flags.Flag1, {visualizePathStyle: {stroke: '#ffffff'}});
                        else {
                            energy_needed = creep.carryCapacity - creep.carry

                            if (creep.withdraw(Game.getObjectById(container), RESOURCE_ENERGY, energy_needed) === ERR_NOT_IN_RANGE) {
                                creep.moveTo(Game.getObjectById(container), {visualizePathStyle: {stroke: '#ff0000'}});
                            }
                        }
                    }
                }else { // Tank is full, delete last refuel source and get a refuel target
                        delete creep.memory.refuel_source
                        target = get_refuel_target(creep)
                        //console.log(target)

                        if(!target) creep.moveTo(Game.flags.Flag1, {visualizePathStyle: {stroke: '#ffffff'}});
                        else{
                            if(creep.transfer(Game.getObjectById(target), RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                                creep.moveTo(Game.getObjectById(target), {visualizePathStyle: {stroke: '#ffffff'}});
                            }
                            if (target.energy === target.energyCapacity) delete creep.memory.refuel_target
                        }
                }

	}*/
    run: function(creep) {
        getDroppedResources(creep)
        getRefuelSource(creep)
        //get_refuel_target(creep)
        getRefuelTarget(creep)
        decideNextMove(creep)

        if(!creep.memory.target_room) creep.memory.target_room = creep.memory.work_room;
        else if (!creep.memory.resource) resource = 0;
            else resource = creep.memory.resource;

        if(creep.memory.next_move === "looting"){
            droppedResource = Game.getObjectById(creep.memory.dropped_resource)
            if(!droppedResource || creep.carry === creep.carryCapacity){
                delete creep.memory.dropped_resource
                delete creep.memory.next_move
                delete creep.memory.next_move_value
            }else if (atPosition(creep, droppedResource)){
                    creep.pickup(droppedResource)
                    delete creep.memory.dropped_resource
                    delete creep.memory.refuel_target
                    delete creep.memory.refuel_source
                    delete creep.memory.next_move
                    delete creep.memory.next_move_value
                }
        }
        if(creep.memory.next_move === "source"){
            refuelSource = Game.getObjectById(creep.memory.refuel_source)
            if(creep.carry === creep.carryCapacity){
                delete creep.memory.refuel_source
                delete creep.memory.next_move
                delete creep.memory.next_move_value
            }else if(atPosition(creep, refuelSource)){
                    energy_needed = creep.carryCapacity - creep.carry
                    creep.withdraw(refuelSource, RESOURCE_ENERGY, energy_needed)
                    delete creep.memory.dropped_resource
                    delete creep.memory.refuel_target
                    delete creep.memory.refuel_source
                    delete creep.memory.next_move
                    delete creep.memory.next_move_value
                }
        }
        if(creep.memory.next_move === "target"){
            refuelTarget = Game.getObjectById(creep.memory.refuel_target)
            if(creep.carry === 0){
                delete creep.memory.refuel_target
                delete creep.memory.next_move
                delete creep.memory.next_move_value
            }else
                if(atPosition(creep, refuelTarget)){
                    if(refuelTarget.structureType === STRUCTURE_STORAGE) creep.transfer(refuelTarget, RESOURCE_ENERGY );
                    else creep.transfer(refuelTarget, RESOURCE_ENERGY)
                    delete creep.memory.dropped_resource
                    delete creep.memory.refuel_target
                    delete creep.memory.refuel_source
                    delete creep.memory.next_move
                    delete creep.memory.next_move_value
                }
        }
    }
};

module.exports = roleTransporter;












