<?php
/**
 * Blocks Initializer
 *
 * Enqueue CSS/JS of all the blocks.
 *
 * @since   0.0.1
 * @package ONM
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// require HotelsuiteApi class
require_once plugin_dir_path( __FILE__ ) . 'HotelsuiteApi.php';

/**
 * Enqueue Gutenberg block assets for both frontend + backend.
 *
 * Assets enqueued:
 * 1. blocks.style.build.css - Frontend + Backend.
 * 2. blocks.build.js - Backend.
 * 3. blocks.editor.build.css - Backend.
 *
 * @uses {wp-blocks} for block type registration & related functions.
 * @uses {wp-element} for WP Element abstraction — structure of blocks.
 * @uses {wp-i18n} to internationalize the block's text.
 * @uses {wp-editor} for WP editor styles.
 * @since 0.0.1
 */
function hsforms_onm_block_assets() { // phpcs:ignore
	// Register block styles for both frontend + backend.
	wp_register_style(
		'hsforms-onm-style-css', // Handle.
		plugins_url( 'dist/blocks.style.build.css', dirname( __FILE__ ) ), // Block style CSS.
		is_admin() ? array( 'wp-editor' ) : null, // Dependency to include the CSS after it.
		null // filemtime( plugin_dir_path( __DIR__ ) . 'dist/blocks.style.build.css' ) // Version: File modification time.
	);

	// Register style for onm/cal
	wp_register_style(
		'hsforms-cal-css', // Handle.
		plugins_url( 'dist/onm/cal/css/cal.min.css', dirname( __FILE__ ) ), // Block style CSS.
		array( 'hsforms-toastr-css' ), // Dependency to include the CSS after it.
		null // filemtime( plugin_dir_path( __DIR__ ) . 'dist/blocks.style.build.css' ) // Version: File modification time.
	);

	// Register style for onm/cal
	wp_register_style(
		'micromodal-css', // Handle.
		plugins_url( 'dist/MicroModal/css/micromodal.css', dirname( __FILE__ ) ), // Block style CSS.
		array( ), // Dependency to include the CSS after it.
		null // filemtime( plugin_dir_path( __DIR__ ) . 'dist/blocks.style.build.css' ) // Version: File modification time.
	);

	// Register block editor script for backend.
	wp_register_script(
		'hsforms-onm-block-js', // Handle.
		plugins_url( '/dist/blocks.build.js', dirname( __FILE__ ) ), // Block.build.js: We register the block here. Built with Webpack.
		array( 'wp-blocks', 'wp-i18n', 'wp-element', 'wp-editor', 'moment', 'wp-api' ), // Dependencies, defined above.
		null, // filemtime( plugin_dir_path( __DIR__ ) . 'dist/blocks.build.js' ), // Version: filemtime — Gets file modification time.
		true // Enqueue the script in the footer.
	);

	// Register style for onm/cal
	wp_register_style(
		'hsforms-toastr-css', // Handle.
		plugins_url( 'dist/toastr/css/toastr.min.css', dirname( __FILE__ ) ), // Block style CSS.
		array(  ), // Dependency to include the CSS after it.
		null // filemtime( plugin_dir_path( __DIR__ ) . 'dist/blocks.style.build.css' ) // Version: File modification time.
	);

	// Register block editor script for backend.
	wp_register_script(
		'hsforms-toastr-js', // Handle.
		plugins_url( '/dist/toastr/js/toastr.min.js', dirname( __FILE__ ) ), // Block.build.js: We register the block here. Built with Webpack.
		array(  ), // Dependencies, defined above.
		null, // filemtime( plugin_dir_path( __DIR__ ) . 'dist/blocks.build.js' ), // Version: filemtime — Gets file modification time.
		true // Enqueue the script in the footer.
	);

	// Register onmCal
	wp_register_script(
		'hsforms-onm-cal', // Handle.
		plugins_url( '/dist/onm/cal/js/cal.min.js', dirname( __FILE__ ) ), // onm/cal
		array( 'jquery', 'hsforms-moment' ), // Dependencies, defined above.
		null, // filemtime( plugin_dir_path( __DIR__ ) . 'dist/blocks.build.js' ), // Version: filemtime — Gets file modification time.
		true // Enqueue the script in the footer.
	);

	// Register momentjs
	wp_register_script(
		'hsforms-moment', // Handle.
		plugins_url( '/dist/moment/moment-with-locales.min.js', dirname( __FILE__ ) ), // main.js
		array( ), // Dependencies, defined above.
		null, // filemtime( plugin_dir_path( __DIR__ ) . 'dist/blocks.build.js' ), // Version: filemtime — Gets file modification time.
		true // Enqueue the script in the footer.
	);

	// Register hsforms js
	wp_register_script(
		'hsforms-js', // Handle.
		plugins_url( '/dist/onm/hsforms/hsforms.js', dirname( __FILE__ ) ), // main.js
		array( 'hsforms-onm-cal', 'responsive-toolkit-js', 'hsforms-toastr-js', 'micromodal' ), // Dependencies, defined above.
		null, // filemtime( plugin_dir_path( __DIR__ ) . 'dist/blocks.build.js' ), // Version: filemtime — Gets file modification time.
		true // Enqueue the script in the footer.
	);

	// Register responsive-toolkit
	wp_register_script(
		'responsive-toolkit-js', // Handle.
		plugins_url( '/dist/responsive-toolkit/bootstrap-toolkit.min.js', dirname( __FILE__ ) ), // main.js
		array( ), // Dependencies, defined above.
		null, // filemtime( plugin_dir_path( __DIR__ ) . 'dist/blocks.build.js' ), // Version: filemtime — Gets file modification time.
		true // Enqueue the script in the footer.
	);

	// Register micromodal
	wp_register_script(
		'micromodal', // Handle.
		plugins_url( '/dist/MicroModal/js/micromodal.min.js', dirname( __FILE__ ) ), // main.js
		array( ), // Dependencies, defined above.
		null, // filemtime( plugin_dir_path( __DIR__ ) . 'dist/blocks.build.js' ), // Version: filemtime — Gets file modification time.
		true // Enqueue the script in the footer.
	);

	// Register block editor styles for backend.
	wp_register_style(
		'hsforms-onm-block-editor-css', // Handle.
		plugins_url( 'dist/blocks.editor.build.css', dirname( __FILE__ ) ), // Block editor CSS.
		array( 'wp-edit-blocks' ), // Dependency to include the CSS after it.
		null // filemtime( plugin_dir_path( __DIR__ ) . 'dist/blocks.editor.build.css' ) // Version: File modification time.
	);

	// WP Localized globals. Use dynamic PHP stuff in JavaScript via `onmGlobal` object.
	wp_localize_script(
		'hsforms-onm-block-js',
		'onmGlobal', // Array containing dynamic data for a JS Global.
		[
			'pluginDirPath' => plugin_dir_path( __DIR__ ),
			'pluginDirUrl'  => plugin_dir_url( __DIR__ ),
			'hsforms_options' => get_option( 'hsforms_options_option_name' )
			// Add more data here that you want to access from `onmGlobal` object.
		]
	);
	// sending admin-ajax url to FE so to send ajax request for colors (maybe more things in future)
	wp_localize_script( 'hsforms-js', 'hsforms_fe', array( 'ajaxurl' => admin_url( 'admin-ajax.php' ) ) );
	if( function_exists( 'register_block_type' ) ) {

		
		/**
		 * Register Gutenberg block on server-side.
		 *
		 * Register the block on server-side to ensure that the block
		 * scripts and styles for both frontend and backend are
		 * enqueued when the editor loads.
		 *
		 * @link https://wordpress.org/gutenberg/handbook/blocks/writing-your-first-block-type#enqueuing-block-scripts
		 * @since 1.16.0
		 */
		register_block_type(
			'onm/block-hsforms', array(
				// Enqueue blocks.style.build.css on both frontend & backend.
				'style'         => ['hsforms-onm-style-css', 'hsforms-cal-css', 'micromodal-css'],
				// Enqueue blocks.build.js in the editor only.
				'editor_script' => ['hsforms-onm-block-js', 'hsforms-js' ],
				// js for fe
				'script' => ['hsforms-js' ],
				// Enqueue blocks.editor.build.css in the editor only.
				'editor_style'  => 'hsforms-onm-block-editor-css',
				'attributes'      => array(
					'bookerType'      => array(
						'type' => 'string',
						'default' => 'form'
					),
					'blockId'      => array(
						'type' => 'string',
						'default' => null,
					),
					'ibeUrl'     => array(
						'type'    => 'string',
						'default' => get_option( 'hsforms_options_option_name' )['ibe_link'],
					),
					'ibeCustomURL' => array(
						'type'    => 'boolean',
						'default' => false,
					),
					'btnLabel'      => array(
						'type'    => 'string',
						'default' => get_option( 'hsforms_options_option_name' )['button_label'],
					),
					'startDate'         => array(
						'type'    => 'string',
					),
					'endDate'         => array(
						'type'    => 'string',
					),
					'minNights'           => array(
						'type'    => 'number',
						'default' => get_option( 'hsforms_options_option_name' )['minimum_nights'],
					),
					'minAdults'           => array(
						'type'    => 'number',
						'default' => get_option( 'hsforms_options_option_name' )['minimum_adults'],
					),
					'maxAdults'           => array(
						'type'    => 'number',
						'default' => get_option( 'hsforms_options_option_name' )['maximum_adults'],
					),
					'minKinder'           => array(
						'type'    => 'number',
						'default' => get_option( 'hsforms_options_option_name' )['minimum_kinder'],
					),
					'maxKinder'           => array(
						'type'    => 'number',
						'default' => get_option( 'hsforms_options_option_name' )['maximum_kinder'],
					),
					'maxKinderAge'           => array(
						'type'    => 'number',
						'default' => get_option( 'hsforms_options_option_name' )['maximum_kinder_age'],
					),
					'minRooms'           => array(
						'type'    => 'number',
						'default' => get_option( 'hsforms_options_option_name' )['minimum_rooms'],
					),
					'maxRooms'           => array(
						'type'    => 'number',
						'default' => get_option( 'hsforms_options_option_name' )['maximum_rooms'],
					),
					'minPersons'           => array(
						'type'    => 'number',
						'default' => get_option( 'hsforms_options_option_name' )['minimum_persons'],
					),
					'maxPersons'           => array(
						'type'    => 'number',
						'default' => get_option( 'hsforms_options_option_name' )['maximum_persons'],
					),
					'extps'       => array(
						'type'    => 'boolean',
						'default' => false,
					),
					'allowedParams'       => array(
						'type'    => 'string',
						'default' => '',
					),
					'minLOSBuffer'=> array(
						'type'    => 'boolean',
						'default' => (isset(get_option( 'hsforms_options_option_name' )['minlosbuffer'])) ? get_option( 'hsforms_options_option_name' )['minlosbuffer'] : false,
					),
					'keepParams'=> array(
						'type'    => 'boolean',
						'default' => (isset(get_option( 'hsforms_options_option_name' )['keepParams'])) ? get_option( 'hsforms_options_option_name' )['keepParams'] : false,
					),
					'promocodeFlag'=> array(
						'type'    => 'boolean',
						'default' => (isset(get_option( 'hsforms_options_option_name' )['promocodeFlag'])) ? get_option( 'hsforms_options_option_name' )['promocodeFlag'] : false,
					),
					'addRoomFlag'=> array(
						'type'    => 'boolean',
						'default' => (isset(get_option( 'hsforms_options_option_name' )['addRoomFlag'])) ? get_option( 'hsforms_options_option_name' )['addRoomFlag'] : false,
					),
					'ratecodeFlag'=> array(
						'type'    => 'boolean',
						'default' => (isset(get_option( 'hsforms_options_option_name' )['ratecodeFlag'])) ? get_option( 'hsforms_options_option_name' )['ratecodeFlag'] : false,
					),
					'segmentFlag'=> array(
						'type'    => 'boolean',
						'default' => (isset(get_option( 'hsforms_options_option_name' )['segmentFlag'])) ? get_option( 'hsforms_options_option_name' )['segmentFlag'] : false,
					),
					'legendFlag'=> array(
						'type'    => 'boolean',
						'default' => (isset(get_option( 'hsforms_options_option_name' )['legendFlag'])) ? get_option( 'hsforms_options_option_name' )['legendFlag'] : false,
					),
					'promocode'=> array(
						'type'    => 'string',
						'default' => (isset(get_option( 'hsforms_options_option_name' )['promocode'])) ? get_option( 'hsforms_options_option_name' )['promocode'] : '',
					),
					'modalTitle'=> array(
						'type'    => 'string',
						'default' => (isset(get_option( 'hsforms_options_option_name' )['modalTitle'])) ? get_option( 'hsforms_options_option_name' )['modalTitle'] : '',
					),
					'toastrClass'=> array(
						'type'    => 'string',
						'default' => (isset(get_option( 'hsforms_options_option_name' )['toastrClass'])) ? get_option( 'hsforms_options_option_name' )['toastrClass'] : '',
					)
				),
				'render_callback' => 'hsforms_render_callback'
			)
		);
	} else {
		// because gutenberg is not installed so scripts and styles are not being enqueued
		// so we have to do it
		wp_enqueue_script('hsforms-js');
		wp_enqueue_style('hsforms-onm-style-css');
		wp_enqueue_style('hsforms-cal-css');
		wp_enqueue_style('micromodal-css');
	}
}

