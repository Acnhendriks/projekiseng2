'use strict';

let Wit = null;
let interactive = null;
try {
  // if running from repo
  Wit = require('../').Wit;
  interactive = require('../').interactive;
} catch (e) {
  Wit = require('node-wit').Wit;
  interactive = require('node-wit').interactive;
}

const accessToken = (() => {
  if (process.argv.length !== 3) {
    console.log('usage: node examples/quickstart.js <wit-access-token>');
    process.exit(1);
  }
  return process.argv[2];
})();

// Quickstart example
// See https://wit.ai/ar7hur/quickstart

const firstEntityValue = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value
  ;
  if (!val) {
    return null;
  }
  return typeof val === 'object' ? val.value : val;
};

const grapariLoc = {
    Surabaya:'Surabaya Bukit Darmo - Jl. Bukit Darmo Boulevard No.6 C-D, Surabaya',
    Jakarta:'Jakarta Barat - Mall Central Park lt.3, Lot-116-118 Jl. Letjend S.Parman Jakarta 11480'
};

const cornerLoc = {
    Surabaya:'GT WTC 1 SURABAYA - WTC Galeria Lt 1 No 702, Jl pemuda No 27-31 ( 031-5483210 )',
    Jakarta:'Global Mall Citraland Lt.1 - Mall Ciputra Lt.1 unit 12, Jln. Letjen S. Parman, Grogol, Jakarta Barat',
    Jkt:'Global Mall Citraland Lt.1 - Mall Ciputra Lt.1 unit 12, Jln. Letjen S. Parman, Grogol, Jakarta Barat'
};
const actions = {
  send(request, response) {
    const {sessionId, context, entities} = request;
    const {text, quickreplies} = response;
      var str = JSON.parse(JSON.stringify(response));
      var quickrply = '';
      if (str.quickreplies != undefined) quickrply = '\r\n' +str.quickreplies;
     console.log('> Agent: ', str.text +  quickrply);
  },
     getContactBasicInfo({context, entities}){
        var usim4G = false;
        var device4G = false;
        var interactionReason = firstEntityValue(entities, 'tsel_interaction_reason');
        console.log("reason: ", interactionReason);
        if(interactionReason){
            context.contactName = 'Budiono';
            context.simNoDeviceNo = false;
            context.simNoDeviceYes = false;
            context.simYesDeviceNo = false;
            context.simYesDeviceYes = false;
            if(usim4G && device4G){
                context.simYesDeviceYes = true;
            } else if (!usim4G && device4G){
                context.simNoDeviceYes = true;
            } else if (usim4G && !device4G){
                context.simYesDeviceNo = true;
            } else if (!usim4G && !device4G){
                context.simNoDeviceNo = true;
            }
            delete context.missingInteractionReason;
            //console.log("missing: ", context.missingInteractionReason);
        } else {
            context.missingInteractionReason = true;
        }
        return context;
    },
    getContactLocation({context, entities}){
        context.contactName='Budiono';
        context.location='Surabaya';
        return context;
    },
    getSmartphoneCorner({context, entities}){
        var location = firstEntityValue(entities,'location');
        console.log("contact location: ", location);
        var detected= true;
        if(!location){
            location = context.location;
            if(location) {
                detected = true;
            }
            else {
                detected = false;
            }
        } else {
            context.location = location;
        }

        if(detected){
            if( location =='Surabaya') {
                context.cornerLocation = 'GT WTC 1 SURABAYA - WTC Galeria Lt 1 No 702, Jl pemuda No 27-31 ( 031-5483210 )';
            }
            if( location.substr('Jakarta') || location.substr('Jkt')) {
                context.cornerLocation = 'Global Mall Citraland Lt.1 - Mall Ciputra Lt.1 unit 12, Jln. Letjen S. Parman, Grogol, Jakarta Barat';
            }
        } else {
            context.cornerLocation = 'not detected';
        }
        return context;
    },
    getGrapariLocation({context, entities}){
        var location = firstEntityValue(entities,'location');
        console.log("contact location: ", location);
        var detected= true;
        if(!location){
            location = context.location;
            if(location) {
                detected = true;
            }
            else {
                detected = false;
            }
        } else {
            context.location = location;
        }

        if(detected){
            context.grapariLocation= grapariLoc[location];
        } else {
            context.grapariLocation = 'not detected';
        }
        return context;
    },
    endInteraction({context, entities}){
        delete context.location;
        delete context.grapariLocation;
        delete context.cornerLocation;
        delete context.contactName ;
        delete context.simNoDeviceNo;
        delete context.simNoDeviceYes;
        delete context.simYesDeviceNo;
        delete context.simYesDeviceYes
        delete context.missingInteractionReason;
        console.log("context... ", context);
    }
};

const client = new Wit({accessToken, actions});
interactive(client);
