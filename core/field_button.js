/**
 * Author: leio
 * Date: 2019/8/28
 */
'use strict';

goog.provide('Blockly.FieldButton');

goog.require('Blockly.Field');
goog.require('Blockly.Tooltip');
goog.require('goog.dom');
goog.require('goog.math.Size');
goog.require('goog.userAgent');


/**
 * Class for a non-editable field.
 * @constructor
 */
Blockly.FieldButton = function (content, x, y, width, height, isLabel, callback) {
  x = x || 0;
  y = y || 0;
  this.x_ = Number(x);
  this.y_ = Number(y);
  this.height_ = Number(height);
  this.width_ = Number(width);
  this.isLabel_ = isLabel;
  this.size_ = new goog.math.Size(this.width_, this.height_);
  this.callback_ = callback;
  this.setValue(content);
};
goog.inherits(Blockly.FieldButton, Blockly.Field);

Blockly.FieldButton.MARGIN = 40;

/**
 * Construct a FieldButton from a JSON arg object,
 * dereferencing any string table references.
 * @param {!Object} options A JSON object with options (text, and class).
 * @returns {!Blockly.FieldButton} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldButton.fromJson = function(options) {
  var content = Blockly.utils.replaceMessageReferences(options['content']);
  var x = Blockly.utils.replaceMessageReferences(options['x']);
  var y = Blockly.utils.replaceMessageReferences(options['y']);
  var width = Blockly.utils.replaceMessageReferences(options['width']);
  var height = Blockly.utils.replaceMessageReferences(options['height']);
  var isLabel = Blockly.utils.replaceMessageReferences(options['isLabel']);
  var callback = Blockly.utils.replaceMessageReferences(options['callback']);
  return new Blockly.FieldButton(content, x, y, width, height, isLabel, callback);
};

/**
 * Editable fields usually show some sort of UI for the user to change them.
 * @type {boolean}
 * @public
 */
Blockly.FieldButton.prototype.EDITABLE = false;

/**
 * Serializable fields are saved by the XML renderer, non-serializable fields
 * are not.  Editable fields should be serialized.
 * @type {boolean}
 * @public
 */
Blockly.FieldButton.prototype.SERIALIZABLE = false;

/**
 * Install this text on a block.
 */
Blockly.FieldButton.prototype.init = function() {

  if (this.btnElement_) {
    return
  }
  if (this.isTextType()) {
    var cssClass = this.isLabel_ ? 'blocklyFlyoutLabel' : 'blocklyFlyoutButton';
    if (this.cssClass_) {
      cssClass += ' ' + this.cssClass_;
    }

    this.btnElement_ = Blockly.utils.createSvgElement('g', { 'class': cssClass },
      null);

    this.addTextSvg(this.btnElement_, this.content_, this.isLabel_);
    
  }
  if (this.isImageType()) {
    var src = this.content_.src;
    src = Blockly.mainWorkspace.options.pathToMedia + src
    this.btnElement_ = Blockly.utils.createSvgElement(
      'image',
      {
        'x': this.x_ ,
        'y': this.y_ ,
        'height': this.height_ + 'px',
        'width': this.width_ + 'px',
      },
      null);
    this.btnElement_.setAttributeNS('http://www.w3.org/1999/xlink',
      'xlink:href', src || '');
  }

  if (this.class_) {
    Blockly.utils.addClass(this.btnElement_, this.class_);
  }
  if (!this.visible_) {
    this.btnElement_.style.display = 'none';
  }
  this.sourceBlock_.getSvgRoot().appendChild(this.btnElement_);

  

  this.mouseDownWrapper_ =
    Blockly.bindEvent_(this.btnElement_, 'mousedown', this, this.onMouseDown);

  // Force a render.
  this.render_();
};
Blockly.FieldButton.prototype.addTextSvg = function (parent, text, isLabel) {
  if (!isLabel) {
    // Shadow rectangle (light source does not mirror in RTL).
    var shadow = Blockly.utils.createSvgElement('rect',
      {
        'class': 'blocklyFlyoutButtonShadow',
        'rx': 4,
        'ry': 4,
        'x': 1,
        'y': 1
      },
      parent);
  }
  // Background rectangle.
  var rect = Blockly.utils.createSvgElement('rect',
    {
      'class': isLabel ?
        'blocklyFlyoutLabelBackground' : 'blocklyFlyoutButtonBackground',
      'rx': 4, 'ry': 4
    },
    parent);

  var svgText = Blockly.utils.createSvgElement('text',
    {
      'class': isLabel ? 'blocklyFlyoutLabelText' : 'blocklyText',
      'x': 0,
      'y': 0,
      'text-anchor': 'middle'
    },
    parent);
  svgText.textContent = text;

  var width;
  var height = this.height_;
  if (this.width_ && this.width_ > 0) {
    width = this.width_;
  } else {
    width = Blockly.Field.getCachedWidth(svgText);
  }
  if (!isLabel) {
    width += 2 * Blockly.FieldButton.MARGIN;
    shadow.setAttribute('width', width);
    shadow.setAttribute('height', height);
  }

  rect.setAttribute('width', width);
  rect.setAttribute('height', height);

  svgText.setAttribute('text-anchor', 'middle');
  svgText.setAttribute('dominant-baseline', 'central');
  svgText.setAttribute('dy', goog.userAgent.EDGE_OR_IE ?
    Blockly.Field.IE_TEXT_OFFSET : '0');
  svgText.setAttribute('x', width / 2);
  svgText.setAttribute('y', height / 2);
};
Blockly.FieldButton.prototype.onMouseDown = function () {
  var callback_name = this.callback_;
  if (callback_name && Blockly.Extensions && Blockly.Extensions[callback_name]) {
    var callback = Blockly.Extensions[callback_name];
    callback(this.sourceBlock_, this);
  }

};

/**
 * Dispose of all DOM objects belonging to this text.
 */
Blockly.FieldButton.prototype.dispose = function() {
  goog.dom.removeNode(this.btnElement_);
  this.btnElement_ = null;

  if (this.mouseDownWrapper_) {
    Blockly.unbindEvent_(this.mouseDownWrapper_);
  }
};

/**
 * Gets the group element for this field.
 * Used for measuring the size and for positioning.
 * @return {!Element} The group element.
 */
Blockly.FieldButton.prototype.getSvgRoot = function() {
  return /** @type {!Element} */ (this.btnElement_);
};

/**
 * Change the tooltip text for this field.
 * @param {string|!Element} newTip Text for tooltip or a parent element to
 *     link to for its tooltip.
 */
Blockly.FieldButton.prototype.setTooltip = function(newTip) {
  this.btnElement_.tooltip = newTip;
};
Blockly.FieldButton.prototype.getValue = function () {
  return this.content_;
};
Blockly.FieldButton.prototype.setValue = function (content) {
  if (content === null) {
    return;
  }
  this.content_ = content;
};
Blockly.FieldButton.prototype.isTextType = function () {
  var btn_type = this.getButtonType();
  if (btn_type == "text") {
    return true;
  }
  return false;
}
Blockly.FieldButton.prototype.isImageType = function () {
  var btn_type = this.getButtonType();
  if (btn_type == "image") {
    return true;
  }
  return false;
}
Blockly.FieldButton.prototype.getButtonType = function () {
  var btn_type = "text";
  if (this.content_ && this.content_.src) {
      btn_type = "image"
  }
  return btn_type;
}
Blockly.Field.register('field_button', Blockly.FieldButton);
