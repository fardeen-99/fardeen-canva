
console.log("hi whatsupp");

const editorState = {
  elements: [],
  selectedElementIds: [],
  activeTool: 'select',
  canvasRect: null,
  zIndexCounter: 1,
  dragState: null,
  resizeState: null,
  rotateState: null,
  history: [],
  historyIndex: -1,
  copiedElements: [],
  zoom: 1,
  panX: 0,
  panY: 0,
  showGrid: false,
  gridSize: 20,
  snapToGrid: false,
  isPanning: false,
  panStartX: 0,
  panStartY: 0
};

console.log("Editor:", editorState)

const canvas = document.getElementById('canvas')
const layersList = document.getElementById('layers-list')
const propWidth = document.getElementById('prop-width')
const propHeight = document.getElementById('prop-height')
const propBgColor = document.getElementById('prop-bg-color')
const propTextContent = document.getElementById('prop-text-content')
const propRotation = document.getElementById('prop-rotation')

console.log("Canvas found?", canvas)
console.log("Layers panel found?", layersList)

function generateId() {
  const id = 'elem-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
  console.log("Generated new element id:", id);
  return id
}

function getCanvasRect() {
  const rect = canvas.getBoundingClientRect();
  console.log("Canvas rect calculated:", rect);
  return rect;
}

function updateCanvasRect() {
  console.log("Updating canvas rect...")
  editorState.canvasRect = getCanvasRect()
}

function constrainToCanvas(x, y, width, height) {
  const canvasWidth = canvas.offsetWidth;
  const canvasHeight = canvas.offsetHeight;

  const constrained = {
    x: Math.max(0, Math.min(x, canvasWidth - width)),
    y: Math.max(0, Math.min(y, canvasHeight - height))
  }

  console.log("Constraining position:", {
    input: { x, y },
    output: constrained
  })

  return constrained
}






function getElementData(id) {
  const element = editorState.elements.find(el => el.id === id)
  console.log("Fetching element data for:", id, element)
  return element
}

function setElementData(id, updates) {
  console.log("Updating element:", id, updates)

  const element = getElementData(id);
  if (element) {
    Object.assign(element, updates);
    console.log("Element after update:", element)
  } else {
    console.warn("Element not found for update:", id)
  }
}

function pushHistory() {

  editorState.history = editorState.history.slice(0, editorState.historyIndex + 1)
  editorState.history.push(JSON.parse(JSON.stringify(editorState.elements)));
  editorState.historyIndex++;

  console.log("History length:", editorState.history.length)
  console.log("History index:", editorState.historyIndex)

  if (editorState.history.length > 50) {
    editorState.history.shift()
    editorState.historyIndex--
    console.log("History trimmed to 50 states")
  }
}

function undo() {
  console.log("Undo triggered")

  if (editorState.historyIndex > 0) {
    editorState.historyIndex--
    editorState.elements = JSON.parse(
      JSON.stringify(editorState.history[editorState.historyIndex])
    );

    console.log("Undo success, index now:", editorState.historyIndex)
    deselectAll()
    renderCanvas()
    updateLayersPanel()
  } else {
    console.log("Nothing to undo")
  }
}

function redo() {
  console.log("Redo triggered")

  if (editorState.historyIndex < editorState.history.length - 1) {
    editorState.historyIndex++
    editorState.elements = JSON.parse(
      JSON.stringify(editorState.history[editorState.historyIndex])
    );

    console.log("Redo success, index now:", editorState.historyIndex)
    deselectAll();
    renderCanvas()
    updateLayersPanel()
  } else {
    console.log("Nothing to redo")
  }
}

