/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.healer');
 * mod.thing == 'a thing'; // true
 */

var roleHealer = {
    run: function (creep) {
        if (inTargetRoom(creep)){
            healTarget = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
                filter: (creep) => {
                    return (creep.hits < creep.hitsMax)}});

            if((healTarget) && atPosition(creep, healTarget)) creep.heal(healTarget)

        }

    }
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


module.exports = roleHealer;