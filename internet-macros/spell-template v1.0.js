//Apply spell templates

let applyChanges = false
new Dialog({
  title: `5e Template creator`,
  content: `
    <style>
      #dnd-template-creator .form-fields.buttons {
        justify-content: flex-start !important;
      }
      #dnd-template-creator .button {
        flex: 1 !important;
      }
      #dnd-template-creator .radios input[type="radio"] {
        opacity: 0;
        position: fixed;
        width: 0;
      }
      #dnd-template-creator .radios label {
        display: flex;
        flex: 1 !important;
        margin: -2px 0;
        line-height: 22px;
        background: rgba(0, 0, 0, 0.1);
        border: 2px groove #f0f0e0;
        width: 100%;
        border-radius: 3px;
        font-size: 14px;
        font-family: "Signika", sans-serif;
        justify-content: center;
        align-items: center;
      }
      #dnd-template-creator .radios label i {
        margin-right: 5px
      }
      #dnd-template-creator .radios label:hover {
        box-shadow: 0 0 5px red;
      }
      #dnd-template-creator .radios input[type="radio"]:checked + label {
        background: rgba(0, 0, 0, 0.2);
      }
      #dnd-template-creator .dialog-buttons {
        align-content: flex-end;
      }
    </style>
    <form>
      <div class="form-group">
        <p class="notes">Zone type:</p>
        <div class="form-fields buttons radios">
          <input type="radio" name="shape" id="square" value="square" checked>
          <label for="square"><i class="fas fa-square"></i> Square</label>
          <input type="radio" name="shape" id="circle" value="circle">
          <label for="circle"><i class="fas fa-dot-circle"></i> Circle</label>
          <input type="radio" name="shape" id="cone" value="cone">
          <label for="cone"><i class="fas fa-wifi"></i> Cone</label>
          <input type="radio" name="shape" id="line" value="line">
          <label for="line"><i class="fas fa-ruler-horizontal"></i> Line</label>
        </div>
      </div>

      <hr>

      <div class="form-group">
        <p class="notes">Predefined values:</p>
        <div class="form-fields buttons">
          <button type="button" class="button" onclick="updateRadiusValue(5)">5 ft</button>
          <button type="button" class="button" onclick="updateRadiusValue(10)">10 ft</button>
          <button type="button" class="button" onclick="updateRadiusValue(15)">15 ft</button>
          <button type="button" class="button" onclick="updateRadiusValue(20)">20 ft</button>
          <button type="button" class="button" onclick="updateRadiusValue(30)">30 ft</button>
          <button type="button" class="button" onclick="updateRadiusValue(60)">60 ft</button>
          <button type="button" class="button" onclick="updateRadiusValue(120)">120 ft</button>
        </div>
      </div>

      <hr>

      <div class="form-group">
      <p class="notes">Template radius in feet:</p>
      <div class="form-fields">
        <input type="range" id="radius" name="radius" value="5" min="5" max="120" step="5" oninput="updateRangeValue(this.value);">
        <span id="range-value" class="range-value">5</span>
      </div>
      </div>
    </form>
    <script>
      function updateRadiusValue(val) {
        document.getElementById("radius").value = val
        updateRangeValue(val)
      }
      function updateRangeValue(val) {
        document.getElementById("range-value").innerHTML = val
      }
    </script>
  `,
  buttons: {
    no: {
      icon: "<i class='fas fa-times'></i>",
      label: `Cancel`
    },
    yes: {
      icon: "<i class='fas fa-check'></i>",
      label: `Apply`,
      callback: () => applyChanges = true
    }
  },
  default: "yes",
  close: html => {
    if (applyChanges) {

      // Template settings
      const templateData = {
        user: game.user._id,
        distance: parseFloat(html.find('[name="radius"]')[0].value),
        direction: 0,
        x: 0,
        y: 0,
        fillColor: game.user.color
      }

      let templateShape = html.find('[name="shape"]')
      for (var i = 0, length = templateShape.length; i < length; i++) {
        if (templateShape[i].checked) {
          templateShape = templateShape[i].value
          break
        }
      }

      switch (templateShape) {
        case "cone":
          templateData.t = "cone"
          templateData.angle = 53.13
          break
        case "square":
          templateData.t = "rect"
          templateData.distance = Math.hypot(templateData.distance, templateData.distance)
          templateData.width = templateData.distance
          templateData.direction = 45
          break
        case "line":
          templateData.t = "ray"
          templateData.width = 5
          break
        case "circle":
          templateData.t = "circle"
          break
        default:
          break
      }

      const measuredTemplate = new MeasuredTemplate(templateData)

      // Prepare layer for preview
      const highlighterName = 'Preview.' + Math.random().toString(36).substr(2, 9)
      const highlighter = canvas.grid.addHighlightLayer(highlighterName)
      const initialLayer = canvas.activeLayer
      measuredTemplate.draw()
      measuredTemplate.layer.activate()
      measuredTemplate.layer.preview.addChild(measuredTemplate)


      // Calculate the highlight
      function highlightGrid() {
        const grid = canvas.grid,
          d = canvas.dimensions,
          bc = "0x000000",
          fc = measuredTemplate.data.fillColor.replace('#', '0x')

        // Clear existing highlight
        canvas.grid.clearHighlightLayer(highlighterName)

        /*
        ----------- THX TO FOUNDRY CREATOR FOR THIS CODE FROM CORE FOUNDRY. --------------
        */
        // Get number of rows and columns
        const nr = Math.ceil(((measuredTemplate.data.distance * 1.5) / d.distance) / (d.size / grid.h));
        const nc = Math.ceil(((measuredTemplate.data.distance * 1.5) / d.distance) / (d.size / grid.w));
        // Get the offset of the template origin relative to the top-left grid space
        const [tx, ty] = canvas.grid.getTopLeft(measuredTemplate.data.x, measuredTemplate.data.y);
        const [row0, col0] = grid.grid.getGridPositionFromPixels(tx, ty);
        const hx = canvas.grid.w / 2;
        const hy = canvas.grid.h / 2;
        const isCenter = (measuredTemplate.data.x - tx === hx) && (measuredTemplate.data.y - ty === hy);
        // Identify grid coordinates covered by the template Graphics
        for (let r = -nr; r < nr; r++) {
          for (let c = -nc; c < nc; c++) {
            let [gx, gy] = canvas.grid.grid.getPixelsFromGridPosition(row0 + r, col0 + c);
            const testX = (gx + hx) - measuredTemplate.data.x;
            const testY = (gy + hy) - measuredTemplate.data.y;
            let contains = ((r === 0) && (c === 0) && isCenter) || measuredTemplate.shape.contains(testX, testY);
            if (!contains) continue;
            grid.grid.highlightGridPosition(highlighter, { x: gx, y: gy, color: fc, border: bc });
          }
        }
      }

      /*
      ----------- THX TO FOUNDRY CREATOR FOR THIS CODE FROM DND 5. --------------
      */

      // Preview handlers
      const handlers = {}
      let moveTime = 0

      // Update placement (mouse-move)
      handlers.mm = event => {
        event.stopPropagation()
        let now = Date.now() // Apply a 20ms throttle
        if (now - moveTime <= 20) return
        const center = event.data.getLocalPosition(measuredTemplate.layer)
        const snapped = canvas.grid.getSnappedPosition(center.x, center.y, 2);
        measuredTemplate.data.x = snapped.x
        measuredTemplate.data.y = snapped.y
        measuredTemplate.refresh()
        highlightGrid()
        moveTime = now
      }

      // Cancel the workflow (right-click)
      handlers.rc = event => {
        canvas.grid.destroyHighlightLayer(highlighterName)
        measuredTemplate.layer.preview.removeChildren()
        canvas.stage.off("mousemove", handlers.mm)
        canvas.stage.off("mousedown", handlers.lc)
        canvas.app.view.oncontextmenu = null
        canvas.app.view.onwheel = null
        initialLayer.activate()
      }

      // Confirm the workflow (left-click)
      handlers.lc = event => {
        handlers.rc(event)

        const destination = canvas.grid.getSnappedPosition(measuredTemplate.data.x, measuredTemplate.data.y, 2);
        measuredTemplate.data.x = destination.x
        measuredTemplate.data.y = destination.y

        canvas.scene.createEmbeddedEntity("MeasuredTemplate", measuredTemplate.data)
      }

      // Rotate the template by 3 degree increments (mouse-wheel)
      handlers.mw = event => {
        if (event.ctrlKey) event.preventDefault()
        event.stopPropagation()
        let delta = canvas.grid.type > CONST.GRID_TYPES.SQUARE ? 30 : 15
        let snap = event.shiftKey ? delta : 5
        measuredTemplate.data.direction += (snap * Math.sign(event.deltaY))
        measuredTemplate.refresh()
        highlightGrid()
      }

      // Activate listeners
      canvas.stage.on("mousemove", handlers.mm)
      canvas.stage.on("mousedown", handlers.lc)
      canvas.app.view.oncontextmenu = handlers.rc
      canvas.app.view.onwheel = handlers.mw

    }
  }
}, {
  id: "dnd-template-creator"
}).render(true)