function createElement(type) {
  console.log("createElement called with type:", type)

  const id = generateId()
  console.log("New element id generated:", id)

  const elementData = {
    id,
    type,
    x: 100,
    y: 100,

    width:
      type === 'text' ? 200 : type === 'line' ? 200 : type === 'circle' ? 150
        : 150,

    height:
      type === 'text' ? 50 : type === 'line' ? 2 : type === 'circle'
        ? 150
        : 150,

    rotation: 0,

    zIndex: editorState.zIndexCounter++,

    styles: {
      backgroundColor:
        type === 'text' || type === 'line' ? 'transparent'
          : type === 'circle'
            ? '#2563eb'
            : '#ffffff',

      color: '#1f2937',
      fontSize: 16,
      fontFamily: 'Arial',
      borderWidth: 0,
      borderColor: '#000000',
      borderRadius: type === 'circle' ? 75 : 0,
      boxShadow: '',
      opacity: 1
    },

    content: type === 'text' ? 'Double click to edit' : ''
  };


  console.log("Elemen:", elementData)

  editorState.elements.push(elementData)
  console.log("Total elements:", editorState.elements.length)

  renderCanvas()
  selectElement(id)
  saveToLocalStorage()

  console.log("createElement:", id)
  return elementData;
}

function renderCanvas() {
  console.log("canvas................................................ chalja bsdk");
  canvas.innerHTML = ''

  // Apply zoom and pan
  canvas.style.transform = `translate(${editorState.panX}px, ${editorState.panY}px) scale(${editorState.zoom})`;
  canvas.style.transformOrigin = '0 0'

  if (editorState.showGrid) {
    console.log("Grid enabled, rendering grid...")
    renderGrid();
  }

  //date-21 

  console.log("Rendering elements ks count count:", editorState.elements.length)
  editorState.elements.forEach((elementData, index) => {
    console.log(`Rendering count ke liye ${index + 1}:`, elementData.id)
    renderElement(elementData)
  });
}

function renderGrid() {
  console.log("Rendering grid...")

  const gridSize = editorState.gridSize
  const canvasWidth = canvas.offsetWidth
  const canvasHeight = canvas.offsetHeight

  console.log("Grid size:", gridSize)
  console.log("Canvas size:", canvasWidth, canvasHeight)

  for (let x = 0; x < canvasWidth; x += gridSize) {
    const line = document.createElement('div')
    line.className = 'grid-line grid-line-vertical'
    line.style.left = x + 'px'
    line.style.height = canvasHeight + 'px'
    canvas.appendChild(line)
  }

  for (let y = 0; y < canvasHeight; y += gridSize) {
    const line = document.createElement('div')
    line.className = 'grid-line grid-line-horizontal'
    line.style.top = y + 'px'
    line.style.width = canvasWidth + 'px'
    canvas.appendChild(line)
  }

  console.log("Grid render complete")
}

function renderElement(elementData) {
  console.log("Rendering single element:", elementData.id)

  const element = document.createElement('div')
  element.className = 'canvas-element'
  element.dataset.elementId = elementData.id
  element.dataset.elementType = elementData.type

  element.style.left = elementData.x + 'px'
  element.style.top = elementData.y + 'px'
  element.style.width = elementData.width + 'px'
  element.style.height = elementData.height + 'px'
  element.style.zIndex = elementData.zIndex;
  element.style.transform = `rotate(${elementData.rotation}deg)`

  if (elementData.styles.borderWidth) {
    element.style.border = `${elementData.styles.borderWidth}px solid ${elementData.styles.borderColor}`
  }

  if (elementData.styles.borderRadius) {
    element.style.borderRadius = elementData.styles.borderRadius + 'px'
  }

  if (elementData.styles.boxShadow) {
    element.style.boxShadow = elementData.styles.boxShadow
  }

  if (elementData.styles.opacity !== undefined) {
    element.style.opacity = elementData.styles.opacity
  }

  const content = document.createElement('div')
  content.className = 'element-content'
  content.style.color = elementData.styles.color
  content.style.fontSize = elementData.styles.fontSize + 'px'
  content.style.fontFamily = elementData.styles.fontFamily || 'Arial'

  if (elementData.type !== 'text') {
    content.style.backgroundColor = elementData.styles.backgroundColor
    console.log("Applied background for non-text element")
  } else {
    content.style.backgroundColor = 'transparent'
    content.style.padding = '0'
    content.textContent = elementData.content
    console.log("Text element content set:", elementData.content)
  }

  element.appendChild(content)
  createResizeHandles(element)
  createRotateHandle(element)
  canvas.appendChild(element)

  console.log("Element rendered:", elementData.id)
}

