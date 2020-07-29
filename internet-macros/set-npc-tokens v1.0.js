//This will set npc tokens in scene to display their token bars and nameplate only for GM, and sets the first bar to represent HP and removes the second token bar.

if (canvas.tokens.placeables.filter(token => token.actor !== null).length >0) {
    const tokens =canvas.tokens.placeables.filter(token => token.actor.isToken).map(token => {
    return {
        _id: token.id,
        "bar1.attribute": "attributes.hp",
        "bar2.attribute": "",
        "displayName": CONST.TOKEN_DISPLAY_MODES.OWNER,
        "displayBars": CONST.TOKEN_DISPLAY_MODES.OWNER
    };
    });

    canvas.scene.updateEmbeddedEntity('Token', tokens);
} else ui.notifications.warn(`The scene doesn't have any actor.`);