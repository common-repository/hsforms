<?php
/**
 * Plugin Name: Hsforms
 * Plugin URI: https://www.onm.de
 * Description: hotelsuite FORM (hs FORMS) will show a form to book hotel rooms with some customized configurations. This plugin allows the creation of deep links and booking buttons in connection with the Internet booking engine "hotelsuite IBE" (https://www.hotelsuite.de). Sell rooms, vouchers, events, tables and much more! - Get in touch with us: Open New Media GmbH | Digital communication agency | Tel .: +49 261 30380-80 | E-Mail: info@onm.de | Web: https://www.onm.de | Hotel solutions: https://www.hotelsuite.de
 * Author: Open New Media GmbH.
 * Author URI: https://www.onm.de
 * Text Domain: wordpress-hsforms
 * Domain Path: /languages
 * Version: 1.0.0
 * License: GPL2+
 * License URI: https://www.gnu.org/licenses/gpl-2.0.txt
 *
 * @package ONM
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$possibleAutoloadLocation = plugin_dir_path( __FILE__ ) . 'vendor/autoload.php';
if (file_exists($possibleAutoloadLocation)) {
	require_once $possibleAutoloadLocation;
}

/**
 * Block Initializer.
 */
require_once plugin_dir_path( __FILE__ ) . 'src/init.php';
/**
 * Plugin Options.
 */
require_once plugin_dir_path( __FILE__ ) . 'src/HsformsOptions.php';
/**
 * Custom post type => TravelPeriod
 */
require_once plugin_dir_path( __FILE__ ) . 'src/TravelPeriod/TravelPeriod.php';
/**
 * Custom post type => RateCode
 */
require_once plugin_dir_path( __FILE__ ) . 'src/RateCode/RateCode.php';
/**
 * Custom post type => Segment
 */
require_once plugin_dir_path( __FILE__ ) . 'src/Segment/Segment.php';
/**
 * hsforms shortcode
 */
require_once plugin_dir_path( __FILE__ ) . 'src/Shortcode.php';


/**
 * Load the plugin textdomain
 */
function hsforms_blocks_init() {
	load_plugin_textdomain( 'wordpress-hsforms', false, basename( dirname( __FILE__ ) ) . '/languages' );
}
add_action( 'init', 'hsforms_blocks_init' );