function createResizeHandles(element) {
  console.log("Creating resize handles...")

  const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top', 'bottom', 'left', 'right']

  positions.forEach(pos => {
    const handle = document.createElement('div')
    handle.className = `resize-handle ${pos}`
    handle.dataset.position = pos
    element.appendChild(handle)
  })
}

function createRotateHandle(element) {
  console.log("Creating rotate handle")

  const handle = document.createElement('div')
  handle.className = 'rotate-handle'
  element.appendChild(handle)
}

function selectElement(id) {
  console.log("selectElement called with id:", id)

  if (editorState.selectedElementId === id) {
    console.log("Same element already selected, returning")
    return
  }

  deselectAll()

  editorState.selectedElementId = id
  console.log("Selected element id set:", id)

  const domElement = canvas.querySelector(`[data-element-id="${id}"]`)
  if (domElement) {
    domElement.classList.add('selected')
    console.log("Selected class added to DOM element")
  } else {
    console.log("DOM element not found for selection")
  }

  updatePropertiesPanel()
  updateLayersPanel()
}

function deselectAll() {
  console.log("Deselecting all elements")

  editorState.selectedElementId = null

  const allElements = canvas.querySelectorAll('.canvas-element')
  console.log("Elements to deselect:", allElements.length)

  allElements.forEach(el => {
    el.classList.remove('selected')
  })

  clearPropertiesPanel()
  updateLayersPanel()
}

function getSelectedElement() {
  if (!editorState.selectedElementId) {
    console.log("No element selected in getSelectedElement")
    return null
  }

  const el = getElementData(editorState.selectedElementId)
  console.log("getSelectedElement returned:", el)
  return el
}

function getSelectedDOMElement() {
  if (!editorState.selectedElementId) {
    console.log("No selected DOM element")
    return null
  }

  const domEl = canvas.querySelector(
    `[data-element-id="${editorState.selectedElementId}"]`
  )

  console.log("Selected DOM element:", domEl)
  return domEl
}

function startDrag(e, element) {
  console.log("startDrag triggered")

  if (
    e.target.classList.contains('resize-handle') ||
    e.target.classList.contains('rotate-handle')
  ) {
    console.log("Clicked on handle, drag cancelled")
    return
  }

  const id = element.dataset.elementId
  console.log("Dragging element id:", id)

  const elementData = getElementData(id)
  if (!elementData) {
    console.log("No element data found for drag")
    return
  }

  selectElement(id)

  const rect = element.getBoundingClientRect()

  editorState.dragState = {
    elementId: id,
    startX: e.clientX,
    startY: e.clientY,
    elementStartX: elementData.x,
    elementStartY: elementData.y,
    offsetX: e.clientX - rect.left,
    offsetY: e.clientY - rect.top
  }

  console.log("Drag state set:", editorState.dragState)
  e.preventDefault()
}

function onDrag(e) {
  if (!editorState.dragState) return

  const {
    elementId,
    startX,
    startY,
    elementStartX,
    elementStartY
  } = editorState.dragState

  const elementData = getElementData(elementId)
  const element = canvas.querySelector(
    `[data-element-id="${elementId}"]`
  )

  if (!elementData || !element) {
    console.log("Drag failed, element missing")
    return
  }

  const dx = e.clientX - startX
  const dy = e.clientY - startY

  let newX = elementStartX + dx
  let newY = elementStartY + dy

  const constrained = constrainToCanvas(
    newX,
    newY,
    elementData.width,
    elementData.height
  )

  elementData.x = constrained.x
  elementData.y = constrained.y

  element.style.left = constrained.x + 'px'
  element.style.top = constrained.y + 'px'

  updatePropertiesPanel()
}
function endDrag() {
  if (editorState.dragState) {
    console.log("Drag ended for:", editorState.dragState.elementId)
    saveToLocalStorage()
    editorState.dragState = null
  }
}

