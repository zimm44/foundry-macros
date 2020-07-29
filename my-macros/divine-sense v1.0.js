//Activate Divine Sense and apply effects

//edit if required, must be equal to character sheet
let featName = "Divine Sense";
let actorData = canvas.tokens.controlled;

//enable effects, requires Tokenmagic module
let effectsOn = true;

if (actorData.length == 1) { //if only one is selected
    actorData = actorData[0].actor;
    let featData = actorData ? actorData.items.find(i => i.name===featName) : null;
    if (featData !== null) { //if have the required feature
        if(featData.data.data.uses.value > 0) { //check if there are uses available              
                       
            //roll dice and update actor  
            //use the feature
            async function main() {
                let roll = await featData.roll();

                if (roll) {
                    if (effectsOn) {
                        //add effects filter template with Tokenmagic module
                        let params =
                        [{
                            filterType: "wave",
                            autoDestroy: true,
                            time: 0,
                            anchorX: 0.5,
                            anchorY: 0.5,
                            strength: 0.015,
                            frequency: 60,
                            color: 0xFFFFFF,
                            maxIntensity: 3.0,
                            minIntensity: 0.8,
                            padding:10,
                            loops: 1,
                            animated :
                            {
                            time : 
                            { 
                                active: true, 
                                speed: 0.0085, 
                                animType: "move",
                                loops: 3
                            },
                            anchorX :
                            {
                                active: false,
                                val1: 0.15,
                                val2: 0.85,
                                animType: "syncCosOscillation",
                                loopDuration: 20000,
                                loops: 3
                            },
                            anchorY :
                            {
                                active: false,
                                val1: 0.15,
                                val2: 0.85,
                                animType: "syncSinOscillation",
                                loopDuration: 20000,
                                loops: 3
                            }
                            }
                        }];
                        TokenMagic.addFiltersOnSelected(params);
                    }
                }
            }
            main();
        } else
            ui.notifications.warn(`${actorData.name} does not have any uses of ${featName} left.`);
    } else
        ui.notifications.warn(`Selected character must have ${featName} feature.`);
} else if (actorData.length > 1)
    ui.notifications.warn(`Select only one token.`);
else
    ui.notifications.warn(`Select one token.`);