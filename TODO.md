# TODO

-   better beam rendering
-   pre-render the positions and equally space notes in a column
    -   also, calculate the page size. Calculate stave-spacing and place accordingly
    -   breaks staves and make a multi-line note rendering
    -   connect the different simultaneous staves using bar-lines and horizontally synchronize
-   show a cursor in the upper part simultaneously (or, click in the upper part to move in the lower)
    -   also, hightlight selection
-   fix the double-delete bug in the editor
-   handle repeating accidentals; i.e., insert parenthesis and respect the key

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
    -   .e.g, " <<<<<<<<<<<<<<<< f >>>>>>> pp" for gabeln
-   another relative mode
-   imitation macros, i.e., demonstrate an harmonization and rhythm based on parameters ("holes") and this pattern is repeatedly applied to just a list of the parameter-tones
    -   but this has to be very deterministic and predictable! No surprises!
    -   e.g. automatically detect octaves, specify other chords
    -   important: allow easy deviation from the pattern; i.e., have a way to connect two notes if they are the same or insert rests etc...
-   tools to modify the source, i.e., "expand macro"