function startResize(e, handle, element) {
  e.stopPropagation()
  e.preventDefault()
  
  const id = element.dataset.elementId
  const elementData = getElementData(id)

  if (!elementData) {
    console.log("Resize failed, element data missing")
    return
  }

  const position = handle.dataset.position
  console.log("Resize handle position:", position)

  editorState.resizeState = {
    elementId: id,
    position,
    startX: e.clientX,
    startY: e.clientY,
    startWidth: elementData.width,
    startHeight: elementData.height,
    startPosX: elementData.x,
    startPosY: elementData.y
  }

  console.log("Resize state set:", editorState.resizeState)
}

function onResize(e) {
  if (!editorState.resizeState) return

  const {
    elementId,
    position,
    startX,
    startY,
    startWidth,
    startHeight,
    startPosX,
    startPosY
  } = editorState.resizeState

  const elementData = getElementData(elementId)
  const element = canvas.querySelector(
    `[data-element-id="${elementId}"]`
  )

  if (!elementData || !element) {
    console.log("Resize failed, element missing")
    return
  }

  const dx = e.clientX - startX
  const dy = e.clientY - startY

  let newWidth = startWidth
  let newHeight = startHeight
  let newX = startPosX
  let newY = startPosY

  const minSize = 20

if (position.includes('right')) {
  newWidth = Math.max(minSize, startWidth + dx)
}

if (position.includes('left')) {
  newWidth = Math.max(minSize, startWidth - dx)
  newX = startPosX + (startWidth - newWidth)
}

if (position.includes('bottom')) {
  newHeight = Math.max(minSize, startHeight + dy)
}

if (position.includes('top')) {
  newHeight = Math.max(minSize, startHeight - dy)
  newY = startPosY + (startHeight - newHeight)
}

  const constrained = constrainToCanvas(
    newX,
    newY,
    newWidth,
    newHeight
  )

  elementData.x = constrained.x
  elementData.y = constrained.y
  elementData.width = newWidth
  elementData.height = newHeight

  element.style.left = constrained.x + 'px'
  element.style.top = constrained.y + 'px'
  element.style.width = newWidth + 'px'
  element.style.height = newHeight + 'px'

  updatePropertiesPanel()
}

function endResize() {
  if (editorState.resizeState) {
    console.log("Resize ended for:", editorState.resizeState.elementId)
    saveToLocalStorage()
    editorState.resizeState = null
  }
}

function startRotate(e, element) {
  console.log("startRotate called")

  e.stopPropagation()

  const id = element.dataset.elementId
  console.log("Rotating element id:", id)

  const elementData = getElementData(id)
  if (!elementData) {
    console.log("Rotate failed: element data not found")
    return
  }

  const rect = element.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  const startAngle =
    Math.atan2(e.clientY - centerY, e.clientX - centerX) *
    (180 / Math.PI)

  editorState.rotateState = {
    elementId: id,
    centerX,
    centerY,
    startAngle,
    startRotation: elementData.rotation
  }

  console.log("Rotate state set:", editorState.rotateState)
  e.preventDefault()
}

function onRotate(e) {
  if (!editorState.rotateState) return

  const {
    elementId,
    centerX,
    centerY,
    startAngle,
    startRotation
  } = editorState.rotateState

  const elementData = getElementData(elementId)
  const element = canvas.querySelector(
    `[data-element-id="${elementId}"]`
  )

  if (!elementData || !element) {
    console.log("onRotate failed: element missing")
    return
  }

  const currentAngle =
    Math.atan2(e.clientY - centerY, e.clientX - centerX) *
    (180 / Math.PI)

  const deltaAngle = currentAngle - startAngle

  let newRotation = startRotation + deltaAngle
  newRotation = ((newRotation % 360) + 360) % 360

  elementData.rotation = newRotation
  element.style.transform = `rotate(${newRotation}deg)`

  console.log("Rotation updated to:", newRotation)
  updatePropertiesPanel()
}

function endRotate() {
  if (editorState.rotateState) {
    console.log("Rotation ended for:", editorState.rotateState.elementId)
    saveToLocalStorage()
    editorState.rotateState = null
  }
}

