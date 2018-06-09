/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.transporter');
 * mod.thing === 'a thing'; // true
 */
require('tools') 

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min; 
}

function getControllerContainer(creep){
    return Game.rooms[creep.room.name].memory.controllerContainer
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

    //console.log("Room: " + creep.room + "  " + getControllerContainer(creep))

    if(!creep.memory.refuel_target) {
        var closestTarget = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity) ||
                    (structure.structureType === STRUCTURE_CONTAINER && (structure.id === getControllerContainer(creep)) &&
                        structure.store[RESOURCE_ENERGY] < structure.storeCapacity * controllerPercent) ||
                    (structure.structureType === STRUCTURE_TOWER && structure.energy < structure.energyCapacity * towerPercent);
            }
        });
        //creep.say(closestTarget.room)
        if (closestTarget && creep.memory.work_room === creep.memory.home_room) { // slaveTransporter should direct infuse the storage
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
                filter: (structure) => structure.structureType === STRUCTURE_STORAGE})
            if (storage[0] && storage[0].store < storage[0].storeCapacity) creep.memory.refuel_target = storage[0].id
            else {
                var terminal = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => structure.structureType === STRUCTURE_TERMINAL})
                if(terminal[0]) creep.memory.refuel_target = terminal[0].id

            }
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
    refuelSource = Game.getObjectById(creep.memory.refuel_source)

    if(!creep.memory.refuel_source){
        var source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType === STRUCTURE_CONTAINER)
                    && (structure.store[RESOURCE_ENERGY] > creep.carryCapacity/2)
                    && structure.id !== getControllerContainer(creep))  // don't refill at controllerContainer
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
        if (!container || container.store[RESOURCE_ENERGY] < 100) delete creep.memory.refuel_source
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

    if(droppedResource && creepFreeSpace > 0 && creep.memory.work_room === creep.room.name){
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
    }else {
        delete creep.memory.dropped_resource
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

    if(refuelSource && creepFreeSpace > 0 && creep.memory.work_room === creep.room.name){
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
    }else {
        delete creep.memory.refuel_source
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
        creep.say("RoomSwitch")
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

function checkForRoomChange(creep) {
    target = Game.getObjectById(creep.memory.refuel_target)

    if(_.sum(creep.carry) >= creep.carryCapacity && creep.memory.home_room !== creep.memory.work_room) {

        if(!target) {
            delete creep.memory.refuel_target
            creep.memory.target_room = creep.memory.home_room
        }
    }
    if(_.sum(creep.carry) <= 0 && creep.memory.home_room !== creep.memory.work_room){

        creep.memory.target_room = creep.memory.work_room
    }

}

var roleTransporter = {
    /** @param {Creep} creep **/
    run: function(creep) {

        if (!creep.memory.target_room) creep.memory.target_room = creep.memory.work_room;
        if (!creep.memory.resource) resource = 0;
        else resource = creep.memory.resource;

        if(inTargetRoom(creep)) {
            //console.log("test")
            getDroppedResources(creep)
            getRefuelSource(creep)
            //get_refuel_target(creep)

            getRefuelTarget(creep)
            decideNextMove(creep)
            checkForRoomChange(creep)


            if (creep.memory.next_move === "looting") {
                droppedResource = Game.getObjectById(creep.memory.dropped_resource)
                if (!droppedResource || creep.carry === creep.carryCapacity) {
                    delete creep.memory.dropped_resource
                    delete creep.memory.next_move
                    delete creep.memory.next_move_value
                } else if (atPosition(creep, droppedResource)) {
                    creep.pickup(droppedResource)
                    delete creep.memory.dropped_resource
                    delete creep.memory.refuel_target
                    delete creep.memory.refuel_source
                    delete creep.memory.next_move
                    delete creep.memory.next_move_value
                }
            }
            if (creep.memory.next_move === "source") {
                refuelSource = Game.getObjectById(creep.memory.refuel_source)
                if (creep.carry === creep.carryCapacity) {
                    delete creep.memory.refuel_source
                    delete creep.memory.next_move
                    delete creep.memory.next_move_value
                } else if (atPosition(creep, refuelSource)) {
                    energy_needed = creep.carryCapacity - creep.carry
                    creep.withdraw(refuelSource, RESOURCE_ENERGY, energy_needed)
                    delete creep.memory.dropped_resource
                    delete creep.memory.refuel_target
                    delete creep.memory.refuel_source
                    delete creep.memory.next_move
                    delete creep.memory.next_move_value
                }
            }
            if (creep.memory.next_move === "target") {
                refuelTarget = Game.getObjectById(creep.memory.refuel_target)
                if (creep.carry === 0) {
                    delete creep.memory.refuel_target
                    delete creep.memory.next_move
                    delete creep.memory.next_move_value
                } else if (atPosition(creep, refuelTarget)) {
                    if (refuelTarget.structureType === STRUCTURE_STORAGE) creep.transfer(refuelTarget, RESOURCE_ENERGY);
                    else creep.transfer(refuelTarget, RESOURCE_ENERGY)
                    delete creep.memory.dropped_resource
                    delete creep.memory.refuel_target
                    delete creep.memory.refuel_source
                    delete creep.memory.next_move
                    delete creep.memory.next_move_value
                }
            }
        }
    }
};

module.exports = roleTransporter;