function hsforms_render_callback( $block_attributes, $content ) {
	// hotelsuite api settings
	$apiOptions = get_option( 'hsforms_api_option_name' );
	
	// hsforms settings
	$hsforms_options = get_option( 'hsforms_options_option_name' );
	$ibeUrl = (isset($block_attributes['ibeUrl'])) ? $block_attributes['ibeUrl'] : 'no';
	$ibeDefault = $hsforms_options['ibe_link'];
	$ibeFinalUrl = (isset($block_attributes['ibeCustomURL'])) ? (($block_attributes['ibeCustomURL']) ? $ibeUrl : $ibeDefault) : $ibeDefault;
	//grabbing params from ibelink if any
	$urlParams = [];
	if(strpos($ibeFinalUrl, '?')) {
		$queryString = explode('?', $ibeFinalUrl)[1];
		$parameters = explode('&', $queryString);
		foreach($parameters as $param) {
			$keyVal = explode('=', $param);
			if(sizeof($keyVal) == 1) {
				$keyVal[1] = $keyVal[0];
			}
			$urlParams[$keyVal[0]] = $keyVal[1];
		}
	}
	$startDate = (isset($block_attributes['startDate'])) ? date('Y-m-d', strtotime($block_attributes['startDate'])) : date('Y-m-d');
	$endDate = (isset($block_attributes['endDate'])) ? date('Y-m-d', strtotime($block_attributes['endDate'])) : date('Y-m-d');
	$minNights = (isset($block_attributes['minNights'])) ? $block_attributes['minNights'] : $hsforms_options['minimum_nights'];
	$minAdults = (isset($block_attributes['minAdults'])) ? $block_attributes['minAdults'] : $hsforms_options['minimum_adults'];
	$maxAdults = (isset($block_attributes['maxAdults'])) ? $block_attributes['maxAdults'] : $hsforms_options['maximum_adults'];
	$minKinder = (isset($block_attributes['minKinder'])) ? $block_attributes['minKinder'] : $hsforms_options['minimum_kinder'];
	$maxKinder = (isset($block_attributes['maxKinder'])) ? $block_attributes['maxKinder'] : $hsforms_options['maximum_kinder'];
	$maxKinderAge = (isset($block_attributes['maxKinderAge'])) ? $block_attributes['maxKinderAge'] : $hsforms_options['maximum_kinder_age'];
	if(!$maxKinderAge) {
		$maxKinderAge = 10;
	}
	$minRooms = (isset($block_attributes['minRooms'])) ? $block_attributes['minRooms'] : $hsforms_options['minimum_rooms'];
	$maxRooms = (isset($block_attributes['maxRooms'])) ? $block_attributes['maxRooms'] : $hsforms_options['maximum_rooms'];
	$minPersons = (isset($block_attributes['minPersons'])) ? $block_attributes['minPersons'] : $hsforms_options['minimum_persons'];
	$maxPersons = (isset($block_attributes['maxPersons'])) ? $block_attributes['maxPersons'] : $hsforms_options['maximum_persons'];
	$btnLabel = (isset($block_attributes['btnLabel'])) ? $block_attributes['btnLabel'] : $hsforms_options['btnLabel'];
	$allowedParams = (isset($block_attributes['allowedParams']) && trim($block_attributes['allowedParams'])) ? $block_attributes['allowedParams'] : $hsforms_options['allowedParams'];
	$promocode = (isset($block_attributes['promocode']) && trim($block_attributes['promocode'])) ? $block_attributes['promocode'] : '';
	$modalTitle = (isset($block_attributes['modalTitle']) && trim($block_attributes['modalTitle'])) ? $block_attributes['modalTitle'] : '';
	$toastrClass = (isset($block_attributes['toastrClass']) && trim($block_attributes['toastrClass'])) ? $block_attributes['toastrClass'] : '';
	$blockId = (isset($block_attributes['blockId'])) ? $block_attributes['blockId'].'_'.rand() : time();
	$extps = (isset($block_attributes['extps'])) ? $block_attributes['extps'] : false;
	$minLOSBuffer = (isset($block_attributes['minLOSBuffer'])) ? $block_attributes['minLOSBuffer'] : false;
	$isButton = (isset($block_attributes['isButton'])) ? $block_attributes['isButton'] : false;
	$keepParams = (isset($block_attributes['keepParams'])) ? $block_attributes['keepParams'] : (isset($hsforms_options['keepParams']) ? $hsforms_options['keepParams'] : false );
	$promocodeFlag = (isset($block_attributes['promocodeFlag'])) ? $block_attributes['promocodeFlag'] : (isset($hsforms_options['promocodeFlag']) ? $hsforms_options['promocodeFlag'] : false );
	$addRoomFlag = (isset($block_attributes['addRoomFlag'])) ? $block_attributes['addRoomFlag'] : (isset($hsforms_options['addRoomFlag']) ? $hsforms_options['addRoomFlag'] : false );
	$ratecodeFlag = (isset($block_attributes['ratecodeFlag'])) ? $block_attributes['ratecodeFlag'] : (isset($hsforms_options['ratecodeFlag']) ? $hsforms_options['ratecodeFlag'] : false );
	$segmentFlag = (isset($block_attributes['segmentFlag'])) ? $block_attributes['segmentFlag'] : (isset($hsforms_options['segmentFlag']) ? $hsforms_options['segmentFlag'] : false );
	$legendFlag = (isset($block_attributes['legendFlag'])) ? $block_attributes['legendFlag'] : (isset($hsforms_options['legendFlag']) ? $hsforms_options['legendFlag'] : false );
	$daysAllowed = (isset($block_attributes['daysAllowed'])) ? $block_attributes['daysAllowed'] : [1,1,1,1,1,1,1];

	// now have to convert to Su,Mo,Tu,We,Th,Fr,Sa from Mo,Tu,We,Th,Fr,Sa,Su
	array_unshift($daysAllowed, $daysAllowed[6]);
	unset($daysAllowed[7]);

	// allowedParams array
	$allowedParamsForJS = [];
	foreach(explode(',',$allowedParams) as $param) {
		if(trim($param))
			$allowedParamsForJS[] = $param;
	}

	// get and prepare tps
	$tp_raw_data = (isset($block_attributes['tps'])) ? $block_attributes['tps'] : [];
	$tps = [];
	$bufferMinLengthOfStay = (!$minLOSBuffer) ? $minNights : '0'; // todo: with buffer flag it can be 0 or minLOS
	if($extps) {
		$today = new \DateTime('now');
		foreach($tp_raw_data as $tp) {
			$tp_start = get_post_meta($tp['value'], 'tp_start');
			$tp_end = get_post_meta($tp['value'], 'tp_end');
			if(is_array($tp_start)) {
				$tp_start = DateTime::createFromFormat('Y-m-d', $tp_start[0]);
			}
			if(is_array($tp_end)) {
				$tp_end = DateTime::createFromFormat('Y-m-d', $tp_end[0]);
			}
			$tp_end = $tp_end->add(\DateInterval::createfromdatestring($bufferMinLengthOfStay . ' day'));
			$today->add(\DateInterval::createfromdatestring($bufferMinLengthOfStay . ' day'));

			if(strtotime($tp_end->format('d-m-Y')) >= strtotime($today->format('d-m-Y'))) {
				if($tp_start->diff($tp_end)->days >= $minNights) {
					$tps[] = [$tp_start->format('Y-m-d'), $tp_end->format('Y-m-d')];
				}
			}
		}
	} else {
		if(!$bufferMinLengthOfStay) {
			$bufferMinLengthOfStay = '0';
		}
		$tp_start = DateTime::createFromFormat('Y-m-d', $startDate);
		$tp_end = DateTime::createFromFormat('Y-m-d', $endDate);
		$tp_end = $tp_end->add(\DateInterval::createfromdatestring($bufferMinLengthOfStay . ' day'));
		$tps[] = [$tp_start->format('Y-m-d'), $tp_end->format('Y-m-d')];
	}

	// get selected ratecodes
	$rc_raw_data = (isset($block_attributes['ratecodes'])) ? $block_attributes['ratecodes'] : [];
	$rcs = [];
	foreach($rc_raw_data as $rc) {
		$rcs[] = get_post_meta($rc['value'], 'ratecode');

	}

	// get selected segments
	$sg_raw_data = (isset($block_attributes['segments'])) ? $block_attributes['segments'] : [];
	$sgs = [];
	foreach($sg_raw_data as $sg) {
		$sgs[] = [$sg['label'], get_post_meta($sg['value'], 'code')[0]];
	}

	// using fluid template engine: https://github.com/TYPO3/Fluid
	require __DIR__ . '/view_init.php';

	// setting Action Name in RenderingContext so to pick up the right template
	if($view) {
		$view->getRenderingContext()->setControllerAction('Index');
		$view->assignMultiple([
			'blockId' => $blockId,
			'translations' => [
				'minRange' => __("Minrange message", "wordpress-hsforms"),
				'maxRange' => __("Maxrange message", "wordpress-hsforms"),
				'dateRange' => __("Daterange message", "wordpress-hsforms"),
				'arrivalDay' => __("Arrival day is not allowed", "wordpress-hsforms"),
				'maxpersonsmsg' => __("sorry too many persons", "wordpress-hsforms"),
				'dateFormat' => __("DD.MM.YYYY", "wordpress-hsforms"),
				'locale' => __('de', 'wordpress-hsforms'),
				'dateFromLabel' => __('From:', 'wordpress-hsforms', 'wordpress-hsforms'),
				'dateToLabel' => __('To:', 'wordpress-hsforms', 'wordpress-hsforms'),
				'adultsLabel' => __('Adults:', 'wordpress-hsforms'),
				'kinderLabel' => __('Children:', 'wordpress-hsforms'),
				'year' => __('Jahr', 'wordpress-hsforms'),
				'years' => __('Jahre', 'wordpress-hsforms'),
				'under' => __('Unter', 'wordpress-hsforms'),
				'segmentLabel' => __('Segment', 'wordpress-hsforms'),
				'segmentDefaultLabel' => __('Select Segment', 'wordpress-hsforms'),
				'promocodeLabel' => __('Promotion Code', 'wordpress-hsforms'),
				'ratecodeLabel' => __('Rate Code', 'wordpress-hsforms'),
				'removeLinkLabel' => __('Remove', 'wordpress-hsforms'),
				'addLinkLabel' => __('Add Room', 'wordpress-hsforms'),
				'kinderAgeLabel' => __('Age of Child:', 'wordpress-hsforms'),
			],
			'minAdults' => $minAdults,
			'maxAdults' => $maxAdults,
			'minKinder' => $minKinder,
			'maxKinder' => $maxKinder,
			'maxKinderAge' => array_fill( 0, $maxKinderAge, null),
			'minPersons' => $minPersons,
			'maxPersons' => $maxPersons,
			'minRooms' => $minRooms,
			'maxRooms' => $maxRooms,
			'minNights' => $minNights,
			'daysAllowed' => $daysAllowed,
			'keepParams' => $keepParams,
			'allowedParams' => $allowedParamsForJS,
			'tps' => $tps,
			'ibeFinalUrl' => $ibeFinalUrl,
			'minRoomsIterator' => range(1, $minRooms),
			'hiddenRoomsIterator' => range($minRooms+1, $maxRooms),
			'segments' => $sgs,
			'promocode' => $promocode,
			'promocodeFlag' => $promocodeFlag,
			'ratecodes' => $rcs,
			'btnLabel' => $btnLabel,
			'addRoomFlag' => $addRoomFlag,
			'ratecodeFlag' => $ratecodeFlag,
			'segmentFlag' => $segmentFlag,
			'legendFlag' => $legendFlag,
			'isButton' => $isButton,
			'modalTitle' => $modalTitle,
			'toastrClass' => $toastrClass,
			'urlParams' => $urlParams
		]);
		if(isset($apiOptions['enable_api'])) {
			$view->assign('enableAPI', 1);
			if($legendFlag) {
				$hsApi = new HotelsuiteApi();
				$colorsConfig = json_decode($hsApi->fetch('/web-availability-color-config'));
				if(is_array($colorsConfig->_embedded->web_availability_color_config)) {
					$view->assign('colorConfig', $colorsConfig->_embedded->web_availability_color_config[0]);
				}
			}
		}
		$output = $view->render();
	} else {
		error_log('I think you forgot to run composer install for hsforms.');
		$output = "Please check the error in debug.log";
	}

	return $output;
}

