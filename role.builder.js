/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.builder');
 * mod.thing == 'a thing'; // true
 */
require('tools');

var controllerContainer = '5af6fde89249541374528d4b'
var controllerContainer2 = '5af6e9df7ab95e2cfc0e490f'
var controllerContainer3 = '5afa293773003b27aff2b5a7'

function checkForDroppedEnergy(creep){
    creep.memory.found = false
    var break_point = 100
    if(creep.carry.energy < creep.carryCapacity-break_point){
        var dropped_energy = creep.pos.findInRange(FIND_DROPPED_RESOURCES,4)

        if(dropped_energy[0] && dropped_energy[0].energy >= break_point) {
            //console.log("Dropped Energy: " + dropped_energy[0].energy)
            creep.say(dropped_energy[0].resourceType)
            creep.memory.found = true
            if(creep.pickup(dropped_energy[0]) === ERR_NOT_IN_RANGE){
                creep.moveTo(dropped_energy[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }else creep.memory.found = false
    } else creep.memory.found = false
    return creep.memory.found
}

function getRepairTarget(creep){
    if(!creep.memory.repair_target){
        //If there are no Structures to repair, then do Walls and Ramparts
        if(!Game.spawns['Home'].memory.hp) Game.spawns['Home'].memory.hp = 1
        else{
        i = Game.spawns['Home'].memory.hp
        var closestDamagedDefence = creep.pos.findClosestByRange(FIND_STRUCTURES, {    
            filter: (structure) => {
                return (structure.structureType === STRUCTURE_WALL ||
                        structure.structureType === STRUCTURE_RAMPART) &&
                        structure.hits < i * 100}
        	});
        }
        if(closestDamagedDefence) creep.memory.repair_target = closestDamagedDefence.id
    }else{
        var target = Game.getObjectById(creep.memory.repair_target)
        if((target) && (target.hits >= target.hitsMax)) delete creep.memory.repair_target
    }
    return creep.memory.repair_target
}

function dyingStructures(creep){
    
    
}

function inTargetRoom(creep){
    if(creep.room.name !== creep.memory.target_room){
        var exits = Game.map.findExit(creep.room, creep.memory.targetRoom)
        var exit = creep.pos.findClosestByRange(exits)
        //creep.moveTo(exit)
        creep.moveTo(Game.flags[creep.memory.target_room])
        return false
    }else return true
}

function inHomeRoom(creep){
    if(creep.room.name !== creep.memory.home_room){
        var exits = Game.map.findExit(creep.room, creep.memory.targetRoom)
        var exit = creep.pos.findClosestByRange(exits)
        creep.moveTo(exit)
        creep.moveTo(Game.flags.Flag1)
        return false
    }else return true
}

var roleBuilder = {
    
    /** @param {Creep} creep **/
    run: function(creep) {
        if(!creep.memory.target_room) creep.memory.target_room = creep.memory.work_room;
        else
        if(!checkForDroppedEnergy(creep)){
    	    if(creep.memory.building && creep.carry.energy === 0) {
                creep.memory.building = false;
                creep.say('🔄 refuel');
                delete creep.memory.repair_target
    	    }
    	    if(!creep.memory.building && creep.carry.energy >= creep.carryCapacity*0.5) {
    	        creep.memory.building = true;
    	        creep.say('🚧 build');
    	    }
            
    	    if(creep.memory.building){
    	        if (inTargetRoom(creep)){
        	        var targets = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);

                    // First Priority of Builder are Construction Sites

                    if(targets) {
                        if(creep.build(targets) === ERR_NOT_IN_RANGE) {
                            creep.moveTo(targets, {visualizePathStyle: {stroke: '#ffffff'}});
                        }
                    }else{
                        // If there are none, repair Structures
                        var closestDamagedStructure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return  structure.structureType !== STRUCTURE_WALL &&
                                        structure.structureType !== STRUCTURE_RAMPART &&
                                        //structure.structureType != STRUCTURE_ROAD &&        // as long as the Tower is doing this
                                        structure.hits < structure.hitsMax *0.5}
        	                    });
                        if(closestDamagedStructure){
                            if(creep.repair(closestDamagedStructure) === ERR_NOT_IN_RANGE) {
                                creep.moveTo(closestDamagedStructure, {visualizePathStyle: {stroke: '#ffffff'}});
                            }
                        }else{
                            var closestDamagedDefence = Game.getObjectById(getRepairTarget(creep))
                            if(closestDamagedDefence){
                                if(creep.repair(closestDamagedDefence) === ERR_NOT_IN_RANGE) {
                                    creep.moveTo(closestDamagedDefence, {visualizePathStyle: {stroke: '#ffffff'}});
                                }
                                // Nothing with this i found, lets increase it
                            }else Game.spawns['Home'].memory.hp = i+1
                        }
                    }
    	        }
    	    }else{
    	        if(inHomeRoom){
        	        spawn = Game.spawns['Home']
        	        energy_status = Game.rooms.E41S26.energyAvailable
        	        maximum_capacity = Game.rooms.E41S26.energyCapacityAvailable
                    energy_needed = creep.carryCapacity - creep.carry
                    
                    
                    var station = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType === STRUCTURE_CONTAINER || 
                                        structure.structureType === STRUCTURE_STORAGE) &&
                                        structure.store[RESOURCE_ENERGY] >= creep.carryCapacity/2 &&
                                        structure.id != controllerContainer &&
                                        structure.id != controllerContainer2 &&
                                        structure.id != controllerContainer3
                            }});
                     //console.log(station)
                    // Only refill for Building if Spawn is full and storage at maximum High
                    //console.log(station)
                    if (station ){ //Game.spawns['Home'].memory.maxStorage)
                        if(creep.withdraw(station, RESOURCE_ENERGY, energy_needed ) === ERR_NOT_IN_RANGE) {
                            creep.moveTo(station, {visualizePathStyle: {stroke: '#ff0000'}});
                        }
                    }/*If Creep needs energy, but the storage has'nt enough, go to the waiting flag*/
                    //else creep.moveTo(Game.flags.Flag1, {visualizePathStyle: {stroke: '#ffffff'}});
    	        }
    	   }
    	}
    }
};

module.exports = roleBuilder;
















