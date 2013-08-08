<?php

# basePath should represent the path from the DOCUMENT_ROOT
$basePath = "/api/public/api/";

$_base_url = $basePath;
//$_base_url = "./";

# Location of data files for each version.   This directory should contain a subdirectory for each product version,
# and the subdirectory should contain details.xml and tree.json
$dataDir = dirname(__FILE__) . "/../api_data/";

# Set to false to regenerate the page for a module every time you view it.
# Useful while working on documentation, or the doc parser and api viewers themselves.
$use_cache = false;

