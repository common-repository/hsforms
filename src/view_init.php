<?php
// Define a cache directory if one is not set
$FLUID_CACHE_DIRECTORY = !isset($FLUID_CACHE_DIRECTORY) ? __DIR__ . '/../cache/' : $FLUID_CACHE_DIRECTORY;

if (!class_exists(TYPO3Fluid\Fluid\View\TemplateView::class)) {
    foreach ([__DIR__ . '/../vendor/autoload.php', __DIR__ . '/../../../../vendor/autoload.php'] as $possibleAutoloadLocation) {
        if (file_exists($possibleAutoloadLocation)) {
            require_once $possibleAutoloadLocation;
        }
    }
}

// Initializing the View: rendering in Fluid takes place through a View instance
// which contains a RenderingContext that in turn contains things like definitions
// of template paths, instances of variable containers and similar.
if(!class_exists('\TYPO3Fluid\Fluid\View\TemplateView')) {
    $view = NULL;
} else {
    $view = new \TYPO3Fluid\Fluid\View\TemplateView();
    
    // TemplatePaths object: a subclass can be used if custom resolving is wanted.
    $paths = $view->getTemplatePaths();
    
    // Configuring paths: explicit setters used in this example. Paths can also
    // be passed as a ["templateRootPaths" => ["path1/", "path2/"]] constructor
    // argument for this implementation of TemplatePaths. When `TYPO3.Fluid`
    // reads these paths they are read in reverse and the first matching file
    // is used - meaning that if you have the same file in both `TemplatesA`
    // and `TemplatesB` and render that using this MVC approach, you will be
    // rendering the file located in `TemplatesB` becase this folder was last
    // and is checked first (think of these paths as prioritised fallbacks).
    $GLOBALS['hsforms']['view']['templateRootPaths'] = isset($GLOBALS['hsforms']['view']['templateRootPaths']) ? $GLOBALS['hsforms']['view']['templateRootPaths'] : [] ;
    $GLOBALS['hsforms']['view']['partialRootPaths'] = isset($GLOBALS['hsforms']['view']['partialRootPaths']) ? $GLOBALS['hsforms']['view']['partialRootPaths'] : [] ;
    $GLOBALS['hsforms']['view']['layoutRootPaths'] = isset($GLOBALS['hsforms']['view']['layoutRootPaths']) ? $GLOBALS['hsforms']['view']['layoutRootPaths'] : [] ;
    
    array_unshift($GLOBALS['hsforms']['view']['templateRootPaths'], __DIR__ . '/Resources/Private/Templates/');
    array_unshift($GLOBALS['hsforms']['view']['partialRootPaths'], __DIR__ . '/Resources/Private/Layouts/');
    array_unshift($GLOBALS['hsforms']['view']['layoutRootPaths'], __DIR__ . '/Resources/Private/Partials/');
    
    $paths->setTemplateRootPaths(
        $GLOBALS['hsforms']['view']['templateRootPaths']
    );
    $paths->setLayoutRootPaths(
        $GLOBALS['hsforms']['view']['partialRootPaths']
    );
    $paths->setPartialRootPaths(
        $GLOBALS['hsforms']['view']['layoutRootPaths']
    );
    
    if ($FLUID_CACHE_DIRECTORY) {
        // Configure View's caching to use ./examples/cache/ as caching directory.
        $view->setCache(new \TYPO3Fluid\Fluid\Core\Cache\SimpleFileCache($FLUID_CACHE_DIRECTORY));
    }
}
