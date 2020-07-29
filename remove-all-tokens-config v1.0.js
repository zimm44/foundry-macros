//This will set every token in scene to always never display their token bars and nameplate.

if (canvas.tokens.placeables.filter(token => token.actor !== null).length >0) {
    const tokens =canvas.tokens.placeables.map(token => {
    return {
        _id: token.id,
        "bar1.attribute": "attributes.hp",
        "bar2.attribute": "",
        "displayName": CONST.TOKEN_DISPLAY_MODES.NONE,
        "displayBars": CONST.TOKEN_DISPLAY_MODES.NONE
    };
    });

    canvas.scene.updateEmbeddedEntity('Token', tokens);
} else ui.notifications.warn(`The scene doesn't have any actor.`);