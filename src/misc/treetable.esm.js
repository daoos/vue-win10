/*
 * treetable Plugin 3.2.0
 * http://ludo.cubicphuse.nl/jquery-treetable
 *
 * Copyright 2013, Ludo van den Boom
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

var DEFAULTS = {
  clickableNodeNames: false,
  initialState: 'collapsed',
  parentAttr: 'parent',       // maps to data-parent
  branchAttr: 'branch',       // maps to data-branch
  idAttr: 'id',               // maps to data-id
  indent: 19,
  column: 0,
  columnElType: 'td', // i.e. 'td', 'th' or 'td,th'
  expandable: false,
  expanderTemplate: '<a>&nbsp</a>',
  indenterTemplate: '<span class="indenter"></span>',
  cellTemplate: '',
  stringCollapse: 'Collapse',
  stringExpand: 'Expand',

  // Events
  onInitialized: null,
  onNodeCollapse: null,
  onNodeExpand: null,
  onNodeInitialized: null
}

export default function Tree (table, options) {
  this.settings = Object.assign(DEFAULTS, options)
  this.table = table
  this.tree = {}

  // Cache the nodes and roots in simple arrays for quick access/iteration
  this.nodes = []
  this.roots = []

  this.loadRows(table.rows).render()

  this.settings.onInitialized && this.settings.onInitialized.apply(this)
}

Tree.prototype.collapseAll = function () {
  var node, i, len, ref, results
  ref = this.nodes
  results = []
  for (i = 0, len = ref.length; i < len; i++) {
    node = ref[i]
    results.push(node.collapse())
  }
  return results
}

Tree.prototype.expandAll = function () {
  var node, i, len, ref, results
  ref = this.nodes
  results = []
  for (i = 0, len = ref.length; i < len; i++) {
    node = ref[i]
    results.push(node.expand())
  }
  return results
}

Tree.prototype.findLastNode = function (node) {
  if (node.children.length > 0) {
    return this.findLastNode(node.children[node.children.length - 1])
  } else {
    return node
  }
}

Tree.prototype.loadRows = function (rows) {
  var node, row, i

  if (rows != null) {
    for (i = 0; i < rows.length; i++) {
      row = rows[i]

      if (row.dataset[this.settings.idAttr] != null) {
        node = new Node(row, this.tree, this.settings)
        this.nodes.push(node)
        this.tree[node.id] = node

        if (node.parent != null && this.tree[node.parent]) {
          this.tree[node.parent].addChild(node)
        } else {
          this.roots.push(node)
        }
      }
    }
  }

  for (i = 0; i < this.nodes.length; i++) {
    node = this.nodes[i].updateBranchLeafClass()
  }

  return this
}

Tree.prototype.move = function (node, destination) {
  // Conditions:
  // 1: +node+ should not be inserted as a child of +node+ itself.
  // 2: +destination+ should not be the same as +node+'s current parent (this
  //    prevents +node+ from being moved to the same location where it already
  //    is).
  // 3: +node+ should not be inserted in a location in a branch if this would
  //    result in +node+ being an ancestor of itself.
  var nodeParent = node.parentNode()
  if (node !== destination && destination.id !== node.parent && destination.ancestors().indexOf(node) === -1) {
    node.setParent(destination)
    this._moveRows(node, destination)

    // Re-render parentNode if this is its first child node, and therefore
    // doesn't have the expander yet.
    if (node.parentNode().children.length === 1) {
      node.parentNode().render()
    }
  }

  if (nodeParent) {
    nodeParent.updateBranchLeafClass()
  }
  if (node.parentNode()) {
    node.parentNode().updateBranchLeafClass()
  }
  node.updateBranchLeafClass()
  return this
}

Tree.prototype.removeNode = function (node) {
  // Recursively remove all descendants of +node+
  this.unloadBranch(node)

  // Remove node from DOM (<tr>)
  node.row.remove()

  // Remove node from parent children list
  if (node.parent != null) {
    node.parentNode().removeChild(node)
  }

  // Clean up Tree object (so Node objects are GC-ed)
  delete this.tree[node.id]
  this.nodes.splice(this.nodes.indexOf(node), 1)

  return this
}

Tree.prototype.render = function () {
  var root, i, len, ref
  ref = this.roots
  for (i = 0, len = ref.length; i < len; i++) {
    root = ref[i]

    // Naming is confusing (show/render). I do not call render on node from here.
    root.show()
  }
  return this
}

Tree.prototype.sortBranch = function (node, sortFun) {
  // First sort internal array of children
  node.children.sort(sortFun)

  // Next render rows in correct order on page
  this._sortChildRows(node)

  return this
}

Tree.prototype.destroy = function () {
  this.table.classList.remove('treetable')
}

Tree.prototype.collapseNode = function (id) {
  var node = this.tree[id]

  if (!node) {
    throw new Error('Unknown node \'' + id + '\'')
  }
  node.collapse()
  return this
}

Tree.prototype.expandNode = function (id) {
  var node = this.tree[id]

  if (!node) {
    throw new Error('Unknown node \'' + id + '\'')
  }
  if (!node.initialized) {
    node.initialize()
  }
  node.expand()
  return this
}

Tree.prototype.loadBranch = function (node, rows) {
  var settings = this.settings,
    tree = this.tree,
    that = this
  // rows = $(rows)

  if (node === null) { // Inserting new root nodes
    // this.append(rows)
    rows.forEach(function (r) {
      that.appendChild(r)
    })
    this.innerHTML += rows
  } else {
    var lastNode = this.findLastNode(node)
    rows.insertAfter(lastNode.row)
  }

  this.loadRows(rows)

  // Make sure nodes are properly initialized
  rows.filter('tr').each(function () {
    tree[this.dataset[settings.idAttr]].show()
  })

  if (node != null) {
    // Re-render parent to ensure expander icon is shown (#79)
    node.render().expand()
  }

  return this
}

Tree.prototype.unloadBranch = function (node) {
  // Use a copy of the children array to not have other functions interfere
  // with this function if they manipulate the children array
  // (eg removeNode).
  var children = node.children.slice(0),
    i

  for (i = 0; i < children.length; i++) {
    this.removeNode(children[i])
  }

  // Reset node's collection of children
  node.children = []

  node.updateBranchLeafClass()

  return this
}

Tree.prototype.move = function (nodeId, destinationId) {
  var destination, node

  node = this.tree[nodeId]
  destination = this.tree[destinationId]
  this.move(node, destination)

  return this
}

Tree.prototype.removeNode = function (id) {
  var node = this.tree[id]

  if (node) {
    this.removeNode(node)
  } else {
    throw new Error('Unknown node \'' + id + '\'')
  }

  return this
}

Tree.prototype.reveal = function (id) {
  var node = this.tree[id]

  if (node) {
    node.reveal()
  } else {
    throw new Error('Unknown node \'' + id + '\'')
  }
  return this
}

Tree.prototype.sortBranch = function (node, columnOrFunction) {
  var sortFun = columnOrFunction || this.settings.column

  if (/^\d*$/.test(columnOrFunction)) {
    sortFun = function (a, b) {
      var extractValue, valA, valB

      extractValue = function (node) {
        var val = node.row.find('td:eq(' + columnOrFunction + ')').text()
        // Ignore trailing/leading whitespace and use uppercase values for
        // case insensitive ordering
        return val.trim().toUpperCase()
      }

      valA = extractValue(a)
      valB = extractValue(b)

      if (valA < valB) return -1
      if (valA > valB) return 1
      return 0
    }
  }

  this.sortBranch(node, sortFun)
  return this
}

Tree.prototype._moveRows = function (node, destination) {
  var children = node.children, i

  node.row.insertAfter(destination.row)
  node.render()

  // Loop backwards through children to have them end up on UI in correct
  // order (see #112)
  for (i = children.length - 1; i >= 0; i--) {
    this._moveRows(children[i], node)
  }
}

// Special _moveRows case, move children to itself to force sorting
Tree.prototype._sortChildRows = function (parentNode) {
  return this._moveRows(parentNode, parentNode)
}

function Node (row, tree, settings) {
  this.settings = settings
  this.tree = tree
  this.row = row
  this.id = this.row.dataset[this.settings.idAttr] // TODO Ensure id/parent is always a string (not int)

  var parent = this.row.dataset[this.settings.parentAttr] // TODO Move this to a setparent function?
  if (parent) {
    this.parent = parent
  }

  this.treeCell = this.row.children[this.settings.column]
  this.expander = parseHTML(this.settings.expanderTemplate)[0]
  this.indenter = parseHTML(this.settings.indenterTemplate)[0]
  if (this.settings.cellTemplate) {
    var cell = parseHTML(this.settings.cellTemplate)[0]
    cell.appendChild(this.indenter)
    this.treeCell.appendChild(cell)
  } else {
    this.treeCell.insertBefore(this.indenter, this.treeCell.firstChild)
  }
  this.initialized = false
  this.children = []
}

var parseHTML = function (text) {
  var tmp = document.implementation.createHTMLDocument()
  tmp.body.innerHTML = text
  return tmp.body.children
}

Node.prototype.initialize = function () {
  var settings = this.settings

  this.render()

  if (settings.expandable && settings.initialState === 'collapsed') {
    this.collapse()
  } else {
    this.expand()
  }

  if (settings.onNodeInitialized !== null) {
    settings.onNodeInitialized.apply(this)
  }

  return this.initialized = true
}

Node.prototype.addChild = function (child) {
  return this.children.push(child)
}

Node.prototype.ancestors = function () {
  var ancestors, node
  node = this
  ancestors = []
  while (node = node.parentNode()) {
    ancestors.push(node)
  }
  return ancestors
}

Node.prototype.collapse = function () {
  if (this.collapsed()) {
    return this
  }

  this.row.classList.remove('expanded')
  this.row.classList.add('collapsed')

  this._hideChildren()
  this.expander.setAttribute('title', this.settings.stringExpand)

  if (this.initialized && this.settings.onNodeCollapse != null) {
    this.settings.onNodeCollapse.apply(this)
  }

  return this
}

Node.prototype.collapsed = function () {
  return this.row.classList.contains('collapsed')
}

// TODO destroy: remove event handlers, expander, indenter, etc.

Node.prototype.expand = function () {
  if (this.expanded()) {
    return this
  }

  this.row.classList.remove('collapsed')
  this.row.classList.add('expanded')

  if (this.initialized && this.settings.onNodeExpand != null) {
    this.settings.onNodeExpand.apply(this)
  }

  if (this.row.offsetparent == null) {
    this._showChildren()
  }

  this.expander.setAttribute('title', this.settings.stringCollapse)

  return this
}

Node.prototype.expanded = function () {
  return this.row.classList.contains('expanded')
}

Node.prototype.hide = function () {
  this._hideChildren()
  this.row.style.display = 'none'
  return this
}

Node.prototype.isBranchNode = function () {
  return this.children.length > 0 || this.row.dataset[this.settings.branchAttr] === true
}

Node.prototype.updateBranchLeafClass = function () {
  this.row.classList.remove('branch')
  this.row.classList.remove('leaf')
  this.row.classList.add(this.isBranchNode() ? 'branch' : 'leaf')
}

Node.prototype.level = function () {
  return this.ancestors().length
}

Node.prototype.parentNode = function () {
  return this.parent ? this.tree[this.parent] : null
}

Node.prototype.removeChild = function (child) {
  var i = this.children.indexOf(child)
  return this.children.splice(i, 1)
}

Node.prototype.render = function () {
  var settings = this.settings,
    that = this,
    handler,
    target

  if (settings.expandable && this.isBranchNode()) {
    handler = function (e) {
      that.tree[that.row.dataset[settings.idAttr]].toggle()
      return e.preventDefault()
    }

    this.indenter.appendChild(this.expander)

    target = settings.clickableNodeNames ? this.treeCell : this.expander

    // target.off('click.treetable').on('click.treetable', handler)
    // target.off('keydown.treetable').on('keydown.treetable', function (e) {
    target.addEventListener('click', handler)
    target.addEventListener('keydown', function (e) {
      if (e.keyCode === 13) {
        handler.apply(this, [e])
      }
    })
  }

  this.indenter.style.paddingLeft = this.level() * settings.indent + 'px'

  return this
}

Node.prototype.reveal = function () {
  if (this.parent !== null) {
    this.parentNode().reveal()
  }
  return this.expand()
}

Node.prototype.setParent = function (node) {
  if (this.parent != null) {
    this.tree[this.parent].removeChild(this)
  }
  this.parent = node.id
  this.row.data(this.settings.parentAttr, node.id)
  return node.addChild(this)
}

Node.prototype.show = function () {
  if (!this.initialized) {
    this.initialize()
  }
  this.row.style.display = 'table-row'
  if (this.expanded()) {
    this._showChildren()
  }
  return this
}

Node.prototype.toggle = function () {
  if (this.expanded()) {
    this.collapse()
  } else {
    this.expand()
  }
  return this
}

Node.prototype._hideChildren = function () {
  var child, i, len, ref, results
  ref = this.children
  results = []
  for (i = 0, len = ref.length; i < len; i++) {
    child = ref[i]
    results.push(child.hide())
  }
  return results
}

Node.prototype._showChildren = function () {
  var child, i, len, ref, results
  ref = this.children
  results = []
  for (i = 0, len = ref.length; i < len; i++) {
    child = ref[i]
    results.push(child.show())
  }
  return results
}