// Hook: Block assets.
add_action( 'init', 'hsforms_onm_block_assets' );

// function to add translated labels for js (gutenberg)
function hsforms_set_script_translations() {
	wp_set_script_translations( 'hsforms-onm-block-js', 'wordpress-hsforms', plugin_dir_path( dirname( __FILE__ ) ) . 'languages' );
}
add_action( 'init', 'hsforms_set_script_translations' );

// ajax action for colors from hotelsuite API
add_action( 'wp_ajax_fetch_colors', 'hsforms_fetch_colors' );
add_action( 'wp_ajax_nopriv_fetch_colors', 'hsforms_fetch_colors' );

// action to fetch colors from hotelsuite API for a month
function hsforms_fetch_colors() {
	$dateString = $_GET['dateString'];
	$colors = [];
	if ($dateString) {
		$startDate = \DateTime::createFromFormat("Y-m-d", $dateString);
	} else {
		$startDate = new \DateTime();
	}
	$startDate = $startDate->modify("first day of this month");
	$endDate = clone $startDate;
	$endDate->modify("last day of this month");
	$apiOptions = get_option( 'hsforms_api_option_name' );
	// fetch data from API when API is enabled from ext config
	if($apiOptions['enable_api']) {
		$api = new HotelsuiteApi();
		$colors = $api->fetch('/web-availability-color?start=' . $startDate->format("Y-m-d") . '&end=' . $endDate->format("Y-m-d"));
	}
	echo $colors;
	wp_die();
}