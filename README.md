https://github.com/dojo/dapi
===
This project has been superceded by https://github.com/dojo/dapi

dapi
====

Node.js/JavaScript Dojo API viewer and static API viewer document generator

Please see the [Wiki](https://github.com/dojo/dapi/wiki) for more information.

Why is this library special?
----------------------------
It's not, well not compared to the original code it was ported from.  
The original API viewer is [here](https://github.com/wkeese/api-viewer) (also, many thanks to [wkeese](https://github.com/wkeese) for writing the dapi exporter for js-doc-parse which makes loading and parsing a breeze compared to loading/parsing XML).  
  
This repository is *just a port of the existing PHP code to node.js*, however it's main aims are to remove the PHP dependency for viewing API docs and leverage node.js instead (eat what you preach), make it simpler to change the UI (templating, separating logical UI code from the data) and be able to generate a *static output* of the API documentation if needed.
