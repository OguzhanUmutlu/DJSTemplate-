/**
 * @name     voiceStateUpdate
 * @enabled  false
 */

const [oldState, newState] = args;

if(oldState.channel && newState.channel) printer.debug("Someone just moved from a VC to a VC!")