// Pure Miner Role
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

function noEnemys(creep){
    enemys = creep.room.find(FIND_HOSTILE_CREEPS)

    if(enemys.length > 0) {
        inHomeRoom(creep)
        return false
    } else return true
}

var roleMiner = {
    /** @param {Creep} creep **/
    run: function(creep) {
        if(!creep.memory.target_room) creep.memory.target_room = creep.memory.work_room;
        else
        if (inTargetRoom(creep)){
            if (!creep.memory.resource) resource = 0;
            else resource = creep.memory.resource;

            var container = creep.pos.findInRange(FIND_STRUCTURES, 2, {
                filter: (structure) => {
                    return (structure.structureType === STRUCTURE_CONTAINER)}});

            var sources = creep.room.find(FIND_SOURCES)

            if (creep.harvest(sources[resource]) === ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[resource], {visualizePathStyle: {stroke: '#ffaa00'}});
            } else {
                if ((container.length > 0) && (creep.pos.getRangeTo(container[0]) !== 0)) creep.moveTo(container[0])
                else{
                    if((container.length > 0) && container[0].hits < container[0].hitsMax - 1000) creep.repair(container[0])

                    var site = creep.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 2)
                    if(site.structureType === STRUCTURE_CONTAINER){

                    }
                }

            }
        }
    }
};

module.exports = roleMiner;