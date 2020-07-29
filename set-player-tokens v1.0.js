//This will set player tokens in scene to always display their token bars and nameplate on mouse hover, and sets the first bar to represent HP and removes the second token bar.

if (canvas.tokens.placeables.filter(token => token.actor !== null).length >0) {
    const tokens =canvas.tokens.placeables.filter(token => token.actor.isPC).map(token => {
    return {
        _id: token.id,
        "bar1.attribute": "attributes.hp",
        "bar2.attribute": "",
        "displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
        "displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS
    };
    });

    canvas.scene.updateEmbeddedEntity('Token', tokens);
} else ui.notifications.warn(`The scene doesn't have any actor.`);