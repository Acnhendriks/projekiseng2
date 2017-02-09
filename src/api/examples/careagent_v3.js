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
const WIT_TOKEN = '4MZ2CZZ2C7D7I4NOTPCV6LBECZRRISRP';//process.env.WIT_TOKEN;

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
        sessions[sessionId] = {msisdn: msisdn, context: {}, currResponse:{}, stackResponse:[]};
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

const findSmartphoneCorner= (location) =>{
    var cornerLocation='';
    if( location =='Surabaya') {
        cornerLocation = 'GT WTC 1 SURABAYA - WTC Galeria Lt 1 No 702, Jl pemuda No 27-31 ( 031-5483210 )';
    }
    if( location.substr('Jakarta') || location.substr('Jkt')) {
        cornerLocation = 'Global Mall Citraland Lt.1 - Mall Ciputra Lt.1 unit 12, Jln. Letjen S. Parman, Grogol, Jakarta Barat';
    }
    return cornerLocation;
};
const findGrapariCorner =(location) =>{

    var grapariLocation= grapariLoc[location];
    return grapariLocation;
};
// Our bot actions
const actions = {
    send(request, response) {
		
        const {sessionId, context, entities} = request;
        const {text, quickreplies} = response;
        // Our bot has something to say!
        // Let's retrieve the Facebook user whose session belongs to
        var str = JSON.parse(JSON.stringify(response));
        var quickrply = (str.quickreplies !== undefined) ? str.quickreplies : '';
        const recipientId = sessions[request.sessionId].msisdn;
        if (recipientId) {
			console.log("response : ", sessions[request.sessionId].stackResponse);
            //console.log('> Agent: ', str.text +  quickrply);
            sessions[request.sessionId].stackResponse.push({
                text: str.text,
                options: quickrply
            });
            sessions[request.sessionId].currResponse = {
                text: str.text,
                options: quickrply
            };
			//TODO: Additional for local test only
            //var currConversation = conversation[request.sessionId].history.text;
            var date = new Date();
            var time = date.getHours()+':'+date.getMinutes();
            var newConversation =
                //"<li class='cm'><b>Agent</b> - "+str.text+" "+quickrply+"</li>";
                '<div class="chat-message clearfix">'+
                '<img src="telkomsel.png" alt="" width="32" height="32">'+
                '<div class="chat-message-content clearfix">'+
                '<span class="chat-time">'+time+'</span>'	+
                '<h5>Agent</h5>'	+
                '<p>'+str.text+'</br>'+quickrply+'</p>'+
                '</div>'+
                '</div>'+
                '<hr>';

            conversation[request.sessionId].history = {
                text:  newConversation
            };
        } else {
            console.error('Oops! Couldn\'t find user for session:', sessionId);
            // Giving the wheel back to our bot
            return Promise.resolve();
        }
    },
    merge({entities, context, message, sessionId}) {
        return new Promise(function(resolve, reject) {
            //location, tsel_channel, tsel_interaction_reason
            console.log("entities in merge op: ", entities);
            const location = firstEntityValue(entities, 'location');
            console.log("location, context.location: ",location, context.location);
            if (location) {
                context.location = location;
            }
            const tselChannel = firstEntityValue(entities, 'tsel_channel');
            console.log("tselChannel, context.tselChannel: ",tselChannel, context.tselChannel);
            if (tselChannel) {
                context.tselChannel = tselChannel;
            }
            const tselInteractionReason = firstEntityValue(entities, 'tsel_interaction_reason');
            console.log("tselInteractionReason, context.tselInteractionReason: ",tselInteractionReason, context.tselInteractionReason);
            if (tselInteractionReason) {
                context.tselInteractionReason = tselInteractionReason;
            }

            return resolve(context);
        });
    },
    getUpgradeInformation({context, entities}){
        //TODO: (1) check location, (2) check channel, (3) interaction reason
        return new Promise(function(resolve, reject) {
            const location = context.location;
            const tselChannel = context.tselChannel;
            const tselInteractionReason = context.tselInteractionReason;

            if (location) {
                delete context.missingLocation;
            } else {
                context.missingLocation = true;
            }

            if (tselChannel) {
                delete context.missingChannel;
            } else {
                context.missingChannel = true;
            }

            if (tselInteractionReason) {
                delete context.missingInteractionReason;
            } else {
                context.missingInteractionReason = true;
            }

            if (location && tselChannel && tselInteractionReason) {
                delete context.missingChannel;
                delete context.missingLocation;
                delete context.missingInteractionReason;
                if (tselChannel.substr("corner")) {
                    delete context.completeInfoGraPARI;
                    context.completeInfoSmartphoneCorner = true;
                    var cornerLocation = findSmartphoneCorner(location);
                    context.cornerLocation = cornerLocation;
                } else if (tselChannel.toLowerCase().substr("grapari")) {
                    delete context.completeInfoSmartphoneCorner;
                    context.completeInfoGraPARI = true;

                    var cornerLocation = findGrapariCorner(location);
                    context.cornerLocation = cornerLocation;
                }
            } else {
                delete context.completeInfoSmartphoneCorner;
                delete context.completeInfoGraPARI;
            }

            console.log("context", context);
            return resolve(context);
        });
    },
    getConfirmationValue({context, entities}){
        //TODO: (1) check location, (2) check channel, (3) interaction reason
        return new Promise(function(resolve, reject) {
            const confirmationVal = firstEntityValue(entities, 'tsel_confirm_interaction');
            if (confirmationVal) {
                delete context.missingConfirmation;
                context.confirmationFound = true;
            } else {
                context.missingConfirmation = true;
            }
            console.log("context", entities);
            console.log("entities ", entities);
            return resolve(context);
        });
    },
    endInteraction({context, entities}){
        return new Promise(function(resolve, reject) {
            delete context.location;
            delete context.tselChannel;
            delete context.tselInteractionReason;
            delete context.missingLocation;
            delete context.missingChannel;
            delete context.missingInteractionReason;
            delete context.missingConfirmation;
            delete context.completeInfoSmartphoneCorner;
            delete context.completeInfoGraPARI;
            delete context.cornerLocation;
            delete context.confirmationFound;
            return resolve(context);
        });
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
    var listofRes = sessions[sessionId].stackResponse;
    sessions[sessionId].stackResponse = [];
    res.send({"response":listofRes});
});

//Get conversation from wit.ai
app.get('/getConversation/:msisdn', (req, res) => {
    const sender = req.params.msisdn;  //get it from request
    var sessionId= findOrCreateSession(sender);
    //console.log("response...", conversation[sessionId].history.text);
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

console.log('starting chat controller [' + PORT + ']...');
app.listen(PORT);
console.log('chat controller started [' + PORT + ']...');