function startPan(e) {
  console.log("Pan started")

  editorState.isPanning = true
  editorState.panStartX = e.clientX - editorState.panX
  editorState.panStartY = e.clientY - editorState.panY

  canvas.style.cursor = 'grabbing'
  e.preventDefault()
}

function onPan(e) {
  if (!editorState.isPanning) return

  editorState.panX = e.clientX - editorState.panStartX
  editorState.panY = e.clientY - editorState.panStartY

  console.log("Panning canvas to:", editorState.panX, editorState.panY)
  renderCanvas()
}

function endPan() {
  if (editorState.isPanning) {
    console.log("Pan ended")
    editorState.isPanning = false
    canvas.style.cursor = 'grab'
  }
}

function updatePropertiesPanel() {
  const elementData = getSelectedElement()

  if (!elementData) {
    console.log("No element selected, clearing properties panel")
    clearPropertiesPanel()
    return
  }

  console.log("Updating properties panel for:", elementData.id)

  propWidth.value = Math.round(elementData.width)
  propHeight.value = Math.round(elementData.height)
  propBgColor.value =
    elementData.styles.backgroundColor === 'transparent'
      ? '#ffffff'
      : elementData.styles.backgroundColor
  propRotation.value = Math.round(elementData.rotation)

  if (elementData.type === 'text') {
    propTextContent.value = elementData.content
    propTextContent.closest('.property-group').style.display = 'block'
    console.log("Text properties shown")
  } else {
    propTextContent.closest('.property-group').style.display = 'none'
  }
}

function clearPropertiesPanel() {
  console.log("Clearing properties panel")

  propWidth.value = ''
  propHeight.value = ''
  propBgColor.value = '#ffffff'
  propTextContent.value = ''
  propRotation.value = ''
}

function onPropertyChange(property, value) {
  console.log("Property change:", property, value)

  const elementData = getSelectedElement()
  const element = getSelectedDOMElement()

  if (!elementData || !element) {
    console.log("Property change ignored: no element selected")
    return
  }

  const content = element.querySelector('.element-content')

  switch (property) {
    case 'width': {
      const width = Math.max(20, parseInt(value) || 20)
      elementData.width = width
      element.style.width = width + 'px'
      break
    }

    case 'height': {
      const height = Math.max(20, parseInt(value) || 20)
      elementData.height = height
      element.style.height = height + 'px'
      break
    }

    case 'backgroundColor':
      elementData.styles.backgroundColor = value
      content.style.backgroundColor = value
      break

    case 'textContent':
      elementData.content = value
      content.textContent = value
      break

    case 'rotation': {
      const rotation = parseFloat(value) || 0
      elementData.rotation = rotation
      element.style.transform = `rotate(${rotation}deg)`
      break
    }
  }

  saveToLocalStorage()
}



// function startRotate(e, element) {
//   console.log("startRotate called");

//   e.stopPropagation();

//   const id = element.dataset.elementId;
//   console.log("Rotating element id:", id);

//   const elementData = getElementData(id);
//   if (!elementData) {
//     console.log("Rotate failed: element data not found");
//     return;
//   }










function updateLayersPanel() {
  console.log("Updating layers panel")

  layersList.innerHTML = ''

  const sortedElements = [...editorState.elements].sort(
    (a, b) => b.zIndex - a.zIndex
  )

  sortedElements.forEach(elementData => {
    const li = document.createElement('li')
    li.textContent = `${elementData.type} (${elementData.id.substr(0, 8)}...)`
    li.dataset.elementId = elementData.id

    if (elementData.id === editorState.selectedElementId) {
      li.classList.add('selected')
    }

    li.addEventListener('click', () => {
      console.log("Layer clicked:", elementData.id)
      selectElement(elementData.id)
    })

    layersList.appendChild(li)
  })
}

function moveLayerUp() {
  const selected = getSelectedElement()
  if (!selected) {
    console.log("Move layer up failed: nothing selected")
    return
  }

  const sorted = [...editorState.elements].sort(
    (a, b) => a.zIndex - b.zIndex
  )

  const index = sorted.findIndex(el => el.id === selected.id)
  if (index === sorted.length - 1) return

  const above = sorted[index + 1]
    ;[selected.zIndex, above.zIndex] = [above.zIndex, selected.zIndex]

  console.log("Layer moved up:", selected.id)
  renderCanvas()
  updateLayersPanel()
  saveToLocalStorage()
}

