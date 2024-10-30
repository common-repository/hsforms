<?php

function hsforms_cptui_register_my_cpts_travelperiod() {

	/**
	 * Post Type: TravelPeriods.
	 */

	$labels = [
		"name" => __( "TravelPeriods", "twentytwenty" ),
		"singular_name" => __( "TravelPeriod", "twentytwenty" ),
		"menu_name" => __( "TravelPeriods", "twentytwenty" ),
		"all_items" => __( "All TravelPeriods", "twentytwenty" ),
		"add_new" => __( "Add new", "twentytwenty" ),
		"add_new_item" => __( "Add new TravelPeriod", "twentytwenty" ),
		"edit_item" => __( "Edit TravelPeriod", "twentytwenty" ),
		"new_item" => __( "New TravelPeriod", "twentytwenty" ),
		"view_item" => __( "View TravelPeriod", "twentytwenty" ),
		"view_items" => __( "View TravelPeriods", "twentytwenty" ),
		"search_items" => __( "Search TravelPeriods", "twentytwenty" ),
		"not_found" => __( "No TravelPeriods found", "twentytwenty" ),
		"not_found_in_trash" => __( "No TravelPeriods found in trash", "twentytwenty" ),
		"parent" => __( "Parent TravelPeriod:", "twentytwenty" ),
		"featured_image" => __( "Featured image for this TravelPeriod", "twentytwenty" ),
		"set_featured_image" => __( "Set featured image for this TravelPeriod", "twentytwenty" ),
		"remove_featured_image" => __( "Remove featured image for this TravelPeriod", "twentytwenty" ),
		"use_featured_image" => __( "Use as featured image for this TravelPeriod", "twentytwenty" ),
		"archives" => __( "TravelPeriod archives", "twentytwenty" ),
		"insert_into_item" => __( "Insert into TravelPeriod", "twentytwenty" ),
		"uploaded_to_this_item" => __( "Upload to this TravelPeriod", "twentytwenty" ),
		"filter_items_list" => __( "Filter TravelPeriods list", "twentytwenty" ),
		"items_list_navigation" => __( "TravelPeriods list navigation", "twentytwenty" ),
		"items_list" => __( "TravelPeriods list", "twentytwenty" ),
		"attributes" => __( "TravelPeriods attributes", "twentytwenty" ),
		"name_admin_bar" => __( "TravelPeriod", "twentytwenty" ),
		"item_published" => __( "TravelPeriod published", "twentytwenty" ),
		"item_published_privately" => __( "TravelPeriod published privately.", "twentytwenty" ),
		"item_reverted_to_draft" => __( "TravelPeriod reverted to draft.", "twentytwenty" ),
		"item_scheduled" => __( "TravelPeriod scheduled", "twentytwenty" ),
		"item_updated" => __( "TravelPeriod updated.", "twentytwenty" ),
		"parent_item_colon" => __( "Parent TravelPeriod:", "twentytwenty" ),
	];

	$args = [
		"label" => __( "TravelPeriods", "twentytwenty" ),
		"labels" => $labels,
		"description" => "",
		"public" => true,
		"publicly_queryable" => true,
		"show_ui" => true,
		"show_in_rest" => true,
		"rest_base" => "",
		"rest_controller_class" => "WP_REST_Posts_Controller",
		"has_archive" => false,
		"show_in_menu" => false,
		"show_in_nav_menus" => false,
		"delete_with_user" => false,
		"exclude_from_search" => false,
		"capability_type" => "post",
		"map_meta_cap" => true,
		"hierarchical" => false,
		"rewrite" => [ "slug" => "travelperiod", "with_front" => true ],
		"query_var" => true,
		"supports" => [ "title", "editor", "custom-fields" ],
	];

	register_post_type( "travelperiod", $args );
}

add_action( 'init', 'hsforms_cptui_register_my_cpts_travelperiod' );
add_action( 'add_meta_boxes', 'hsforms_cd_meta_box_add_tp' );

function hsforms_cd_meta_box_add_tp()
{
	add_meta_box(
		'tp-box',
		'TravelPeriod dates',
		'hsforms_meta_box_tp',
		'travelperiod',
		'side' );
}
function hsforms_meta_box_tp()
{
	include plugin_dir_path( __FILE__ ) . '/tp.php';
}


