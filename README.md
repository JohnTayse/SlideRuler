SlideRuler
===========
[
![Screenshot Of applet](AppletScreenshot.png?raw=true "Screenshot Of applet")](http://robbbb.github.io/VectorRuler/)

A Javascript-based generator of laser cutter friendly etchable slide rules
### Features
+  **SVG** Genrates fully vector based slide rules ready for laser-etching, printing, plotting, or CAD applications
+ Similar lines are grouped as labeled SVG layers when opened in Adobe Illustrator or Inkscape.
+ Each line is labeled by its resolution and number as an SVG object
+ Code is well-commented and sylistically sound allowing for easy modifications and pull requests
+ The text is editable as text, so it can easily be changed in Illustrator or Inkscape.


Viewing the very well organized document tree of an exported ruler in Illustrator:

Open the [Layers] Palette (Window > Layers)
click the [ ►Layer 1] arrow to view its children
There will be a group for each tick level (1"in, ½:"in, ¼"in, ⅛"in... or 1cm. 0.1cm, 0.01cm...)▼
All the labels can easily be changed in terms of size or font