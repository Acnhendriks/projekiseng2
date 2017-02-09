'use strict';


const bodyParser = require('body-parser');
const crypto = require('crypto');
const express = require('express');
const fetch = require('node-fetch');
const request = require('request');

let Wit = null;
let log = null;
try {
    // if running from repo
    Wit = require('../').Wit;
    log = require('../').log;
} catch (e) {
    Wit = require('node-wit').Wit;
    log = require('node-wit').log;
}

// Webserver parameter
const PORT = process.env.PORT || 8445;

// Wit.ai parameters
const WIT_TOKEN = 'X5OVWERDJJNQC3TT5FKPXEXSESS3OKRX';//process.env.WIT_TOKEN;

// This will contain all user sessions.
// Each session has an entry:
// sessionId -> {msisdn: appsUserId, context: sessionState}
const sessions = {};
const conversation = {};

const findOrCreateSession = (msisdn) => {
    let sessionId;
    // Let's see if we already have a session for the user fbid
    Object.keys(sessions).forEach(k => {
        if (sessions[k].msisdn === msisdn) {
        // Yep, got it!
        sessionId = k;
    }
});
    if (!sessionId) {
        // No session found for MSISDN X, let's create a new one
        sessionId = new Date().toISOString();
        sessions[sessionId] = {msisdn: msisdn, context: {}, currResponse:{}};
        conversation[sessionId] = {msisdn: msisdn, context: {}, history:{}};
    }
    return sessionId;
};

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

const getResponse = (id) => {
    console.log("getResponse called: ");
    var qs = id;
    var callback = 'http://localhost:8445/getResponse/' + qs;
    console.log("callback: ",callback);
    return fetch(callback, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        });
};
const pushMessage = (id, text) => {
    const body = JSON.stringify({
        recipient: { id },
        message: { text },
    });
    const qs = 'access_token=' + encodeURIComponent(FB_PAGE_TOKEN);
    var callback = 'https://graph.facebook.com/me/messages?' + qs;
    return fetch(callback, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body,
        })
        .then(rsp => rsp.json())
        .then(json => {
                if (json.error && json.error.message) {
                throw new Error(json.error.message);
            }
            return json;
        });
};
// Our bot actions
const actions = {
    send(request, response) {
        const {sessionId, context, entities} = request;
        const {text, quickreplies} = response;
        // Our bot has something to say!
        // Let's retrieve the Facebook user whose session belongs to
        var str = JSON.parse(JSON.stringify(response));
        var quickrply = (str.quickreplies != undefined) ? str.quickreplies : '';
        const recipientId = sessions[request.sessionId].msisdn;
        if (recipientId) {
            //console.log('> Agent: ', str.text +  quickrply);
            sessions[request.sessionId].currResponse = {
                text: str.text,
                options: quickrply
            };
            //TODO: Additional for local test only
            //var currConversation = conversation[request.sessionId].history.text;
            var newConversation = //"<li class='cm'><b>"+recipientId+"</b> - "+request.text+"</li>"+
                                  "<li class='cm'><b>Agent</b> - "+str.text+" "+quickrply+"</li>";
            conversation[request.sessionId].history = {
                text:  newConversation
            };

            // Yay, we found our recipient!
            // Let's forward our bot response to her.
            // We return a promise to let our bot know when we're done sending
        //     return pushMessage(recipientId, text)
        //             .then(() => null)
        // .catch((err) => {
        //         console.error(
        //         'Oops! An error occurred while forwarding the response to',
        //         recipientId,
        //         ':',
        //         err.stack || err
        //     );
        // });
        } else {
            console.error('Oops! Couldn\'t find user for session:', sessionId);
            // Giving the wheel back to our bot
            return Promise.resolve();
        }
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

// Setting up our bot
const wit = new Wit({
    accessToken: WIT_TOKEN,
    actions,
    logger: new log.Logger(log.INFO)
});

const app = express();
app.use(bodyParser.json({ extended: true }));
app.use((req, rsp, next) => {
	
    // Allow access control origin
    let vAllow;
    let vOrigin = req.get('origin');
    if (vOrigin == 'http://localhost:3000') {
        vAllow = 'http://localhost:3000';
    }
    else {
        vAllow = vOrigin;
    }
    if (vAllow) {
        rsp.header('Access-Control-Allow-Origin', vAllow);
    }
    rsp.header('Access-Control-Allow-Credentials', 'true');
    rsp.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Origin, X-Requested-With, Content-Type, Accept,Authorization,Proxy-Authorization,X-session, accessToken, enctype');
    rsp.header('Access-Control-Allow-Methods', 'GET,PUT,DELETE,POST');
    rsp.header('Access-Control-Expose-Headers', 'accessToken,created');
	
	rsp.on('finish', () => {
    console.log(`${rsp.statusCode} ${req.path}`);
});
next();
});
//Get current response from wit.ai
app.get('/getResponse/:msisdn', (req, res) => {
    const sender = req.params.msisdn;  //get it from request
    var sessionId= findOrCreateSession(sender);
    console.log("response...", sessions[sessionId].currResponse);
    res.send(JSON.stringify(sessions[sessionId].currResponse));
});

//Get conversation from wit.ai
app.get('/getConversation/:msisdn', (req, res) => {
    const sender = req.params.msisdn;  //get it from request
    var sessionId= findOrCreateSession(sender);
    console.log("response...", conversation[sessionId].history.text);
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.send(conversation[sessionId].history.text);
});
// Send message to wit.ai
var prevResponse = {};
var currResponse = {};

app.post('/sendMessage/:msisdn', (req, res) => {
    // Let's forward the message to the Wit.ai Bot Engine
    // This will run all actions until our bot has nothing left to do
    const sender = req.params.msisdn;  //get it from request
    var sessionId= findOrCreateSession(sender);
    var text = req.body.message; //get it from request
    console.log("request...", text);
    wit.runActions(
        sessionId, // the user's current session
        text, // the user's message
        sessions[sessionId].context // the user's current session state
    ).then((context) => {
        // Our bot did everything it has to do.
        // Now it's waiting for further messages to proceed.
        console.log('Waiting for next user messages');

    // Based on the session state, you might want to reset the session.
    // This depends heavily on the business logic of your bot.
    // Example:
    // if (context['done']) {
    //   delete sessions[sessionId];
    // }

    // Updating the user's current session state
    sessions[sessionId].context = context;
    })
    .catch((err) => {
        console.error('Oops! Got an error from Wit: ', err.stack || err);
    });

    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.status(200).json({"status": "OK"});
});

app.listen(PORT);
console.log('chat controller started [' + PORT + ']...');