/**
 * Save meta box content.
 *
 * @param int $post_id Post ID
 */
function hsforms_tp_save_meta_box( $post_id ) {
    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) return;
    if ( $parent_id = wp_is_post_revision( $post_id ) ) {
        $post_id = $parent_id;
    }
    $fields = [
        'tp_start',
        'tp_end',
    ];
    foreach ( $fields as $field ) {
        if ( array_key_exists( $field, $_POST ) ) {
            update_post_meta( $post_id, $field, sanitize_text_field( $_POST[$field] ) );
        }
     }
}
add_action( 'save_post', 'hsforms_tp_save_meta_box' );

// add custom columns for travelperiod

add_filter('manage_travelperiod_posts_columns', 'hsforms_tp_table_head');
function hsforms_tp_table_head( $defaults ) {
	$defaults['date']  = __('Date created', 'wordpress-hsforms');
    $defaults['start']  = __('Start', 'wordpress-hsforms');
    $defaults['end']    = __('End', 'wordpress-hsforms');
    return $defaults;
}

// filling up the custom columns

add_action( 'manage_travelperiod_posts_custom_column', 'hsforms_tp_table_content', 10, 2 );

function hsforms_tp_table_content( $column_name, $post_id ) {
	// today's date to compare with start and end dates
	$today = new DateTime();
	$today->setTime(0,0,0);
	$startPassed = false;
	$endPassed = false;
	// start date processing
	$tp_start = get_post_meta( $post_id, 'tp_start', true );
	$startDate = DateTime::createFromFormat('Y-m-d', $tp_start);
	$startDate->setTime(0,0,0);
	$startDateToShow = date( _x( 'F d, Y', 'Start', 'textdomain' ), strtotime( $startDate->format('c') ) );
	// end date processing
	$tp_end = get_post_meta( $post_id, 'tp_end', true );
	$endDate = DateTime::createFromFormat('Y-m-d', $tp_end);
	$endDate->setTime(0,0,0);
	$endDateToShow = date( _x( 'F d, Y', 'End', 'textdomain' ), strtotime( $endDate->format('c') ) );
	// comparing today with start and date
	if($today > $startDate) {
		$startPassed = !$startPassed;
	}
	if($today > $endDate) {
		$startPassed = !$startPassed;
		$endPassed = !$endPassed;
	}

    if ($column_name == 'start') {
		if($startPassed || $endPassed) {
			echo '<span style="color:red">' . $startDateToShow . '</span>';
		} else {
			echo $startDateToShow;
		}
    }
    if ($column_name == 'end') {

		if($endPassed) {
			echo '<span style="color:red">' . $endDateToShow . '</span>';
		} else {
			echo $endDateToShow;
		}
    }
}

add_filter( 'manage_edit-travelperiod_sortable_columns', 'hsforms_tp_table_sorting' );
function hsforms_tp_table_sorting( $columns ) {
  $columns['start'] = 'tp_start';
  $columns['end'] = 'ep_end';
  return $columns;
}

add_filter( 'request', 'hsforms_bs_event_start_column_orderby' );
function hsforms_bs_event_start_column_orderby( $vars ) {
    if ( isset( $vars['orderby'] ) && 'start' == $vars['orderby'] ) {
        $vars = array_merge( $vars, array(
            'meta_key' => 'tp_start',
            'orderby' => 'meta_value'
        ) );
    }

    return $vars;
}

add_filter( 'request', 'hsforms_bs_event_end_column_orderby' );
function hsforms_bs_event_end_column_orderby( $vars ) {
    if ( isset( $vars['orderby'] ) && 'end' == $vars['orderby'] ) {
        $vars = array_merge( $vars, array(
            'meta_key' => 'tp_end',
            'orderby' => 'meta_value'
        ) );
    }

    return $vars;
}


add_action( 'rest_api_init', function () {
    register_rest_field( 'travelperiod', 'tp_start', array(
        'get_callback' => function( $post_arr ) {
            return get_post_meta( $post_arr['id'], 'tp_start', true );
        },
    ) );

    register_rest_field( 'travelperiod', 'tp_end', array(
        'get_callback' => function( $post_arr ) {
            return get_post_meta( $post_arr['id'], 'tp_end', true );
        },
    ) );
} );
