# TODO

### Rendering

-   add "space affinity rules", i.e., how much a symbol wants extraspace.

    -   We have to care about front / behind to synchronize at beats.
    -   group-borders should be zero-width with some extra space affinity (so you also see grouping when using quarters)
    -   give the allocated width to the render-function and let the glyph place itself in the space.
    -   maybe unify content and beats? We can just put the rendered props into the main object.

-   place stave-header glyphs in the content section to render them the same way we render the rest
    -   also add a stave-spacer in the beginning which is a phantom box that draws the whole stave
-   connect the different simultaneous staves using bar-lines and horizontally synchronize

### New Features

-   clef and time signature changes
    -   also integrate this into
-   handle repeating accidentals; i.e., insert parenthesis and respect the key

### Editor

-   show a cursor in the upper part simultaneously (or, click in the upper part to move in the lower) - also, hightlight selection
-   fix the double-delete bug in the editor

## reading assignments

-   Read through the chapters about music programming and music notation: https://project-awesome.org/ciconia/awesome-music
    -   https://www.vexflow.com/
    -   https://github.com/AaronDavidNewman/Smoosic
    -   https://flat.io/developers/docs/embed/javascript-editor.html
    -   https://github.com/wbsoft/lilymusic
    -   https://github.com/frescobaldi/frescobaldi
    -   https://music-encoding.org/
    -   http://ciconia.github.io/lydown/
    -   https://opensheetmusicdisplay.org/blog/sheet-music-display-libraries-browsers/
-   https://musescore.org/en/handbook/3/advanced-topics

## usefull links

-   wikipedia: unicode music symbols https://en.wikipedia.org/wiki/Musical_Symbols_(Unicode_block)
-   SMUFL https://w3c.github.io/smufl/latest/tables/noteheads.html
-   SMUFL Browser https://github.com/Edirom/SMuFL-Browser

## Ideas

-   notate accents, dynamics etc. using a separate line below! Synchronize using markers or using ascii-art spacing!
    -   .e.g, " <<<<<<<<<<<<<<<< f >>>>>>> pp" for hairpins
-   another relative mode
-   imitation macros, i.e., demonstrate an harmonization and rhythm based on parameters ("holes") and this pattern is repeatedly applied to just a list of the parameter-tones
    -   but this has to be very deterministic and predictable! No surprises!
    -   e.g. automatically detect octaves, specify other chords
    -   important: allow easy deviation from the pattern; i.e., have a way to connect two notes if they are the same or insert rests etc...
-   tools to modify the source, i.e., "expand macro"