function moveLayerDown() {
  const selected = getSelectedElement()
  if (!selected) {
    console.log("Move layer down failed: nothing selected")
    return
  }

  const sorted = [...editorState.elements].sort(
    (a, b) => a.zIndex - b.zIndex
  )

  const index = sorted.findIndex(el => el.id === selected.id)
  if (index === 0) return

  const below = sorted[index - 1]
    ;[selected.zIndex, below.zIndex] = [below.zIndex, selected.zIndex]

  console.log("Layer moved down:", selected.id)
  renderCanvas()
  updateLayersPanel()
  saveToLocalStorage()
}

function copySelectedElement() {
  const elementData = getSelectedElement()
  if (!elementData) return

  editorState.copiedElements = [JSON.parse(JSON.stringify(elementData))]
}

function pasteElements() {
  if (editorState.copiedElements.length === 0) return

  editorState.copiedElements.forEach(copiedElement => {
    const newElement = JSON.parse(JSON.stringify(copiedElement))
    newElement.id = generateId()
    newElement.x += 20
    newElement.y += 20
    newElement.zIndex = editorState.zIndexCounter++

    editorState.elements.push(newElement)
  })

  renderCanvas()
  updateLayersPanel()
  pushHistory()
  saveToLocalStorage()
}

function selectAllElements() {
  if (editorState.elements.length > 0) {
    selectElement(editorState.elements[0].id)
  }
}

function groupSelectedElements() {
  const selectedElement = getSelectedElement()
  if (!selectedElement) return

  const groupElement = {
    id: generateId(),
    type: 'group',
    x: selectedElement.x,
    y: selectedElement.y,
    width: selectedElement.width,
    height: selectedElement.height,
    rotation: 0,
    zIndex: editorState.zIndexCounter++,
    styles: {
      backgroundColor: 'transparent',
      color: '#1f2937',
      fontSize: 16,
      fontFamily: 'Arial',
      borderWidth: 1,
      borderColor: '#3b82f6',
      borderRadius: 0,
      boxShadow: '',
      opacity: 1
    },
    content: '',
    children: [selectedElement.id]
  }

  editorState.elements.push(groupElement)
  renderCanvas()
  selectElement(groupElement.id)
  pushHistory()
  saveToLocalStorage()
}

function handleKeyboardShortcuts(e) {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    return
  }

  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
      case 'z':
        if (e.shiftKey) {
          redo()
        } else {
          undo()
        }
        e.preventDefault()
        return

      case 'y':
        redo()
        e.preventDefault()
        return

      case 'c':
        copySelectedElement()
        e.preventDefault()
        return

      case 'v':
        pasteElements()
        e.preventDefault()
        return

      case 'a':
        selectAllElements()
        e.preventDefault()
        return

      case 'g':
        groupSelectedElements()
        e.preventDefault()
        return
    }
  }

  const elementData = getSelectedElement()
  if (!elementData) return

  const element = getSelectedDOMElement()
  if (!element) return

  const moveAmount = e.shiftKey ? 10 : 5

  switch (e.key) {
    case 'Delete':
    case 'Backspace':
      deleteSelectedElement()
      e.preventDefault()
      break

    case 'ArrowUp':
      moveElement(0, -moveAmount)
      e.preventDefault()
      break

    case 'ArrowDown':
      moveElement(0, moveAmount)
      e.preventDefault()
      break

    case 'ArrowLeft':
      moveElement(-moveAmount, 0)
      e.preventDefault()
      break

    case 'ArrowRight':
      moveElement(moveAmount, 0)
      e.preventDefault()
      break
  }
}

function moveElement(dx, dy) {
  const elementData = getSelectedElement()
  const element = getSelectedDOMElement()

  if (!elementData || !element) return

  const newX = elementData.x + dx
  const newY = elementData.y + dy

  const constrained = constrainToCanvas(
    newX,
    newY,
    elementData.width,
    elementData.height
  )

  elementData.x = constrained.x
  elementData.y = constrained.y

  element.style.left = constrained.x + 'px'
  element.style.top = constrained.y + 'px'

  updatePropertiesPanel()
  saveToLocalStorage()
}

