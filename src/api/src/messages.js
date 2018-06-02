module.exports = {
    //Message envelope for putting messages on the bus
    makeMessage: function (ptype, pbody) {
        return {
            version: '1.1',
            sender: 'fullcyclereact',
            type: ptype,
            timestamp: new Date().toISOString(),
            body: pbody
        }
    },

    // MinerMessage
    makeMinerMessage: function (pminer, pcommand, ppool){
        return {
            miner: pminer,
            command: pcommand,
            minerstats: null,
            minerpool: ppool
        }
    },

    //MinerCommandMessge
    makeCommand: function (pcommand,pparameter){
        return {
            command: pcommand,
            parameter: pparameter
        }
    },

    // ConfigurationMessage
    makeConfigurationMessage: function (pbody){
        return {
            command: pbody.command,
            parameter: pbody.parameter,
            id: pbody.id,
            entity: pbody.entity,
            values: pbody.values
        }
    }
}
