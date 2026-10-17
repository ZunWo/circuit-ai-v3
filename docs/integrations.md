# CircuitLib integration

Source: https://github.com/keenzachanathip-bit/Electronic-Components-Librarys
Reference commit: 577ded1523fe7fce4b70063510a9fb26f63807f1

Adapted into this project:
- The scan overlay, rotating frame and indeterminate inference progress animation from UploadDialog.
- TensorFlow.js HTTP download progress from ModelService, retaining shared model caching.
- Breadboard SVGs from StarterCircuit and LabBreadboard, including named hole positions.
- LED/resistor, button, diode and NPN experiments, pin-to-pin connections and troubleshooting.

The original diagrams are in src/components/library/reference/.
The surrounding UI follows this project's light/dark theme and supports image enlargement.
All 14 component types have wiring instructions in src/data/connections.js.

Project-specific behavior takes precedence:
- Confidence must be strictly greater than 70% to show an accepted classification.
- The resistor calculator appears inside accepted Resistor results, before wiring instructions, for both real inference and explicitly labelled Demo results.
- Upload replacement, removal, a failed prediction, or a non-resistor result hides the calculator.
- Inference has no invented percentage or artificial delay.
- Images remain in the browser.

The component library detail view also follows PartDetailDialog: a modal with a
fixed title/close button, numbered cards for identification, pin/polarity, connection,
and usage, plus separate reading, calculator, wiring, and reference sections.
It retains direct component URLs, local photographs, light/dark themes, Escape
dismissal, focus restoration, and an internally scrolling body.

All 14 component categories, including both IR and seven-segment alternatives,
now open with breadboard pictures (16 examples). BreadboardPicture and
breadboardLayout derive component leads and jumpers from the same connection
data as the written instructions. Each lead occupies a separate five-hole strip;
jumpers use free sockets on the appropriate strip. Numbered controls highlight
wires directly on the breadboard and show their socket coordinates. Named-terminal
circuit pictures remain an optional view. Enlarged pictures can be panned on mobile.
The earlier imported board drawings are retained in the reference directory.

The default view starts on wire 1 with other wires hidden. Green source and orange
destination labels show the socket names directly on the picture. Instructions,
coordinates sit above the picture; previous/next controls sit directly below it. The all-wires view
is optional. Supply connections use the nearest free rail socket; signal wires
cross through free gaps between components, with separate vertical tracks and
rounded bends instead of a shared detour around the board edge. Routing tests
check that wires stay within the picture and avoid the component bodies.

Seven-segment displays are external a/COM connections, rather than an invented
universal display pinout. All actual COM pins must be connected according to the
display's datasheet. GPIO is a signal terminal, separate from the supply rail.
Board connectivity follows the five-hole groups and isolated centre trench in
https://learn.sparkfun.com/tutorials/how-to-use-a-breadboard/all .
Unit tests compare every example's electrical nets against its actual breadboard
strips/jumpers and reject reused sockets or accidental shorts.

The CircuitLib name, CIRCUITLIB wordmark and resistor-path logo are taken from
src/app.jsx in the reference commit above. The shared local SVG in
public/circuitlib-logo.svg is used in the header, footer and browser tab icon.