function deleteSelectedElement() {
  const elementData = getSelectedElement()
  if (!elementData) return

  const element = getSelectedDOMElement()

  if (element) {
    element.remove()
  }

  editorState.elements = editorState.elements.filter(
    el => el.id !== elementData.id
  )
  editorState.selectedElementId = null

  updateLayersPanel()
  clearPropertiesPanel()
  saveToLocalStorage()
}

function saveToLocalStorage() {
  localStorage.setItem(
    'editorState',
    JSON.stringify({
      elements: editorState.elements,
      zIndexCounter: editorState.zIndexCounter
    })
  )
}

function loadFromLocalStorage() {
  const saved = localStorage.getItem('editorState')
  if (!saved) return

  try {
    const data = JSON.parse(saved)
    editorState.elements = data.elements || []
    editorState.zIndexCounter = data.zIndexCounter || 1

    canvas.innerHTML = ''

    editorState.elements.forEach(elementData => {
      renderElement(elementData)
    })

    updateLayersPanel()
  } catch (e) {
    console.error('Failed to load from localStorage', e)
  }
}

function exportJSON() {
  const data = JSON.stringify(editorState.elements, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = 'design-export.json'
  a.click()

  URL.revokeObjectURL(url)
}

function exportHTML() {
  let html = '<!DOCTYPE html>\n<html lang="en">\n<head>\n'
  html += '  <meta charset="UTF-8">\n'
  html += '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
  html += '  <title>Exported Design</title>\n'
  html += '  <style>\n'
  html += '    body { margin: 0; padding: 0; }\n'
  html += '    .canvas { position: relative; width: 1200px; height: 800px; margin: 0 auto; }\n'
  html += '    .element { position: absolute; }\n'
  html += '  </style>\n'
  html += '</head>\n<body>\n'
  html += '  <div class="canvas">\n'

  editorState.elements.forEach(el => {
    html += `    <div class="element" style="`
    html += `left: ${el.x}px; `
    html += `top: ${el.y}px; `
    html += `width: ${el.width}px; `
    html += `height: ${el.height}px; `
    html += `transform: rotate(${el.rotation}deg); `
    html += `z-index: ${el.zIndex}; `
    html += `background-color: ${el.styles.backgroundColor}; `
    html += `color: ${el.styles.color}; `
    html += `font-size: ${el.styles.fontSize}px; `
    html += `padding: 12px; `
    html += `box-sizing: border-box;`
    html += `">\n`

    if (el.type === 'text') {
      html += `      ${el.content}\n`
    }

    html += `    </div>\n`
  })

  html += '  </div>\n'
  html += '</body>\n</html>'

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = 'design-export.html'
  a.click()

  URL.revokeObjectURL(url)
}

function clearCanvas() {
  if (!confirm('Are you sure you want to clear the canvas?')) return

  editorState.elements = []
  editorState.selectedElementId = null
  editorState.zIndexCounter = 1

  canvas.innerHTML = ''

  updateLayersPanel()
  clearPropertiesPanel()
  saveToLocalStorage()
}

function setActiveTool(tool) {
  editorState.activeTool = tool

  document.querySelectorAll('.tool-button').forEach(btn => {
    btn.classList.remove('active')
  })

  const toolBtn = document.getElementById(`tool-${tool}`)
  if (toolBtn) {
    toolBtn.classList.add('active')
  }

  updateCursor()
}

function updateCursor() {
  const canvas = document.getElementById('canvas')
  switch (editorState.activeTool) {
    case 'select':
      canvas.style.cursor = 'default'
      break
    case 'move':
      canvas.style.cursor = 'move'
      break
    case 'resize':
      canvas.style.cursor = 'nw-resize'
      break
    case 'rotate':
      canvas.style.cursor = 'crosshair'
      break
  }
}

function initEventListeners() {
  document.getElementById('btn-add-rectangle').addEventListener('click', () => {
    createElement('rectangle')
  })

  document.getElementById('btn-add-text').addEventListener('click', () => {
    createElement('text')
  })

  document.getElementById('btn-export-json').addEventListener('click', exportJSON)
  document.getElementById('btn-export-html').addEventListener('click', exportHTML)
  document.getElementById('btn-save-layout').addEventListener('click', () => {
    saveToLocalStorage()
    alert('Layout saved successfully!')
  })
  document.getElementById('btn-clear-canvas').addEventListener('click', clearCanvas)

  document.getElementById('btn-layer-move-up').addEventListener('click', moveLayerUp)
  document.getElementById('btn-layer-move-down').addEventListener('click', moveLayerDown)

  document.getElementById('tool-select').addEventListener('click', () => setActiveTool('select'))
  document.getElementById('tool-move').addEventListener('click', () => setActiveTool('move'))
  document.getElementById('tool-resize').addEventListener('click', () => setActiveTool('resize'))
  document.getElementById('tool-rotate').addEventListener('click', () => setActiveTool('rotate'))

  propWidth.addEventListener('input', e => onPropertyChange('width', e.target.value))
  propHeight.addEventListener('input', e => onPropertyChange('height', e.target.value))
  propBgColor.addEventListener('input', e => onPropertyChange('backgroundColor', e.target.value))
  propTextContent.addEventListener('input', e => onPropertyChange('textContent', e.target.value))
  propRotation.addEventListener('input', e => onPropertyChange('rotation', e.target.value))

  canvas.addEventListener('click', e => {
    if (e.target === canvas || e.target.id === 'canvas') {
      deselectAll()
    }
  })

  canvas.addEventListener('mousedown', e => {
    const element = e.target.closest('.canvas-element')

    if (!element) {
      if (e.button === 1 || e.altKey) {
        startPan(e)
        return
      }
      return
    }

    const elementData = getElementData(element.dataset.elementId)
    if (!elementData) return

    switch (editorState.activeTool) {
      case 'select':
        if (e.target.classList.contains('resize-handle')) {
          startResize(e, e.target, element)
        } else if (e.target.classList.contains('rotate-handle')) {
          startRotate(e, element)
        } else {
          startDrag(e, element)
        }
        break

      case 'move':
        startDrag(e, element)
        break

      case 'resize':
        if (e.target.classList.contains('resize-handle')) {
          startResize(e, e.target, element)
        }
        break

      case 'rotate':
        if (e.target.classList.contains('rotate-handle')) {
          startRotate(e, element)
        }
        break
    }
  })

  document.addEventListener('mousemove', e => {
    if (editorState.dragState) {
      onDrag(e)
    } else if (editorState.resizeState) {
      onResize(e)
    } else if (editorState.rotateState) {
      onRotate(e)
    } else if (editorState.isPanning) {
      onPan(e)
    }
  })

  document.addEventListener('mouseup', () => {
    endDrag()
    endResize()
    endRotate()
    endPan()
  })

  document.addEventListener('keydown', handleKeyboardShortcuts)

  window.addEventListener('resize', updateCanvasRect)

  canvas.addEventListener('dblclick', e => {
    const element = e.target.closest('.canvas-element')
    if (!element) return

    const elementData = getElementData(element.dataset.elementId)
    if (elementData && elementData.type === 'text') {
      const content = element.querySelector('.element-content')
      content.contentEditable = true
      content.focus()

      const range = document.createRange()
      range.selectNodeContents(content)
      const sel = window.getSelection()
      sel.removeAllRanges()
      sel.addRange(range)

      content.addEventListener(
        'blur',
        function handleBlur() {
          content.contentEditable = false
          elementData.content = content.textContent
          propTextContent.value = content.textContent
          saveToLocalStorage()
          content.removeEventListener('blur', handleBlur)
        },
        { once: true }
      )
    }
  })
}

function init() {
  updateCanvasRect()
  loadFromLocalStorage()
  initEventListeners()
  setActiveTool('select')

  if (editorState.elements.length === 0) {
    updateLayersPanel()
  }
}

init()
